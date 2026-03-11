---
author: Steve Kaschimer
date: 2026-05-29
image: /images/posts/2026-05-29-hero.png
image_prompt: "A precise, dark-mode technical editorial illustration — near-black background with electric green, steel blue, and off-white accents. The central composition shows a vertical pipeline of four labeled boxes connected by clean arrows: 'changes (detect paths)' → 'test (runs if src/ changed)' → 'coverage (runs if test ran)' → 'ci-gate (always runs)'. The ci-gate box glows distinctly in electric green with a thin concentric border, and a small label below it reads 'Required Status Check — Ruleset'. To the left of the pipeline, four thin red warning cards float at staggered heights, each labeled in small caps: 'FLAKY TESTS', 'SLOW PIPELINE', 'VACUOUS PASS', 'NO COVERAGE FLOOR'. Each card has a faint diagonal strikethrough in green, implying each failure mode has been resolved. The mood is clinical and resolved — not a chaotic system, but one that has been deliberately engineered. Avoid: generic green checkmarks, circuit-board textures, cartoon pipeline icons, any specific company or framework logos."
layout: post.njk
site_title: Tech Notes
summary: Status checks only block bad code if they are fast, reliable, correctly named, and actually enforced — this post covers the four ways pipelines fail that test and the concrete workflow patterns that fix each one.
tags: ["github-actions", "ci-cd", "code-quality", "developer-productivity"]
title: "Enforcing Code Quality with GitHub Actions Status Checks You Can Actually Trust"
---

Your required status checks are configured. CI is green. PRs merge. The team believes the gate is working.

Then someone asks: what happens if a developer pushes directly to `main`? What happens when the test suite takes 18 minutes and developers start merging before results are in — or, worse, start suppressing failures to keep velocity up? What happens when a job is renamed in the workflow file and silently stops matching the required check name, so every PR from that point forward merges without the check running at all?

Status checks are only a quality gate if they are fast, reliable, correctly named, and actually enforced. Most pipelines satisfy one or two of those criteria. This post covers all four failure modes and a concrete fix for each.

---

## Failure Mode 1: Flaky Tests That Erode Trust

When tests fail non-deterministically, developers learn to re-run rather than investigate. That's rational behavior — if the test failed without a code change, the fix is to run it again. But it's catastrophic for a quality gate. Once re-running is the default response to a red check, the check stops functioning as a signal. It becomes a speed bump: an obstacle to clear, not a question to answer.

The erosion compounds. A developer re-runs a flaky test and it passes. The next time, a different developer re-runs a different flaky test. After enough repetitions, the implicit team norm becomes "if it's red, retry it." Actual failures get retried and missed.

### Identifying Flaky Tests

The `gh` CLI makes it straightforward to spot patterns. Look for jobs that fail on one run and pass on a re-run without any code change between them:

```bash
# Re-run only the failed jobs from the last workflow run
gh run rerun --failed <run-id>

# View the history of runs on a workflow, filtering by conclusion
gh run list --workflow ci.yml --limit 50 \
  --json conclusion,headBranch,headSha \
  | jq '.[] | select(.conclusion == "failure")'
```

Compare the failing run's SHA against subsequent passing runs. If the same SHA both fails and passes across runs, those tests are flaky by definition.

### The Quarantine Pattern

The immediate mitigation is to quarantine flaky tests into a separate job that does not block merge:

```yaml
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --testPathIgnorePatterns="flaky"

  flaky-tests:
    runs-on: ubuntu-latest
    continue-on-error: true   # doesn't block merge
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --testPathPattern="flaky"
```

`continue-on-error: true` means the `flaky-tests` job can fail without failing the workflow. It runs, it reports, but it does not gate. The `tests` job runs everything except the quarantined set and does gate.

This is a mitigation, not a fix. The real fix is to treat flaky tests as bugs with a defined SLA — they cost more in lost trust than they save in coverage. A quarantined test that doesn't get scheduled for repair inside a sprint or two should be deleted. Zero coverage is more honest than false coverage.

***

## Failure Mode 2: Slow Pipelines That Developers Route Around

18-minute CI is a social engineering problem as much as a technical one. When developers know the check takes that long, some will merge "probably fine" work before results are in. Others will pressure reviewers to approve before CI completes. The pipeline hasn't broken — it's been socially bypassed. The 10-minute rule: if your full CI pipeline exceeds 10 minutes, you will observe developers routing around it within three months. Not because they're careless, but because the feedback loop is too slow to respect.

### Parallelizing Linters and Tests

The most common source of unnecessary serial time is running linters, type checks, and tests sequentially in one job. These have no dependency on each other. They should run in parallel:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

These three jobs run simultaneously. The workflow completes in `max(lint, typecheck, test)` time, not `sum`. If each takes three minutes, the total is three minutes instead of nine. `cache: 'npm'` in `actions/setup-node` handles dependency caching keyed on `package-lock.json` — on a cache hit, `npm ci` takes seconds.

### Using `paths` Filters to Skip Irrelevant Checks

A PR that only changes `README.md` or `docs/` does not need to run the full test suite. The `paths` trigger filter skips the workflow entirely for those PRs — zero runner minutes consumed:

```yaml
on:
  pull_request:
    paths:
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'
      - '.github/workflows/**'
```

There is an important caveat. If a required status check is configured and the workflow is skipped by a `paths` filter, GitHub marks the check as **Expected** rather than **Success** — and the PR is blocked. The check never ran, so GitHub doesn't know if it would have passed.

The fix is a `ci-gate` job that always runs and evaluates whether the real checks passed or were legitimately skipped. This is covered in detail in Failure Mode 3 below — the `ci-gate` pattern is the solution to both the bypass problem and the path-filter problem simultaneously.

### The Path-Aware CI Pattern

The production-correct approach uses `dorny/paths-filter` to detect which paths changed and make downstream jobs conditional:

```yaml
name: CI

on:
  pull_request:

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      src: ${{ steps.filter.outputs.src }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            src:
              - 'src/**'
              - 'package-lock.json'

  test:
    needs: changes
    if: needs.changes.outputs.src == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci && npm test

  # Always runs — this is the job configured as the required status check
  ci-gate:
    needs: [changes, test]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Check all required jobs passed or were skipped
        run: |
          if [[ "${{ needs.test.result }}" == "failure" ]]; then
            echo "Tests failed"
            exit 1
          fi
          echo "CI gate passed"
```

The `ci-gate` job runs on every PR without exception (`if: always()`). It checks the result of the `test` job: if `test` failed, `ci-gate` fails. If `test` was skipped because the paths didn't match, `ci-gate` passes — that's a legitimate skip. `ci-gate` is the one job name registered as a required status check. It is the stable contract between the workflow and branch protection.

***

## Failure Mode 3: Required Checks That Can Be Bypassed

> A **vacuous pass** occurs when a required status check is configured by name, but no check with that name runs on a given PR — GitHub treats an expected-but-absent check as satisfied and allows the merge to proceed.

This is the most insidious failure mode because it looks correct from the outside. Branch protection is enabled. Required checks are configured. PRs require checks to pass. But if the job was renamed — `unit-tests` became `jest` during a test runner migration, or a workflow file was restructured — the old required check name no longer matches any running check. Every PR from that point forward merges without running it.

This is a naming contract problem. The required check name in branch protection is a string. The job name in the workflow is a string. Nothing enforces that they match.

### Auditing the Mismatch

Check what's configured as required against what actually ran on recent PRs:

```bash
# List configured required status checks for main
gh api /repos/{owner}/{repo}/branches/main/protection \
  --jq '.required_status_checks.contexts'

# List checks that actually ran on the last merged PR
gh api /repos/{owner}/{repo}/commits/$(gh api /repos/{owner}/{repo}/pulls \
  --jq 'map(select(.state=="closed")) | first | .merge_commit_sha')/check-runs \
  --jq '[.check_runs[] | {name, status, conclusion}]'
```

Compare the two lists. Any name in the first list that doesn't appear in the second list is a vacuous pass waiting to happen — or already happening.

### Configuring Required Checks via the API

Clicking required checks in the UI works but isn't reproducible or auditable. Set them via the API instead:

```bash
# Set required status checks via API
# PUT replaces the full protection config — include null for unused fields
gh api --method PUT /repos/{owner}/{repo}/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci-gate"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null
}
EOF
```

`enforce_admins=true` removes the admin bypass from classic branch protection — without it, repository admins skip all rules by default. (For a more complete treatment of admin bypass and why Rulesets are the better long-term answer, see the [May 8 post on Rulesets](https://steve-kaschimer.github.io/posts/2026-05-08-github-branch-protection-rules-vs-rulesets/).)

Using Rulesets instead of classic branch protection, the required check is expressed as JSON that can be version-controlled and applied programmatically:

```json
{
  "type": "required_status_checks",
  "parameters": {
    "strict_required_status_checks_policy": true,
    "required_status_checks": [
      { "context": "ci-gate" }
    ]
  }
}
```

One required check name — `ci-gate` — that never changes. The workflow internals (job names, parallel vs. serial structure, which linter runs) can be refactored freely without ever touching branch protection configuration. The contract is between branch protection and `ci-gate`. Everything else is internal.

***

## Failure Mode 4: Coverage Enforcement With No Floor

Tests pass. Coverage is tracked. The badge on the README shows 73%. A PR removes a feature and its tests together — coverage drops to 65%. It merges. Nothing blocked it.

Status checks can enforce a coverage floor, but most teams configure the check without one. Tracking coverage and enforcing a minimum are different things. The badge is decorative. The threshold is functional.

### Enforcing a Floor in the Workflow

For Jest, threshold enforcement is built in — the `--coverageThreshold` flag causes the process to exit non-zero if the threshold isn't met, which fails the step, which fails the job, which blocks the merge:

```yaml
- name: Run tests with coverage
  run: npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
```

For other frameworks, read the coverage report and fail explicitly:

```yaml
- name: Check coverage threshold
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    echo "Line coverage: $COVERAGE%"
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage $COVERAGE% is below the 80% threshold"
      exit 1
    fi
```

### Threshold Philosophy

The floor should reflect your current coverage, not your aspirational coverage. Setting 80% when you're at 65% blocks every PR until someone dedicates a sprint to coverage work — which creates pressure to delete tests rather than write them, which is the opposite of the intent.

Set the threshold at current coverage minus a small buffer. If you're at 73%, set 70%. This prevents regression without creating an immediate blocker. Then raise it quarterly, by five points at a time, as part of normal engineering hygiene. A threshold that moves deliberately upward is more useful than one set aspirationally high and immediately disabled under pressure.

***

## The Stable Required Check Pattern

These four failure modes share a common solution: a single `ci-gate` job that acts as the stable contract between workflow internals and branch protection configuration.

```
PR opens
  → changes job:  detect which paths changed
  → lint job:     runs only if src/ changed (skipped otherwise)
  → test job:     runs only if src/ changed (skipped otherwise; coverage threshold enforced inline)
  → ci-gate job:  always runs, fails if lint or test failed
        ↑
        Required status check in Ruleset
```

The properties that make this pattern reliable:

1. **One stable check name** configured in branch protection or Rulesets: `ci-gate`. This string never needs to change regardless of what happens inside the workflow.
2. **`ci-gate` always runs** — `if: always()` ensures it has a result on every PR, including PRs where the real checks were skipped by path filters.
3. **`ci-gate` validates outcomes** — it passes if the real checks passed or were legitimately skipped; it fails if any real check failed.
4. **Workflow internals can change freely** — add a linter, rename a job, restructure parallelism. None of those changes affect the string registered in branch protection.
5. **Coverage threshold lives inside a job that `ci-gate` depends on** — the `test` job exits non-zero if coverage falls below the threshold, which propagates through `needs` and surfaces as a `ci-gate` failure.

The complete wiring for a typical project:

```yaml
name: CI

on:
  pull_request:

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      src: ${{ steps.filter.outputs.src }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            src:
              - 'src/**'
              - 'package-lock.json'

  lint:
    needs: changes
    if: needs.changes.outputs.src == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci && npm run lint

  test:
    needs: changes
    if: needs.changes.outputs.src == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: >
          npm ci && npm test -- --coverage
          --coverageThreshold='{"global":{"lines":80}}'

  ci-gate:
    needs: [changes, lint, test]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Check all required jobs passed or were skipped
        run: |
          for result in "${{ needs.lint.result }}" "${{ needs.test.result }}"; do
            if [[ "$result" == "failure" || "$result" == "cancelled" ]]; then
              echo "A required job did not pass: $result"
              exit 1
            fi
          done
          echo "CI gate passed"
```

Register `ci-gate` as the required status check in your Ruleset. Everything else is an implementation detail.

***

<div class="callout-box">

## Status Check Audit Checklist

Run this against your current setup before the next sprint planning:

- [ ] List your required status check names (`gh api /repos/{owner}/{repo}/branches/main/protection --jq '.required_status_checks.contexts'`) and verify they match actual job names running on recent PRs
- [ ] Check whether "Include administrators" is enforced on classic branch protection — or migrate to Rulesets (see May 8 post) where admin bypass is explicitly configurable
- [ ] Identify any test jobs that fail non-deterministically across the last 20 runs — quarantine them with `continue-on-error: true` and file them as bugs with an SLA
- [ ] Measure CI wall-clock time on the last 10 PRs — is the median under 10 minutes? If not, identify which serial jobs can be parallelized
- [ ] If using `paths` filters on the workflow trigger: verify you have a `ci-gate` job with `if: always()` that is the registered required check name
- [ ] Set a coverage threshold at current coverage minus 2–3% — then raise it 5 points per quarter
- [ ] Name the job registered as required status check something stable (`ci-gate`) so workflow refactoring never silently disables enforcement

</div>

Status checks are the enforcement layer between "code was reviewed" and "code meets quality standards." When they're slow, developers route around them. When they're flaky, developers stop trusting them. When they're misconfigured, they enforce nothing at all.

The fixes aren't complex — parallel jobs, a stable gate job, a coverage floor, path-aware skipping — but they require deliberate design. Default pipelines rarely have all four in place. A status check that developers respect and that actually enforces what it claims to enforce is one of the highest-leverage investments in code quality a team can make. It compounds: every PR, every merge, every release, automatically.

***

Questions about CI design, workflow architecture, or structuring required checks across an org? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
