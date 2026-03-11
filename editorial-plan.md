# Editorial Calendar

> A living schedule for blog content on steve-kaschimer.github.io. Each section represents a publishing horizon — move entries forward as they progress, update their status, and link GitHub Issues once created. See **📐 How to Use This Calendar** at the bottom for the full workflow.

---

## 🗓 This Period — March 2026

The three posts most worth shipping right now: two are directly tied to the active Eleventy site work, and one is a high-impact security quick-win.

### Deploying to GitHub Pages with GitHub Actions: Beyond the Defaults
- **Status:** `published`
- **Issue:** #95
- **Pitch:** The default `peaceiris/actions-gh-pages` workflow gets you up and running, but it leaks build artifacts, skips caching, and doesn't handle environment protection or OIDC — this post shows the production-grade version.
- **Angle:** Rebuilds the deployment pipeline from scratch using the official `actions/deploy-pages` action with OIDC token authentication (no `GITHUB_TOKEN` secret exposure), proper cache keys for the build tool, and a staging environment that requires reviewer approval before the production deploy.
- **Tags:** `github-actions`, `github-pages`, `ci-cd`, `eleventy`, `deployment`

### The GitHub Actions `permissions` Block: Principle of Least Privilege for Workflows
- **Status:** `draft`
- **Issue:** #96
- **Pitch:** By default, GitHub Actions workflows run with a token that has write access to your entire repository — explicitly scoping `permissions` to the minimum required is a one-line security improvement most workflows skip.
- **Angle:** Shows the blast radius of a compromised workflow token with default permissions (hint: an attacker can push to main, create releases, and exfiltrate secrets). Walks through the permissions model, explains why `contents: read` should be the default, and provides a hardened workflow template for the five most common workflow patterns: test, release, deploy, PR comment, and dependency update.
- **Tags:** `github-actions`, `security`, `devsecops`, `ci-cd`

### Tailwind CSS v4: What Actually Changed and How to Migrate
- **Status:** `published`
- **Issue:** #97
- **Pitch:** Tailwind v4 ships a completely rewritten engine, drops `tailwind.config.js` in favor of CSS-native configuration, and changes how plugins and themes work — this post is the migration guide for developers already using v3.
- **Angle:** Side-by-side comparison of v3 vs. v4 config syntax with a real migration of this blog's `tailwind.config.js`. Benchmarks cold build time before and after, explains what `@theme` and `@utility` replace, and flags the three breaking changes most likely to burn you (custom screen breakpoints, arbitrary value syntax, dark mode configuration).
- **Tags:** `tailwind-css`, `css`, `static-sites`, `eleventy`

---

## 📋 Next Up — April 2026

Three posts queued and ready to pick up once the March batch ships.

### GitHub Actions: Reusable Workflows vs. Composite Actions — Know the Difference
- **Status:** `draft`
- **Issue:** #98
- **Pitch:** Reusable workflows and composite actions both let you DRY up your pipelines, but they have fundamentally different scoping rules, secret-passing behaviors, and failure semantics — choosing the wrong one causes subtle bugs.
- **Angle:** Side-by-side comparison driven by concrete failure scenarios: a secret that silently disappears, a matrix that can't be inherited, a status check that reports to the wrong job. Readers finish knowing exactly which abstraction to reach for and why.
- **Tags:** `github-actions`, `ci-cd`, `devops`, `workflow-design`

### GitHub Branch Protection Rules vs. Rulesets: The New Way to Enforce Standards
- **Status:** `draft`
- **Issue:** #99
- **Pitch:** GitHub Rulesets replace the old branch protection model and are strictly more powerful, but the migration path and new capabilities are poorly documented — this post maps what changed and what you should migrate today.
- **Angle:** Covers the key differences: Rulesets apply to tags and branches, support bypass actors, and work at the organization level. Includes a YAML-driven Ruleset template for a typical open-source project and a GitHub Actions workflow that audits whether all repos in an org have Rulesets configured.
- **Tags:** `github`, `branch-protection`, `devsecops`, `platform-engineering`

### Enforcing Code Quality with GitHub Actions Status Checks You Can Actually Trust
- **Status:** `draft`
- **Issue:** #100
- **Pitch:** Status checks only work as a quality gate if they're fast enough for developers to respect and strict enough to be meaningful — most pipelines fail one or both criteria.
- **Angle:** Covers the four failure modes of status checks (flaky tests, slow linters, bypass-able required checks, missing branch coverage enforcement) and a concrete remediation for each. Includes workflow patterns for parallelizing linters, using `paths` filters to skip irrelevant checks, and configuring required status checks via the GitHub API so they can't be bypassed even by repo admins.
- **Tags:** `github-actions`, `ci-cd`, `code-quality`, `developer-productivity`

---

## 📦 Backlog

All remaining topics, roughly ordered by theme. Pull from here when a slot opens up.

### Trunk-Based Development in Practice: What They Don't Tell You
- **Status:** `draft`
- **Issue:** #101
- **Pitch:** Trunk-based development is the delivery model behind high-performing engineering teams, but the advice online glosses over the cultural and tooling prerequisites that make it safe.
- **Angle:** Covers the hard parts: feature flags as a first-class citizen, how to handle database migrations without long-lived branches, the minimum branch protection ruleset you need, and how to talk your team out of GitFlow. Grounded in The Accelerate research.
- **Tags:** `git`, `devops`, `ci-cd`, `developer-productivity`, `branching-strategy`

### Dependabot Advanced: Getting Past the Noise
- **Status:** `draft`
- **Issue:** #102
- **Pitch:** Default Dependabot configuration floods teams with low-signal PRs; this post shows how to tune grouping, scheduling, versioning strategies, and auto-merge rules so you actually merge dependency updates instead of ignoring them.
- **Angle:** Starts from a realistic monorepo with npm, Docker, and GitHub Actions dependencies. Walks through a battle-tested `dependabot.yml` that cuts PR volume by 70% while keeping security updates fast. Also covers when to switch to Renovate and why.
- **Tags:** `dependabot`, `supply-chain-security`, `github`, `dependency-management`

### Understanding CVSS Scores: A Practical Guide for Developers
- **Status:** `draft`
- **Issue:** #103
- **Pitch:** CVSS scores show up in Dependabot alerts and security advisories every day, but most developers treat them as black boxes — this post teaches you to read them critically so you can triage accurately instead of panic-patching.
- **Angle:** Breaks down the CVSS v3.1 vector string (AV, AC, PR, UI, S, C, I, A) using real CVEs pulled from npm and GitHub Advisory Database examples. Shows how the same "Critical 9.8" can be a fire drill or a non-issue depending on your deployment context.
- **Tags:** `security`, `vulnerability-management`, `devsecops`, `developer-education`

### Generating and Using SBOMs with GitHub Actions
- **Status:** `draft`
- **Issue:** #104
- **Pitch:** A Software Bill of Materials (SBOM) is becoming a compliance requirement for many development teams, and GitHub Actions makes generating, attesting, and publishing one surprisingly straightforward.
- **Angle:** Practical walkthrough using `anchore/sbom-action` and GitHub's artifact attestation to produce a CycloneDX SBOM, attach it to a release, and validate it downstream. Addresses why the SBOM matters beyond compliance — it's also a debugging tool for transitive dependency surprises.
- **Tags:** `sbom`, `supply-chain-security`, `github-actions`, `compliance`

### GitHub CLI Power User: 10 `gh` Commands That Replace Browser Tabs
- **Status:** `draft`
- **Issue:** #105
- **Pitch:** The `gh` CLI can handle PR reviews, issue triage, secret management, and workflow triggers without leaving the terminal — most developers use 20% of it and miss the most productive parts.
- **Angle:** Focused on commands that replace real browser workflows: `gh pr checkout`, `gh run watch`, `gh secret set`, `gh repo clone --template`, `gh issue develop`. Includes shell aliases and a practical script for daily standup prep.
- **Tags:** `github-cli`, `developer-productivity`, `tooling`, `terminal`

### Writing Commit Messages That Make Code Review Faster
- **Status:** `draft`
- **Issue:** #106
- **Pitch:** A well-written commit message is the smallest unit of developer communication, and most engineers write them badly — this post teaches a repeatable format that makes diffs self-documenting and `git log` actually useful.
- **Angle:** Uses the Conventional Commits spec as a baseline but goes further: how to write the body (`why`, not `what`), how to link issues and PRs correctly, how to use `git notes` for post-merge context, and how to configure a commit-msg hook that enforces format in CI.
- **Tags:** `git`, `developer-productivity`, `writing-for-engineers`, `code-review`

### Architecture Decision Records: The 30-Minute Investment That Pays Off for Years
- **Status:** `draft`
- **Issue:** #107
- **Pitch:** ADRs are the most underused documentation practice in software engineering — a lightweight Markdown file per decision that eliminates "why did we do it this way?" forever.
- **Angle:** Walks through creating an ADR template, storing ADRs in a `docs/decisions/` folder in the repo, linking them from PR descriptions, and using GitHub Discussions for the deliberation phase. Includes a real-world example: choosing between Nunjucks and Liquid for an Eleventy project.
- **Tags:** `documentation`, `architecture`, `writing-for-engineers`, `developer-productivity`

### Shift Right: Why Production Observability Is a Security Practice
- **Status:** `draft`
- **Issue:** #108
- **Pitch:** Shifting left catches vulnerabilities before deployment, but attackers operate in production — runtime observability (logs, traces, alerts) is the underinvested complement to a strong shift-left posture.
- **Angle:** Argues that observability and security share the same data (anomalous request patterns, unexpected process spawns, unusual outbound connections) and should share the same tooling. Shows how to instrument a Node.js app with OpenTelemetry, route signals to GitHub's security alerts via a custom action, and define alert thresholds that distinguish abuse from bugs.
- **Tags:** `observability`, `security`, `devsecops`, `opentelemetry`, `nodejs`

---

## 📐 How to Use This Calendar

### Moving items between sections

Pull entries **forward** as publishing horizons approach — never delete. When a backlog item becomes a near-term priority, cut it from **📦 Backlog** and paste it into **📋 Next Up** (or directly into **🗓 This Period** if it's urgent). When a period closes, any unstarted entries roll back down to **📋 Next Up** or **📦 Backlog** depending on priority.

### Updating status

Change the `**Status:**` field in-place as the post moves through the pipeline:

| Status | Meaning |
|---|---|
| `idea` | Topic captured, not yet started |
| `draft` | Outline or first draft exists (link the draft file or branch) |
| `in-progress` | Actively being written or revised |
| `published` | Live on the site — add the URL next to the status |

### Linking GitHub Issues

Once you open a GitHub Issue for a post, replace `#TBD` with the issue number (e.g. `#42`). The `#42` syntax auto-links in GitHub's Markdown renderer. One issue per post; use the issue for draft feedback, outline review, and final sign-off comments.

### Session kickoff ritual

1. **Ralph** opens the session and queries the calendar for any entries whose status has changed or whose target period has elapsed.
2. Ralph reports the backlog count and flags any posts that are overdue or blocked.
3. The coordinator fans out tasks: **Trenton** picks up a writing or editing task; **Mr. Robot** handles any tooling or deployment work surfaced during the review.
4. At session close, update status fields and commit the calendar so the next session opens with fresh state.