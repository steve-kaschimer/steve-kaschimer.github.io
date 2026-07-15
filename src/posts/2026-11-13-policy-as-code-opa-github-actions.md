---
author: Steve Kaschimer
date: 2026-11-13
image: /images/posts/2026-11-13-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, amber, and teal accents. On the left, a stack of small file icons labeled 'required-labels.rego', 'allowed-base-images.rego', 'workflow-permissions.rego' feeding into a single hexagonal gate icon labeled 'OPA' with a small owl-silhouette mark. A PR diff panel in the center shows a Dockerfile line highlighted in amber reading 'FROM ubuntu:latest' with a small warning triangle. An arrow flows from the OPA gate to a GitHub PR status-check row showing three checks: two green checkmarks and one red X labeled 'policy: base-image-not-allowed', with a short actionable message beneath it. The mood is precise and mechanical - compliance rules enforced as a deterministic gate, not a reviewer's memory."
layout: post.njk
site_title: Tech Notes
summary: "Compliance rules that live in a wiki page get followed inconsistently because enforcing them depends on a reviewer remembering them at the right moment. Open Policy Agent turns those same rules into Rego code, evaluated the same way on every PR, with no reviewer memory required. This post covers writing Rego policies for real engineering standards - required PR labels, allowed Docker base images, mandatory workflow permissions blocks - running OPA in GitHub Actions, and surfacing violations as PR check failures with messages a developer can actually act on."
tags: ["policy-as-code", "opa", "github-actions", "devsecops", "compliance"]
title: "Policy as Code with OPA and GitHub Actions: Enforcing Org Standards at the Merge Gate"
---

An engineering standard written down as a wiki page or a Slack pin gets followed exactly as consistently as reviewers remember it exists. "Every workflow file needs an explicit `permissions` block" is easy to state once in an onboarding doc and easy to forget three months later when someone's copy-pasting a workflow from a different repo that predates the standard. [The permissions-block post](/posts/2026-03-25-github-actions-permissions-block/) made the case for the standard itself; this post is about the layer most teams skip - making the standard something a machine checks on every PR, not something a human is trusted to remember.

Open Policy Agent (OPA) is a general-purpose policy engine, and Rego is its policy language - rules expressed as code, versioned in the repo, evaluated deterministically against structured input. The pitch isn't "replace code review with a policy engine." It's narrower and more useful: take the subset of review comments that are actually deterministic yes/no checks against a written standard, and stop spending a human reviewer's attention on them.

***

## What Belongs in a Policy vs. What Doesn't

The same boundary [the agentic-code-review post](/posts/2026-10-16-agentic-code-review-architecture-rules/) drew for AI-enforced architecture rules applies here, for a more mechanical enforcement mechanism: a policy needs a clear, structured yes/no answer computable from the PR's actual content. "Does this Dockerfile's `FROM` line reference an approved base image" is a policy. "Is this a well-designed API" is not - it has no single correct answer to check against, and forcing it into Rego just produces a rigid rule that's wrong for cases nobody anticipated.

Three real standards make good OPA policies because they're already unambiguous rules, just currently enforced by nothing:

- Every PR must carry at least one label from an approved set (`bug`, `feature`, `chore`, `security`) - currently "enforced" by a reviewer noticing an unlabeled PR.
- Every `Dockerfile` must reference a base image from an approved list, not `latest` tags or arbitrary public images.
- Every workflow file under `.github/workflows/` must declare an explicit top-level `permissions` block - the standard from the permissions-block post, now actually checked.

***

## Writing Rego Policies

Rego evaluates structured input (JSON) against rules and produces a set of violations. Each of the three standards above is its own small policy file:

```rego
# policies/required_labels.rego
package pr.labels

import rego.v1

approved_labels := {"bug", "feature", "chore", "security"}

violation contains msg if {
	count(input.pull_request.labels & approved_labels) == 0
	msg := sprintf(
		"PR has no label from the approved set %v - add one before merge.",
		[approved_labels],
	)
}
```

```rego
# policies/allowed_base_images.rego
package docker.base_images

import rego.v1

approved_images := {"node", "python", "mcr.microsoft.com/devcontainers"}

violation contains msg if {
	some file in input.changed_dockerfiles
	some line in file.lines
	startswith(line.text, "FROM ")
	image := trim_space(substring(line.text, 5, -1))
	not startswith_any(image, approved_images)
	msg := sprintf(
		"%s:%d - base image '%s' is not in the approved list %v.",
		[file.path, line.number, image, approved_images],
	)
}

startswith_any(s, prefixes) if {
	some prefix in prefixes
	startswith(s, prefix)
}
```

```rego
# policies/workflow_permissions.rego
package workflows.permissions

import rego.v1

violation contains msg if {
	some file in input.changed_workflows
	not file.has_top_level_permissions
	msg := sprintf(
		"%s has no top-level 'permissions:' block - add one scoped to least privilege.",
		[file.path],
	)
}
```

Each `violation` rule produces its own message, with the file and line where relevant - the same discipline as a good code review comment, because that message is what a developer sees on a failed check, not a Rego stack trace.

***

## Running OPA in a GitHub Actions Workflow

```yaml
name: Policy Check

on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  opa-policy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install OPA
        run: |
          curl -L -o opa https://openpolicyagent.org/downloads/v0.68.0/opa_linux_amd64_static
          chmod +x opa
          sudo mv opa /usr/local/bin/

      - name: Build policy input
        run: python scripts/build_policy_input.py > input.json

      - name: Evaluate policies
        run: |
          opa eval --format pretty \
            --data policies/ \
            --input input.json \
            "data.pr.labels.violation | data.docker.base_images.violation | data.workflows.permissions.violation" \
            > violations.json

      - name: Fail on violations
        run: |
          if [ "$(jq -e '. != [] and . != null' violations.json)" = "true" ]; then
            echo "Policy violations found:"
            jq -r '.[]' violations.json
            exit 1
          fi
          echo "No policy violations."
```

`build_policy_input.py` is the piece that's specific to your repo - it pulls the PR's labels via the GitHub API, diffs `Dockerfile`s in the PR against `main`, and parses changed workflow YAML files into the structured shape the Rego policies expect. OPA itself never talks to GitHub directly; it only evaluates whatever structured input it's handed, which keeps the policies themselves testable in isolation without a live PR to test against.

***

## Testing Policies Without a Live PR

Because Rego policies are pure functions over structured input, they're testable the same way any code is - with fixture data, in CI, before they ever run against a real PR:

```rego
# policies/required_labels_test.rego
package pr.labels_test

import rego.v1
import data.pr.labels

test_no_labels_violates if {
	count(labels.violation) > 0 with input as {"pull_request": {"labels": []}}
}

test_approved_label_passes if {
	count(labels.violation) == 0 with input as {"pull_request": {"labels": ["bug"]}}
}
```

`opa test policies/` runs these as part of the same CI pipeline that evaluates real PRs - a policy change that breaks its own test suite fails before it ever gets a chance to incorrectly block (or incorrectly pass) someone else's PR.

***

## Making Violations Actionable

The single biggest determinant of whether a policy-as-code rollout survives contact with a real engineering org is whether a blocked developer knows exactly what to do next. A failed check that says `policy violation: PR-4471` sends someone to search Slack for who owns OPA. A failed check that says `Dockerfile:3 - base image 'ubuntu:latest' is not in the approved list {node, python, mcr.microsoft.com/devcontainers}` tells them the fix in the same line as the failure. Every `violation` rule in the policies above was written with that message as the actual deliverable - the Rego logic exists to produce it, not the other way around.

***

## Rolling Out Without Blocking Everyone on Day One

Same non-blocking-first sequencing as the agentic code review post and the Ruleset evaluation mode from earlier posts: run the policy check as a required-in-name-only status for a few weeks, let it post results without gating the merge button, and look at the actual violation rate before flipping it to a hard block. A policy that's correct in theory but has a bug in the input-building script will otherwise block every PR in the org simultaneously on rollout day - a failure mode this soft-launch period is specifically designed to catch before it's expensive.

***

## Closing

Policy as code doesn't replace human judgment in review - it removes the subset of review that was never judgment to begin with, just a rule a reviewer had to remember and a developer had to guess they'd violated. Rego makes that rule executable, testable, and versioned like the rest of the codebase; the GitHub Actions integration makes it run automatically on every PR instead of whenever a reviewer happens to notice. What's left for the human reviewer is what should have had their attention the whole time - the genuinely ambiguous calls a deterministic rule was never going to make correctly anyway.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
