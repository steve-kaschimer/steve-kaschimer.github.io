---
author: Steve Kaschimer
date: 2026-03-13
image: /images/posts/2026-03-13-hero.png
image_prompt: "A clean, technical illustration in a dark-mode aesthetic — deep charcoal background with cool blue and violet accent tones. Two parallel vertical swimlanes represent execution environments: the left lane labeled 'Reusable Workflow' shows a complete bordered job box with its own runner icon and status badge; the right lane labeled 'Composite Action' shows a flat sequence of inline steps nested inside a parent job box. Subtle YAML code fragments float behind each lane as ghost text. A branching decision node sits at the top center, rendered as a crisp geometric diamond. Mood: precise, architectural, the kind of diagram a senior engineer would draw on a whiteboard before saying 'it matters which one you pick.' Avoid: any generic gears, cloud logos, or abstract circuit-board textures."
layout: post.njk
site_title: Tech Notes
summary: Reusable workflows and composite actions solve different problems — understand the secret-passing rules, matrix scoping, and status-check semantics before you pick one.
tags: ["github-actions", "ci-cd", "devops", "workflow-design"]
title: "GitHub Actions: Reusable Workflows vs. Composite Actions — Know the Difference"
---

Every team that grows past a handful of GitHub Actions workflows eventually hits the same wall: duplicated YAML, copy-pasted step sequences, a `deploy` job that lives in six repositories. The solution is obvious — abstract the common pieces. GitHub gives you two tools to do that: **reusable workflows** and **composite actions**. The docs present them as siblings. They're not. They operate at different levels of the execution model, enforce different scoping rules, and fail in different ways when you use them outside their intended purpose.

Most of the bugs I've seen come from one pattern: a developer reads about both abstractions, picks the one that looks right, and discovers the hard way that secrets don't arrive, matrix values vanish, or a branch protection rule silently stops enforcing. This post walks through three concrete failure scenarios — real YAML, real error behavior — and ends with a decision framework you can apply without rereading the docs.

---

## What Each One Actually Is

Before the failure scenarios, a precise definition of each mechanism. The marketing framing ("reuse your workflows!") is accurate but useless for debugging.

### Reusable Workflows

> A reusable workflow is a complete workflow file that runs as its **own job** (or set of jobs) inside the calling workflow run. It is invoked at the `jobs:` level using `uses:`.

```yaml
# caller.yml
jobs:
  test:
    uses: ./.github/workflows/run-tests.yml
    with:
      node-version: "20"
    secrets: inherit
```

The called file must declare `on: workflow_call:`. It runs on its own runner, in its own environment, with its own job context. From GitHub's perspective — and from branch protection's perspective — it appears as a separate job in the workflow run, with its own status check named `<calling-job> / <reusable-job>`.

### Composite Actions

> A composite action is a reusable sequence of **steps** that runs inside the calling job. It is invoked at the `steps:` level using `uses:`, just like any other action.

```yaml
# caller.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: ./.github/actions/setup-node
        with:
          node-version: "20"
      - run: npm test
```

The called file is an `action.yml` that declares `runs.using: composite`. Its steps execute inside the calling job, sharing the runner, the workspace, environment variables, and the job context. It is not a separate job. It has no separate status check.

That structural difference — job vs. steps — is the source of every failure scenario below.

***

## The Three Failure Scenarios

### 1. The Disappearing Secret

This is the most common gotcha. A team moves their deployment logic into a composite action and discovers that the secret they need is silently empty at runtime.

**The broken setup:**

```yaml
# .github/actions/deploy/action.yml
name: Deploy
description: Deploy to production
runs:
  using: composite
  steps:
    - name: Call deployment API
      shell: bash
      run: |
        curl -sf -X POST \
          -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" \
          https://api.example.com/deploy
```

```yaml
# .github/workflows/release.yml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/deploy
```

The `curl` command sends an empty `Authorization` header. The API returns a 401. Nothing in the logs explains why — `${{ secrets.DEPLOY_TOKEN }}` just evaluates to an empty string inside the composite action because **the secrets context is not available inside composite action YAML**. Composite actions run within the calling job's environment, but they don't inherit the calling job's secrets context automatically. GitHub explicitly scopes secrets away from composite action definitions to prevent accidental secret forwarding into third-party actions.

**The fix — pass it as an input:**

```yaml
# .github/actions/deploy/action.yml
name: Deploy
description: Deploy to production
inputs:
  deploy-token:
    description: API token for the deployment endpoint
    required: true
runs:
  using: composite
  steps:
    - name: Call deployment API
      shell: bash
      env:
        DEPLOY_TOKEN: ${{ inputs.deploy-token }}
      run: |
        curl -sf -X POST \
          -H "Authorization: Bearer ${DEPLOY_TOKEN}" \
          https://api.example.com/deploy
```

```yaml
# .github/workflows/release.yml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/deploy
        with:
          deploy-token: ${{ secrets.DEPLOY_TOKEN }}
```

Two things changed. First, the composite action declares a `deploy-token` input and reads it via `inputs.deploy-token`. Second, the calling workflow explicitly passes `${{ secrets.DEPLOY_TOKEN }}` via `with:`. The secret is now in scope at the call site, where the secrets context *is* available, and forwarded as an opaque input value.

Notice the `env:` block in the step definition. Referencing secrets (including values derived from inputs that originally came from secrets) via environment variables rather than inline `${{ }}` interpolation is a defense-in-depth practice — it prevents the value from appearing in runner debug logs when step debug logging is enabled.

If your composite action needs many secrets, the `with:` list can get long fast. When that happens, it's often a signal that a reusable workflow is actually the right tool — it supports `secrets: inherit`, which passes all secrets from the calling workflow automatically.

### 2. The Matrix That Won't Cooperate

A developer wants to test their library against three Node.js versions. They already have a reusable workflow for running tests. The natural move seems to be: loop the matrix, call the reusable workflow for each combination. They write this:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    strategy:
      matrix:
        node: [18, 20, 22]
    uses: ./.github/workflows/run-tests.yml
    with:
      node-version: ${{ matrix.node }}
```

This actually works syntactically — `matrix.*` is available in the `with:` block of a reusable workflow call when the calling job has a `strategy.matrix` defined. Each matrix combination triggers a separate invocation of the reusable workflow. So far so good.

The problem appears in the GitHub Actions UI and in branch protection rules. Each matrix combination produces a set of jobs named:

```
test (18) / lint
test (18) / unit-tests
test (20) / lint
test (20) / unit-tests
test (22) / lint
test (22) / unit-tests
```

If you had a required status check configured as `lint` or `unit-tests`, it no longer matches anything. The check names now include the calling job name AND the matrix suffix. Your branch protection rule passes vacuously — no check with that name exists, so GitHub considers it satisfied — and you've accidentally disabled your quality gate.

**The fix:** Update your required status checks to match the full generated names, or restructure so the matrix lives inside the reusable workflow rather than at the call site:

```yaml
# .github/workflows/run-tests.yml
on:
  workflow_call:

jobs:
  unit-tests:
    strategy:
      matrix:
        node: [18, 20, 22]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci && npm test
```

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    uses: ./.github/workflows/run-tests.yml
```

Now the generated job names are `test / unit-tests (18)`, `test / unit-tests (20)`, and `test / unit-tests (22)`. The required status check `test / unit-tests (18)` is predictable and won't shift when the caller changes. Better yet: you can require just `test / unit-tests` and GitHub will wait for all matrix variants to pass.

A composite action sidesteps this entirely — its steps appear within the parent job, and the job name in branch protection is just the job name. No suffix, no nesting. If you're not sharing the workflow cross-repo and don't need secrets isolation, a composite action plus a matrix on the calling job is cleaner.

### 3. The Status Check That Lies

This one is the most dangerous because it doesn't cause a visible failure. It causes a **missing** failure — a gate you thought was enforcing stops enforcing.

Suppose you have a workflow with a `build` job that your branch protection rules require to pass before merging. The team refactors `build` to call a reusable workflow:

```yaml
# Before refactor
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build

# After refactor
jobs:
  build:
    uses: ./.github/workflows/build.yml
```

The reusable workflow file contains a job named `compile`:

```yaml
# .github/workflows/build.yml
on:
  workflow_call:

jobs:
  compile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
```

After the refactor, the workflow run produces a check named `build / compile`. The old check named `build` no longer exists. GitHub's required status check for `build` now matches nothing, so it's considered satisfied automatically. Every PR merges regardless of whether the build passes.

Nobody notices until a broken build ships to production.

**The fix has two parts:**

First, update the required status check in branch protection from `build` to `build / compile` to match the new job name structure:

```yaml
# GitHub API — update required status check
# PATCH /repos/{owner}/{repo}/branches/{branch}/protection
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build / compile"]
  }
}
```

Second, make this explicit in your reusable workflow by naming the job clearly:

```yaml
# .github/workflows/build.yml
on:
  workflow_call:

jobs:
  build:          # ← name this to match what branch protection expects
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
```

If the reusable workflow job is also named `build`, the required check becomes `build / build` — redundant but unambiguous. Some teams prefix reusable workflow jobs with `rw-` to make it obvious which job names come from reusable workflows.

Composite actions don't have this problem. Their steps roll up into the parent job's status. If you refactor steps into a composite action, the job name in branch protection doesn't change. This is one of the strongest arguments for composite actions when cross-repo sharing isn't needed.

***

## Decision Framework

Use these rules. They're opinionated because ambiguity is what causes the bugs described above.

**Reach for a reusable workflow when:**
- You need secrets to be available inside the abstraction without explicitly passing each one (use `secrets: inherit`)
- You want the abstraction to appear as its own named job in the workflow UI and in status checks
- The workflow needs to run on a different runner type than the caller (separate `runs-on`)
- You're sharing the automation across repositories
- The logic involves multiple jobs with dependencies between them

**Reach for a composite action when:**
- You're sharing a sequence of steps within the same repository (or same workflow)
- The steps need access to the calling job's workspace, environment variables, or matrix context
- You want the steps to appear inline in the calling job — same status check, same log view
- You're building a reusable action you'll publish to the GitHub Marketplace
- Keeping the calling workflow's total job count low matters for readability

One rule of thumb that holds up: if you're thinking "I want this to look like a step," use a composite action. If you're thinking "I want this to look like a job," use a reusable workflow.

***

## Side-by-Side Reference

| Capability | Reusable Workflow | Composite Action |
|---|---|---|
| **Invoked at** | `jobs:` level (`uses:`) | `steps:` level (`uses:`) |
| **Runs on** | Its own runner | Calling job's runner |
| **Appears in UI as** | Separate job(s) | Steps within calling job |
| **Status check name** | `<caller-job> / <rw-job>` | Same as calling job |
| **Secrets access** | Via `secrets:` or `secrets: inherit` | Must pass via `with:` inputs |
| **Calling job's env vars** | Not inherited | Inherited |
| **Calling job's workspace** | Not shared | Shared |
| **Matrix context** | Not inherited; pass via `inputs` | Inherited (`${{ matrix.* }}` works) |
| **Cross-repo use** | Yes | Yes (if published or referenced by path) |
| **`outputs` support** | Yes (workflow-level outputs) | Yes (action-level outputs) |
| **Multiple jobs** | Yes, with `needs:` chains | No (steps only) |
| **`strategy.matrix`** | Definable inside the workflow | N/A — runs within calling job |

***

## Closing Thoughts

Reusable workflows and composite actions are not interchangeable. The GitHub documentation groups them under "reusing workflows" in a way that makes them look like two flavors of the same thing. They're not. One is a job abstraction; the other is a step abstraction. That difference determines everything: how secrets flow, how status checks are named, how matrix strategies compose, and where logs appear.

The three failure scenarios in this post — the disappearing secret, the matrix naming problem, and the missing status check — don't show up as actionable errors. They show up as empty strings, confusing UI, and security gates that quietly stop working. The fix is always the same: understand which layer you're operating at and choose the abstraction that matches.

If you're auditing existing workflows for these issues, start with branch protection. Pull your required status check names, run a recent workflow, and verify every required check name appears somewhere in the checks list. If anything is missing, you've found a silent bypass. That's the one worth fixing first.

***

Have questions about structuring your GitHub Actions pipelines, or want help auditing your branch protection rules? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
