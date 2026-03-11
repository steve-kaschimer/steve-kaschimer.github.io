# Editorial Plan

> Topics not yet covered on this blog, ready to draft.

## Topic Ideas

### GitHub Actions: Reusable Workflows vs. Composite Actions — Know the Difference
**Pitch:** Reusable workflows and composite actions both let you DRY up your pipelines, but they have fundamentally different scoping rules, secret-passing behaviors, and failure semantics — choosing the wrong one causes subtle bugs.  
**Angle:** Side-by-side comparison driven by concrete failure scenarios: a secret that silently disappears, a matrix that can't be inherited, a status check that reports to the wrong job. Readers finish knowing exactly which abstraction to reach for and why.  
**Tags:** github-actions, ci-cd, devops, workflow-design

---

### Trunk-Based Development in Practice: What They Don't Tell You
**Pitch:** Trunk-based development is the delivery model behind high-performing engineering teams, but the advice online glosses over the cultural and tooling prerequisites that make it safe.  
**Angle:** Covers the hard parts: feature flags as a first-class citizen, how to handle database migrations without long-lived branches, the minimum branch protection ruleset you need, and how to talk your team out of GitFlow. Grounded in The Accelerate research.  
**Tags:** git, devops, ci-cd, developer-productivity, branching-strategy

---

### Dependabot Advanced: Getting Past the Noise
**Pitch:** Default Dependabot configuration floods teams with low-signal PRs; this post shows how to tune grouping, scheduling, versioning strategies, and auto-merge rules so you actually merge dependency updates instead of ignoring them.  
**Angle:** Starts from a realistic monorepo with npm, Docker, and GitHub Actions dependencies. Walks through a battle-tested `dependabot.yml` that cuts PR volume by 70% while keeping security updates fast. Also covers when to switch to Renovate and why.  
**Tags:** dependabot, supply-chain-security, github, dependency-management

---

### Understanding CVSS Scores: A Practical Guide for Developers
**Pitch:** CVSS scores show up in Dependabot alerts and security advisories every day, but most developers treat them as black boxes — this post teaches you to read them critically so you can triage accurately instead of panic-patching.  
**Angle:** Breaks down the CVSS v3.1 vector string (AV, AC, PR, UI, S, C, I, A) using real CVEs pulled from npm and GitHub Advisory Database examples. Shows how the same "Critical 9.8" can be a fire drill or a non-issue depending on your deployment context.  
**Tags:** security, vulnerability-management, devsecops, developer-education

---

### Generating and Using SBOMs with GitHub Actions
**Pitch:** A Software Bill of Materials (SBOM) is becoming a compliance requirement for many development teams, and GitHub Actions makes generating, attesting, and publishing one surprisingly straightforward.  
**Angle:** Practical walkthrough using `anchore/sbom-action` and GitHub's artifact attestation to produce a CycloneDX SBOM, attach it to a release, and validate it downstream. Addresses why the SBOM matters beyond compliance — it's also a debugging tool for transitive dependency surprises.  
**Tags:** sbom, supply-chain-security, github-actions, compliance

---

### GitHub CLI Power User: 10 `gh` Commands That Replace Browser Tabs
**Pitch:** The `gh` CLI can handle PR reviews, issue triage, secret management, and workflow triggers without leaving the terminal — most developers use 20% of it and miss the most productive parts.  
**Angle:** Focused on commands that replace real browser workflows: `gh pr checkout`, `gh run watch`, `gh secret set`, `gh repo clone --template`, `gh issue develop`. Includes shell aliases and a practical script for daily standup prep.  
**Tags:** github-cli, developer-productivity, tooling, terminal

---

### Writing Commit Messages That Make Code Review Faster
**Pitch:** A well-written commit message is the smallest unit of developer communication, and most engineers write them badly — this post teaches a repeatable format that makes diffs self-documenting and `git log` actually useful.  
**Angle:** Uses the Conventional Commits spec as a baseline but goes further: how to write the body (`why`, not `what`), how to link issues and PRs correctly, how to use `git notes` for post-merge context, and how to configure a commit-msg hook that enforces format in CI.  
**Tags:** git, developer-productivity, writing-for-engineers, code-review

---

### Architecture Decision Records: The 30-Minute Investment That Pays Off for Years
**Pitch:** ADRs are the most underused documentation practice in software engineering — a lightweight Markdown file per decision that eliminates "why did we do it this way?" forever.  
**Angle:** Walks through creating an ADR template, storing ADRs in a `docs/decisions/` folder in the repo, linking them from PR descriptions, and using GitHub Discussions for the deliberation phase. Includes a real-world example: choosing between Nunjucks and Liquid for an Eleventy project.  
**Tags:** documentation, architecture, writing-for-engineers, developer-productivity

---

### GitHub Branch Protection Rules vs. Rulesets: The New Way to Enforce Standards
**Pitch:** GitHub Rulesets replace the old branch protection model and are strictly more powerful, but the migration path and new capabilities are poorly documented — this post maps what changed and what you should migrate today.  
**Angle:** Covers the key differences: Rulesets apply to tags and branches, support bypass actors, and work at the organization level. Includes a YAML-driven Ruleset template for a typical open-source project and a GitHub Actions workflow that audits whether all repos in an org have Rulesets configured.  
**Tags:** github, branch-protection, devsecops, platform-engineering

---

### Shift Right: Why Production Observability Is a Security Practice
**Pitch:** Shifting left catches vulnerabilities before deployment, but attackers operate in production — runtime observability (logs, traces, alerts) is the underinvested complement to a strong shift-left posture.  
**Angle:** Argues that observability and security share the same data (anomalous request patterns, unexpected process spawns, unusual outbound connections) and should share the same tooling. Shows how to instrument a Node.js app with OpenTelemetry, route signals to GitHub's security alerts via a custom action, and define alert thresholds that distinguish abuse from bugs.  
**Tags:** observability, security, devsecops, opentelemetry, nodejs

---

### Deploying to GitHub Pages with GitHub Actions: Beyond the Defaults
**Pitch:** The default `peaceiris/actions-gh-pages` workflow gets you up and running, but it leaks build artifacts, skips caching, and doesn't handle environment protection or OIDC — this post shows the production-grade version.  
**Angle:** Rebuilds the deployment pipeline from scratch using the official `actions/deploy-pages` action with OIDC token authentication (no `GITHUB_TOKEN` secret exposure), proper cache keys for the build tool, and a staging environment that requires reviewer approval before the production deploy.  
**Tags:** github-actions, github-pages, ci-cd, eleventy, deployment

---

### Enforcing Code Quality with GitHub Actions Status Checks You Can Actually Trust
**Pitch:** Status checks only work as a quality gate if they're fast enough for developers to respect and strict enough to be meaningful — most pipelines fail one or both criteria.  
**Angle:** Covers the four failure modes of status checks (flaky tests, slow linters, bypass-able required checks, missing branch coverage enforcement) and a concrete remediation for each. Includes workflow patterns for parallelizing linters, using `paths` filters to skip irrelevant checks, and configuring required status checks via the GitHub API so they can't be bypassed even by repo admins.  
**Tags:** github-actions, ci-cd, code-quality, developer-productivity

---

### Tailwind CSS v4: What Actually Changed and How to Migrate
**Pitch:** Tailwind v4 ships a completely rewritten engine, drops `tailwind.config.js` in favor of CSS-native configuration, and changes how plugins and themes work — this post is the migration guide for developers already using v3.  
**Angle:** Side-by-side comparison of v3 vs. v4 config syntax with a real migration of this blog's `tailwind.config.js`. Benchmarks cold build time before and after, explains what `@theme` and `@utility` replace, and flags the three breaking changes most likely to burn you (custom screen breakpoints, arbitrary value syntax, dark mode configuration).  
**Tags:** tailwind-css, css, static-sites, eleventy

---

### The GitHub Actions `permissions` Block: Principle of Least Privilege for Workflows
**Pitch:** By default, GitHub Actions workflows run with a token that has write access to your entire repository — explicitly scoping `permissions` to the minimum required is a one-line security improvement most workflows skip.  
**Angle:** Shows the blast radius of a compromised workflow token with default permissions (hint: an attacker can push to main, create releases, and exfiltrate secrets). Walks through the permissions model, explains why `contents: read` should be the default, and provides a hardened workflow template for the five most common workflow patterns: test, release, deploy, PR comment, and dependency update.  
**Tags:** github-actions, security, devsecops, ci-cd