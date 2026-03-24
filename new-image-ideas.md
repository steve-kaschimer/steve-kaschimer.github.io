# Image Ideas for Posts Finalized 2026-03-11

---

## 1. Enforcing Code Quality with GitHub Actions Status Checks You Can Actually Trust
`src/posts/2026-05-29-github-actions-status-checks-you-can-trust.md`

1. **Screenshot: Vacuous pass in action** — A GitHub PR page screenshot showing a required status check listed as "Expected" (not "Success") because the job was renamed. Annotated with a red callout box pointing to the "Expected" badge, labeled "This PR can merge — the check never ran."

2. **Code sample: The ci-gate pattern** — A clean, syntax-highlighted image of the complete `ci-gate` YAML block (`if: always()`, the `needs` array, the shell script checking each job result), styled as a dark-mode code card. Optionally add margin annotations showing which part solves which failure mode.

3. **Diagram: Pipeline flow with path-aware skipping** — A vertical swimlane diagram showing `changes → lint → test → ci-gate`, with a "README-only PR" branch that bypasses lint/test but still produces a green `ci-gate`. Contrasts with a second column showing what happens without `ci-gate` (PR blocks on "Expected").

---

## 2. Generating and Using SBOMs with GitHub Actions
`src/posts/2026-04-10-generating-and-using-sboms-with-github-actions.md`

1. **Terminal screenshot: jq query against a real SBOM** — A terminal window running `jq '.components[] | select(.name == "some-package") | {name, version, purl}' sbom.cyclonedx.json` and showing the output — a real-looking PURL string (`pkg:npm/lodash@4.17.21`) and version. Demonstrates the "mystery vulnerability" debugging scenario in concrete terms.

2. **Code sample: The permissions block** — A side-by-side code card showing a workflow `permissions:` block *without* the three required entries (red/dimmed) next to one *with* `contents: write`, `id-token: write`, and `attestations: write` (green). Adds a callout: "Without `id-token: write`, attestation silently fails."

3. **Screenshot: gh attestation verify output** — A terminal screenshot of `gh attestation verify sbom.cyclonedx.json --owner ... --format json | jq ...` showing the verification result — signer identity, workflow ref, commit SHA. Illustrates cryptographic provenance in the most concrete possible way.

---

## 3. Shift Right: Why Production Observability Is a Security Practice
`src/posts/2026-05-15-shift-right-observability-as-a-security-practice.md`

1. **Diagram: Shift-left vs. shift-right coverage map** — A horizontal timeline from "code commit" to "production traffic," with shift-left tools (linters, SAST, secrets scanning, tests) annotated on the left half and observability/detection tools (log anomalies, auth failure rates, outbound traffic spikes) annotated on the right. Shows the gap between the two — the deployment boundary that neither side covers.

2. **Screenshot: An alerting rule or dashboard panel** — A Grafana/Datadog-style panel (or annotated screenshot of a GitHub Actions OIDC log) showing an auth-failure rate spike with a threshold line, or an outbound connection to an unexpected host. Conveys "your logs already have this signal — you just need to watch for it."

3. **Code sample: A structured log query** — A syntax-highlighted snippet of a log query (e.g., a Loki LogQL or Splunk SPL query) filtering for failed authentication events above a threshold, with an inline annotation explaining each clause. Makes the "turn observability into detection" concept concrete.

---

## 4. GitHub CLI Power User: 10 `gh` Commands That Replace Browser Tabs
`src/posts/2026-04-17-github-cli-power-user.md`

1. **Terminal screenshot: gh run watch in action** — A real or realistic terminal showing `gh run watch --exit-status` live-updating with job statuses (✓ lint, ✓ typecheck, ● test running…), demonstrating the zero-browser-tab CI monitoring workflow.

2. **Screenshot: gh pr checkout + git log side-by-side** — Left pane shows `gh pr checkout 342` completing in the terminal. Right pane shows `git log --oneline -5` on the newly checked-out branch. Together they show the complete "PR review from terminal" flow.

3. **Code sample or screenshot: gh issue develop** — Terminal showing `gh issue develop 88 --checkout` completing, followed by `git branch` output showing the new branch named after the issue. Annotated with "Branch created, checked out, and linked to issue #88 in one command."

---

## 5. Dependabot Advanced: Getting Past the Noise
`src/posts/2026-03-27-dependabot-advanced-getting-past-the-noise.md`

1. **Screenshot: Before/after PR inbox comparison** — Left side: a GitHub PR list filtered to Dependabot showing 40+ individual version-bump PRs, timestamps aging. Right side: the same repo after grouping config, showing 3–4 grouped PRs (e.g., "dev-dependencies," "patch-updates," one security PR). No annotation needed — the contrast is self-evident.

2. **Code sample: The groups configuration** — A clean code card showing a `.github/dependabot.yml` `groups:` block with `dev-dependencies` and `production-patch` groups defined, with `patterns` and `update-types` specified. Annotated: "This config is what cuts 40 PRs to 4."

3. **Diagram: Dependabot PR lifecycle with auto-merge** — A simple flowchart showing a patch-level Dependabot PR entering, passing CI, matching the auto-merge conditions, and merging without human review — versus a major-version PR that stops at a human review gate. Shows the two-tier triage model.

---

## 6. Trunk-Based Development in Practice: What They Don't Tell You
`src/posts/2026-03-20-trunk-based-development-in-practice.md`

1. **Diagram: Short-lived branch lifecycle** — A git-log-style diagram showing a feature branch opened, two commits added, and merged back into `main` within 24 hours — with a measurement annotation showing "< 1 day." Contrasted (ghosted, background) with a long-lived branch that diverges for two weeks and requires a painful merge.

2. **Code sample: Feature flag gate** — A simple code snippet (language-agnostic pseudocode or real framework) showing `if (featureFlags.isEnabled('new-checkout')) { ... }` wrapping an incomplete feature. Annotated: "Ships to production. Nobody sees it. Trunk stays green."

3. **Screenshot: CI passing on a tiny commit** — A GitHub Actions run triggered by a commit with a one-line diff — something like `fix: correct null check in cart service` — showing all checks green in under 3 minutes. The smallness of the diff is the point: TBD only works when CI is fast enough to trust on a 5-line change.

---

## 7. Writing Commit Messages That Make Code Review Faster
`src/posts/2026-04-24-writing-commit-messages-that-make-code-review-faster.md`

1. **Screenshot: git log --oneline before and after** — A terminal split: left shows `git log --oneline` with messages like "fix", "wip", "update", "more fixes". Right shows the same history after rewriting with Conventional Commits format (`feat(cart): add coupon code validation`, `fix(auth): handle null session on logout`). The difference in readability is immediate.

2. **Code sample: commit-msg hook** — A syntax-highlighted shell script for a `.git/hooks/commit-msg` (or `commitlint` config) that enforces the `type(scope): subject` format, with a sample rejection message when the format doesn't match. Shows enforcement, not just convention.

3. **Diagram: Conventional Commits anatomy** — A single commit message broken into labeled parts: `type` (feat), `scope` (auth), `subject` (imperative, ≤72 chars), `body` (why, not what), `footer` (breaking change / closes). Each section annotated with a one-line rule. Clean, reference-card style.

---

## 8. GitHub Actions: Reusable Workflows vs. Composite Actions — Know the Difference
`src/posts/2026-03-13-github-actions-reusable-workflows-vs-composite-actions.md`

1. **Diagram: Execution model comparison** — Side-by-side swimlane diagram. Left: a calling workflow spawning a reusable workflow as a separate job (separate runner box, its own status check entry). Right: a composite action inlined as steps within the calling job's runner box. The distinct runner boundaries are the key visual.

2. **Code sample: Secret-passing failure** — A two-panel code card. Left panel shows a reusable workflow called *without* `secrets: inherit` and the secret failing to arrive (with a comment showing the masked `***` in logs). Right panel shows the correct `secrets: inherit` or explicit `secrets:` mapping. This is the most common "why doesn't this work?" question.

3. **Screenshot: Status check for a reusable workflow job** — A GitHub PR status checks list showing a job from a called reusable workflow appearing as its own named check (e.g., `release / build`), separate from the calling workflow. Annotated: "This job shows up as a separate required check — renaming it breaks branch protection."

---

## 9. Understanding CVSS Scores: A Practical Guide for Developers
`src/posts/2026-04-03-understanding-cvss-scores.md`

1. **Diagram: CVSS vector string decoded** — A full CVSS v3.1 vector string (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`) broken into labeled cells, each cell explained: `AV:N = Network (anyone can reach it)`, `PR:N = No privileges required`, etc. Reference-card style. The reader should be able to decode any vector string after seeing this.

2. **Diagram: Same score, different contexts** — Two columns, both showing "CVSS 9.8 Critical." Left column: public-facing API, `AV:N`, no auth required → "Patch immediately." Right column: internal build tool, `AV:L`, requires physical access → "Schedule for next sprint." Illustrates why context changes the triage decision even when the score doesn't change.

3. **Screenshot: A real Dependabot alert with vector string** — A GitHub Security tab showing a Dependabot critical alert, with the CVSS vector string visible. Annotated to highlight which vector components to read first (AV, PR, UI) when doing a rapid triage.

---

## 10. The GitHub Actions `permissions` Block: Principle of Least Privilege for Workflows
`src/posts/2026-03-25-github-actions-permissions-block.md`

1. **Code sample: Default vs. locked-down permissions** — A two-panel code card. Left panel: a workflow with no `permissions:` block, and a comment listing everything the token can do by default (contents: write, pull-requests: write, packages: write…). Right panel: the same workflow with `permissions: contents: read` — a three-line block, everything else locked out.

2. **Diagram: Blast radius comparison** — Two circles. Left: large, labeled "Default GITHUB_TOKEN" with icons for write-contents, write-PRs, write-packages, write-deployments. Right: small, labeled "With permissions block" with only write-checks and read-contents visible. Makes the attack surface reduction tangible without text.

3. **Screenshot: StepSecurity / actionlint flagging a missing permissions block** — A terminal or CI annotation showing `actionlint` (or the StepSecurity Harden-Runner dashboard) surfacing a warning for a workflow missing a top-level `permissions:` block. Shows that tooling can enforce this, not just convention.

---

## 11. Deploying to GitHub Pages with GitHub Actions: Beyond the Defaults
`src/posts/2026-03-18-deploying-to-github-pages-beyond-the-defaults.md`

1. **Diagram: The three-job pipeline** — A horizontal flow diagram: `build` job (with npm cache hit annotation) → artifact upload → `deploy` job (with OIDC token badge and GitHub Environment gate). Shows the reviewer approval step between artifact creation and deployment going live. This is the whole post in one image.

2. **Screenshot: GitHub Environment with protection rules** — The GitHub repo Settings → Environments page showing the `github-pages` environment with a required reviewer configured. Annotated to show that no deployment proceeds past this gate without approval — the human checkpoint that the default workflow skips entirely.

3. **Code sample: OIDC permissions block** — A clean code card showing the `permissions:` block required for OIDC-based Pages deployment (`contents: read`, `pages: write`, `id-token: write`), with a callout explaining why `id-token: write` replaces a long-lived deploy key. Contrasts with the old `peaceiris/actions-gh-pages` approach that requires a stored SSH key.

---

## 12. Tailwind CSS v4: What Actually Changed and How to Migrate
`src/posts/2026-04-01-tailwind-css-v4-migration.md`

1. **Code sample: tailwind.config.js → @theme migration** — A side-by-side code card. Left: a v3 `tailwind.config.js` with `content`, `theme.extend`, and `darkMode`. Right: the equivalent v4 CSS using `@import "tailwindcss"`, `@theme {}`, and `@variant dark`. The visual elimination of the JS config file is the point.

2. **Screenshot: Build time benchmark** — A terminal showing `npm run build:css` completing in v3 (e.g., 1.8s) versus v4 (e.g., 0.3s), or a side-by-side of `time` output. For a blog like this one (Eleventy + Tailwind), these numbers are real and concrete.

3. **Code sample: A breaking change diff** — A git-diff-style image showing one of the three most likely breaking changes (e.g., `bg-opacity-*` replaced by `bg-black/50`, or `divide-*` renamed), with old utility crossed out in red and new utility shown in green. Practical reference for anyone mid-migration.
