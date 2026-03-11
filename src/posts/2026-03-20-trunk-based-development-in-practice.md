---
author: Steve Kaschimer
date: 2026-03-20
image: /images/posts/2026-03-20-hero.png
image_prompt: "A wide, horizontal illustration in a warm-but-technical style — off-white background with deep forest green, amber, and slate blue. A single thick horizontal trunk line stretches across the canvas, labeled 'main.' From it sprout three very short branch stubs, each no longer than a thumb's width, each curving swiftly back into the trunk. In stark contrast, a ghosted background shows a tangle of long, serpentine branches that never converge — slightly desaturated, visually chaotic, receding into the distance. Small feature-flag toggle switches appear along the trunk like signal lights on a rail line. Mood: confident momentum, engineering discipline, the satisfaction of a system that actually works. Avoid: Git logo, any reference to specific tools, generic 'branching tree' stock illustration styles."
layout: post.njk
site_title: Tech Notes
summary: Trunk-based development promises elite software delivery performance, but most adoption attempts fail on unspoken prerequisites — feature flags, expand/contract migrations, and a CI pipeline that earns trust.
tags: ["devops", "ci-cd", "developer-productivity"]
title: "Trunk-Based Development in Practice: What They Don't Tell You"
---

The internet has no shortage of "trunk-based development is better than GitFlow" hot takes. They're not wrong, but they're not useful either. Teams read the post, nod along, rename their `develop` branch to `main`, and wonder two sprints later why nothing has changed. The abstract argument isn't the hard part. The hard part is the prerequisites — the tooling and cultural wiring that has to be in place before TBD actually works. Nobody writes about those.

So let's do that instead.

---

## Why the Research Points Here

**Trunk-based development (TBD)** is the practice of integrating code to a shared mainline frequently — at minimum daily, ideally multiple times a day — rather than maintaining long-lived feature or release branches. It sounds simple. The implications are not.

In *Accelerate* (Nicole Forsgren, Jez Humble, Gene Kim), the authors analyzed four years of DORA survey data spanning thousands of organizations and found that trunk-based development is one of a small cluster of technical practices that statistically separates elite software delivery performers from everyone else. Elite performers — the cohort deploying on demand, with lead times under an hour and change failure rates under 15% — almost universally practice TBD. It shows up alongside continuous integration, comprehensive test automation, and loosely coupled architecture as a predictor of both delivery throughput *and* stability.

> "High performers were more likely to practice trunk-based development, have fewer than three active branches, and merge to trunk daily." — *Accelerate*, Forsgren et al.

The data point that tends to surprise people: TBD is correlated with *both* speed and reliability. The instinct is to assume that committing often to a shared branch increases instability. The research says the opposite. Long-lived branches accumulate integration debt that gets paid — with interest — at merge time. The longer you wait to integrate, the more expensive it gets.

That's the theory. Here's what it takes to actually do it.

***

## What TBD Actually Requires

### Feature Flags as a First-Class Citizen

The most common objection to TBD is: "What do we do with work that isn't ready for production?" The answer is **feature flags**, and if you don't have them, you don't have TBD — you have wishful thinking.

The model is simple: code that isn't ready for users still ships to production. It just ships behind a flag that keeps it dark. This decouples *deployment* (getting code onto servers) from *release* (exposing it to users). Once that mental model clicks, a lot of the fear around TBD dissolves.

Not all flags are the same. There are three types worth distinguishing:

- **Release toggles** are long-lived flags that gate an unreleased feature. They're the most common, and the most abused.
- **Ops toggles** are runtime switches — circuit breakers, kill switches for expensive features under load. These have a legitimate long lifespan.
- **Experiment toggles** are A/B test controls. They're tied to a hypothesis with a defined end date.

A minimal flag pattern doesn't require LaunchDarkly or a feature management platform. A config value or environment variable will do for early-stage work:

```typescript
// config.ts
export const flags = {
  newCheckoutFlow: process.env.FEATURE_NEW_CHECKOUT === "true",
};

// checkout.ts
import { flags } from "./config";

function renderCheckout(user: User) {
  if (flags.newCheckoutFlow) {
    return renderNewCheckout(user);
  }
  return renderLegacyCheckout(user);
}
```

The pattern is trivial. The discipline is not. **Flag lifecycle** is where teams get into trouble. Flags accumulate. Developers ship behind a flag, the feature launches, and the flag never gets removed. Six months later you have 40 flags controlling behavior that shipped a year ago, and nobody is confident about what happens if you toggle one. Treat flags like debt: every flag you create should have a removal ticket filed the day it ships to production. Make "remove old flags" a recurring part of your sprint.

### Database Migrations Without Long-Lived Branches

Schema changes are the hardest part of TBD to get right, and the one most tutorials skip. The problem is classic: you need to rename a column, but the current production code still reads the old column name. If you deploy the migration before the application code, production breaks. If you merge the application code first, it breaks because the column doesn't exist yet. Long-lived branches "solve" this by bundling both changes together — and that solution is exactly what TBD rules out.

The answer is the **expand/contract pattern**, also called parallel change. Instead of making a breaking schema change in one step, you split it into three phases deployed across separate releases:

**Phase 1 — Expand:** Add the new column alongside the old one. Deploy application code that *writes to both* and reads from the old column. At this point, both versions of the code are compatible with the schema.

```sql
-- Migration 001: Add the new column (non-breaking)
ALTER TABLE orders ADD COLUMN customer_reference VARCHAR(255);
```

**Phase 2 — Migrate and cut over:** Deploy application code that reads from the *new* column. Run a backfill to populate the new column for existing rows. Both the old and new column still exist — a rollback is still safe.

```sql
-- Migration 002: Backfill existing rows
UPDATE orders SET customer_reference = order_ref WHERE customer_reference IS NULL;
```

**Phase 3 — Contract:** Once you're confident the new column is correct and the old column is no longer read anywhere in production code, drop it.

```sql
-- Migration 003: Drop the old column (safe to run after code is fully deployed)
ALTER TABLE orders DROP COLUMN order_ref;
```

This is not glamorous, but it is safe. It also means you can deploy at any of these phases independently, which is exactly what TBD demands.

### The Minimum CI Gate

TBD has exactly one non-negotiable: **trunk is always deployable**. If you can't guarantee that, the whole model breaks down. The mechanism that enforces it is your CI pipeline.

Every commit to `main` must run your test suite and block merge on failure. That's table stakes. The less obvious constraint is speed. The target is **under 10 minutes**. This is not arbitrary. When a pipeline takes 30 minutes, developers stop waiting for it. They queue up another change, or they start multitasking, or they just merge and hope. The feedback loop breaks. Small batches accumulate. You're back to GitFlow behavior with a different branch name.

Here's a minimal GitHub Actions workflow that enforces this:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run lint
        run: npm run lint
```

The `timeout-minutes: 10` is doing real work here — it enforces the discipline in code, not just policy. If your test suite is already over 10 minutes, parallelizing test execution and aggressively culling slow integration tests is the first investment you need to make before TBD is viable.

### Short-Lived Branches (If You Use Branches at All)

TBD does not require that every developer commits directly to `main`. Short-lived feature branches with pull requests are fine — and for most teams, preferable. The rule is: **a branch that lives longer than one day is a risk.** A branch that lives longer than a week is a problem.

The target is branches that represent a few hours of work, get reviewed, and merge the same day. When a task is genuinely larger than that, the skill to develop is decomposition — breaking the work into independently mergeable slices, each behind a feature flag if needed.

**Stacked PRs** are a technique worth knowing here. Instead of one massive PR that touches the data layer, API layer, and UI, you create three PRs where each one builds on the previous. PR 1 merges first. PR 2 is rebased on top of it. PR 3 is rebased on PR 2. Each is small and reviewable. The stack merges in order over the course of a day. This is how you do large changes without long-lived branches.

***

## How to Talk Your Team Out of GitFlow

Don't argue abstractions. "Trunk-based development has better research support" will not move anyone who has spent three years on a team where GitFlow worked fine. Argue consequences.

**Long-lived branches create merge conflicts.** Merge conflicts are not a technical nuisance — they are lost time, and they compound. A branch that was one day of work becomes two days when you factor in the merge and the re-testing.

**GitFlow's release branch is solving the wrong problem.** The `release/2.4.1` branch exists to stabilize code before it ships. TBD solves the same problem differently: with a CI pipeline that keeps main stable, and feature flags that let you exclude unready work. The stabilization is continuous, not batch.

**The hotfix question.** Teams always ask this one: "What about hotfixes? We need a way to patch production without shipping everything in develop." This is a legitimate scenario. TBD handles it better, not worse. If `main` is always deployable, a hotfix is just: commit the fix to main, deploy. There's no `hotfix/` branch to create, no cherry-pick into `develop`, no cherry-pick into `main`. The ceremony GitFlow adds for hotfixes is ceremony that only exists because GitFlow made the process complicated in the first place.

**The migration path.** Don't try to flip a team from GitFlow to TBD overnight. Start with one metric: branch lifetime. Track how long the average branch lives from creation to merge. Make it visible. Set a goal. Start pushing toward same-day merges. That single habit change will surface all the tooling gaps — missing feature flags, slow pipelines, large PRs — and give you a concrete agenda for fixing them. Branch lifetime is the leading indicator for everything else.

***

## The Minimum GitHub Setup for TBD

The tooling that enforces TBD practices in GitHub is **branch protection rules** (or the newer rulesets for organizations). Here's the minimum configuration that makes the model work:

```yaml
# Equivalent repository ruleset (GitHub API / terraform-github-provider)
ruleset:
  name: "Trunk Protection"
  target: branch
  enforcement: active
  conditions:
    ref_include: ["~DEFAULT_BRANCH"]
  rules:
    - type: required_status_checks
      parameters:
        strict_required_status_checks_policy: true  # branch must be up to date
        required_status_checks:
          - context: "CI / test"
          - context: "CI / lint"
    - type: pull_request
      parameters:
        required_approving_review_count: 1
        dismiss_stale_reviews_on_push: true
    - type: non_fast_forward          # no force-pushes to main
    - type: deletion                  # can't delete main
```

If you prefer GitHub UI, the key settings are: **Require status checks to pass before merging**, **Require branches to be up to date before merging**, and **Require a pull request before merging**. Enable **Automatically delete head branches** at the repository level to keep the branch list clean.

One opinion worth taking: **include administrators in the restriction**. The "bypass for admins" escape hatch gets used. When it does, it undermines the trust the CI gate is supposed to build. If the trunk is always deployable, there's no reason admins need to bypass it.

***

<div class="callout-box">

## TBD Readiness Checklist

Use this to assess whether your team has the prerequisites in place before making the switch:

- [ ] CI pipeline completes in **under 10 minutes** — if not, parallelization is the first project
- [ ] **Feature flags** exist for in-progress or unreleased work — code ships dark
- [ ] Database migrations follow the **expand/contract pattern** — no single-step breaking changes
- [ ] Branches are **deleted within 24 hours** of creation — track this as a team metric
- [ ] Every merge to main **triggers a deployment** (to at least a staging environment)
- [ ] Developers are comfortable **committing incomplete work behind a flag** — this is the cultural shift

If more than two of these are unchecked, start there before changing your branching strategy. The tools have to be in place before the practice is safe.

</div>

## The One Thing to Do First

TBD isn't hard because of Git. Git is fine. It's hard because it exposes every gap in your delivery pipeline and makes every cultural shortcut visible. Teams that succeed treat it as an engineering practice with prerequisites — not a branching strategy you adopt by announcing it in a team meeting.

If you're starting from GitFlow, the single change with the most leverage is this: **stop creating branches that last more than a day.** Not as a rule you enforce immediately, but as a target you start measuring toward. That one constraint will surface the flag infrastructure you need, the pipeline speed you're missing, and the decomposition skills your team hasn't had to develop yet. Fix those, and the rest follows.

The research is clear on where this leads. The path there is less a strategy swap and more an engineering discipline you build one merged PR at a time.

***

Want to talk through a TBD migration for your team, or figure out where to start? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
