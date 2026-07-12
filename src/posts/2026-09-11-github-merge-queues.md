---
author: Steve Kaschimer
date: 2026-09-11
image_prompt: "A precise, architectural illustration in a dark-mode technical editorial style - near-black background with steel blue, amber, and off-white accents. A queue of five pull-request cards lines up left to right, each with a small green checkmark, feeding into a bracket labeled 'Batch' that groups three of them together. The batch flows into a single temporary merge-commit node, which splits into a CI pipeline bar showing one consolidated test run rather than five separate ones. Below, a smaller inset shows a batch mid-failure: one card highlighted amber and ejected sideways while the rest of the batch continues forward with a green arrow, illustrating bisection. The mood is orderly and mechanical - a well-engineered queue, not a traffic jam."
layout: post.njk
site_title: Tech Notes
summary: "Required status checks with a strict up-to-date policy don't scale: every merge invalidates every other open PR's status, forcing a re-run, which produces a queue where PRs re-validate against a constantly moving target. Merge queues fix this by batching. This post covers how GitHub's merge queue actually works, how to configure one through Rulesets, the merge_group Actions trigger teams forget to wire up, what happens when a batch fails, and how the whole model traces back to bors and homu."
tags: ["github", "ci-cd", "developer-productivity", "branch-protection", "platform-engineering"]
title: "GitHub Merge Queues: Safe, Scalable Merging Without Branch Protection Bottlenecks"
---

`strict_required_status_checks_policy: true` is the setting that makes a required status check mean something - a PR can't merge unless it passed CI against the current state of `main`, not some earlier version of it. It's also the setting that turns your merge rate into a bottleneck the moment more than one PR is trying to land at the same time. The [Rulesets post](/posts/2026-05-08-github-branch-protection-rules-vs-rulesets/) covered why you want that setting on. This post covers what happens once you have ten engineers relying on it and why the fix isn't disabling it.

Here's the failure mode. Two PRs are both green and both up to date with `main`. The first one merges. The instant it does, the second PR is no longer up to date - `main` moved out from under it. Its "up to date" status flips to false, its required check is no longer satisfiable as-is, and it has to re-sync and re-run CI before it can merge. Now imagine ten PRs merging in a day, each one invalidating everyone still in flight behind it. Every merge triggers a re-run somewhere else. CI capacity goes to repeated validation of the same changes against slightly different bases, and "my PR was green an hour ago, why is it red now" becomes a routine complaint instead of a rare one.

A merge queue doesn't relax the requirement. It changes how PRs earn the right to merge: instead of validating each PR against `main` independently and hoping nothing lands in between, GitHub batches queued PRs together, tests the batch as a unit, and merges the whole batch atomically if it passes. One CI run validates several PRs' combined effect on `main`, and nothing merges until it's actually confirmed safe to merge - not "was safe a few minutes ago."

***

## How the Queue Actually Works

A PR enters the merge queue once it's approved and its required checks (evaluated against the PR branch itself, same as always) are green. From there:

1. GitHub creates a temporary merge branch combining the queued PR(s) with the current tip of `main`.
2. Your required status checks run against that temporary branch - not the PR branch, and not `main` directly.
3. If the batch passes, GitHub merges it into `main` and the queue advances.
4. If it fails, GitHub identifies which PR in the batch is responsible (more on this below) and continues the queue without it.

The batching behavior is controlled by `grouping_strategy`, and it's the setting that determines how much latency you're trading for how much CI efficiency:

**`ALLGREEN`** waits for every PR in a batch to pass before merging any of them. Maximum CI efficiency - one run validates the whole batch - at the cost of the fastest PR in the batch being held up by the slowest.

**`HEADGREEN`** merges PRs from the front of the batch as soon as their prefix has been confirmed green, without waiting for later entries in the same batch to finish. Lower latency for individual PRs, at the cost of more CI runs overall, since a prefix passing doesn't tell you anything about whether the full batch would have.

Most teams start with `ALLGREEN` and small batch sizes, and move toward `HEADGREEN` only if merge latency becomes a real complaint and CI cost has headroom to absorb more runs.

***

## Configuring a Merge Queue via Rulesets

Merge queues are a rule type within the same Ruleset system covered in the branch protection post - add a `merge_queue` rule alongside your existing `required_status_checks` rule:

```json
{
  "name": "Protect main branch",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "build / compile", "integration_id": null },
          { "context": "test / unit-tests", "integration_id": null }
        ]
      }
    },
    {
      "type": "merge_queue",
      "parameters": {
        "merge_method": "SQUASH",
        "grouping_strategy": "ALLGREEN",
        "max_entries_to_build": 5,
        "max_entries_to_merge": 5,
        "min_entries_to_merge": 1,
        "min_entries_to_merge_wait_minutes": 5,
        "check_response_timeout_minutes": 30
      }
    }
  ]
}
```

A few choices worth explaining:

- **`max_entries_to_build`** caps how many queued PRs get combined into a single batch for the temporary merge branch. Larger batches mean fewer CI runs but a bigger blast radius when one fails - every PR in a failed batch gets re-evaluated.
- **`max_entries_to_merge`** caps how many PRs merge together once a batch passes. This can be lower than `max_entries_to_build` if you want to test larger batches but merge them in smaller, more auditable groups.
- **`min_entries_to_merge` / `min_entries_to_merge_wait_minutes`**: the queue will wait up to this many minutes to accumulate at least this many entries before building a batch, trading a small delay for better batching efficiency during bursty merge activity. Set `min_entries_to_merge: 1` if you'd rather never make a lone PR wait for company.
- **`check_response_timeout_minutes`**: how long the queue waits for required checks to report before treating the batch as failed. Set this above your slowest required check's typical duration, with margin - a queue that times out prematurely on a slow-but-passing check ejects innocent PRs.

***

## Wiring CI to the Queue: the `merge_group` Event

This is the gotcha that stalls a merge queue silently on first setup: required checks configured to trigger on `pull_request` or `push` do not fire against the merge queue's temporary branch. GitHub Actions added a dedicated event for this - `merge_group` - and if your required workflow doesn't listen for it, the queue will sit there waiting forever for a status check that's never going to report.

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  merge_group:
    types: [checks_requested]

jobs:
  build:
    name: build / compile
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

  test:
    name: test / unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
```

The job names here - `build / compile` and `test / unit-tests` - have to match the `context` values in the Ruleset's `required_status_checks` exactly, same requirement as in the branch protection post. Nothing else about the workflow needs to change: the same jobs that validate a PR validate the merge group, just triggered by a different event against a different (temporary) ref.

***

## When a Batch Fails: Stale Base and Bisection

Two distinct failure modes, and GitHub handles them differently.

**Stale base.** If `main` moves while a batch is being built or tested - another merge landed outside the queue, or a previous queue entry completed - the batch's base is no longer current. GitHub detects this and rebuilds the batch against the new tip rather than merging a batch that was validated against a `main` that no longer exists. This is exactly the problem the queue exists to prevent, applied recursively to its own batches.

**A check fails.** If the batch's required checks come back red, GitHub doesn't just fail the whole batch and make every PR in it start over. It bisects: the batch gets split, and GitHub retests smaller sub-batches to isolate which PR is actually responsible for the failure. The innocent PRs get re-batched and continue through the queue; the PR that broke the build gets removed and returned to its author, who has to fix it and re-enter the queue from the back.

This bisection is the entire value proposition condensed into one behavior. Without it, a merge queue would just move the "one bad PR blocks everyone" problem from `main`'s history to the queue itself. With it, one broken PR costs that PR's author a re-submission - not the whole batch, and not everyone else waiting behind it.

***

## There's No Priority Lane

Worth being direct about a limitation: GitHub's merge queue is FIFO. There is no built-in mechanism to jump a P0 hotfix to the front of the queue, no priority flag, no "merge this one next regardless of position." If your queue has a five-PR batch in flight and a critical fix needs to land in the next two minutes, waiting for the queue is usually the wrong call.

The practical answer is the same escape hatch that exists for any Ruleset: a bypass actor. For genuine emergencies, someone with bypass permission merges directly, outside the queue, and the audit trail records that it happened - exactly the same trade-off the branch protection post covered for `bypass_mode: "pull_request"`. Use it rarely and deliberately. A queue that gets routinely bypassed for "urgent" changes isn't providing the guarantee it's there for.

***

## Where This Pattern Came From

None of this is a new idea GitHub invented. Batch-test-and-bisect is the model `bors-ng` and `homu` used for years, self-hosted, in projects like Rust and Servo - a bot that watched a review-approval comment (`bors r+` or `r=username`), queued the PR, built a merge commit against the batch, ran CI, and merged or bisected based on the result. Anyone who's worked on a large Rust project has typed `bors r+` into a PR comment and watched a bot do exactly what GitHub's merge queue now does natively.

What changed isn't the design - it's who has to run the infrastructure. `bors-ng` required standing up and maintaining your own bot, database, and webhook listener. GitHub's merge queue is the same batching-and-bisection pattern as a Rulesets checkbox. The pattern was always right; it just used to cost a self-hosted service to get it.

***

## Closing

A required status check with a strict up-to-date policy is correct and worth keeping - it's the thing that guarantees "green" actually means safe to merge. The problem was never the requirement. It was validating that requirement one PR at a time against a target that moves every time someone else merges. A merge queue doesn't weaken the guarantee. It changes the unit of validation from "one PR against `main`" to "one batch against `main`," which is the only version of the check that stays true for long enough to be useful once more than one person is merging at once.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
