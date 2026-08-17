# Editorial Calendar

> A living schedule for blog content on steve-kaschimer.github.io. Most sections represent a publishing horizon in the main Friday sequence - move entries forward as they progress, update their status, and link GitHub Issues once created. A thematic track running its own cadence gets its own section rather than being interleaved into the Friday horizons (currently the **📅 Tuesday Track**, which runs one six-post series at a time). See **📐 How to Use This Calendar** at the bottom for the full workflow.

---

## 📅 October-December 2025 - Completed

Ten posts covering the blog's first months - DevSecOps foundations, GitHub platform capabilities, and the site build itself. Backfilled after the fact; these predate the calendar.

### Why GitHub is the DevSecOps Platform of Choice
- **Status:** `published`
- **Published:** 2025-10-27
- **File:** `src/posts/2025-10-27-why-github-is-the-devsecops-platform-of-choice.md`
- **Pitch:** DevSecOps initiatives usually die on tool sprawl and adoption friction, not on the security tooling itself - GitHub wins because it's already where developers work.
- **Angle:** Argues the platform case on developer familiarity first, then walks the native capabilities that back it up: Actions for automation, CodeQL, secret scanning, dependency review, and Security Overview. Covers the recurring objections (security vs. speed, tool fragmentation, lack of visibility) and closes with the strategic questions worth answering before committing - whether you need Advanced Security, how audit logs map to SOC 2 / ISO 27001 / NIST, and whether the model scales across teams.
- **Tags:** `devsecops`, `github`, `devops`

### 5 Tailwind CSS Tips for Better Productivity
- **Status:** `published`
- **Published:** 2025-10-29
- **File:** `src/posts/2025-10-29-tailwind-css-tips.md`
- **Pitch:** Five short, concrete Tailwind habits that cut down the class-string sprawl most people accumulate in their first few weeks with the framework.
- **Angle:** A deliberately brief tips post: `@apply` for genuinely repeated patterns, what the JIT compiler buys you (including arbitrary values like `w-[347px]`), extending the theme with custom colors, `dark:` variants, and the VS Code IntelliSense extension. Written against Tailwind v3 conventions - the `tailwind.config.js` example predates this site's own move to v4's CSS-native config.
- **Tags:** `tailwind-css`, `eleventy`, `developer-productivity`

### Getting Started with Eleventy
- **Status:** `published`
- **Published:** 2025-10-30
- **File:** `src/posts/2025-10-30-getting-started-with-eleventy.md`
- **Pitch:** Eleventy gets you from an empty directory to a live site in three commands, which is the entire argument for choosing it over a heavier static site generator.
- **Angle:** A short orientation post: why Eleventy (template-language flexibility, fast builds, no client-side JS by default), the minimal `npm install` / `npx @11ty/eleventy --serve` setup, and the three concepts that carry most of the work - layouts, collections, and filters. Ends with next steps rather than depth: styling, custom filters, plugins, and deploying to GitHub Pages or Netlify.
- **Tags:** `eleventy`, `developer-productivity`

### Security as Code with GitHub Actions: Automating DevSecOps
- **Status:** `published`
- **Published:** 2025-11-03
- **File:** `src/posts/2025-11-03-security-as-code-making-it-real-with-github-actions.md`
- **Pitch:** Manual security review doesn't survive contact with teams that ship several times a day - codifying the checks as workflow definitions is the only version that scales.
- **Angle:** Defines Security as Code in terms of what it replaces (ad-hoc scans, manual gates), then covers the three GitHub Actions features that make it practical at org scale: reusable workflows for consistency across repos, Marketplace actions for layered coverage (Snyk, Trivy, Checkov), and matrix builds for environment-specific vulnerabilities. Includes a pull-request workflow running CodeQL and secret scanning, plus the standard failure modes - false positives, developer resistance, and pipeline slowdown.
- **Tags:** `github-actions`, `devsecops`, `ci-cd`

### Secrets Management on GitHub: Best Practices and Pitfalls
- **Status:** `published`
- **Published:** 2025-11-10
- **File:** `src/posts/2025-11-10-secrets-management-on-github-best-practices-and-pitfalls.md`
- **Pitch:** Version control is designed to remember everything forever, which is exactly why a committed credential is not fixed by a follow-up commit that removes it.
- **Angle:** Covers GitHub's three relevant surfaces - secret scanning as detection, environment secrets as the storage mechanism, and Dependabot as defense in depth for the libraries that handle those secrets. Spends real time on the failure modes: assuming private repos are safe, never rotating, and losing track of secret sprawl across repos and environments. Recommends scoping secrets at repository/organization/environment levels by least privilege and integrating an external manager (Vault, Key Vault) once org scale demands it.
- **Tags:** `security`, `github`, `devsecops`

### Shift Left Without Slowing Down: DevSecOps Pipeline Design
- **Status:** `published`
- **Published:** 2025-11-17
- **File:** `src/posts/2025-11-17-shift-left-without-slowing-down.md`
- **Pitch:** Teams resist shift-left for a rational reason: badly implemented security checks genuinely do make pipelines slow. The fix is pipeline design, not more discipline.
- **Angle:** Splits security work by weight - static analysis, secret scanning, and dependency review run in parallel on every pull request, while container and IaC scans move to merge-to-main and nightly schedules. Ships two complete workflows (`pr-pipeline.yml` and `main-security.yml`) plus a reusable org-wide security workflow, and leans on concurrency groups, matrix builds, Trivy DB caching, and minimal `permissions` blocks. Treats false-positive tuning and developer trust as load-bearing, not optional polish.
- **Tags:** `devsecops`, `ci-cd`, `devops`

### CodeQL Deep Dive: Static Analysis for DevSecOps Engineers
- **Status:** `published`
- **Published:** 2025-11-24
- **File:** `src/posts/2025-11-24-codeql-deep-dive-static-analysis-for-devops-engineers.md`
- **Pitch:** CodeQL compiles your codebase into a queryable database instead of grepping for suspicious strings, which is why it catches multi-hop vulnerabilities that pattern matchers miss.
- **Angle:** Walks the three-stage pipeline - extraction into a language-specific database, query execution, SARIF results surfaced as code scanning alerts. Covers the query language structure (imports, predicates, select) with a working hardcoded-AWS-key example, then makes the case for customization: extending queries, teaching CodeQL about your own sanitizer functions to kill false positives, and iterating locally with the CodeQL CLI before wiring it into CI. Includes a workflow running on push, pull request, and a weekly schedule.
- **Tags:** `security`, `devsecops`, `github`

### DevOps Culture: What It Is, Why It Exists, and Why It Matters
- **Status:** `published`
- **Published:** 2025-12-01
- **File:** `src/posts/2025-12-01-devops-culture.md`
- **Pitch:** You can buy every tool on the market and still not have DevOps - the transformation is cultural, and the tooling only amplifies whatever culture already exists.
- **Angle:** Grounded in The Phoenix Project's Three Ways and the 2009 Allspaw/Hammond "10+ Deploys Per Day" talk that started the movement. Covers the enabling practices (IaC, shift-left security, observability, ChatOps), Team Topologies as the organizational design layer, a four-phase transformation roadmap from assessment to ongoing optimization, and DORA metrics as the measurement frame. The most useful sections are the honest ones: ten named anti-patterns (the "DevOps team" silo, rebrand without reform, "you build it, you run it" without support, metrics theater) and rebuttals to the four objections you will actually hear.
- **Tags:** `devops`

### DevSecOps Metrics That Matter: What to Measure, How to Track It in GitHub, and Why It Matters
- **Status:** `published`
- **Published:** 2025-12-08
- **File:** `src/posts/2025-12-08-devsecops-metrics-that-matter.md`
- **Pitch:** Measure only speed and you cut corners; measure only security and delivery grinds to a halt. The useful metric set spans both, and GitHub already emits most of it.
- **Angle:** Pairs the four DORA delivery metrics with four security signals - open vulnerabilities, time to remediate, dependency health, and secret exposure - and gives each one industry benchmarks, common measurement pitfalls, and specific remediation levers. Every metric comes with the actual `gh api` or GraphQL query that produces it, plus a nightly export workflow that dumps code scanning, Dependabot, and secret scanning alerts as artifacts. Insists throughout that metrics are for feedback loops, not for blame.
- **Tags:** `devsecops`, `devops`

### GitHub Advanced Security: What You Get and How to Use It
- **Status:** `published`
- **Published:** 2025-12-15
- **File:** `src/posts/2025-12-15-github-advanced-security.md`
- **Pitch:** GHAS is four distinct products sold as one SKU, and teams that enable everything on day one drown in alerts before they get any value out of it.
- **Angle:** Covers each pillar in turn - Code Scanning via CodeQL, Secret Scanning, Dependency Review, and Security Overview - with UI, API, and workflow-based enablement for each. Includes three case studies (leaked AWS keys caught in minutes, Log4Shell remediation across 47 repos, an enterprise migration that cut security approval from five days to four hours) and a frank ROI section pricing GHAS against breach cost. The back half is where the real value sits: custom secret patterns, CodeQL query filtering and path ignores, alert routing to PagerDuty/Slack/Jira, systematic false-positive handling, and a four-phase rollout that starts with 5-10 pilot repos rather than the whole org.
- **Tags:** `security`, `devsecops`, `github`

---

## 📅 March 2026 - Completed

All three posts in this batch have been published.

### Deploying to GitHub Pages with GitHub Actions: Beyond the Defaults
- **Status:** `published`
- **Published:** 2026-03-18
- **Issue:** [#95](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/95) ✅ closed
- **File:** `src/posts/2026-03-18-deploying-to-github-pages-beyond-the-defaults.md`
- **Pitch:** The default `peaceiris/actions-gh-pages` workflow gets you up and running, but it leaks build artifacts, skips caching, and doesn't handle environment protection or OIDC - this post shows the production-grade version.
- **Angle:** Rebuilds the deployment pipeline from scratch using the official `actions/deploy-pages` action with OIDC token authentication (no `GITHUB_TOKEN` secret exposure), proper cache keys for the build tool, and a staging environment that requires reviewer approval before the production deploy.
- **Tags:** `github-actions`, `github-pages`, `ci-cd`, `eleventy`, `deployment`

### The GitHub Actions `permissions` Block: Principle of Least Privilege for Workflows
- **Status:** `published`
- **Published:** 2026-03-25
- **Issue:** [#96](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/96) ✅ closed
- **File:** `src/posts/2026-03-25-github-actions-permissions-block.md`
- **Pitch:** By default, GitHub Actions workflows run with a token that has write access to your entire repository - explicitly scoping `permissions` to the minimum required is a one-line security improvement most workflows skip.
- **Angle:** Shows the blast radius of a compromised workflow token with default permissions (hint: an attacker can push to main, create releases, and exfiltrate secrets). Walks through the permissions model, explains why `contents: read` should be the default, and provides a hardened workflow template for the five most common workflow patterns: test, release, deploy, PR comment, and dependency update.
- **Tags:** `github-actions`, `security`, `devsecops`, `ci-cd`

### Tailwind CSS v4: What Actually Changed and How to Migrate
- **Status:** `published`
- **Published:** 2026-04-01
- **Issue:** [#97](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/97) ✅ closed
- **File:** `src/posts/2026-04-01-tailwind-css-v4-migration.md`
- **Pitch:** Tailwind v4 ships a completely rewritten engine, drops `tailwind.config.js` in favor of CSS-native configuration, and changes how plugins and themes work - this post is the migration guide for developers already using v3.
- **Angle:** Side-by-side comparison of v3 vs. v4 config syntax with a real migration of this blog's `tailwind.config.js`. Benchmarks cold build time before and after, explains what `@theme` and `@utility` replace, and flags the three breaking changes most likely to burn you (custom screen breakpoints, arbitrary value syntax, dark mode configuration).
- **Tags:** `tailwind-css`, `css`, `static-sites`, `eleventy`

---

## 📅 April-May 2026 - Completed

Both posts in this batch have been published.

### GitHub Actions: Reusable Workflows vs. Composite Actions - Know the Difference
- **Status:** `published`
- **Published:** 2026-03-13
- **Issue:** [#98](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/98) ✅ closed
- **File:** `src/posts/2026-03-13-github-actions-reusable-workflows-vs-composite-actions.md`
- **Pitch:** Reusable workflows and composite actions both let you DRY up your pipelines, but they have fundamentally different scoping rules, secret-passing behaviors, and failure semantics - choosing the wrong one causes subtle bugs.
- **Angle:** Side-by-side comparison driven by concrete failure scenarios: a secret that silently disappears, a matrix that can't be inherited, a status check that reports to the wrong job. Readers finish knowing exactly which abstraction to reach for and why.
- **Tags:** `github-actions`, `ci-cd`, `devops`, `workflow-design`

### GitHub Branch Protection Rules vs. Rulesets: The New Way to Enforce Standards
- **Status:** `published`
- **Published:** 2026-05-08
- **Issue:** [#99](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/99) ✅ closed
- **File:** `src/posts/2026-05-08-github-branch-protection-rules-vs-rulesets.md`
- **Pitch:** GitHub Rulesets replace the old branch protection model and are strictly more powerful, but the migration path and new capabilities are poorly documented - this post maps what changed and what you should migrate today.
- **Angle:** Covers the key differences: Rulesets apply to tags and branches, support bypass actors, and work at the organization level. Includes a YAML-driven Ruleset template for a typical open-source project and a GitHub Actions workflow that audits whether all repos in an org have Rulesets configured.
- **Tags:** `github`, `branch-protection`, `devsecops`, `platform-engineering`

---

## 📅 This Period - May 2026

One post scheduled and ready to publish on May 29.

### Enforcing Code Quality with GitHub Actions Status Checks You Can Actually Trust
- **Status:** `published`
- **Published:** 2026-05-29
- **Issue:** [#100](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/100) ✅ closed
- **File:** `src/posts/2026-05-29-github-actions-status-checks-you-can-trust.md`
- **Pitch:** Status checks only work as a quality gate if they're fast enough for developers to respect and strict enough to be meaningful - most pipelines fail one or both criteria.
- **Angle:** Covers the four failure modes of status checks (flaky tests, slow linters, bypass-able required checks, missing branch coverage enforcement) and a concrete remediation for each. Includes workflow patterns for parallelizing linters, using `paths` filters to skip irrelevant checks, and configuring required status checks via the GitHub API so they can't be bypassed even by repo admins.
- **Tags:** `github-actions`, `ci-cd`, `code-quality`, `developer-productivity`

### Trunk-Based Development in Practice: What They Don't Tell You
- **Status:** `published`
- **Published:** 2026-03-20
- **Issue:** [#101](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/101) ✅ closed
- **File:** `src/posts/2026-03-20-trunk-based-development-in-practice.md`
- **Pitch:** Trunk-based development is the delivery model behind high-performing engineering teams, but the advice online glosses over the cultural and tooling prerequisites that make it safe.
- **Angle:** Covers the hard parts: feature flags as a first-class citizen, how to handle database migrations without long-lived branches, the minimum branch protection ruleset you need, and how to talk your team out of GitFlow. Grounded in The Accelerate research.
- **Tags:** `git`, `devops`, `ci-cd`, `developer-productivity`, `branching-strategy`

### Dependabot Advanced: Getting Past the Noise
- **Status:** `published`
- **Published:** 2026-03-27
- **Issue:** [#102](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/102) ✅ closed
- **File:** `src/posts/2026-03-27-dependabot-advanced-getting-past-the-noise.md`
- **Pitch:** Default Dependabot configuration floods teams with low-signal PRs; this post shows how to tune grouping, scheduling, versioning strategies, and auto-merge rules so you actually merge dependency updates instead of ignoring them.
- **Angle:** Starts from a realistic monorepo with npm, Docker, and GitHub Actions dependencies. Walks through a battle-tested `dependabot.yml` that cuts PR volume by 70% while keeping security updates fast. Also covers when to switch to Renovate and why.
- **Tags:** `dependabot`, `supply-chain-security`, `github`, `dependency-management`

### Understanding CVSS Scores: A Practical Guide for Developers
- **Status:** `published`
- **Published:** 2026-04-03
- **Issue:** [#103](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/103) ✅ closed
- **File:** `src/posts/2026-04-03-understanding-cvss-scores.md`
- **Pitch:** CVSS scores show up in Dependabot alerts and security advisories every day, but most developers treat them as black boxes - this post teaches you to read them critically so you can triage accurately instead of panic-patching.
- **Angle:** Breaks down the CVSS v3.1 vector string (AV, AC, PR, UI, S, C, I, A) using real CVEs pulled from npm and GitHub Advisory Database examples. Shows how the same "Critical 9.8" can be a fire drill or a non-issue depending on your deployment context.
- **Tags:** `security`, `vulnerability-management`, `devsecops`, `developer-education`

### Generating and Using SBOMs with GitHub Actions
- **Status:** `published`
- **Published:** 2026-04-10
- **Issue:** [#104](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/104) ✅ closed
- **File:** `src/posts/2026-04-10-generating-and-using-sboms-with-github-actions.md`
- **Pitch:** A Software Bill of Materials (SBOM) is becoming a compliance requirement for many development teams, and GitHub Actions makes generating, attesting, and publishing one surprisingly straightforward.
- **Angle:** Practical walkthrough using `anchore/sbom-action` and GitHub's artifact attestation to produce a CycloneDX SBOM, attach it to a release, and validate it downstream. Addresses why the SBOM matters beyond compliance - it's also a debugging tool for transitive dependency surprises.
- **Tags:** `sbom`, `supply-chain-security`, `github-actions`, `compliance`

### GitHub CLI Power User: 10 `gh` Commands That Replace Browser Tabs
- **Status:** `published`
- **Published:** 2026-04-17
- **Issue:** [#105](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/105) ✅ closed
- **File:** `src/posts/2026-04-17-github-cli-power-user.md`
- **Pitch:** The `gh` CLI can handle PR reviews, issue triage, secret management, and workflow triggers without leaving the terminal - most developers use 20% of it and miss the most productive parts.
- **Angle:** Focused on commands that replace real browser workflows: `gh pr checkout`, `gh run watch`, `gh secret set`, `gh repo clone --template`, `gh issue develop`. Includes shell aliases and a practical script for daily standup prep.
- **Tags:** `github-cli`, `developer-productivity`, `tooling`, `terminal`

### Writing Commit Messages That Make Code Review Faster
- **Status:** `published`
- **Published:** 2026-04-24
- **Issue:** [#106](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/106) ✅ closed
- **File:** `src/posts/2026-04-24-writing-commit-messages-that-make-code-review-faster.md`
- **Pitch:** A well-written commit message is the smallest unit of developer communication, and most engineers write them badly - this post teaches a repeatable format that makes diffs self-documenting and `git log` actually useful.
- **Angle:** Uses the Conventional Commits spec as a baseline but goes further: how to write the body (`why`, not `what`), how to link issues and PRs correctly, how to use `git notes` for post-merge context, and how to configure a commit-msg hook that enforces format in CI.
- **Tags:** `git`, `developer-productivity`, `writing-for-engineers`, `code-review`

### Architecture Decision Records: The 30-Minute Investment That Pays Off for Years
- **Status:** `published`
- **Published:** 2026-05-01
- **Issue:** [#107](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/107) ✅ closed
- **File:** `src/posts/2026-05-01-architecture-decision-records.md`
- **Pitch:** ADRs are the most underused documentation practice in software engineering - a lightweight Markdown file per decision that eliminates "why did we do it this way?" forever.
- **Angle:** Walks through creating an ADR template, storing ADRs in a `docs/decisions/` folder in the repo, linking them from PR descriptions, and using GitHub Discussions for the deliberation phase. Includes a real-world example: choosing between Nunjucks and Liquid for an Eleventy project.
- **Tags:** `documentation`, `architecture`, `writing-for-engineers`, `developer-productivity`

### Shift Right: Why Production Observability Is a Security Practice
- **Status:** `published`
- **Published:** 2026-05-15
- **Issue:** [#108](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/108) ✅ closed
- **File:** `src/posts/2026-05-15-shift-right-observability-as-a-security-practice.md`
- **Pitch:** Shifting left catches vulnerabilities before deployment, but attackers operate in production - runtime observability (logs, traces, alerts) is the underinvested complement to a strong shift-left posture.
- **Angle:** Argues that observability and security share the same data (anomalous request patterns, unexpected process spawns, unusual outbound connections) and should share the same tooling. Shows how to instrument a Node.js app with OpenTelemetry, route signals to GitHub's security alerts via a custom action, and define alert thresholds that distinguish abuse from bugs.
- **Tags:** `observability`, `security`, `devsecops`, `opentelemetry`, `nodejs`

---

## 📅 Pipeline - June-December 2026

One post per Friday through end of year. Topics rotate across the established DevSecOps/GitHub/CI-CD themes plus a new Azure AI Foundry and agentic development thread.

---

### GitHub Copilot in CI: Automating Code Review at Scale
- **Status:** `published`
- **Published:** 2026-06-05
- **Issue:** [#113](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/113) ✅ closed
- **File:** `src/posts/2026-06-05-github-copilot-in-ci.md`
- **Pitch:** Copilot can do more than autocomplete in an IDE - used in CI it can flag issues on every PR without a human reviewer being available, and this post shows how to wire it up safely.
- **Angle:** Walks through the `github/copilot-code-review` action, how to constrain it to specific file patterns, how to prevent it from approving its own suggestions, and how to read its output as a non-blocking signal vs. a hard gate.
- **Tags:** `github-copilot`, `github-actions`, `ai`, `code-review`, `developer-productivity`

### OpenID Connect in GitHub Actions: Replacing Long-Lived Secrets with Short-Lived Tokens
- **Status:** `published`
- **Published:** 2026-06-12
- **Issue:** [#114](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/114) ✅ closed
- **File:** `src/posts/2026-06-12-oidc-in-github-actions.md`
- **Pitch:** Long-lived cloud credentials stored as GitHub secrets are a supply-chain risk - OIDC lets GitHub Actions authenticate to AWS, Azure, and GCP without any stored secret at all.
- **Angle:** Covers the trust model (GitHub as OIDC provider, cloud as relying party), shows the exact IAM/role configuration for Azure and AWS, and demonstrates a deployment workflow that uses no secrets whatsoever. Includes a checklist for auditing existing workflows still using static credentials.
- **Tags:** `github-actions`, `security`, `devsecops`, `oidc`, `ci-cd`

### Azure AI Foundry: A Developer's First Look at Agentic AI Workflows
- **Status:** `published`
- **Published:** 2026-06-19
- **Issue:** [#115](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/115) ✅ closed
- **File:** `src/posts/2026-06-19-azure-ai-foundry-first-look-agentic-ai-workflows.md`
- **Pitch:** Azure AI Foundry is Microsoft's unified platform for building, evaluating, and deploying AI agents - this is the practical orientation post for developers who've heard the name but haven't built anything with it yet.
- **Angle:** Sets up a Foundry project from scratch, deploys a model, creates a basic agent with a tool, and runs it. Explains the key concepts (hubs, projects, deployments, connections) without the marketing layer. Compares Foundry's agent model to OpenAI Assistants and LangChain for developers who already know one of those.
- **Tags:** `azure-ai-foundry`, `ai-agents`, `agentic-development`, `azure`, `llm`

### GitHub Projects Automation: Custom Fields, Workflows, and the GraphQL API
- **Status:** `published`
- **Published:** 2026-06-26
- **Issue:** [#116](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/116) ✅ closed
- **File:** `src/posts/2026-06-26-github-projects-automation-custom-fields-workflows-graphql-api.md`
- **Pitch:** GitHub Projects v2 has a powerful automation layer that most teams barely touch - this post shows how to build a lightweight engineering workflow without leaving GitHub.
- **Angle:** Covers custom field types (iteration, single-select, number), built-in auto-add and status workflows, and the GraphQL API for programmatic project updates from GitHub Actions. Practical example: auto-assigning sprint, linking PR status to issue progress, and generating a weekly digest via a scheduled workflow.
- **Tags:** `github`, `developer-productivity`, `project-management`, `github-actions`

---

### Semantic Kernel and Azure AI Foundry: Building Your First AI Agent in .NET
- **Status:** `published`
- **Published:** 2026-07-03
- **Issue:** [#117](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/117) ✅ closed
- **File:** `src/posts/2026-07-03-semantic-kernel-azure-ai-foundry-first-agent-dotnet.md`
- **Pitch:** Semantic Kernel is Microsoft's open-source SDK for building AI agents, and Azure AI Foundry is its natural deployment target - together they give .NET developers a production path for agentic apps.
- **Angle:** Builds a working agent that uses a Foundry-hosted model, registers a plugin with a tool function, and executes a multi-step plan. Explains the kernel, memory, planner, and plugin concepts in concrete code rather than diagrams. Includes a GitHub Actions workflow for deploying the agent to Azure Container Apps.
- **Tags:** `azure-ai-foundry`, `semantic-kernel`, `ai-agents`, `dotnet`, `agentic-development`

### GitHub Actions Advanced Caching: Strategies That Actually Cut Build Times
- **Status:** `published`
- **Published:** 2026-07-10
- **Issue:** [#118](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/118) ✅ closed
- **File:** `src/posts/2026-07-10-github-actions-advanced-caching-strategies.md`
- **Pitch:** Most teams use `actions/cache` with a single key and wonder why cache hit rates are low - this post covers the cache key strategies that actually work for real build systems.
- **Angle:** Covers restore-keys fallback chains, scoping cache by branch vs. by PR, matrix-aware cache keys, and per-job vs. per-workflow cache sharing. Includes worked examples for npm, Gradle, pip, and Docker layer caching. Addresses the cache poisoning risk and how GitHub's isolation model mitigates it.
- **Tags:** `github-actions`, `ci-cd`, `developer-productivity`, `performance`

### Container Image Security in CI: Scanning with Trivy and GitHub Advanced Security
- **Status:** `published`
- **Published:** 2026-07-17
- **Issue:** [#119](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/119) ✅ closed
- **File:** `src/posts/2026-07-17-container-image-security-trivy-github-advanced-security.md`
- **Pitch:** Scanning container images for vulnerabilities before they ship is table stakes for DevSecOps, but most teams don't know how to get actionable signal out of the noise.
- **Angle:** Shows how to run Trivy in a GitHub Actions workflow, convert output to SARIF, upload to the GitHub Security tab, and configure severity thresholds that block builds without creating alert fatigue. Also covers base image pinning, multi-stage build hardening, and what to do when your base image has unfixable CVEs.
- **Tags:** `container-security`, `github-advanced-security`, `devsecops`, `trivy`, `docker`

### Multi-Agent Patterns with Azure AI Foundry: Orchestration, Handoff, and Shared State
- **Status:** `published`
- **Published:** 2026-07-24
- **Issue:** [#120](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/120) ✅ closed
- **File:** `src/posts/2026-07-24-multi-agent-patterns-azure-ai-foundry-orchestration-handoff-shared-state.md`
- **Pitch:** Single agents hit a ceiling quickly - real agentic applications route tasks across specialized agents, and Azure AI Foundry provides the primitives to do this without building your own orchestration layer.
- **Angle:** Covers the three core multi-agent patterns (sequential pipeline, parallel fan-out, hierarchical orchestrator/sub-agent) with concrete Foundry implementations. Discusses shared memory and state management across agents, error handling when a sub-agent fails, and observability - how to trace a user request through a chain of agents.
- **Tags:** `azure-ai-foundry`, `ai-agents`, `agentic-development`, `multi-agent`, `azure`

### IaC Security Scanning in CI: Catching Terraform and Bicep Misconfigurations Before They Deploy
- **Status:** `published`
- **Published:** 2026-07-31
- **Issue:** [#121](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/121) ✅ closed
- **File:** `src/posts/2026-07-31-iac-security-scanning-terraform-bicep-ci.md`
- **Pitch:** Misconfigured infrastructure is one of the most common causes of cloud security incidents, and catching it in CI costs nothing compared to fixing it post-deployment.
- **Angle:** Shows how to integrate Checkov and tfsec into a GitHub Actions workflow for Terraform, and PSRule for Bicep. Covers converting results to SARIF for the GitHub Security tab, setting break-on-severity thresholds, and handling false positives with inline suppressions that are reviewable in PRs.
- **Tags:** `infrastructure-as-code`, `security`, `devsecops`, `terraform`, `github-actions`

---

### Prompt Engineering for Developers: Writing Reliable Instructions for Agentic Systems
- **Status:** `published`
- **Published:** 2026-08-07
- **Issue:** [#122](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/122)
- **File:** `src/posts/2026-08-07-prompt-engineering-for-developers.md`
- **Pitch:** Prompt engineering for agents is different from prompting a chatbot - reliability, tool use, and output format predictability matter far more than creativity.
- **Angle:** Covers system prompt structure for agents (role, context, constraints, output format), few-shot examples for tool selection, handling ambiguous user input gracefully, and testing prompts systematically rather than eyeballing outputs. Uses Azure AI Foundry's prompt flow as the testing harness.
- **Tags:** `prompt-engineering`, `ai-agents`, `agentic-development`, `azure-ai-foundry`, `llm`

### GitHub Environments Deep Dive: Deployment Protection Rules, Secrets, and Variables
- **Status:** `draft`
- **Scheduled:** 2026-08-14
- **Issue:** [#123](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/123)
- **File:** `src/posts/2026-08-14-github-environments-deep-dive.md`
- **Pitch:** GitHub Environments are the right place to model staging/production deployment gates, but most teams use them only for required reviewer approval and miss the rest of the capability.
- **Angle:** Covers deployment protection rules (required reviewers, wait timers, branch filters, custom rules via webhooks), the difference between environment secrets and repository secrets, and how to use environment variables to manage config promotion across environments. Includes a GitHub Actions workflow that enforces a staging smoke test before production is unlocked.
- **Tags:** `github-actions`, `ci-cd`, `deployment`, `devsecops`, `environments`

### Evaluating LLM Outputs in CI/CD: Testing Your AI Features Like Production Code
- **Status:** `draft`
- **Scheduled:** 2026-08-21
- **Issue:** [#124](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/124)
- **File:** `src/posts/2026-08-21-evaluating-llm-outputs-in-ci-cd.md`
- **Pitch:** AI features that can't be regression-tested are a deployment liability - this post shows how to treat LLM evaluation as a first-class CI step that blocks bad model updates from shipping.
- **Angle:** Covers deterministic tests (output format, null checks, latency SLA), semantic similarity scoring for non-deterministic outputs, and LLM-as-judge patterns for subjective quality. Uses Azure AI Foundry's evaluation SDK and shows how to fail a GitHub Actions workflow when evaluation scores drop below a threshold.
- **Tags:** `llm`, `testing`, `ai-agents`, `azure-ai-foundry`, `ci-cd`

### GitHub Secret Scanning Custom Patterns: Finding Business-Specific Credentials Before They Ship
- **Status:** `draft`
- **Scheduled:** 2026-08-28
- **Issue:** [#125](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/125) ✅ closed
- **File:** `src/posts/2026-08-28-github-secret-scanning-custom-patterns.md`
- **Pitch:** GitHub's built-in secret scanning covers common provider tokens, but internal API keys, connection strings, and proprietary credential formats require custom patterns - which most teams never configure.
- **Angle:** Walks through writing a custom secret scanning pattern (regex + test strings), deploying it at the org level, setting up push protection to block commits containing matches, and routing alerts to a security dashboard. Includes patterns for common internal formats: JWT with known issuer, internal API key prefix, database connection strings.
- **Tags:** `secret-scanning`, `github-advanced-security`, `devsecops`, `security`

---

### Azure AI Foundry Agents: Memory, Tool Calling, and Retrieval-Augmented Generation
- **Status:** `draft`
- **Scheduled:** 2026-09-04
- **Issue:** [#126](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/126) ✅ closed
- **File:** `src/posts/2026-09-04-azure-ai-foundry-agents-memory-tool-calling-rag.md`
- **Pitch:** Memory and RAG are what separate a useful agent from a stateless chatbot - this post covers the Foundry primitives for both and when to use each.
- **Angle:** Distinguishes conversation memory (thread state), semantic memory (vector search over documents), and episodic memory (structured facts about the user/session). Shows how to connect an Azure AI Search index to a Foundry agent, write a tool function that queries it, and ground responses in retrieved context without hallucinating citations.
- **Tags:** `azure-ai-foundry`, `ai-agents`, `rag`, `azure-ai-search`, `agentic-development`

### GitHub Merge Queues: Safe, Scalable Merging Without Branch Protection Bottlenecks
- **Status:** `draft`
- **Scheduled:** 2026-09-11
- **Issue:** [#127](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/127) ✅ closed
- **File:** `src/posts/2026-09-11-github-merge-queues.md`
- **Pitch:** At scale, required status checks on protected branches create a thundering herd problem where every PR re-runs CI after every merge - merge queues solve this without sacrificing safety.
- **Angle:** Explains the merge queue model (batching, pre-merge CI, jump-the-queue for urgent fixes), shows how to configure one via Rulesets, and covers the failure modes (stale base detection, batch splitting on failure). Compares merge queues to the older `bors`/`homu` bots used in large open-source projects.
- **Tags:** `github`, `ci-cd`, `developer-productivity`, `branch-protection`, `platform-engineering`

### RAG in Production: Chunking, Indexing, and Observability with Azure AI Search
- **Status:** `draft`
- **Scheduled:** 2026-09-18
- **Issue:** [#128](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/128) ✅ closed
- **File:** `src/posts/2026-09-18-rag-in-production-chunking-indexing-observability-azure-ai-search.md`
- **Pitch:** Getting a RAG prototype working is easy - getting it to produce accurate, grounded responses at scale requires deliberate decisions about chunking strategy, index design, and retrieval evaluation.
- **Angle:** Covers chunking strategies (fixed-size, sentence-boundary, semantic), hybrid search (keyword + vector), re-ranking with Azure AI Search semantic ranker, and how to measure retrieval quality. Includes an Azure AI Foundry evaluation run that scores groundedness and relevance on a test query set.
- **Tags:** `rag`, `azure-ai-search`, `azure-ai-foundry`, `llm`, `agentic-development`

### GitHub Packages as an Internal Registry: Publishing and Consuming npm, Docker, and Maven Artifacts
- **Status:** `draft`
- **Scheduled:** 2026-09-25
- **Issue:** [#129](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/129) ✅ closed
- **File:** `src/posts/2026-09-25-github-packages-internal-registry.md`
- **Pitch:** GitHub Packages is an underused alternative to JFrog, Nexus, or a public registry for teams that want artifact management without extra infrastructure.
- **Angle:** Covers publishing npm packages, Docker images, and Maven artifacts to GitHub Packages from a GitHub Actions workflow, consuming them in downstream workflows using the GITHUB_TOKEN (no PAT required), and setting package visibility and retention policies. Addresses the one real limitation: cross-org consumption requires a PAT.
- **Tags:** `github-packages`, `github-actions`, `ci-cd`, `artifact-management`, `platform-engineering`

---

### Responsible AI in the SDLC: Governance Gates You Can Automate with GitHub Actions
- **Status:** `draft`
- **Scheduled:** 2026-10-02
- **Issue:** [#130](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/130) ✅ closed
- **File:** `src/posts/2026-10-02-responsible-ai-governance-gates-github-actions.md`
- **Pitch:** Responsible AI isn't just a policy document - it's a set of checks you can automate into your deployment pipeline to catch bias, safety violations, and compliance issues before they ship.
- **Angle:** Maps the Microsoft Responsible AI principles to concrete CI checks: content safety filtering via Azure AI Content Safety, bias detection on model evaluation datasets, documentation completeness for model cards, and sign-off gates in GitHub Environments. Shows how to fail a deployment workflow when a content safety score exceeds a threshold.
- **Tags:** `responsible-ai`, `azure-ai-foundry`, `devsecops`, `compliance`, `governance`

### GitHub Codespaces for Team Onboarding: Eliminating "Works on My Machine" at Scale
- **Status:** `draft`
- **Scheduled:** 2026-10-09
- **Issue:** [#131](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/131) ✅ closed
- **File:** `src/posts/2026-10-09-github-codespaces-team-onboarding.md`
- **Pitch:** A well-configured Codespace means a new team member goes from zero to running the app in under five minutes on any device - this post shows how to build one.
- **Angle:** Covers `devcontainer.json` from scratch (base image, features, lifecycle commands, port forwarding), pre-building images to eliminate cold-start time, dotfiles integration for personal preferences, and Codespace secrets for environment-specific config. Includes a cost model for teams considering Codespaces vs. local dev.
- **Tags:** `github-codespaces`, `developer-productivity`, `devcontainer`, `onboarding`

### Agentic Code Review: Using AI Agents to Enforce Architecture Rules on Every PR
- **Status:** `draft`
- **Scheduled:** 2026-10-16
- **Issue:** [#132](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/132) ✅ closed
- **File:** `src/posts/2026-10-16-agentic-code-review-architecture-rules.md`
- **Pitch:** Architecture rules that live in documents get violated; architecture rules enforced by an agent on every PR get followed - this post shows how to build the latter.
- **Angle:** Builds a GitHub Actions-triggered agent that reads a PR diff, checks it against a set of architecture constraints stored in the repo (ADRs, dependency rules, naming conventions), and posts a structured review comment. Uses Azure AI Foundry for the agent runtime and the GitHub REST API for PR interaction. Covers how to keep the rules up to date as the architecture evolves.
- **Tags:** `ai-agents`, `code-review`, `azure-ai-foundry`, `github-actions`, `architecture`

### GitHub Actions Self-Hosted Runners: Security Hardening for Production Workloads
- **Status:** `draft`
- **Scheduled:** 2026-10-23
- **Issue:** [#133](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/133) ✅ closed
- **File:** `src/posts/2026-10-23-github-actions-self-hosted-runners-security-hardening.md`
- **Pitch:** Self-hosted runners unlock private network access and custom hardware, but they introduce security risks that GitHub-hosted runners don't have - most teams running them haven't hardened them.
- **Angle:** Covers the attack surface (persistent runner compromise, malicious PR targeting, secret exfiltration via environment), and the mitigations: ephemeral runners with autoscaling (ARC), network egress controls, workflow approval for external contributors, and runner groups scoped to specific repos. Includes an Azure Container Apps-based ephemeral runner setup.
- **Tags:** `github-actions`, `security`, `devsecops`, `runners`, `platform-engineering`

### LLMOps: Versioning, Testing, and Deploying Prompts as First-Class Artifacts
- **Status:** `draft`
- **Scheduled:** 2026-10-30
- **Issue:** [#134](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/134) ✅ closed
- **File:** `src/posts/2026-10-30-llmops-versioning-testing-deploying-prompts.md`
- **Pitch:** Prompts are code - they need versioning, testing, and a deployment pipeline. Most teams manage them as strings scattered across application code, which makes regression invisible.
- **Angle:** Covers storing prompts as versioned files in the repo, running evaluation tests against them in CI using Azure AI Foundry prompt flow, gating deployments on evaluation score thresholds, and rolling back a prompt version the same way you'd roll back a code deployment. Draws the analogy to feature flags for gradual prompt rollout.
- **Tags:** `llmops`, `azure-ai-foundry`, `prompt-engineering`, `ci-cd`, `agentic-development`

---

### Azure AI Foundry Fine-Tuning: When to Customize a Model vs. When to Prompt Better
- **Status:** `draft`
- **Scheduled:** 2026-11-06
- **Issue:** [#135](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/135)
- **File:** `src/posts/2026-11-06-azure-ai-foundry-fine-tuning-customize-vs-prompt.md`
- **Pitch:** Fine-tuning is often the wrong answer - it's expensive, opaque, and fragile - but for the right problem it dramatically outperforms prompt engineering alone. This post helps you decide.
- **Angle:** Sets up the decision framework: when few-shot examples consistently get the format right but aren't reliable enough (fine-tune), vs. when the model doesn't have the domain knowledge (RAG). Shows how to prepare a training dataset, run a supervised fine-tune job in Azure AI Foundry, evaluate the fine-tuned model against the base, and deploy both behind an A/B traffic split.
- **Tags:** `azure-ai-foundry`, `fine-tuning`, `llm`, `agentic-development`, `azure`

### Policy as Code with OPA and GitHub Actions: Enforcing Org Standards at the Merge Gate
- **Status:** `draft`
- **Scheduled:** 2026-11-13
- **Issue:** [#136](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/136)
- **File:** `src/posts/2026-11-13-policy-as-code-opa-github-actions.md`
- **Pitch:** Open Policy Agent lets you express compliance rules as code and enforce them in CI - this post shows how to use it to gate merges on policy rather than on a human reviewer's memory.
- **Angle:** Covers writing Rego policies for common engineering standards (required labels on PRs, allowed base images in Dockerfiles, required fields in workflow files), running OPA in a GitHub Actions workflow, and surfacing policy violations as PR check failures with actionable messages. Includes a policy for enforcing the `permissions` block on all workflow files.
- **Tags:** `policy-as-code`, `opa`, `github-actions`, `devsecops`, `compliance`

### Internal Developer Platforms with GitHub: Backstage, Service Catalog, and the GitHub API
- **Status:** `draft`
- **Scheduled:** 2026-11-20
- **Issue:** [#137](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/137)
- **File:** `src/posts/2026-11-20-internal-developer-platforms-backstage-github-api.md`
- **Pitch:** Backstage is the most widely adopted IDP framework, and GitHub is its most natural data source - this post shows how to wire them together so your catalog stays in sync with your actual codebase.
- **Angle:** Covers deploying Backstage with the GitHub integration, writing catalog-info.yaml for a real service, auto-discovering catalog entries from GitHub repos using the GitHub Entity Provider, and using GitHub Actions to keep the catalog updated when repos are created or archived. Includes a GitHub App setup that gives Backstage read-only access without a PAT.
- **Tags:** `developer-platform`, `backstage`, `github`, `platform-engineering`, `developer-productivity`

### Agentic QA: How AI Agents Are Reshaping Test Generation and Exploratory Testing
- **Status:** `draft`
- **Scheduled:** 2026-11-27
- **Issue:** [#138](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/138)
- **File:** `src/posts/2026-11-27-agentic-qa-ai-test-generation-exploratory-testing.md`
- **Pitch:** AI agents that understand a codebase can generate regression tests, explore edge cases, and find issues a human tester would miss - the tooling is early but the results are already useful.
- **Angle:** Surveys the current landscape (GitHub Copilot test generation, Azure AI Foundry-based test agents, open-source options), builds a simple agent that reads a function and generates a parameterized test suite for it, and discusses where the pattern breaks down (flaky agents, hallucinated assertions, coverage theater). Frames it as augmentation not replacement.
- **Tags:** `ai-agents`, `testing`, `agentic-development`, `azure-ai-foundry`, `developer-productivity`

---

### GitHub Advanced Security at the Org Level: Rolling Out GHAS Across 100+ Repos
- **Status:** `draft`
- **Scheduled:** 2026-12-04
- **Issue:** [#139](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/139)
- **File:** `src/posts/2026-12-04-github-advanced-security-org-rollout.md`
- **Pitch:** Enabling GHAS on one repo is easy; rolling it out consistently across a large org without alert fatigue or developer friction requires a deliberate strategy.
- **Angle:** Covers the rollout sequence (secret scanning first, then code scanning, then Dependabot alerts with auto-dismiss rules), using the GitHub REST API and `gh` CLI to audit enablement status across repos, setting org-level default setup for CodeQL, and building a compliance dashboard with GitHub Actions that reports on coverage weekly.
- **Tags:** `github-advanced-security`, `devsecops`, `platform-engineering`, `codeql`, `secret-scanning`

### Azure AI Foundry MCP Servers: Building and Registering Custom Tools for Your Agents
- **Status:** `draft`
- **Scheduled:** 2026-12-11
- **Issue:** [#140](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/140)
- **File:** `src/posts/2026-12-11-azure-ai-foundry-mcp-servers-custom-tools.md`
- **Pitch:** The Model Context Protocol lets agents call external tools over a standard interface - Azure AI Foundry's MCP server support means you can extend your agents with custom capabilities without forking the runtime.
- **Angle:** Builds an MCP server that exposes two tools (a GitHub API wrapper and an internal knowledge base query), registers it with a Foundry agent, and shows the agent routing tool calls correctly. Covers the MCP schema, authentication between the agent and the server, and deploying the MCP server as an Azure Container App alongside the agent.
- **Tags:** `azure-ai-foundry`, `mcp`, `ai-agents`, `agentic-development`, `azure`

### The DevSecOps Year in Review 2026: What Shipped, What Mattered, What's Next
- **Status:** `draft`
- **Scheduled:** 2026-12-18
- **Issue:** [#141](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/141)
- **File:** `src/posts/2026-12-18-devsecops-year-in-review-2026.md`
- **Pitch:** A retrospective on the year's most significant shifts in developer security, CI/CD, and AI-assisted development - written for practitioners who want signal, not press releases.
- **Angle:** Structured as three sections: what shipped (concrete features from GitHub, Azure, and the ecosystem), what actually mattered in practice (the things teams adopted vs. the things that stayed theoretical), and what to watch in 2027 (agentic pipelines, AI-native security tooling, platform engineering consolidation). Personal and opinionated.
- **Tags:** `devsecops`, `year-in-review`, `github`, `azure-ai-foundry`, `editorial`

### Async-First Development: Writing Code and Processes That Work Across Time Zones
- **Status:** `draft`
- **Scheduled:** 2026-12-25
- **Issue:** [#142](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/142)
- **File:** `src/posts/2026-12-25-async-first-development-across-time-zones.md`
- **Pitch:** The best remote engineering teams aren't just distributed - they're async-first, which means their code, processes, and tooling are designed to work without real-time coordination.
- **Angle:** Covers the practices that separate async-capable teams from ones that just have standup on Zoom: commit message discipline, ADR-driven decision-making, self-documenting PRs, GitHub Discussions for async deliberation, and using GitHub Actions to automate the status updates that would otherwise require a Slack message. Light enough for the holiday week, substantive enough to be worth reading.
- **Tags:** `developer-productivity`, `remote-work`, `writing-for-engineers`, `git`, `async`

---

## 📅 Tuesday Track - AI Coding Agents (August-September 2026)

Six posts on AI coding agents, running Tuesdays alongside the Friday DevOps track. A comparison post anchors the track and each of the five follow-ups goes deep on one tool's setup.

### The Top 5 AI Coding Agents Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2026-08-18
- **File:** `src/posts/2026-08-18-top-5-ai-coding-agents-compared.md`
- **Pitch:** Claude Code, Copilot, Codex, Cursor, and Kiro are all sold as "AI coding assistants," but they disagree fundamentally about how much control you hand over - this is the orientation piece for a team that has to pick one and defend the choice.
- **Angle:** Opens with a five-column comparison table across surface, core philosophy, autonomy style, extensibility, and best-fit team, then gives each tool a strengths/weaknesses/best-for breakdown. Closes with a decision section that routes by team situation (already standardized on GitHub, want a programmable agent, want async fire-and-forget work, want agent power without leaving a familiar editor, need traceable spec-first delivery). Explicitly framed as a snapshot rather than a permanent ranking, since this space moves in weeks.
- **Tags:** `ai-agents`, `agentic-development`, `developer-productivity`, `ai-coding-tools`, `tooling`

### Getting Started with Claude Code: Setup, Environment, and Best Practices
- **Status:** `draft`
- **Scheduled:** 2026-08-25
- **File:** `src/posts/2026-08-25-getting-started-with-claude-code.md`
- **Pitch:** Claude Code installs in under a minute, which is exactly why most people stop there and end up with a chatbot that happens to have file access. Everything that makes it a programmable agent lives in the setup skipped on day one.
- **Angle:** Covers the install paths (native installer vs. npm), then the three things that actually decide whether the setup holds up: `CLAUDE.md` for standing project instructions, the permissions model for what the agent can do without asking, and hooks for making non-negotiables deterministic instead of hoping the model remembers an instruction. Includes a verification checklist, guidance on what subagents are genuinely for, and a direct comparison with GitHub Copilot.
- **Tags:** `ai-agents`, `ai-coding-tools`, `agentic-development`, `developer-productivity`, `tooling`

### Getting Started with GitHub Copilot: Setup, Environment, and Best Practices
- **Status:** `draft`
- **Scheduled:** 2026-09-01
- **File:** `src/posts/2026-09-01-getting-started-with-github-copilot.md`
- **Pitch:** Copilot is the AI tool most developers touch first because it already lives in their editor - and that familiarity is why most teams never get past inline autocomplete. Agent mode and the cloud coding agent are there; they just don't turn themselves on.
- **Angle:** Walks the layered instruction system - `.github/copilot-instructions.md` for repo-wide rules, `AGENTS.md` as the cross-tool alternative worth maintaining if you only keep one file, and `.github/instructions/*.instructions.md` with `applyTo` globs for monorepos with per-directory conventions. Draws a hard line between in-editor agent mode (watch and interrupt) and the cloud coding agent (assign an issue, get a PR), and includes the one-time onboarding pass that measurably improves how often the cloud agent's PRs clear CI.
- **Tags:** `ai-agents`, `ai-coding-tools`, `agentic-development`, `developer-productivity`, `tooling`

### Getting Started with OpenAI Codex: Setup, Environment, and Best Practices
- **Status:** `draft`
- **Scheduled:** 2026-09-08
- **File:** `src/posts/2026-09-08-getting-started-with-openai-codex.md`
- **Pitch:** Codex is built on the assumption that you'll describe a task and walk away, which makes the settings people skip when trying it quickly - sandbox mode, approval policy, `AGENTS.md` - exactly the ones that decide whether an unattended run is safe.
- **Angle:** Covers installing the CLI, then writing an `AGENTS.md` that names your real test command and off-limits directories so Codex stops guessing. Separates the two dials people conflate: sandbox mode (`read-only`, `workspace-write`, `danger-full-access`) governs what Codex may touch, approval policy governs whether it asks first. Also covers excluding `.env` from sandbox read access explicitly rather than trusting `.gitignore`, `@codex review` / `@codex fix` on GitHub PRs, and isolated git worktrees for running parallel agents against one repo.
- **Tags:** `ai-agents`, `ai-coding-tools`, `agentic-development`, `developer-productivity`, `tooling`

### Getting Started with Cursor: Setup, Environment, and Best Practices
- **Status:** `draft`
- **Scheduled:** 2026-09-15
- **File:** `src/posts/2026-09-15-getting-started-with-cursor.md`
- **Pitch:** Cursor feels like the editor you already use right up until it doesn't, and the gap between using Cursor and using Cursor well is almost entirely in two places most people never open: `.cursor/rules/` and the MCP config.
- **Angle:** Covers migrating off the legacy `.cursorrules` file to scoped `.cursor/rules/` files, the three AI surfaces (Tab autocomplete, chat, Agent and Background Agents) and how to match the surface to the size of the task, and connecting MCP servers to real infrastructure without over-connecting and drowning the context window. Also covers what belongs in version control and how the metered credit model actually bills - the part that surprises teams a month in.
- **Tags:** `ai-agents`, `ai-coding-tools`, `agentic-development`, `developer-productivity`, `tooling`

### Getting Started with Kiro: Setup, Environment, and Best Practices
- **Status:** `draft`
- **Scheduled:** 2026-09-22
- **File:** `src/posts/2026-09-22-getting-started-with-kiro.md`
- **Pitch:** Kiro makes you write the spec before any code gets generated, which genuinely feels slower than just prompting an agent - this post is an honest look at when that upfront cost pays for itself and when it's pure overhead.
- **Angle:** Covers generating steering documents into `.kiro/steering/` and why stale steering is worse than none, the three-phase spec flow (requirements in EARS notation, then design, then an ordered task breakdown), and event-driven hooks as JSON under `.kiro/hooks/` that fire on file save or task completion. Distinguishes vibe sessions from spec sessions, argues for committing `.kiro/` so intent is versioned alongside output, and compares the model head-to-head with Cursor.
- **Tags:** `ai-agents`, `ai-coding-tools`, `agentic-development`, `developer-productivity`, `aws`

---

## 📅 Tuesday Track - .NET Architecture Patterns (September-November 2026)

Six posts on how to organize a .NET codebase, picking up the Tuesday cadence directly from the AI coding agents track. A comparison post anchors the track and each of the five follow-ups sets one pattern up end to end.

### The Top 5 .NET Architecture Patterns Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2026-09-29
- **Source:** `docs/article-ideas/top-5-dotnet-architecture-patterns-compared.md`
- **File:** `src/posts/2026-09-29-top-5-dotnet-architecture-patterns-compared.md`
- **Pitch:** Layered, Clean, Vertical Slice, Modular Monolith, and Microservices aren't five points on a scale from bad to good - they're different trades between structure, speed, and organizational scale. This is the orientation piece for a team that has to pick one and defend the choice.
- **Angle:** Opens with a comparison table across organizing principle, deployment unit, learning curve, change isolation, and operational overhead, then gives each pattern a strengths/weaknesses/choose-this-when breakdown. The load-bearing argument is that several of these compose rather than compete - Vertical Slice or Clean Architecture inside a module of a Modular Monolith is a common and underrated landing spot. Closes on the point that a Modular Monolith is usually the honest predecessor to Microservices rather than its opposite, and that module boundaries only hold when enforcement is structural rather than cultural.
- **Tags:** `dotnet`, `architecture`, `microservices`, `platform-engineering`, `developer-productivity`

### Getting Started with Clean Architecture in .NET
- **Status:** `draft`
- **Scheduled:** 2026-10-06
- **Source:** `docs/article-ideas/getting-started-with-clean-architecture-dotnet.md`
- **File:** `src/posts/2026-10-06-getting-started-with-clean-architecture-dotnet.md`
- **Pitch:** The dependency rule is easy to state and easy to leave aspirational. Getting the project structure right so the compiler enforces it - rather than code review hoping to catch violations - is where most first attempts go sideways.
- **Angle:** Scaffolds the solution both from the Ardalis Clean Architecture template and by hand, showing the Core/UseCases/Infrastructure/Web reference graph that turns the dependency rule into a compile error. Covers where entities, handlers, and repository implementations actually belong, the single point in `Program.cs` where the concrete and the abstract meet, and NetArchTest/ArchUnitNET architecture tests that fail the build when `Core` picks up an infrastructure dependency a project reference alone wouldn't catch. Ends on the honest limitation: the ceremony earns its keep only where there's real business logic to protect, and a rules-free CRUD endpoint doesn't need four layers and a MediatR handler.
- **Tags:** `dotnet`, `architecture`, `testing`, `developer-productivity`

### Getting Started with Layered (N-Tier) Architecture in .NET
- **Status:** `draft`
- **Scheduled:** 2026-10-13
- **Source:** `docs/article-ideas/getting-started-with-layered-architecture-dotnet.md`
- **File:** `src/posts/2026-10-13-getting-started-with-layered-architecture-dotnet.md`
- **Pitch:** Layered architecture still runs a huge share of production .NET, and for genuinely CRUD-shaped applications that's the right call rather than a compromise. The mistake isn't using it - it's using it past the point where it stops fitting the problem.
- **Angle:** Sets up Web/Business/DataAccess as three separate projects so violating the dependency direction is a compile error rather than a convention people forget, wires EF Core into the data layer, and keeps the business layer free of ASP.NET Core types. Covers DTOs vs. entities at the API boundary, repository interfaces purely for testability, and why the business layer becomes a dumping ground without deliberate internal splitting. Closes with the signal to move on: when most feature changes touch all three layers, that friction is pointing at Vertical Slice or a Modular Monolith, not at adding more structure inside the same three layers.
- **Tags:** `dotnet`, `architecture`, `testing`, `developer-productivity`

### Getting Started with Vertical Slice Architecture in .NET
- **Status:** `draft`
- **Scheduled:** 2026-10-20
- **Source:** `docs/article-ideas/getting-started-with-vertical-slice-architecture-dotnet.md`
- **File:** `src/posts/2026-10-20-getting-started-with-vertical-slice-architecture-dotnet.md`
- **Pitch:** Vertical Slice Architecture asks what a single request actually needs and puts all of it in one folder, so adding a feature means adding a slice rather than touching four existing layers. Its failure mode is teams reading "organize by feature" as "duplicate everything."
- **Angle:** Builds a complete slice - command, handler, endpoint, validator - under `Features/<Area>/<Feature>/` with MediatR and FastEndpoints, where assembly scanning means new slices register nothing manually. Makes the case that a MediatR pipeline behavior is where validation, logging, and transaction handling belong, since re-implementing cross-cutting concerns slightly differently per slice is what stops many independent slices from feeling like one coherent application. Argues against extracting shared abstractions early and against reflexively hiding `DbContext` behind a repository in every slice, then positions the pattern relative to a Modular Monolith as a different altitude rather than a competing choice.
- **Tags:** `dotnet`, `architecture`, `developer-productivity`, `tooling`

### Getting Started with Modular Monolith Architecture in .NET
- **Status:** `draft`
- **Scheduled:** 2026-10-27
- **Source:** `docs/article-ideas/getting-started-with-modular-monolith-dotnet.md`
- **File:** `src/posts/2026-10-27-getting-started-with-modular-monolith-dotnet.md`
- **Pitch:** A Modular Monolith is deceptively easy to describe and genuinely hard to keep honest - nothing forces modules to respect each other's boundaries except deliberate enforcement, and the moment enforcement lapses it's a monolith with extra folders.
- **Angle:** Structures each module as an implementation project plus a `Contracts` project, where modules reference only each other's contracts and implementations are marked `internal` so a cross-module reach is a compile error rather than a code review note. Gives each module its own `DbContext` and self-registering DI extension so the host stays thin, and backs the whole arrangement with architecture tests that fail CI on a boundary violation. Covers the two decisions that actually determine whether the pattern holds - separate schemas vs. separate databases, and in-process events vs. direct contract calls - and argues a Modular Monolith is a complete architecture rather than an unfinished Microservices migration.
- **Tags:** `dotnet`, `architecture`, `microservices`, `platform-engineering`, `ci-cd`

### Getting Started with Microservices Architecture in .NET
- **Status:** `draft`
- **Scheduled:** 2026-11-03
- **Source:** `docs/article-ideas/getting-started-with-microservices-dotnet.md`
- **File:** `src/posts/2026-11-03-getting-started-with-microservices-dotnet.md`
- **Pitch:** Microservices solve an organizational problem most projects don't have yet: independent teams needing to deploy and scale without blocking each other. .NET Aspire has made the local development side dramatically less painful, but it hasn't changed that trade-off.
- **Angle:** Scaffolds a multi-service solution with Aspire and describes the whole topology in AppHost - a Postgres container per service, `WithReference` for service discovery instead of hardcoded URLs, and one `dotnet run` that brings everything up with a dashboard showing logs and traces across services. Covers ServiceDefaults as the place shared OpenTelemetry, health checks, and resilience configuration live without coupling services to each other's business logic. Is explicit that AppHost is a development tool that never gets deployed, and that Aspire removes friction from building and running services locally without removing contract versioning, partial failure handling, or distributed data consistency - which are the actual cost of the pattern.
- **Tags:** `dotnet`, `architecture`, `microservices`, `observability`, `devops`

---

## 📅 Tuesday Track - .NET Logging Frameworks (November-December 2026)

Six posts on .NET logging, continuing the Tuesday cadence. A comparison post anchors the track and each of the five follow-ups is a complete ASP.NET Core setup for one framework.

### The Top 5 .NET Logging Frameworks Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2026-11-10
- **Source:** `docs/article-ideas/top-5-dotnet-logging-frameworks-compared.md`
- **File:** `src/posts/2026-11-10-top-5-dotnet-logging-frameworks-compared.md`
- **Pitch:** Picking a .NET logging framework sounds like a five-minute decision, but these five don't solve the same problem - one is built in, one is structured-logging-first, one optimizes for routing flexibility, one is inherited from a decade ago, and one trades ecosystem breadth for near-zero allocation.
- **Angle:** Compares Microsoft.Extensions.Logging, Serilog, NLog, log4net, and ZLogger across setup effort, configuration style, structured logging support, performance, and sink ecosystem, then gives each a strengths/weaknesses/choose-this-when breakdown. The framing that matters most: Microsoft.Extensions.Logging isn't really a competitor to the other four, it's the `ILogger<T>` abstraction they all implement. Closes on why that makes the decision unusually reversible - swapping providers touches `Program.cs` and configuration, not the application code that calls the logger.
- **Tags:** `dotnet`, `logging`, `observability`, `performance`, `tooling`

### Getting Started with Microsoft.Extensions.Logging in ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2026-11-17
- **Source:** `docs/article-ideas/getting-started-with-microsoft-extensions-logging-in-aspnet-core.md`
- **File:** `src/posts/2026-11-17-getting-started-with-microsoft-extensions-logging-in-aspnet-core.md`
- **Pitch:** There's no package to install and no obvious getting-started moment, which is exactly what trips people up - most developers never learn how the log level hierarchy resolves or why their `appsettings.json` overrides aren't taking effect the way they expect.
- **Angle:** Covers what `WebApplication.CreateBuilder` already registers, the prefix-based most-specific-match category resolution that makes `Microsoft.AspNetCore` overrides work (and explains why they sometimes don't), and the two configuration paths with the precedence order between them - code-based `AddFilter` calls layer on top of JSON, which accounts for most of the surprises. Shows the startup pattern for both ASP.NET Core and Worker Services, `BeginScope` with `IncludeScopes`, and why no `try/catch/finally` flush is needed here when NLog and log4net both require one. Ends on the real limitation: Console and Debug persist nothing, so this is the foundation the other four build on rather than a production logging story.
- **Tags:** `dotnet`, `logging`, `observability`, `developer-productivity`

### Getting Started with Serilog in ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2026-11-24
- **Source:** `docs/article-ideas/getting-started-with-serilog-in-aspnet-core.md`
- **File:** `src/posts/2026-11-24-getting-started-with-serilog-in-aspnet-core.md`
- **Pitch:** Serilog's fluent, code-first configuration throws a curveball at anyone used to XML or JSON logging config: there's no single file to point at, and the two-stage bootstrap-logger initialization isn't obvious from the docs alone.
- **Angle:** Covers both configuration styles - the fluent `LoggerConfiguration` API and `Serilog.Settings.Configuration` for JSON-driven setup - plus enrichers, `MinimumLevel.Override` for framework noise, and rolling file output. Spends real time on the bootstrap logger pattern and the services-aware `UseSerilog` overload that replaces it, since configuring sinks only in the bootstrap logger is the mistake that leaves an app stuck on a minimal console pipeline for its entire lifetime. Makes the structured logging argument concrete rather than abstract: message templates keep `{OrderId}` queryable in Seq or Elasticsearch, and string interpolation throws that capability away entirely.
- **Tags:** `dotnet`, `logging`, `observability`, `tooling`

### Getting Started with NLog in ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2026-12-01
- **Source:** `docs/article-ideas/getting-started-with-nlog-in-aspnet-core.md`
- **File:** `src/posts/2026-12-01-getting-started-with-nlog-in-aspnet-core.md`
- **Pitch:** NLog setup is straightforward once you've done it once, but the first pass raises three questions at the same time: XML or JSON, how buffered entries get flushed, and why the official guidance wraps `Program.cs` in a `try/catch/finally`.
- **Angle:** Ships a complete `nlog.config` with an `AsyncWrapper`-wrapped file target plus the equivalent JSON section, and explains the two attributes that matter most - `autoReload` for raising verbosity in production without a restart, and `throwConfigExceptions` because NLog's default silent-failure mode produces an app that runs normally and logs nothing. Covers `UseNLog()` vs. `AddNLog()` for web hosts and Worker Services, `LogManager.Shutdown()` in `finally`, and silencing `Microsoft.*` with `final="true"` before the catch-all rule. Points at `internal-nlog.txt` as the first place to look when logs aren't appearing.
- **Tags:** `dotnet`, `logging`, `devops`, `tooling`

### Getting Started with ZLogger in ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2026-12-08
- **Source:** `docs/article-ideas/getting-started-with-zlogger-in-aspnet-core.md`
- **File:** `src/posts/2026-12-08-getting-started-with-zlogger-in-aspnet-core.md`
- **Pitch:** ZLogger looks like any other `Microsoft.Extensions.Logging` provider right up until the log calls, where it asks for native C# string interpolation instead of message templates in exchange for allocation-free, directly-UTF8-encoded output.
- **Angle:** Covers the single-package install, `AddZLoggerConsole`/`AddZLoggerRollingFile` registration, and the fact that ZLogger respects the standard `Logging:LogLevel` section - so switching from the built-in providers changes only the provider registration, not the level configuration. Explains what the source generator actually does: it intercepts the interpolated string handler at compile time, so `$"Order {orderId}"` still captures `orderId` as a named structured property rather than flattening it into text. Honest about the constraints - C# 11 and .NET 8 for the full benefit, a much narrower sink ecosystem than Serilog, and that mixing `ZLogInformation` with plain `LogInformation` silently drops calls off the fast path that justified choosing it.
- **Tags:** `dotnet`, `logging`, `performance`, `observability`

### Getting Started with log4net in ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2026-12-15
- **Source:** `docs/article-ideas/getting-started-with-log4net-in-aspnet-core.md`
- **File:** `src/posts/2026-12-15-getting-started-with-log4net-in-aspnet-core.md`
- **Pitch:** log4net predates `Microsoft.Extensions.Logging` by well over a decade, and its defining property today is that it fails silently on configuration errors - an app that runs normally, logs nothing, and gives you no error pointing at the cause.
- **Angle:** Covers the two-package install (`log4net` plus the `Microsoft.Extensions.Logging` bridge, so you inject `ILogger<T>` rather than log4net's native `ILog`), a `RollingFileAppender` configuration with date-based rolling and explicit `Microsoft`/`System.Net.Http` level overrides, and the `CopyToOutputDirectory` setting that is the single most common cause of "nothing is logging." Covers `LogManager.Flush()` in a `finally` block, why there's no native JSON configuration schema, and the per-environment config file approach that stands in for one. Lands on the honest recommendation from the comparison post: keep it where it already works, don't start new services on it.
- **Tags:** `dotnet`, `logging`, `tooling`, `developer-productivity`

---

## 📅 Tuesday Track - .NET Testing Frameworks (January-February 2027)

Six posts on .NET testing frameworks, resuming the Tuesday cadence in January - 2026-12-22 and 2026-12-29 are intentionally skipped for the holidays. A comparison post anchors the track and each of the five follow-ups sets one framework up from scratch.

### The Top 5 .NET Testing Frameworks Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2027-01-05
- **Source:** `docs/article-ideas/top-5-dotnet-testing-frameworks-compared.md`
- **File:** `src/posts/2027-01-05-top-5-dotnet-testing-frameworks-compared.md`
- **Pitch:** "Which .NET testing framework" used to mean picking between three mature options with mostly stylistic differences. Microsoft.Testing.Platform and TUnit's source-generated, reflection-free architecture have made it a genuinely open question again.
- **Angle:** Compares xUnit, NUnit, MSTest, TUnit, and Expecto across origin, test discovery mechanism, Native AOT support, parallelism, and maturity. The architectural split is the actual story: the three incumbents discover tests via reflection at run time, TUnit does it at compile time via source generators, which is why it supports Native AOT in a way the others structurally can't without a rewrite. Expecto is included deliberately as F#'s own answer rather than a competing C# option. Closes on the migration question - churn for marginal ergonomic gains is rarely worth it, a concrete pain point like CI run time or AOT compatibility is.
- **Tags:** `dotnet`, `testing`, `performance`, `tooling`, `developer-productivity`

### Getting Started with xUnit in .NET
- **Status:** `draft`
- **Scheduled:** 2027-01-12
- **Source:** `docs/article-ideas/getting-started-with-xunit.md`
- **File:** `src/posts/2027-01-12-getting-started-with-xunit.md`
- **Pitch:** xUnit's minimal-ceremony design is the whole point, and also the thing that confuses people arriving from NUnit - there's no `[SetUp]` because the constructor does that job, and no `[TearDown]` because `IDisposable` already does.
- **Angle:** Covers constructor/`IDisposable` setup and teardown, the fact that a fresh test class instance is created per test (which is why shared state needs an explicit `IClassFixture<T>` rather than happening by accident), `IAsyncLifetime` for genuinely async setup, and `[Theory]` with `[InlineData]` vs. `[MemberData]`. Treats default class-level parallelism as a feature rather than an obstacle: intermittent failures that only appear when tests run together are a shared-state design problem to fix, not a reason to disable parallelization and hide it.
- **Tags:** `dotnet`, `testing`, `ci-cd`, `developer-productivity`

### Getting Started with NUnit in .NET
- **Status:** `draft`
- **Scheduled:** 2027-01-19
- **Source:** `docs/article-ideas/getting-started-with-nunit.md`
- **File:** `src/posts/2027-01-19-getting-started-with-nunit.md`
- **Pitch:** NUnit front-loads more concepts than xUnit - `[TestFixture]`, `[SetUp]`, `[TearDown]`, `[OneTimeSetUp]` - and each one buys something specific. The part worth getting right early is knowing which setup attribute runs when.
- **Angle:** Walks the full setup/teardown hierarchy and maps each level onto its xUnit equivalent, then covers what NUnit actually offers over the alternatives: constraint-based assertions that compose with `.And`/`.Or`, `[TestCase]` vs. `[TestCaseSource]` for fixed vs. computed data, and `[Category]` for splitting fast unit tests from slow integration tests inside one project. The two failure modes it names directly are reaching for `[OneTimeSetUp]` on state that should be per-test isolated, and mixing classic `Assert.AreEqual` with constraint-based `Assert.That` across the same codebase.
- **Tags:** `dotnet`, `testing`, `developer-productivity`, `tooling`

### Getting Started with MSTest in .NET
- **Status:** `draft`
- **Scheduled:** 2027-01-26
- **Source:** `docs/article-ideas/getting-started-with-mstest.md`
- **File:** `src/posts/2027-01-26-getting-started-with-mstest.md`
- **Pitch:** MSTest's reputation as "the Visual Studio one" undersells where it's actually landed - the feature gap with xUnit and NUnit has narrowed considerably, and the decision that matters now is which test execution platform you're building against.
- **Angle:** Covers `[TestInitialize]`/`[TestCleanup]` and `[ClassInitialize]`/`[ClassCleanup]`, including the static-method requirement that produces a compile error for anyone arriving from xUnit or NUnit's instance-based lifecycles. Covers `[DataRow]`/`[DynamicData]`, `TestContext` for run-time metadata, and an assertion style closer to xUnit's direct form than NUnit's fluent one. The genuinely useful part is the VSTest vs. Microsoft.Testing.Platform decision, which affects CI behavior in ways the project file doesn't make obvious.
- **Tags:** `dotnet`, `testing`, `tooling`, `devops`

### Getting Started with TUnit in .NET
- **Status:** `draft`
- **Scheduled:** 2027-02-02
- **Source:** `docs/article-ideas/getting-started-with-tunit.md`
- **File:** `src/posts/2027-02-02-getting-started-with-tunit.md`
- **Pitch:** TUnit's important characteristic isn't its syntax, it's when test discovery happens - compile time via source generators rather than run time via reflection. That's a different architecture, not a faster implementation of the same idea.
- **Angle:** Covers the template install and why the project needs `<OutputType>Exe</OutputType>` (TUnit generates a standalone test executable rather than a library an external runner reflects over), `[Before(Test)]`/`[After(Test)]` plus the broader hook scopes, async fluent assertions, reference-counted fixture sharing via `[ClassDataSource<T>]`, and matrix tests for genuine combinatorial coverage. Honest about the trade: pre-1.0 in places, a much smaller community, and a real migration project rather than a find-and-replace - so the strongest case is greenfield adoption or a suite with measured performance pain.
- **Tags:** `dotnet`, `testing`, `performance`, `ci-cd`, `tooling`

### Getting Started with Expecto in .NET (F#)
- **Status:** `draft`
- **Scheduled:** 2027-02-09
- **Source:** `docs/article-ideas/getting-started-with-expecto.md`
- **File:** `src/posts/2027-02-09-getting-started-with-expecto.md`
- **Pitch:** Expecto asks a different question than the other four: what does a test look like if it's just an ordinary F# value? The adjustment isn't syntax, it's the mental model - a test suite is data you build up, not a class the framework introspects.
- **Angle:** Covers `testList`/`testCase` composition with the test project's own entry point acting as the runner, setup and teardown as higher-order functions wrapping the test body rather than framework attribute hooks, and list comprehensions standing in for `[TestCase]`/`[InlineData]`. Covers FsCheck property-based testing as a first-class built-in rather than an add-on, which is Expecto's most distinctive capability and the one most commonly underused. Explicit throughout that this is the F# answer, not a competing option for C# projects.
- **Tags:** `dotnet`, `testing`, `developer-productivity`, `tooling`

---

## 📅 Tuesday Track - .NET ORMs (February-March 2027)

Six posts on .NET data access, closing out the Tuesday cadence. A comparison post anchors the track and each of the five follow-ups is a complete setup for one ORM.

### The Top 5 .NET ORMs Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2027-02-16
- **Source:** `docs/article-ideas/top-5-dotnet-orms-compared.md`
- **File:** `src/posts/2027-02-16-top-5-dotnet-orms-compared.md`
- **Pitch:** Every .NET data access decision collapses into one question: how much should the ORM do for you, versus how much SQL do you want to write yourself? EF Core and Dapper are the two ends of that axis, and the other three aren't simply worse versions of either.
- **Angle:** Compares EF Core, Dapper, NHibernate, Linq2Db, and RepoDb across category, query style, change tracking, migrations, performance, and maintainer, then gives each a strengths/weaknesses/choose-this-when breakdown. The recurring argument is that "pick one" is often the wrong framing - EF Core for the domain and migrations with Dapper on specific read paths is a widely supported pattern, not a compromise. Pushes back hard on choosing by benchmark: for most applications the bottleneck is the query, the network, or business logic, not the mapping layer's marginal overhead.
- **Tags:** `dotnet`, `orm`, `database`, `performance`, `architecture`

### Getting Started with EF Core in .NET
- **Status:** `draft`
- **Scheduled:** 2027-02-23
- **Source:** `docs/article-ideas/getting-started-with-ef-core.md`
- **File:** `src/posts/2027-02-23-getting-started-with-ef-core.md`
- **Pitch:** EF Core is the right default, but the gap between a tutorial's `dotnet ef migrations add` and a setup that stays maintainable is bigger than it looks. Three things trip up most first real projects: change tracking you're paying for on read-only queries, migrations that can't find your `DbContext`, and repository layers added out of habit.
- **Angle:** Covers the provider and design-time packages - including why `Microsoft.EntityFrameworkCore.Design` belongs in the startup project, the single most common cause of broken migrations in a multi-project solution - plus `DbContext` and relationship configuration, the `--project`/`--startup-project` split, and `IDesignTimeDbContextFactory<T>` as the fallback when the tooling can't instantiate your context. Makes `AsNoTracking()` the default habit for reads, since that one habit accounts for most of the performance gap people attribute to EF Core being slow. Argues against a reflexive repository/unit-of-work layer on top of something that already implements unit of work, and treats reaching for Dapper on specific paths as normal rather than an admission the choice was wrong.
- **Tags:** `dotnet`, `orm`, `database`, `performance`, `developer-productivity`

### Getting Started with Dapper in .NET
- **Status:** `draft`
- **Scheduled:** 2027-03-02
- **Source:** `docs/article-ideas/getting-started-with-dapper.md`
- **File:** `src/posts/2027-03-02-getting-started-with-dapper.md`
- **Pitch:** You write the SQL, Dapper maps the results onto your objects, and almost nothing happens in between. What trips people up isn't Dapper's fault so much as the gaps it deliberately doesn't fill - connection lifecycle, migrations, and mapping conventions all become your responsibility.
- **Angle:** Sets up a DI-registered connection factory where every call site creates and disposes its own connection and ADO.NET pooling does the actual reuse, then covers `QuerySingleOrDefaultAsync`, multi-mapping with `splitOn` for joined queries, and batched writes. Treats parameterization as the one non-negotiable rule - it's the difference between a parameterized query and a SQL injection vulnerability, not a style preference. Names the schema gap directly and pairs Dapper with DbUp or Fluent Migrator rather than pretending migrations are optional, and warns against building a generic repository that slowly reimplements a mini-ORM.
- **Tags:** `dotnet`, `orm`, `database`, `performance`, `security`

### Getting Started with NHibernate in .NET
- **Status:** `draft`
- **Scheduled:** 2027-03-09
- **Source:** `docs/article-ideas/getting-started-with-nhibernate.md`
- **File:** `src/posts/2027-03-09-getting-started-with-nhibernate.md`
- **Pitch:** NHibernate's maturity is real - caching, mapping flexibility, and loading control are all battle-tested after a decade in large enterprise systems - but there's genuine configuration depth to learn before any of it pays off, and skipping straight to "just make it work" produces a setup that fights you.
- **Angle:** Uses Fluent NHibernate rather than hand-written `.hbm.xml`, covers why entity members must be `virtual` (proxy generation for lazy loading - a non-virtual property compiles fine and silently breaks), and the two lifetimes that matter: `ISessionFactory` as an expensive singleton and `ISession` scoped per unit of work. Covers session-scoped change tracking, the LINQ provider vs. HQL as entry points, `SchemaExport` for local development against a real migration tool for production, and second-level caching as a deliberate per-entity decision rather than a global default. Doesn't pretend this is a greenfield recommendation - it's a guide for extending a codebase already built on it.
- **Tags:** `dotnet`, `orm`, `database`, `architecture`, `tooling`

### Getting Started with Linq2Db in .NET
- **Status:** `draft`
- **Scheduled:** 2027-03-16
- **Source:** `docs/article-ideas/getting-started-with-linq2db.md`
- **File:** `src/posts/2027-03-16-getting-started-with-linq2db.md`
- **Pitch:** Linq2Db gives you EF Core's most-loved feature - strongly-typed, composable LINQ queries - without the change tracking, identity map, or unit-of-work machinery that comes bundled whether you want it or not.
- **Angle:** Covers attribute-based entity mapping, a `DataConnection` subclass exposing `ITable<T>` properties, and DI registration where scoping is about connection lifetime rather than preserving tracked entity state. The core adjustment is updates: `Where(...).Set(...).UpdateAsync()` maps to a single `UPDATE` statement with no fetch first, and falling into an EF Core-style fetch-mutate-save habit is the most common first mistake. Same migration gap as Dapper and RepoDb, handled the same way with DbUp or Fluent Migrator, and honest that the real cost is a much smaller community, ecosystem, and hiring pool rather than any technical shortfall.
- **Tags:** `dotnet`, `orm`, `database`, `performance`, `tooling`

### Getting Started with RepoDb in .NET
- **Status:** `draft`
- **Scheduled:** 2027-03-23
- **Source:** `docs/article-ideas/getting-started-with-repodb.md`
- **File:** `src/posts/2027-03-23-getting-started-with-repodb.md`
- **Pitch:** RepoDb exists for one specific complaint: Dapper is fast but leaves you writing the same CRUD SQL over and over, while EF Core writes it for you at a real abstraction cost. It sits deliberately in between.
- **Angle:** Covers the core plus provider extension packages and the `SqlServerBootstrap.Initialize()` call that's easy to skip and produces confusing runtime errors that look unrelated to the actual missing step. Uses the same connection-factory pattern as Dapper, then contrasts generated CRUD (`InsertAsync`, expression-based `QueryAsync`) against `ExecuteQueryAsync` for anything complex, plus `InsertAllAsync`/`MergeAllAsync` bulk methods that beat row-by-row loops. Names the actual failure mode: treating RepoDb exactly like Dapper and hand-writing SQL for everything, which works fine but discards the only reason to pick it over Dapper in the first place.
- **Tags:** `dotnet`, `orm`, `database`, `performance`, `developer-productivity`

---

## 📅 Tuesday Track - .NET API Styles (March-May 2027)

Six posts on how a .NET service talks to the outside world, picking up the Tuesday cadence directly from the ORMs track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one API style.

### The Top 5 .NET API Styles Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2027-03-30
- **Source:** `docs/article-ideas/top-5-dotnet-api-styles-compared.md`
- **File:** `src/posts/2027-03-30-top-5-dotnet-api-styles-compared.md`
- **Pitch:** "REST API" has quietly stopped being the only answer to how a service talks to the outside world. Minimal APIs and Controllers are two flavors of the same idea, while gRPC, GraphQL, and SignalR each exist because REST is the wrong shape for a specific problem.
- **Angle:** Argues this isn't a ranking, it's a match between protocol and problem - fixed response shapes over HTTP, binary RPC between services you control, client-specified queries, or server-initiated push. Makes Minimal APIs the default for new projects (Microsoft's own recommendation) while keeping Controllers as a real answer for large APIs with a mature filter and binding ecosystem. Closes on the point that most production systems combine several of these rather than picking one, so the useful question is per-endpoint, not per-system.
- **Tags:** `dotnet`, `api-design`, `architecture`, `performance`, `developer-productivity`

### Getting Started with Minimal APIs in .NET
- **Status:** `draft`
- **Scheduled:** 2027-04-06
- **Source:** `docs/article-ideas/getting-started-with-minimal-apis.md`
- **File:** `src/posts/2027-04-06-getting-started-with-minimal-apis.md`
- **Pitch:** Minimal APIs make the first ten minutes genuinely trivial. The part that doesn't show up in a quickstart is what happens once forty of those route calls are sitting in Program.cs without a deliberate organizational strategy.
- **Angle:** Covers route groups and per-feature extension methods as the antidote to a sprawling Program.cs, OpenAPI documentation set up from day one rather than retrofitted, and validation wired through an endpoint filter instead of ad hoc per-handler checks. Argues against re-implementing Controllers' full ceremony on top of Minimal APIs - if that's what a project needs, Controllers is probably the better fit outright.
- **Tags:** `dotnet`, `api-design`, `developer-productivity`, `tooling`

### Getting Started with Controllers (MVC) in .NET
- **Status:** `draft`
- **Scheduled:** 2027-04-13
- **Source:** `docs/article-ideas/getting-started-with-controllers-mvc.md`
- **File:** `src/posts/2027-04-13-getting-started-with-controllers-mvc.md`
- **Pitch:** More than a decade of accumulated Controllers conventions are exactly why large APIs still reach for the pattern even with Minimal APIs now the recommended default. The tricky part is knowing which conventions still earn their keep.
- **Angle:** Covers the `--use-controllers` flag current templates now require, what `[ApiController]` actually does (automatic model validation, binding source inference, problem-details error responses - not just a marker attribute), FluentValidation auto-validation as an alternative to DataAnnotations, and filters as Controllers' clearest structural advantage over Minimal API endpoint filters. Draws a clean line between middleware and filters, since conflating the two is a common source of confusion.
- **Tags:** `dotnet`, `api-design`, `developer-productivity`, `tooling`

### Getting Started with GraphQL (Hot Chocolate) in .NET
- **Status:** `draft`
- **Scheduled:** 2027-04-20
- **Source:** `docs/article-ideas/getting-started-with-graphql-hotchocolate.md`
- **File:** `src/posts/2027-04-20-getting-started-with-graphql-hotchocolate.md`
- **Pitch:** GraphQL's promise - clients ask for exactly the fields they need, nested across related entities - is also exactly what makes a naive first implementation slow. The N+1 query problem is the trap, and DataLoaders are the fix.
- **Angle:** Covers Hot Chocolate's code-first schema with `[UseProjection]`/`[UseFiltering]`/`[UseSorting]` translating client queries directly into efficient EF Core queries, then builds a DataLoader step by step to show exactly what problem it solves - one batched query instead of one per related entity. Treats query depth and complexity limits as a day-one requirement, not a hardening pass, since GraphQL's flexibility is also an unbounded cost model until it's constrained.
- **Tags:** `dotnet`, `api-design`, `graphql`, `performance`, `architecture`

### Getting Started with SignalR in .NET
- **Status:** `draft`
- **Scheduled:** 2027-04-27
- **Source:** `docs/article-ideas/getting-started-with-signalr.md`
- **File:** `src/posts/2027-04-27-getting-started-with-signalr.md`
- **Pitch:** SignalR's basic setup is genuinely simple. The part that catches people off guard is everything that happens the moment a second server instance joins the deployment and a backplane isn't there yet.
- **Angle:** Builds a Hub with group management, then makes the more common real-world case - pushing updates from application services via `IHubContext<T>` rather than waiting on client-initiated Hub methods - the default pattern rather than an aside. Covers the Redis backplane as a one-line fix for a bug that otherwise has no error message, just clients silently missing updates depending on which instance they're connected to. Explicit throughout that SignalR complements a REST/GraphQL/gRPC API rather than replacing one.
- **Tags:** `dotnet`, `api-design`, `real-time`, `architecture`, `devops`

### Getting Started with gRPC in .NET
- **Status:** `draft`
- **Scheduled:** 2027-05-04
- **Source:** `docs/article-ideas/getting-started-with-grpc-dotnet.md`
- **File:** `src/posts/2027-05-04-getting-started-with-grpc-dotnet.md`
- **Pitch:** gRPC asks you to design the contract in a .proto file before writing any C# at all. That inversion is where its compile-time safety across services comes from, and it's also where most of the initial friction sits coming from REST's "just write a handler" habit.
- **Angle:** Covers the proto-first workflow, why Kestrel needs HTTP/2 (and TLS, even locally, since there's no clear-text protocol negotiation for a dual-protocol endpoint), unary calls versus server/client/bidirectional streaming, and sharing a single .proto file via a common project reference so contract drift becomes a build error instead of a runtime surprise. Scopes gRPC explicitly to internal service-to-service communication, not public or browser-facing APIs, since that's the one decision most first attempts get wrong.
- **Tags:** `dotnet`, `api-design`, `grpc`, `performance`, `microservices`

---

## 📅 Tuesday Track - .NET Validation Approaches (May-June 2027)

Six posts on how a .NET service validates incoming data, picking up the Tuesday cadence directly from the API Styles track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one validation approach.

### The Top 5 .NET Validation Approaches Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2027-05-11
- **Source:** `docs/article-ideas/top-5-dotnet-validation-approaches-compared.md`
- **File:** `src/posts/2027-05-11-top-5-dotnet-validation-approaches-compared.md`
- **Pitch:** .NET 10 shipped first-party validation for Minimal APIs using the same DataAnnotations attributes MVC has relied on for over a decade. That closes the exact gap that pushed teams toward FluentValidation or MiniValidation in the first place, and it changes the calculus for a large share of new projects.
- **Angle:** Compares the five on style, where each fits natively, performance, and how well each handles conditional and cross-property rules. Leads with a genuinely counterintuitive benchmark result - FluentValidation is the most popular option and routinely the slowest, sometimes by a factor of two - without pretending performance is the whole decision. Resolves on complexity rather than popularity: attributes for straightforward rules, FluentValidation only where conditional and cross-property logic actually earns its ceremony, and hand-written checks for business rules that need database lookups or span entities.
- **Tags:** `dotnet`, `validation`, `security`, `performance`, `developer-productivity`

### Getting Started with FluentValidation in .NET
- **Status:** `draft`
- **Scheduled:** 2027-05-18
- **Source:** `docs/article-ideas/getting-started-with-fluentvalidation.md`
- **File:** `src/posts/2027-05-18-getting-started-with-fluentvalidation.md`
- **Pitch:** FluentValidation's rules read like sentences and handle conditional logic naturally, but it's consistently one of the slowest validation options in independent benchmarks. Both facts should shape where in an application it actually gets used.
- **Angle:** Covers validator classes and DI registration via assembly scanning, MVC auto-validation versus the endpoint-filter pattern Minimal APIs need instead, and `.When()`/`RuleForEach` as the concrete mechanisms that justify its ceremony. Argues against reaching for it uniformly - reserve it for genuinely complex conditional or cross-property rules, and let DataAnnotations or native Minimal API validation cover the simpler models in the same codebase.
- **Tags:** `dotnet`, `validation`, `developer-productivity`, `tooling`

### Getting Started with DataAnnotations in .NET
- **Status:** `draft`
- **Scheduled:** 2027-05-25
- **Source:** `docs/article-ideas/getting-started-with-dataannotations.md`
- **File:** `src/posts/2027-05-25-getting-started-with-dataannotations.md`
- **Pitch:** DataAnnotations' biggest advantage is that they're already there - no package, no configuration, automatic validation in MVC since ASP.NET Core's earliest versions. The part worth understanding is exactly where that automatic convenience ends.
- **Angle:** Covers `[ApiController]`'s automatic model validation, `IValidatableObject` as the built-in answer to conditional and cross-property rules, `Validator.TryValidateObject` for validation outside MVC's pipeline, and custom `ValidationAttribute` classes for reusable rules. Draws the line where `IValidatableObject` starts getting unwieldy enough that FluentValidation would express the same logic more readably.
- **Tags:** `dotnet`, `validation`, `developer-productivity`, `tooling`

### Getting Started with Custom Validation in .NET
- **Status:** `draft`
- **Scheduled:** 2027-06-01
- **Source:** `docs/article-ideas/getting-started-with-custom-validation.md`
- **File:** `src/posts/2027-06-01-getting-started-with-custom-validation.md`
- **Pitch:** Every validation library in this series eventually admits some rules just don't fit its model - a check spanning three related entities in a database, or logic specific enough that a declarative abstraction would be more convoluted than the code itself.
- **Angle:** Distinguishes guard clauses (fail-fast, for internal invariants) from a result-collecting `ValidationResult` pattern (for user-facing input validation), then builds a validator class with injected dependencies for the one scenario no attribute-based library handles cleanly - rules requiring a database lookup or another service call. Names inconsistency, not capability, as custom validation's real risk without a library enforcing structure.
- **Tags:** `dotnet`, `validation`, `architecture`, `developer-productivity`

### Getting Started with Native Minimal API Validation in .NET 10
- **Status:** `draft`
- **Scheduled:** 2027-06-08
- **Source:** `docs/article-ideas/getting-started-with-native-minimal-api-validation.md`
- **File:** `src/posts/2027-06-08-getting-started-with-native-minimal-api-validation.md`
- **Pitch:** Minimal APIs went four major versions without a first-party answer to a question MVC solved on day one. .NET 10's `AddValidation()` closes that gap directly, using the same DataAnnotations attributes MVC has used for over a decade.
- **Angle:** Covers the two-line `AddValidation()` setup, automatic validation of nested objects and collections with no extra configuration, and `IValidatableObject` continuing to work for conditional rules through the same automatic pass. Clear that this is a delivery mechanism, not new expressiveness - it doesn't extend what DataAnnotations and `IValidatableObject` already cover, so FluentValidation remains the answer once a rule outgrows that ceiling.
- **Tags:** `dotnet`, `validation`, `developer-productivity`, `tooling`

### Getting Started with MiniValidation in .NET
- **Status:** `draft`
- **Scheduled:** 2027-06-15
- **Source:** `docs/article-ideas/getting-started-with-minivalidation.md`
- **File:** `src/posts/2027-06-15-getting-started-with-minivalidation.md`
- **Pitch:** MiniValidation's pitch is one sentence: the same DataAnnotations attributes you already know, running through a validator optimized specifically to be fast, with none of FluentValidation's ceremony.
- **Angle:** Covers the single-line `MiniValidator.TryValidate` call, the endpoint-filter pattern for consistency across multiple routes, and `TryValidateAsync` with a service provider for `IValidatableObject` rules needing DI. Positions it honestly against .NET 10's native validation - its clearest remaining niche is pre-.NET 10 projects and non-Minimal-API application types like console apps, not a reason to add a dependency where native validation already covers the need.
- **Tags:** `dotnet`, `validation`, `performance`, `developer-productivity`

---

## 📅 Tuesday Track - .NET Mapping Libraries (June-July 2027)

Six posts on how a .NET service converts one type into another, picking up the Tuesday cadence directly from the Validation Approaches track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one mapping approach.

### The Top 5 .NET Mapping Libraries Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2027-06-22
- **Source:** `docs/article-ideas/top-5-dotnet-mapping-libraries-compared.md`
- **File:** `src/posts/2027-06-22-top-5-dotnet-mapping-libraries-compared.md`
- **Pitch:** Object mapping in .NET used to start and end with AutoMapper. Its April 2025 move to commercial licensing did for mapping what Moq's SponsorLink incident did for mocking - it got a lot of teams comparing alternatives for the first time in years instead of defaulting out of habit.
- **Angle:** Compares the five on mechanism (runtime reflection versus compile-time source generation), performance, license, debuggability, and EF Core `ProjectTo` support. The through-line is that this space has moved to source generators: Mapperly matches hand-written mapping's performance while turning member typos into build errors, and Facet goes further by generating the destination DTO from the domain model rather than just the mapping between them. Treats manual mapping as a legitimate answer rather than a fallback, and is honest that Mapster's slowing development pace is a real risk for new projects.
- **Tags:** `dotnet`, `tooling`, `performance`, `architecture`, `developer-productivity`

### Getting Started with AutoMapper in .NET
- **Status:** `draft`
- **Scheduled:** 2027-06-29
- **Source:** `docs/article-ideas/getting-started-with-automapper.md`
- **File:** `src/posts/2027-06-29-getting-started-with-automapper.md`
- **Pitch:** AutoMapper's convention-based mapping is still exactly as convenient as it was before April 2025. What's changed is that adding it to a new project is no longer a purely technical decision - it's also a licensing one.
- **Angle:** Covers `Profile`-based configuration, assembly-scan registration, `ProjectTo` for EF Core query projection - still one of AutoMapper's most distinctive and mature capabilities - and `AssertConfigurationIsValid()` as the fix for configuration errors that would otherwise surface as runtime surprises. Frames resolving the licensing question as a business decision to settle explicitly before building architecture around it, not an afterthought.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`, `architecture`

### Getting Started with Mapster in .NET
- **Status:** `draft`
- **Scheduled:** 2027-07-06
- **Source:** `docs/article-ideas/getting-started-with-mapster.md`
- **File:** `src/posts/2027-07-06-getting-started-with-mapster.md`
- **Pitch:** Mapster's `Adapt()` is the fastest on-ramp of any mapper in this series - zero configuration, works immediately. That immediacy is real, but worth pairing with an honest look at the project's genuinely slowed development pace.
- **Angle:** Covers zero-config `Adapt<T>()`, `TypeAdapterConfig` for exceptions to convention, the optional compile-time generation mode via `Mapster.Tool` that closes much of the performance gap with Mapperly, and the `IMapper`/`ServiceMapper` DI pattern for testability. Doesn't shy away from the maintenance-trajectory question, naming it as a real factor to weigh for a new, long-lived project rather than glossing over it.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`, `performance`

### Getting Started with Mapperly in .NET
- **Status:** `draft`
- **Scheduled:** 2027-07-13
- **Source:** `docs/article-ideas/getting-started-with-mapperly.md`
- **File:** `src/posts/2027-07-13-getting-started-with-mapperly.md`
- **Pitch:** Mapperly asks you to declare a partial method with the shape you want, then writes the actual mapping body for you at compile time - no runtime configuration, no reflection, just real generated C# sitting next to your own code.
- **Angle:** Covers the partial-method pattern as the entire configuration surface, `[MapProperty]` for renamed and flattened properties, `EnumMappingStrategy.ByName` as the fix for a common silent-bug risk when enum numeric values don't align, and reading generated code directly when debugging. Explicit that this is the "starting fresh today" recommendation on technical merits, but not a good fit for a profile-by-profile migration off an existing AutoMapper codebase.
- **Tags:** `dotnet`, `tooling`, `performance`, `developer-productivity`

### Getting Started with Facet in .NET
- **Status:** `draft`
- **Scheduled:** 2027-07-20
- **Source:** `docs/article-ideas/getting-started-with-facet.md`
- **File:** `src/posts/2027-07-20-getting-started-with-facet.md`
- **Pitch:** Every other mapper in this series assumes you've already hand-written the destination DTO. Facet asks why - given a domain model and a declarative attribute, it generates both the DTO type and the mapping code from a single source generator pass.
- **Angle:** Covers the `[Facet(typeof(Source), exclude: [...])]` declaration, generating multiple focused views of the same entity (summary, detail, contact) from one domain model instead of three hand-maintained DTO classes, and extending generated facets with `partial` for computed properties. Scopes Facet honestly to its narrower niche - the "multiple views of one entity" pattern - rather than pitching it as a general-purpose mapper replacement, and flags it as newer and less established than the other four.
- **Tags:** `dotnet`, `tooling`, `architecture`, `developer-productivity`

### Getting Started with Manual Mapping in .NET
- **Status:** `draft`
- **Scheduled:** 2027-07-27
- **Source:** `docs/article-ideas/getting-started-with-manual-mapping.md`
- **File:** `src/posts/2027-07-27-getting-started-with-manual-mapping.md`
- **Pitch:** It's easy to dismiss manual mapping as "what you do before you get a real library," but for a genuinely large share of applications it's the fastest, most transparent, and most maintainable option in this entire comparison - not a placeholder for something better.
- **Angle:** Covers extension methods, static factory methods, and constructor-based mapping as the three common patterns, collection-mapping helper overloads to avoid repeating `.Select()` projections, and the compiler's structural-change detection as manual mapping's built-in safety net. Names inconsistency - not performance or correctness - as its real risk, and gives an honest signal for when the volume of repetitive mapping code makes a library like Mapperly worth reconsidering.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`, `architecture`

---

## 📅 Tuesday Track - .NET Caching Solutions (August-September 2027)

Six posts on how a .NET service caches data, picking up the Tuesday cadence directly from the Mapping Libraries track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one caching option.

### The Top 5 Caching Solutions for .NET Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2027-08-03
- **Source:** `docs/article-ideas/top-5-dotnet-caching-solutions-compared.md`
- **File:** `src/posts/2027-08-03-top-5-dotnet-caching-solutions-compared.md`
- **Pitch:** Caching decisions collapse into "just use Redis" one step too early. The first fork is whether you need a distributed cache at all, since `IMemoryCache` solves a real and common subset of the problem with zero infrastructure and nanosecond-scale reads.
- **Angle:** Compares the five on scope, latency, data structures, persistence, and how .NET-native each one actually is. The core argument is that in-process and distributed caching are different problems with different right answers, and only once you're running multiple instances do the four distributed options genuinely compete with each other. Redis stays the honest default for the same reason EF Core is the default ORM, while Garnet (Microsoft Research, written in C#, RESP-compatible) and NCache are framed as options worth evaluating rather than defaulting past.
- **Tags:** `dotnet`, `caching`, `performance`, `architecture`, `devops`

### Getting Started with IMemoryCache in .NET
- **Status:** `draft`
- **Scheduled:** 2027-08-10
- **Source:** `docs/article-ideas/getting-started-with-imemorycache.md`
- **File:** `src/posts/2027-08-10-getting-started-with-imemorycache.md`
- **Pitch:** `IMemoryCache` is the easiest caching decision in .NET to get right and, paradoxically, one of the easiest to misuse - not because the API is complicated, but because it's so simple to add that people reach for it in places a distributed cache actually belongs.
- **Angle:** Covers size limits and per-entry `Size`, the `GetOrCreateAsync` pattern that avoids manual check-then-set bugs, and explicit invalidation on write. Makes the case for .NET 9's `HybridCache` as the better default over raw `IMemoryCache` even for single-server apps, given its cache-stampede protection and clean upgrade path to a distributed L2 tier with zero call-site changes.
- **Tags:** `dotnet`, `caching`, `performance`, `developer-productivity`

### Getting Started with Redis in .NET
- **Status:** `draft`
- **Scheduled:** 2027-08-17
- **Source:** `docs/article-ideas/getting-started-with-redis-dotnet.md`
- **File:** `src/posts/2027-08-17-getting-started-with-redis-dotnet.md`
- **Pitch:** Most of the friction people hit adopting Redis in .NET isn't Redis's fault - it's the boilerplate that used to be necessary around `IDistributedCache`: manual serialization, hand-written cache-aside logic, no stampede protection. `HybridCache` closes that gap directly.
- **Angle:** Covers the recommended `HybridCache`-with-Redis-as-L2 path against the classic manual `IDistributedCache` approach, sharing one `IConnectionMultiplexer` as a singleton across the whole application, and tag-based invalidation for clearing related entries at once. Flags Redis's shifting licensing terms and Valkey as the BSD-licensed fork worth knowing about rather than treating the decision as settled.
- **Tags:** `dotnet`, `caching`, `performance`, `architecture`, `devops`

### Getting Started with Garnet in .NET
- **Status:** `draft`
- **Scheduled:** 2027-08-24
- **Source:** `docs/article-ideas/getting-started-with-garnet.md`
- **File:** `src/posts/2027-08-24-getting-started-with-garnet.md`
- **Pitch:** Garnet's pitch is unusually direct: same RESP protocol as Redis, so existing client code mostly just works, but built in C# by Microsoft Research with a modern, epoch-based GC design aimed at strong multi-core performance.
- **Angle:** Covers connecting with the exact same `StackExchange.Redis`/`HybridCache` setup used for Redis itself, and treats "RESP-compatible" as "very likely to work" rather than "guaranteed identical" - testing an application's actual command usage (sorted sets, pub/sub, specific modules) against a real Garnet instance before trusting it as a drop-in replacement. Honest that low switching cost is a reason to actually evaluate it thoroughly, not a reason to skip evaluation.
- **Tags:** `dotnet`, `caching`, `performance`, `tooling`

### Getting Started with Memcached in .NET
- **Status:** `draft`
- **Scheduled:** 2027-08-31
- **Source:** `docs/article-ideas/getting-started-with-memcached.md`
- **File:** `src/posts/2027-08-31-getting-started-with-memcached.md`
- **Pitch:** Memcached's setup story is the shortest in the whole series, and that's not an accident - no data structure configuration, no persistence tuning, no replication topology to choose between. A fast, multi-threaded key-value store and nothing else.
- **Angle:** Covers the community-standard `EnyimMemcachedCore` client, client-side consistent hashing across multiple nodes (a meaningfully different model from Redis Cluster's server-side approach), and the hard key/value size limits Memcached enforces by default. Scopes it honestly to genuinely simple key-value workloads at high throughput - session stores, page fragments - and flags total lack of persistence as disqualifying the moment that matters.
- **Tags:** `dotnet`, `caching`, `performance`, `tooling`

### Getting Started with NCache in .NET
- **Status:** `draft`
- **Scheduled:** 2027-09-07
- **Source:** `docs/article-ideas/getting-started-with-ncache.md`
- **File:** `src/posts/2027-09-07-getting-started-with-ncache.md`
- **Pitch:** NCache's whole pitch is being the distributed cache built for .NET rather than adapted to it, and that shows up most clearly in the setup itself - ASP.NET Core session state and EF Core query caching are first-class, purpose-built integrations rather than something assembled on top of a generic `IDistributedCache`.
- **Angle:** Covers provisioning named caches ahead of time (a real difference from Redis's implicit connect-and-go model), native .NET object caching with no manual serialization step, and the purpose-built ASP.NET Core session and EF Core `FromCache()` integrations that are NCache's clearest differentiators. Flags which capabilities (advanced replication, write-behind caching) require Enterprise licensing before a design assumes them.
- **Tags:** `dotnet`, `caching`, `architecture`, `developer-productivity`

---

## 📅 Tuesday Track - .NET Message Brokers (September-October 2027)

Six posts on how a .NET service moves messages between other services, picking up the Tuesday cadence directly from the Caching Solutions track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one broker.

### The Top 5 Message Brokers for .NET Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2027-09-14
- **Source:** `docs/article-ideas/top-5-dotnet-message-brokers-compared.md`
- **File:** `src/posts/2027-09-14-top-5-dotnet-message-brokers-compared.md`
- **Pitch:** Broker comparisons get framed as "which one is fastest" when the actual differentiator is shape - routing discrete messages between services, streaming an ordered replayable log, or just decoupling two parts of a system without standing up new infrastructure.
- **Angle:** Compares the five on model, message replay, hosting, and .NET client experience, then argues that picking on throughput benchmarks alone reliably produces the wrong answer. Makes a practical point most comparisons skip entirely: .NET teams rarely talk to these brokers directly, so the abstraction sitting in between - MassTransit, NServiceBus, or Rebus - often matters as much as the broker choice itself. The managed options (Service Bus, SQS) are evaluated on cloud coupling rather than feature count.
- **Tags:** `dotnet`, `messaging`, `architecture`, `microservices`, `devops`

### Getting Started with RabbitMQ in .NET
- **Status:** `draft`
- **Scheduled:** 2027-09-21
- **Source:** `docs/article-ideas/getting-started-with-rabbitmq.md`
- **File:** `src/posts/2027-09-21-getting-started-with-rabbitmq.md`
- **Pitch:** Working directly against RabbitMQ's raw AMQP client in .NET means hand-managing connections, channels, serialization, retry, and error queues yourself - all boilerplate the overwhelming majority of real .NET RabbitMQ integrations avoid by going through MassTransit instead.
- **Angle:** Covers MassTransit's `IConsumer<T>` and `ConfigureEndpoints` auto-topology as the default rather than a nice-to-have, `Publish` vs. `Send` as a coupling decision rather than an API preference, and tuning `PrefetchCount`/`ConcurrentMessageLimit` per consumer workload. Frames MassTransit as the practical argument for RabbitMQ over a raw-client comparison, since it's also what makes switching brokers later a configuration change.
- **Tags:** `dotnet`, `messaging`, `architecture`, `developer-productivity`

### Getting Started with Kafka in .NET
- **Status:** `draft`
- **Scheduled:** 2027-09-28
- **Source:** `docs/article-ideas/getting-started-with-kafka.md`
- **File:** `src/posts/2027-09-28-getting-started-with-kafka.md`
- **Pitch:** Kafka's .NET story is deliberately more hands-on than RabbitMQ's - Confluent.Kafka is a thinner wrapper around partitions, consumer groups, and offsets than MassTransit gives you over RabbitMQ, because Kafka is a fundamentally different thing than a traditional broker.
- **Angle:** Covers `Acks.All` plus `EnableIdempotence` as the default worth defaulting to, partition-key selection as the actual lever for ordering and parallelism, and manual offset commits after successful processing rather than risky auto-commit. Treats Kafka's log-based retention (independent of consumption) as the core conceptual shift from every queue-based broker in the series, and is explicit about when Kafka is overkill for a workload that's really just a queue.
- **Tags:** `dotnet`, `messaging`, `architecture`, `performance`, `microservices`

### Getting Started with Azure Service Bus in .NET
- **Status:** `draft`
- **Scheduled:** 2027-10-05
- **Source:** `docs/article-ideas/getting-started-with-azure-service-bus.md`
- **File:** `src/posts/2027-10-05-getting-started-with-azure-service-bus.md`
- **Pitch:** Azure Service Bus's reputation as the best .NET developer experience among message brokers isn't marketing - the `Azure.Messaging.ServiceBus` SDK feels designed by people who write ASP.NET Core applications, not adapted from a cross-language client.
- **Angle:** Covers queues (point-to-point) versus topics/subscriptions (pub/sub) as a deliberate architectural choice, `MessageId`-based duplicate detection as low-effort idempotency protection, and explicit message completion instead of relying on `AutoCompleteMessages`. Draws the abandon-vs-dead-letter distinction clearly, and flags real Azure lock-in and usage-based cost scaling as the honest trade-offs against the smoothest SDK in the comparison.
- **Tags:** `dotnet`, `messaging`, `cloud`, `architecture`, `devops`

### Getting Started with Amazon SQS in .NET
- **Status:** `draft`
- **Scheduled:** 2027-10-12
- **Source:** `docs/article-ideas/getting-started-with-amazon-sqs.md`
- **File:** `src/posts/2027-10-12-getting-started-with-amazon-sqs.md`
- **Pitch:** SQS's simplicity is genuinely refreshing after RabbitMQ's exchange model or Kafka's partition mechanics - a queue, messages go in, messages come out, AWS handles the rest - but it still asks for a few binary decisions made explicitly rather than by default.
- **Angle:** Covers standard versus FIFO queues, long polling as the default with essentially no downside, and deletion (not "acknowledgment") as SQS's genuinely different completion model governed by visibility timeout. Positions FIFO's `MessageGroupId` as the SQS analog to a Kafka partition key, and is direct that pairing with SNS is what fills the pub/sub gap SQS alone doesn't cover.
- **Tags:** `dotnet`, `messaging`, `cloud`, `architecture`, `devops`

### Getting Started with NATS in .NET
- **Status:** `draft`
- **Scheduled:** 2027-10-19
- **Source:** `docs/article-ideas/getting-started-with-nats.md`
- **File:** `src/posts/2027-10-19-getting-started-with-nats.md`
- **Pitch:** NATS's core pitch is that most messaging doesn't need to be as heavy as it usually is - subject-based pub/sub, a tiny operational footprint, and genuinely low latency, without RabbitMQ's exchange configuration or Kafka's partition mechanics.
- **Angle:** Covers core NATS's fire-and-forget model (and the real, deliberate trade-off that a message is simply gone if nobody's subscribed) against JetStream's durability and explicit acknowledgment once persistence actually matters. Treats subject hierarchies and wildcards as NATS's answer to RabbitMQ's topic routing, and is upfront that the smaller .NET ecosystem is a real factor to weigh, not just a footnote.
- **Tags:** `dotnet`, `messaging`, `architecture`, `performance`, `microservices`

---

## 📅 Tuesday Track - .NET Background Job Libraries (October-November 2027)

Six posts on how a .NET service runs work outside the request/response cycle, picking up the Tuesday cadence directly from the Message Brokers track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one background job tool.

### The Top 5 Background Job Libraries for .NET Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2027-10-26
- **Source:** `docs/article-ideas/top-5-dotnet-background-job-libraries-compared.md`
- **File:** `src/posts/2027-10-26-top-5-dotnet-background-job-libraries-compared.md`
- **Pitch:** A `BackgroundService` with a `PeriodicTimer` is genuinely enough for one job. It stops scaling around the third - no persistence, no retry policy, no job history, no cron expressions, no coordination across instances, and an unhandled exception silently kills the loop for the rest of the process's lifetime.
- **Angle:** Compares the five on persistence, dashboard, clustering, and setup effort, starting from what .NET already gives you for free so the comparison begins at the point a library is actually justified. These aren't all solving the same problem - two are schedulers, Wolverine is a messaging framework that happens to include scheduling, and Azure Functions is a managed runtime rather than a library - so matching the tool to the system matters more than ranking them. Hangfire is the default for most teams; Quartz.NET earns its extra configuration only when the scheduling rules are genuinely complex.
- **Tags:** `dotnet`, `tooling`, `architecture`, `devops`, `developer-productivity`

### Getting Started with Hangfire in .NET
- **Status:** `draft`
- **Scheduled:** 2027-11-02
- **Source:** `docs/article-ideas/getting-started-with-hangfire.md`
- **File:** `src/posts/2027-11-02-getting-started-with-hangfire.md`
- **Pitch:** Hangfire's install-to-first-job time is genuinely a few minutes, and that speed is exactly why it's easy to skip the two decisions that determine whether it stays cheap to run: which storage backend, and how much you rely on the polling interval defaults.
- **Angle:** Covers `AddHangfireServer()` as the easy-to-forget half of setup (jobs enqueue but never run without it), securing the dashboard before any non-local deployment, and `RecurringJob.AddOrUpdate` with a stable ID as the idempotent registration pattern that survives redeploys. Flags that storage load scales with polling frequency, not job volume - a real cost consideration for a small number of infrequent jobs.
- **Tags:** `dotnet`, `tooling`, `architecture`, `developer-productivity`

### Getting Started with Quartz.NET in .NET
- **Status:** `draft`
- **Scheduled:** 2027-11-09
- **Source:** `docs/article-ideas/getting-started-with-quartznet.md`
- **File:** `src/posts/2027-11-09-getting-started-with-quartznet.md`
- **Pitch:** Quartz.NET's reputation for complexity is earned, but it's complexity in service of a specific thing: scheduling rules that are genuinely hard to express correctly, like a job that must run at 9am in the customer's local time zone, skip holidays, and never overlap.
- **Angle:** Covers the job/trigger/scheduler separation as the core vocabulary that makes everything else click, `UseClustering()` for coordinating execution across instances without duplicate runs, and calendar exclusions for rules Hangfire's simpler model can't express. Direct that its configuration overhead is only worth paying when the scheduling need is genuinely hard, not for "run this every night."
- **Tags:** `dotnet`, `tooling`, `architecture`, `developer-productivity`

### Getting Started with Coravel in .NET
- **Status:** `draft`
- **Scheduled:** 2027-11-16
- **Source:** `docs/article-ideas/getting-started-with-coravel.md`
- **File:** `src/posts/2027-11-16-getting-started-with-coravel.md`
- **Pitch:** Coravel's whole value proposition is that it doesn't ask you for anything - no database, no storage configuration, no dashboard to secure. Add a package, write a fluent scheduling expression, and you're done.
- **Angle:** Covers the fluent `.Schedule().DailyAtHour()` API, `PreventOverlapping` as cheap insurance for any job whose duration is uncertain relative to its interval, and the explicit trade-off of zero persistence and zero multi-instance coordination. Frames Coravel as a deliberately different tool from Hangfire rather than a smaller version of it, with clear signals for when to graduate away from it.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`

### Getting Started with Wolverine in .NET
- **Status:** `draft`
- **Scheduled:** 2027-11-23
- **Source:** `docs/article-ideas/getting-started-with-wolverine.md`
- **File:** `src/posts/2027-11-23-getting-started-with-wolverine.md`
- **Pitch:** Wolverine is the one entry in this series where "getting started with background jobs" and "getting started with the whole library" are almost the same document - scheduling is one feature of a much broader messaging framework, not the framework's reason for existing.
- **Angle:** Covers convention-based handlers with no interfaces required (source-generated dispatch instead of MediatR-style reflection), the durable outbox that atomically coordinates database writes with message publishing, and `Schedule.CronJob` versus `bus.ScheduleAsync` as the recurring-versus-one-time scheduling split. Upfront that adopting Wolverine purely for scheduling means taking on a full messaging framework's scope for one feature - the wrong trade unless the rest of its capabilities are also wanted.
- **Tags:** `dotnet`, `messaging`, `architecture`, `performance`

### Getting Started with Azure Functions Timer Triggers in .NET
- **Status:** `draft`
- **Scheduled:** 2027-11-30
- **Source:** `docs/article-ideas/getting-started-with-azure-functions-timer-triggers.md`
- **File:** `src/posts/2027-11-30-getting-started-with-azure-functions-timer-triggers.md`
- **Pitch:** Azure Functions timer triggers solve a problem the other four tools in this series structurally can't: what happens when your job needs to run even if your main application isn't. An in-process scheduler is only as reliable as the app hosting it.
- **Angle:** Covers scaffolding on the isolated worker model (the only path worth building on, since in-process support ends November 2026), Azure's 6-field NCronTab format that trips people up expecting standard 5-field cron, and designing for idempotency since serverless retries mean more-than-once execution is a real possibility, not an edge case. Honest that real Azure lock-in is the trade for structural independence from any single app's uptime.
- **Tags:** `dotnet`, `cloud`, `architecture`, `devops`

---

## 📅 Tuesday Track - .NET Mocking Libraries (December 2027-January 2028)

Six posts on how a .NET test isolates a system under test from its dependencies, picking up the Tuesday cadence directly from the Background Job Libraries track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one mocking library.

### The Top 5 .NET Mocking Libraries Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2027-12-07
- **Source:** `docs/article-ideas/top-5-dotnet-mocking-libraries-compared.md`
- **File:** `src/posts/2027-12-07-top-5-dotnet-mocking-libraries-compared.md`
- **Pitch:** Mocking in .NET used to be a two-horse syntax preference between Moq and NSubstitute. Moq 4.20's SponsorLink - which hashed a developer's Git email and sent it to a server without clear consent - was reverted within days, but the trust damage genuinely reshaped adoption, and an honest comparison can't skip it.
- **Angle:** Compares the five on mechanism, syntax style, what they can actually mock, license, and community trajectory. The technical through-line is the same one running through the mapping and testing series - runtime proxy generation versus compile-time source generation - with Rocks representing the AOT-compatible, compile-time-checked direction. Doesn't declare Moq unusable; it gives the full picture, including that JustMock is the only option here that can mock statics, sealed types, and non-virtual members, which makes it the specific answer for legacy code.
- **Tags:** `dotnet`, `testing`, `tooling`, `developer-productivity`

### Getting Started with Moq in .NET
- **Status:** `draft`
- **Scheduled:** 2027-12-14
- **Source:** `docs/article-ideas/getting-started-with-moq.md`
- **File:** `src/posts/2027-12-14-getting-started-with-moq.md`
- **Pitch:** Moq's `Setup`/`Returns`/`Verify` workflow is likely the mocking syntax the largest share of .NET developers already know. The one thing worth addressing directly: the 2023 SponsorLink incident, fully removed since 4.20.2, and what pinning to a current version actually means in 2026.
- **Angle:** Covers the `Mock<T>`/`.Object` two-part model as the most common early confusion coming from NSubstitute, `It.IsAny<T>()`/`It.Is<T>()` argument matching, and `SetupSequence` for multi-call scenarios. Settles the version question directly - no need to pin pre-4.20 - and covers `MockBehavior.Strict` for teams that specifically want unconfigured calls to fail loudly.
- **Tags:** `dotnet`, `testing`, `tooling`, `developer-productivity`

### Getting Started with NSubstitute in .NET
- **Status:** `draft`
- **Scheduled:** 2027-12-21
- **Source:** `docs/article-ideas/getting-started-with-nsubstitute.md`
- **File:** `src/posts/2027-12-21-getting-started-with-nsubstitute.md`
- **Pitch:** NSubstitute's defining decision is that there's no wrapper object - the substitute itself is both the fake and the configuration target, with no `.Setup()` call and no `.Object` to unwrap.
- **Angle:** Covers the direct-call configuration pattern as the core mental shift from Moq, `Received()`/`DidNotReceive()` as the plain-English verification vocabulary, and the `callInfo` lambda for argument-dependent responses. Direct that NSubstitute doesn't support strict mocking by design - unconfigured calls succeed silently - and frames that as a deliberate trade-off to understand, not a gap to work around.
- **Tags:** `dotnet`, `testing`, `tooling`, `developer-productivity`

### Getting Started with FakeItEasy in .NET
- **Status:** `draft`
- **Scheduled:** 2027-12-28
- **Source:** `docs/article-ideas/getting-started-with-fakeiteasy.md`
- **File:** `src/posts/2027-12-28-getting-started-with-fakeiteasy.md`
- **Pitch:** FakeItEasy's entire design fits behind one idea: whatever you're doing with a fake, stubbing or verifying, it goes through the same entry point, `A.CallTo(...)`, with no separate mental model for arranging versus asserting.
- **Angle:** Covers `A.Fake<T>()` and the single `A.CallTo(...)` API for both stubbing and verification, `A<T>.Ignored`/`A<T>.That.Matches(...)` argument matching, and the precise `MustHaveHappened...` variants for exact interaction counts. Frames the one-API consistency as FakeItEasy's core value proposition and the reason to use it deliberately rather than mixing in habits from Moq or NSubstitute.
- **Tags:** `dotnet`, `testing`, `tooling`, `developer-productivity`

### Getting Started with JustMock in .NET
- **Status:** `draft`
- **Scheduled:** 2028-01-04
- **Source:** `docs/article-ideas/getting-started-with-justmock.md`
- **File:** `src/posts/2028-01-04-getting-started-with-justmock.md`
- **Pitch:** JustMock answers a question the other four libraries in this series can't: what do you do when the code under test has a static dependency, a sealed class, or a non-virtual method, and refactoring it isn't realistic right now.
- **Angle:** Covers the free JustMock Lite tier (`Mock.Create`/`Mock.Arrange`/`Mock.Assert`, comparable in scope to Moq) against the commercial elevated mode's Profiler API that mocks statics, sealed classes, and non-virtual members. Direct that elevated mode requires explicit CI/IDE enabling and a paid license, and that it's the pragmatic answer for legacy code specifically, not a default for new interface-driven projects.
- **Tags:** `dotnet`, `testing`, `tooling`, `developer-productivity`

### Getting Started with Rocks in .NET
- **Status:** `draft`
- **Scheduled:** 2028-01-11
- **Source:** `docs/article-ideas/getting-started-with-rocks.md`
- **File:** `src/posts/2028-01-11-getting-started-with-rocks.md`
- **Pitch:** Rocks asks you to accept one trade upfront: a smaller community and a genuinely different syntax, in exchange for mocks that are ordinary, compiler-checked C# code instead of runtime-generated proxies.
- **Angle:** Covers the `Rock.Create` → `.Methods()` → `.Instance()` → `.Verify()` flow as a direct consequence of source-generated architecture rather than arbitrary verbosity, and Native AOT/trimmed-deployment compatibility as the concrete reason to accept that trade-off. Honest that its smaller community shifts more troubleshooting burden onto the adopting team, and that it still can't mock statics or sealed classes the way JustMock's elevated mode can.
- **Tags:** `dotnet`, `testing`, `tooling`, `performance`

---

## 📅 Tuesday Track - .NET Architecture Quality Tools (January-February 2028)

Six posts on how a .NET team keeps architecture decisions from silently drifting, picking up the Tuesday cadence directly from the Mocking Libraries track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one enforcement tool.

### The Top 5 .NET Architecture & Quality Enforcement Tools Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2028-01-18
- **Source:** `docs/article-ideas/top-5-dotnet-architecture-quality-tools-compared.md`
- **File:** `src/posts/2028-01-18-top-5-dotnet-architecture-quality-tools-compared.md`
- **Pitch:** A team agrees the domain layer shouldn't reference infrastructure, everyone nods, and eighteen months later a deadline-pressured change adds exactly that reference. Code review might catch it. These tools make it a build failure instead of a hope.
- **Angle:** Splits the five into two categories that routinely get conflated - architecture-testing libraries where rules are ordinary unit tests (NetArchTest, ArchUnitNET) versus broad static analysis platforms where architectural rules are one capability among many (SonarQube, NDepend, Roslyn Analyzers). Reframes the question from "which is best" to "which layer of enforcement am I adding," since feedback speed differs by orders of magnitude between compiler-integrated analysis, a test run, and a CI batch job. Pairs directly with the Clean Architecture post's claim that a dependency rule isn't real until something enforces it.
- **Tags:** `dotnet`, `architecture`, `code-quality`, `testing`, `ci-cd`

### Getting Started with SonarQube in .NET
- **Status:** `draft`
- **Scheduled:** 2028-01-25
- **Source:** `docs/article-ideas/getting-started-with-sonarqube.md`
- **File:** `src/posts/2028-01-25-getting-started-with-sonarqube.md`
- **Pitch:** SonarQube's setup story is different from every other tool in this series in one important way: it's not a NuGet package you add and forget, it's a platform your CI pipeline talks to on every analysis run - which is exactly why it can do things a test-scoped library can't.
- **Angle:** Covers the scanner's `begin`/`end` MSBuild wrapping, wiring up real coverage reports (a misconfigured 0% is worse than no metric at all), and configuring a quality gate focused on new-code conditions rather than demanding an existing codebase retroactively meet a high bar. Flags full Git history (`fetch-depth: 0`) as the easy-to-miss CI setting that silently degrades new-code analysis, and positions SonarQube as complementary to Roslyn Analyzers, not competing with them.
- **Tags:** `dotnet`, `architecture`, `code-quality`, `ci-cd`

### Getting Started with NetArchTest in .NET
- **Status:** `draft`
- **Scheduled:** 2028-02-01
- **Source:** `docs/article-ideas/getting-started-with-netarchtest.md`
- **File:** `src/posts/2028-02-01-getting-started-with-netarchtest.md`
- **Pitch:** NetArchTest's entire value proposition is that architecture rules stop being something written in a design doc nobody rereads and start being something your build actually checks - and the setup is genuinely small enough to do on day one.
- **Angle:** Covers the fluent `Types.InAssembly(...).Should()...` API for dependency-direction and naming rules, a dedicated architecture-test project referencing every layer under test, and including `FailingTypeNames` in every assertion so a failure is immediately actionable. Direct that rules should reflect real, agreed-upon decisions rather than speculative ones, and that a rule nobody can satisfy anymore deserves a conversation, not a silent deletion.
- **Tags:** `dotnet`, `architecture`, `testing`, `developer-productivity`

### Getting Started with ArchUnitNET in .NET
- **Status:** `draft`
- **Scheduled:** 2028-02-08
- **Source:** `docs/article-ideas/getting-started-with-archunitnet.md`
- **File:** `src/posts/2028-02-08-getting-started-with-archunitnet.md`
- **Pitch:** ArchUnitNET's fluent API reads a lot like NetArchTest's - the real differences show up once you're modeling something more elaborate than "layer A shouldn't depend on layer B."
- **Angle:** Covers `ArchLoader` for building the architecture model once per test class, named layers as a genuine readability and reuse win over repeated namespace strings, and slice rules for detecting cyclic dependencies between modules - a capability NetArchTest doesn't have natively. Frames the choice against NetArchTest as mostly stylistic for simple layered systems, and a real advantage specifically for Modular Monolith-style module-boundary checks.
- **Tags:** `dotnet`, `architecture`, `testing`, `developer-productivity`

### Getting Started with NDepend in .NET
- **Status:** `draft`
- **Scheduled:** 2028-02-15
- **Source:** `docs/article-ideas/getting-started-with-ndepend.md`
- **File:** `src/posts/2028-02-15-getting-started-with-ndepend.md`
- **Pitch:** NDepend's reputation as the "Swiss Army knife" for .NET code quality comes down to CQLinq - a LINQ-based query language for interrogating your codebase's structure directly, so anything expressible in LINQ is a question you can ask about your code.
- **Angle:** Covers writing CQLinq rules for both complexity metrics and dependency-direction checks, dependency graph and matrix visualization for spotting structural problems reading code doesn't surface, and quality gates driven by NDepend's own metrics for CI integration. Honest about the per-seat commercial licensing as the real differentiator from every other tool in this series, and that its value scales with codebase size and organizational complexity rather than being a default upgrade.
- **Tags:** `dotnet`, `architecture`, `code-quality`, `tooling`

### Getting Started with Roslyn Analyzers in .NET
- **Status:** `draft`
- **Scheduled:** 2028-02-22
- **Source:** `docs/article-ideas/getting-started-with-roslyn-analyzers.md`
- **File:** `src/posts/2028-02-22-getting-started-with-roslyn-analyzers.md`
- **Pitch:** Roslyn Analyzers have the fastest feedback loop of any tool in this series for a simple reason: they run inside the same compiler that turns code into IL, so a violation shows up before you've even saved the file.
- **Angle:** Covers installing an existing package (Roslynator, Meziantou.Analyzer) versus authoring a fully custom analyzer against the syntax tree/semantic model APIs, `.editorconfig` severity overrides committed to source control as what makes enforcement team-wide rather than per-developer, and treating warnings as errors in CI specifically while keeping local iteration fast. Flags `OutputItemType="Analyzer"` as the single most common reason a correctly written custom analyzer silently does nothing.
- **Tags:** `dotnet`, `architecture`, `code-quality`, `developer-productivity`

---

## 📅 Tuesday Track - CI/CD Platforms for .NET (February-April 2028)

Six posts on where a .NET team actually runs its builds and deployments, picking up the Tuesday cadence directly from the Architecture Quality Tools track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one CI/CD platform.

### The Top 5 CI/CD Platforms for .NET Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2028-02-29
- **Source:** `docs/article-ideas/top-5-cicd-platforms-dotnet-compared.md`
- **File:** `src/posts/2028-02-29-top-5-cicd-platforms-dotnet-compared.md`
- **Pitch:** GitHub Actions leads organizational adoption at roughly a third of teams, with Jenkins and GitLab CI behind it. But adoption share answers "what do most teams use," not "what should this team use" - and for .NET specifically the answer depends mostly on where the code already lives and how much governance the organization actually needs.
- **Angle:** Compares the five on hosting model, repo coupling, .NET-specific fit, governance, and cost model. The research is consistent that there's no universal winner, so the comparison resolves on repo host and control appetite rather than a feature matrix. Gives Azure DevOps an honest hearing as frequently the cheapest option for Windows-heavy workloads and the strongest out-of-the-box governance story, which is easy to miss when GitHub Actions is the unexamined default.
- **Tags:** `dotnet`, `ci-cd`, `devops`, `platform-engineering`, `tooling`

### Getting Started with GitHub Actions for .NET
- **Status:** `draft`
- **Scheduled:** 2028-03-07
- **Source:** `docs/article-ideas/getting-started-with-github-actions-dotnet.md`
- **File:** `src/posts/2028-03-07-getting-started-with-github-actions-dotnet.md`
- **Pitch:** A working GitHub Actions build-and-test workflow takes about ten lines, which is exactly why the real setup work lives elsewhere - caching NuGet correctly, pinning actions to a commit SHA, and using OIDC instead of long-lived cloud credentials.
- **Angle:** Covers `setup-dotnet`'s built-in caching keyed to lock files, matrix builds across OS/version combinations, SHA-pinning third-party actions against supply-chain risk, and OIDC-based Azure login as the default over static service-principal secrets. Separates CI triggers from CD triggers explicitly and covers GitHub Environments with required reviewers as the enforced human gate before production.
- **Tags:** `dotnet`, `ci-cd`, `devops`, `tooling`

### Getting Started with Azure DevOps for .NET
- **Status:** `draft`
- **Scheduled:** 2028-03-14
- **Source:** `docs/article-ideas/getting-started-with-azure-devops-dotnet.md`
- **File:** `src/posts/2028-03-14-getting-started-with-azure-devops-dotnet.md`
- **Pitch:** Azure Pipelines' YAML feels familiar if you know GitHub Actions - steps, stages, triggers - but the vocabulary is genuinely different underneath, and the payoff is real specifically where Azure is the deployment target.
- **Angle:** Covers the `Cache@2` task as the explicit equivalent of `setup-dotnet`'s caching, multi-stage pipelines with `dependsOn` for build/deploy separation, workload identity federation as Azure DevOps' answer to OIDC, and native deployment tasks (`AzureWebApp@1`) over raw CLI scripting. Direct that Azure DevOps works against GitHub-hosted repos too, and is frequently the cheapest option specifically for Windows-heavy build workloads.
- **Tags:** `dotnet`, `ci-cd`, `cloud`, `devops`, `tooling`

### Getting Started with GitLab CI for .NET
- **Status:** `draft`
- **Scheduled:** 2028-03-21
- **Source:** `docs/article-ideas/getting-started-with-gitlab-ci-dotnet.md`
- **File:** `src/posts/2028-03-21-getting-started-with-gitlab-ci-dotnet.md`
- **Pitch:** GitLab CI's single-file, single-platform philosophy means your `.gitlab-ci.yml` sits inside the same product that hosts the repo, runs security scans, and tracks issues - which changes the setup calculus from just build/test/deploy.
- **Angle:** Covers `stages`/`rules` as GitLab's job-scoping vocabulary, cache keys tied to lock file contents, and including the built-in Dependency-Scanning and Container-Scanning templates as the platform's clearest differentiator over stitching a third-party scanner onto GitHub Actions or Azure DevOps. Frames adopting GitLab CI as a broader platform commitment, not a narrow CI/CD-only decision.
- **Tags:** `dotnet`, `ci-cd`, `devops`, `security`, `tooling`

### Getting Started with Jenkins for .NET
- **Status:** `draft`
- **Scheduled:** 2028-03-28
- **Source:** `docs/article-ideas/getting-started-with-jenkins-dotnet.md`
- **File:** `src/posts/2028-03-28-getting-started-with-jenkins-dotnet.md`
- **Pitch:** Jenkins asks more of you before your first pipeline even runs than any other platform in this series - provisioning the server, installing plugins, configuring agents - work every cloud-hosted alternative hands you for free the moment you push a YAML file.
- **Angle:** Covers Declarative Pipeline syntax in a Jenkinsfile, Docker agents as the fix for "works on my Jenkins host but nowhere else," the Credentials plugin over hardcoded secrets, and `input` steps as Jenkins' built-in manual approval gate. Honest throughout that the real cost isn't the free software, it's the ongoing infrastructure and maintenance burden - estimated $800-2,500/month for a 20-person team - and that this needs existing operational capacity to be worth it.
- **Tags:** `dotnet`, `ci-cd`, `devops`, `platform-engineering`, `tooling`

### Getting Started with TeamCity for .NET
- **Status:** `draft`
- **Scheduled:** 2028-04-04
- **Source:** `docs/article-ideas/getting-started-with-teamcity-dotnet.md`
- **File:** `src/posts/2028-04-04-getting-started-with-teamcity-dotnet.md`
- **Pitch:** TeamCity's build configuration UI is a genuinely good way to learn the concepts, but the moment there's more than one project, Kotlin DSL - version-controlled, code-based pipeline definitions - is the real setup decision that determines whether configuration is reviewable or a black box.
- **Angle:** Covers migrating from UI-configured builds to Kotlin DSL (with TeamCity's own DSL-generation as a starting point), snapshot dependencies for genuine multi-project build chains that parallelize independent builds and gate on prerequisites, and omitted VCS triggers as TeamCity's manual-approval mechanism for deployment configurations. Direct that its build-chain sophistication earns its keep specifically for complex, multi-project .NET solutions, not a single simple project.
- **Tags:** `dotnet`, `ci-cd`, `devops`, `tooling`

---

## 📅 Tuesday Track - .NET Deployment Options (April-May 2028)

Six posts on how a .NET application actually reaches production, picking up the Tuesday cadence directly from the CI/CD Platforms track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one deployment path.

### The Top 5 Ways to Deploy .NET Apps Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2028-04-11
- **Source:** `docs/article-ideas/top-5-dotnet-deployment-options-compared.md`
- **File:** `src/posts/2028-04-11-top-5-dotnet-deployment-options-compared.md`
- **Pitch:** Four of these five paths are container-based, so "do we use containers" isn't the real question. The differentiator is how much orchestration and operational burden you keep versus hand to a managed platform - a team running Kubernetes for a service taking 500 requests a day is spending engineering time on something that isn't the problem.
- **Angle:** Compares the five on operational overhead, portability, and cloud coupling, carrying forward the Microservices post's argument that infrastructure should be sized to the control you actually need rather than to what sounds most modern. That's why IIS stays in the comparison as a valid answer for Windows and on-premises environments instead of a legacy footnote. Treats .NET Aspire as a target-agnostic tooling layer that generates manifests for whichever of the others you pick, not as a competing runtime.
- **Tags:** `dotnet`, `deployment`, `containers`, `platform-engineering`, `devops`

### Getting Started with Azure Container Apps for .NET Deployment
- **Status:** `draft`
- **Scheduled:** 2028-04-18
- **Source:** `docs/article-ideas/getting-started-with-azure-container-apps.md`
- **File:** `src/posts/2028-04-18-getting-started-with-azure-container-apps.md`
- **Pitch:** Azure Container Apps' whole pitch is containerized, cloud-native deployment without ever touching a Kubernetes manifest or provisioning a cluster - and for a genuinely large share of .NET applications, that trade is exactly right.
- **Angle:** Covers `--min-replicas 0` scale-to-zero, secret references over plain environment variables, HTTP-concurrency and KEDA-backed autoscaling rules, and `azd` as the integrated workflow once a deployment involves more than one service. Direct about ACA's real edges upfront - no DaemonSets, no privileged containers, no GPU node selection - so the choice is deliberate, not a mid-project discovery, and names the well-defined migration path to AKS if those limits are hit later.
- **Tags:** `dotnet`, `deployment`, `cloud`, `containers`, `devops`

### Getting Started with AWS ECS/Fargate for .NET Deployment
- **Status:** `draft`
- **Scheduled:** 2028-04-25
- **Source:** `docs/article-ideas/getting-started-with-aws-ecs-fargate.md`
- **File:** `src/posts/2028-04-25-getting-started-with-aws-ecs-fargate.md`
- **Pitch:** ECS paired with Fargate solves the same problem Azure Container Apps solves - run containers without managing a cluster - but asks one decision Azure's platform doesn't: EC2-backed ECS or Fargate.
- **Angle:** Covers task definitions with Secrets Manager references, pairing an ECS service with an Application Load Balancer target group for health-checked routing, registering a new task definition revision per deployment rather than editing in place, and starting with Fargate by default unless there's a specific reason to manage EC2 compute directly. Honest that ECS's scale-to-zero story needs more manual work than ACA's native support, and that .NET-specific tooling is comparatively thinner than Azure's.
- **Tags:** `dotnet`, `deployment`, `cloud`, `containers`, `devops`

### Getting Started with Docker + Kubernetes for .NET Deployment
- **Status:** `draft`
- **Scheduled:** 2028-05-02
- **Source:** `docs/article-ideas/getting-started-with-docker-kubernetes-dotnet.md`
- **File:** `src/posts/2028-05-02-getting-started-with-docker-kubernetes-dotnet.md`
- **Pitch:** Containerizing a .NET application is the easy part. Running that image well in Kubernetes is where the real work lives, and it's also where .NET-specific details - Kestrel binding, graceful shutdown - matter more than generic Kubernetes advice accounts for.
- **Angle:** Covers a two-stage Dockerfile, Kestrel bound directly to a non-privileged port with TLS terminating at the ingress (genuinely simpler than IIS out-of-process hosting), liveness/readiness health checks, and `IHostApplicationLifetime`-based graceful shutdown as the single most commonly mishandled piece of a first .NET-on-Kubernetes deployment. Names resource requests/limits as non-optional, not tuning, and covers the clean migration path to and from Azure Container Apps since only the orchestration layer changes.
- **Tags:** `dotnet`, `deployment`, `containers`, `devops`, `architecture`

### Getting Started with IIS for .NET Deployment
- **Status:** `draft`
- **Scheduled:** 2028-05-09
- **Source:** `docs/article-ideas/getting-started-with-iis-dotnet.md`
- **File:** `src/posts/2028-05-09-getting-started-with-iis-dotnet.md`
- **Pitch:** IIS deployments have one failure mode that shows up more than any other in this series: a completely correct application returning a 500 error the moment it hits the server, because the .NET Core Hosting Bundle wasn't installed on the Windows Server itself.
- **Angle:** Covers the Hosting Bundle as a separate install from any SDK, the out-of-process hosting model (IIS as reverse proxy in front of Kestrel) that `dotnet publish` configures automatically via `web.config`, setting `managedRuntimeVersion` to empty for "No Managed Code," and temporarily enabling `stdoutLogEnabled` for first-deployment troubleshooting. Frames IIS as a legitimate answer for existing Windows Server infrastructure and Active Directory integration, not a legacy fallback.
- **Tags:** `dotnet`, `deployment`, `platform-engineering`, `devops`

### Getting Started with .NET Aspire's Deploy Workflow
- **Status:** `draft`
- **Scheduled:** 2028-05-16
- **Source:** `docs/article-ideas/getting-started-with-aspire-deploy-workflow.md`
- **File:** `src/posts/2028-05-16-getting-started-with-aspire-deploy-workflow.md`
- **Pitch:** Aspire's local development story is well known. Less widely known is that Aspire 9.2+ ships a genuine deployment workflow - `aspire publish` and `aspire deploy` - that generates real deployment artifacts from the exact same AppHost model used for local development.
- **Angle:** Covers `aspire publish` for reviewing generated artifacts before ever applying them, `azd up` as the full Azure provision-and-deploy path with the deepest first-class Aspire integration, targeting Kubernetes instead via the extensible publisher model, and making deployment customizations from the AppHost itself (`PublishAsAzureContainerApp`) rather than hand-editing generated Bicep that drifts on the next publish. Direct throughout that this is a consistency layer over an actual target, not a target itself - the operational realities from the ACA, ECS, and Kubernetes posts in this same track still apply underneath it.
- **Tags:** `dotnet`, `deployment`, `cloud`, `tooling`, `architecture`

---

## 📅 Tuesday Track - Auth & Identity for .NET (May-June 2028)

Six posts on how .NET applications handle authentication and identity, picking up the Tuesday cadence directly from the .NET Deployment Options track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one auth/identity solution.

### The Top 5 Auth & Identity Solutions for .NET Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2028-05-23
- **Source:** `docs/article-ideas/top-5-auth-identity-solutions-dotnet-compared.md`
- **File:** `src/posts/2028-05-23-top-5-auth-identity-solutions-dotnet-compared.md`
- **Pitch:** Duende IdentityServer - the direct successor to the free, widely-loved IdentityServer4 - now requires a commercial license for production use above a revenue threshold, the same commercial-shift pattern the mapping and mocking tracks both hit.
- **Angle:** Compares the five across three genuinely different categories - an embedded user-management library, self-hosted protocol servers you operate yourself, and fully managed identity platforms you configure rather than run - framing the decision as how much of the identity stack you want to own, not a feature checklist. Names OpenIddict as the free, .NET-native alternative that rose directly out of Duende's licensing change, and closes on the common pattern of pairing ASP.NET Core Identity with a protocol framework rather than treating the five as strictly mutually exclusive.
- **Tags:** `dotnet`, `security`, `identity`, `oidc`, `architecture`

### Getting Started with ASP.NET Core Identity
- **Status:** `draft`
- **Scheduled:** 2028-05-30
- **Source:** `docs/article-ideas/getting-started-with-aspnet-core-identity.md`
- **File:** `src/posts/2028-05-30-getting-started-with-aspnet-core-identity.md`
- **Pitch:** Scaffolding gets a working login page in minutes, which is exactly why it's easy to stop there and miss the configuration that actually matters: password and lockout policies tuned to real risk tolerance, email confirmation wired to a real sender, and knowing when Identity alone has been outgrown.
- **Angle:** Covers tuning password/lockout policy away from generic scaffolded defaults, replacing the default `IEmailSender` stub (which silently does nothing) with a real provider, adding `AddRoles<IdentityRole>()` for role-based authorization, and claims-based policies for anything more granular than a fixed role list. Direct that the moment SSO, external API tokens, or third-party federation are needed, that's the signal to pair Identity with a protocol framework rather than stretch it further.
- **Tags:** `dotnet`, `security`, `identity`, `aspnet-core`

### Getting Started with Microsoft Entra External ID for .NET
- **Status:** `draft`
- **Scheduled:** 2028-06-06
- **Source:** `docs/article-ideas/getting-started-with-entra-external-id.md`
- **File:** `src/posts/2028-06-06-getting-started-with-entra-external-id.md`
- **Pitch:** The newest name in this track's comparison - Microsoft's current, officially recommended replacement for Azure AD B2C - which means double-checking any setup step against Microsoft's own docs before production, since this is an actively evolving product rather than a long-settled one.
- **Angle:** Covers tenant and app registration, `Microsoft.Identity.Web` as the same first-party library that's underpinned Azure AD and Azure AD B2C integration for years, admin-center-configured user flows for sign-up/sign-in behavior, and the still-maturing pattern for unifying consumer and B2B sign-in in one application. Honest that this is genuinely newer than Azure AD B2C with a smaller body of battle-tested guidance, and points to Microsoft's official migration path for existing B2C applications.
- **Tags:** `dotnet`, `security`, `identity`, `azure`, `oidc`

### Getting Started with Duende IdentityServer
- **Status:** `draft`
- **Scheduled:** 2028-06-13
- **Source:** `docs/article-ideas/getting-started-with-duende-identityserver.md`
- **File:** `src/posts/2028-06-13-getting-started-with-duende-identityserver.md`
- **Pitch:** The first real decision happens before writing any code: is the organization actually under the community edition's revenue threshold, or does it need a commercial license - worth resolving explicitly rather than building an identity provider around an unconfirmed licensing assumption.
- **Angle:** Covers clients and scopes as the foundational configuration vocabulary, pairing with ASP.NET Core Identity for the actual user store (Duende supplies no UI or user management of its own), deliberate token lifetime configuration, and the real, often-underestimated engineering cost of building login, registration, consent, and password-reset flows Duende doesn't ship turnkey. Recommends seriously evaluating OpenIddict or Keycloak before committing to a paid license unless there's a specific technical requirement only Duende meets.
- **Tags:** `dotnet`, `security`, `identity`, `oidc`, `architecture`

### Getting Started with Keycloak for .NET
- **Status:** `draft`
- **Scheduled:** 2028-06-20
- **Source:** `docs/article-ideas/getting-started-with-keycloak-dotnet.md`
- **File:** `src/posts/2028-06-20-getting-started-with-keycloak-dotnet.md`
- **Pitch:** Free and standards-compliant enough that the .NET side is genuinely simple - the same generic `Microsoft.AspNetCore.Authentication.OpenIdConnect` middleware works with no Keycloak-specific SDK - while the real work lives in realms, clients, and operating a Java-based service as infrastructure regardless of how cleanly .NET talks to it.
- **Angle:** Covers realms as Keycloak's top-level isolation boundary, standard OIDC middleware pointed at a realm-specific issuer URL, the `realm_access.roles` claim nesting that's a common source of silently-never-matching authorization policies, and never running `start-dev` mode in production. Frames Keycloak as the community's clear recommendation over a paid Duende license for cost-constrained teams with real infrastructure capacity, at the cost of operating a Java-based service.
- **Tags:** `dotnet`, `security`, `identity`, `oidc`, `devops`

### Getting Started with Auth0 for .NET
- **Status:** `draft`
- **Scheduled:** 2028-06-27
- **Source:** `docs/article-ideas/getting-started-with-auth0-dotnet.md`
- **File:** `src/posts/2028-06-27-getting-started-with-auth0-dotnet.md`
- **Pitch:** The value proposition shows up in the first ten minutes - register an application, install one SDK package, working login without hand-writing an OAuth flow or standing up infrastructure - but the setup work that actually matters happens after that quick win.
- **Angle:** Covers the `Auth0.AspNetCore.Authentication` SDK for web apps versus JWT Bearer authentication for APIs as two distinct integration patterns, `Audience` mismatches as the most common "token is valid but access is denied" cause, namespaced custom claims via Auth0 Actions since roles aren't included in tokens by default, and clearing both the local and Auth0 session on logout. Closes on monitoring usage-based pricing against tier boundaries as user base grows, rather than being surprised by cost later.
- **Tags:** `dotnet`, `security`, `identity`, `oidc`, `tooling`

---

## 📅 Tuesday Track - .NET IDEs & Editors (July-August 2028)

Six posts on where .NET developers actually write and debug C# in 2028, picking up the Tuesday cadence directly from the Auth & Identity for .NET track. A comparison post anchors the track and each of the five follow-ups is a complete setup for one editor. This is the final scheduled series drawn from the current `docs/article-ideas/` backlog - the Backlog section below is now empty.

### The Top 5 .NET IDEs & Editors Compared: Which One Should You Choose?
- **Status:** `draft`
- **Scheduled:** 2028-07-04
- **Source:** `docs/article-ideas/top-5-dotnet-ides-editors-compared.md`
- **File:** `src/posts/2028-07-04-top-5-dotnet-ides-editors-compared.md`
- **Pitch:** "Visual Studio on Windows" stopped being the automatic answer. Rider has a real claim to being better for day-to-day C# work, VS Code became genuinely solid once the C# Dev Kit shipped, and in mid-2026 JetBrains extended full C# tooling - debugging included - to Cursor and other VS Code-compatible editors.
- **Angle:** Compares the five on platform support, cost, C# intelligence, and debugging, with Neovim included specifically for the terminal-first crowd rather than as a novelty entry. States the licensing detail that drives most of the current landscape upfront: Microsoft's C# Dev Kit is licensed for genuine VS Code only and does not run on Cursor or other forks, which is exactly the gap JetBrains moved into. Deliberately scoped to the core development experience and cross-references the AI Coding Agents track rather than re-litigating agent capability.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`, `ai-coding-tools`

### Getting Started with Visual Studio for .NET Development
- **Status:** `draft`
- **Scheduled:** 2028-07-11
- **Source:** `docs/article-ideas/getting-started-with-visual-studio.md`
- **File:** `src/posts/2028-07-11-getting-started-with-visual-studio.md`
- **Pitch:** The install wizard makes the first decision that matters most, and it's easy to get wrong: which workloads to install. Checking every box "just in case" turns a reasonable install into a multi-hour, disk-hungry mess.
- **Angle:** Covers deliberate workload selection over installing everything available, tuning background analysis scope and Solution Explorer tracking for large-solution responsiveness, committing `.editorconfig` from day one as the highest-leverage team-consistency setting, and conditional breakpoints over littering code with temporary print statements. Direct that Community edition is genuinely free for individuals, open-source projects, and teams of up to five - not just a trial - and that Visual Studio for Mac is fully discontinued with no path forward on macOS.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`

### Getting Started with JetBrains Rider for .NET Development
- **Status:** `draft`
- **Scheduled:** 2028-07-18
- **Source:** `docs/article-ideas/getting-started-with-rider.md`
- **File:** `src/posts/2028-07-18-getting-started-with-rider.md`
- **Pitch:** The reputation for being faster and smarter than Visual Studio for day-to-day C# work isn't marketing copy - it comes directly from ReSharper's static analysis engine running natively inside the IDE rather than as an add-on.
- **Angle:** Covers Solution-Wide Analysis as continuous background checking across the entire solution rather than just open files, ReSharper-native refactoring and navigation as the clearest day-to-day strength, shared `.editorconfig` conventions that let Rider and Visual Studio coexist on the same team without friction, and the built-in database tools shared with DataGrip. Direct that it's a genuinely first-class cross-platform experience, not a Windows product ported elsewhere - the strongest full .NET IDE choice on macOS now that Visual Studio for Mac is gone.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`

### Getting Started with VS Code for .NET Development
- **Status:** `draft`
- **Scheduled:** 2028-07-25
- **Source:** `docs/article-ideas/getting-started-with-vscode-dotnet.md`
- **File:** `src/posts/2028-07-25-getting-started-with-vscode-dotnet.md`
- **Pitch:** The C# story used to require a fair amount of manual extension-hunting to get something resembling IntelliSense and a working debugger. That's not the situation anymore - the C# Dev Kit bundles the pieces that matter into one coherent extension.
- **Angle:** Covers opening the folder containing a `.sln`/`.csproj` (not loose files) as the fix for the most common "IntelliSense isn't working" complaint, committing `.vscode/settings.json` and `.editorconfig` for team-wide consistency, the built-in Test Explorer and F5 debugging workflow, and the extension's genuine first-party Microsoft investment rather than community-maintained status. States plainly that the C# Dev Kit's license restricts it to genuine VS Code and does not run on Cursor or other forks - the detail that drives most of this track's Cursor post.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`

### Getting Started with C# Development in Cursor
- **Status:** `draft`
- **Scheduled:** 2028-08-01
- **Source:** `docs/article-ideas/getting-started-with-cursor-dotnet.md`
- **File:** `src/posts/2028-08-01-getting-started-with-cursor-dotnet.md`
- **Pitch:** Cursor's C# story had a real, well-known gap until mid-2026: the C# Dev Kit refuses to run on VS Code forks, leaving Cursor users doing .NET work with a degraded experience - until JetBrains extended ReSharper's full engine, debugging included, directly into Cursor as of their 2026.2 release.
- **Angle:** Covers installing ReSharper's extension from Cursor's marketplace, the same `.editorconfig`-respecting conventions that keep formatting consistent across a mixed-editor team, debugging as specifically the capability that was missing before 2026.2, and a practical pattern for combining Cursor's Agent mode for larger changes with ReSharper's inline inspections to verify agent-generated code the same way hand-written code gets checked. Honest about the combined licensing cost - a ReSharper license plus any Cursor Pro tier - and cross-references this series' separate Cursor AI-agent setup guide rather than repeating it.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`, `ai-coding-tools`

### Getting Started with Neovim for .NET Development
- **Status:** `draft`
- **Scheduled:** 2028-08-08
- **Source:** `docs/article-ideas/getting-started-with-neovim-dotnet.md`
- **File:** `src/posts/2028-08-08-getting-started-with-neovim-dotnet.md`
- **Pitch:** Every other editor in this track gives you IntelliSense and debugging the moment you install it. Neovim gives you neither - you assemble both yourself, from a language server, a completion plugin, and a debug adapter, each configured explicitly.
- **Angle:** Covers `csharp-ls` (or OmniSharp) via `nvim-lspconfig` for core IDE-like features, `nvim-dap` paired with `netcoredbg` as the most setup-intensive piece with no out-of-the-box equivalent, `nvim-dap-ui` as the non-optional upgrade over bare `nvim-dap` commands for a usable debugging panel, and building configuration incrementally rather than trying to replicate every IDE feature before writing real code. Honest throughout that this requires meaningfully more upfront investment than any other option in the track, worth it specifically for developers who value full control and a terminal-first workflow.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`

---

## 📅 Sunday Track - Patterns of Enterprise Application Architecture in Modern .NET (Volume 1) (August 2028-August 2029)

Fifty-five posts translating Martin Fowler's *Patterns of Enterprise Application Architecture* catalog into modern .NET 10 and C# 14 - four introductory articles followed by all 51 catalog patterns in Fowler's canonical order, covering domain logic, data source, object-relational, web presentation, distribution, offline concurrency, session state, and base patterns. Runs weekly on Sundays as a standing series alongside the Tuesday .NET tracks. This is volume 1 of 3; volumes 2 and 3 will extend the series once drafted into `docs/article-ideas/`.

### What Are Enterprise Application Architecture Patterns?
- **Status:** `draft`
- **Scheduled:** 2028-08-13
- **Source:** `docs/article-ideas/01-what-are-enterprise-application-architecture-patterns.md`
- **File:** `src/posts/2028-08-13-what-are-enterprise-application-architecture-patterns.md`
- **Pitch:** Martin Fowler's *Patterns of Enterprise Application Architecture* catalog gave developers a shared vocabulary for organizing business rules, data, and presentation - and most of it holds up two decades later. This opens a series translating that catalog into modern .NET 10 and C# 14, starting with why patterns are tools for a specific problem, not architecture to apply by default.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/01-what-are-enterprise-application-architecture-patterns.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Layers, Boundaries, and Separation of Concerns in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-08-20
- **Source:** `docs/article-ideas/02-layers-boundaries-separation-of-concerns.md`
- **File:** `src/posts/2028-08-20-layers-boundaries-separation-of-concerns.md`
- **Pitch:** A web endpoint starts with a few lines of code, then someone adds validation, pricing, authorization, and notifications - and it quietly becomes a miniature application. A look at what a layer actually is, why dependency direction matters more than folder names, and the practical test for a good boundary: does it localize a kind of change?
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/02-layers-boundaries-separation-of-concerns.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Transaction Script, Domain Model, and Service Layer
- **Status:** `draft`
- **Scheduled:** 2028-08-27
- **Source:** `docs/article-ideas/03-transaction-script-domain-model-service-layer.md`
- **File:** `src/posts/2028-08-27-transaction-script-domain-model-service-layer.md`
- **Pitch:** Where should business logic actually live? A practical comparison of three of Fowler's most consequential answers - procedures organized around operations, a rich object model that owns its own rules, and a coordinating boundary layer - and why modern applications frequently combine all three rather than picking one.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/03-transaction-script-domain-model-service-layer.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-logic`

### Data Access Patterns and the Object-Relational Impedance Mismatch
- **Status:** `draft`
- **Scheduled:** 2028-09-03
- **Source:** `docs/article-ideas/04-data-access-patterns-object-relational-mismatch.md`
- **File:** `src/posts/2028-09-03-data-access-patterns-object-relational-mismatch.md`
- **Pitch:** Objects and relational tables represent information differently, and that gap - the object-relational impedance mismatch - is what an entire family of Fowler patterns exists to bridge. An introduction to that gap, and to how much of it Entity Framework Core already closes without most developers noticing.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/04-data-access-patterns-object-relational-mismatch.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `data-access`

### Transaction Script in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-09-10
- **Source:** `docs/article-ideas/05-transaction-script.md`
- **File:** `src/posts/2028-09-10-transaction-script.md`
- **Pitch:** Transaction Script organizes business logic around the application's transactions, with one procedure handling each operation - explicit, easy to locate, and often the right choice for CRUD-heavy systems. A look at when it works well, and the warning sign - duplicated business knowledge - that means a domain object may need to take over.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/05-transaction-script.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-logic`

### Domain Model in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-09-17
- **Source:** `docs/article-ideas/06-domain-model.md`
- **File:** `src/posts/2028-09-17-domain-model.md`
- **Pitch:** A Domain Model organizes business logic around objects representing concepts in the problem domain - the order itself owns the rules governing whether it can be submitted, not a service acting on it from outside. Covers building behavior-rich models with modern C# records and value objects, and the honest trade-off against an anemic, data-only alternative.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/06-domain-model.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-logic`

### Table Module in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-09-24
- **Source:** `docs/article-ideas/07-table-module.md`
- **File:** `src/posts/2028-09-24-table-module.md`
- **Pitch:** Table Module organizes domain logic into one module responsible for all rows in a table or view, rather than one object instance per entity - a less commonly named pattern today, but one LINQ makes natural for set-oriented behavior. Covers where it still fits cleanly against both Transaction Script and Domain Model.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/07-table-module.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-logic`

### Service Layer in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-10-01
- **Source:** `docs/article-ideas/08-service-layer.md`
- **File:** `src/posts/2028-10-01-service-layer.md`
- **Pitch:** Service Layer defines an application's boundary and answers a specific architectural question: what can this application do? Covers keeping the service as coordination rather than a procedural dumping ground, and the useful default - application services orchestrate, domain objects decide.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/08-service-layer.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-logic`

### Table Data Gateway in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-10-08
- **Source:** `docs/article-ideas/09-table-data-gateway.md`
- **File:** `src/posts/2028-10-08-table-data-gateway.md`
- **Pitch:** Table Data Gateway places the SQL for a table behind a single object, giving persistence logic one clear home instead of letting database knowledge spread through controllers and jobs. Covers pairing it with Transaction Script, and why it's more compelling when SQL is intentionally explicit than as a thin wrapper around what DbSet already provides.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/09-table-data-gateway.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `data-access`

### Row Data Gateway in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-10-15
- **Source:** `docs/article-ideas/10-row-data-gateway.md`
- **File:** `src/posts/2028-10-15-row-data-gateway.md`
- **Pitch:** If Table Data Gateway says one gateway handles the Orders table, Row Data Gateway says this object is the gateway for order row 42 - one instance per record. Covers the distinction from Active Record (behavior vs. pure persistence) and why the pattern is less common now that tracked EF Core entities provide much of the same ergonomic benefit.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/10-row-data-gateway.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `data-access`

### Active Record in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-10-22
- **Source:** `docs/article-ideas/11-active-record.md`
- **File:** `src/posts/2028-10-22-active-record.md`
- **Pitch:** Active Record combines a data record, persistence operations, and domain behavior in the same object - `customer.ChangeEmail(...)` then `customer.SaveAsync()` - reducing indirection for domains that closely match their relational schema. Covers why typical EF Core code is conceptually closer to Data Mapper than true Active Record, and when the combined responsibility becomes awkward as a domain grows.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/11-active-record.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `data-access`

### Data Mapper in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-10-29
- **Source:** `docs/article-ideas/12-data-mapper.md`
- **File:** `src/posts/2028-10-29-data-mapper.md`
- **Pitch:** Data Mapper separates the in-memory object model from the database entirely - domain objects don't need to know which tables contain their data or when an INSERT happens. One of the most important patterns in the whole catalog for modern .NET, because EF Core implements so much of it directly.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/12-data-mapper.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `data-access`

### Unit of Work in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-11-05
- **Source:** `docs/article-ideas/13-unit-of-work.md`
- **File:** `src/posts/2028-11-05-unit-of-work.md`
- **Pitch:** Unit of Work keeps track of objects affected by a business transaction and coordinates the resulting database changes - a definition that maps remarkably well onto how most .NET developers already use DbContext. Covers when a custom IUnitOfWork abstraction earns its keep versus when it just renames SaveChangesAsync.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/13-unit-of-work.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Identity Map in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-11-12
- **Source:** `docs/article-ideas/14-identity-map.md`
- **File:** `src/posts/2028-11-12-identity-map.md`
- **Pitch:** Identity Map ensures a particular database identity maps to exactly one in-memory object within a business transaction - a small implementation detail that's actually important for both correctness and performance. Covers how EF Core's tracked DbContext already provides this, and why a second identity map on top of it is usually one too many.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/14-identity-map.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Lazy Load in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-11-19
- **Source:** `docs/article-ideas/15-lazy-load.md`
- **File:** `src/posts/2028-11-19-lazy-load.md`
- **Pitch:** Lazy Load delays retrieving related data until it's actually needed - solving real waste, while also being one of the easiest ways to accidentally create severe database performance problems. Covers the classic N+1 query problem, and why explicit loading or projection is often the more predictable choice for modern APIs.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/15-lazy-load.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Identity Field in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-11-26
- **Source:** `docs/article-ideas/16-identity-field.md`
- **File:** `src/posts/2028-11-26-identity-field.md`
- **Pitch:** Identity Field stores a database identifier in an object so the persistence layer can maintain the connection between an in-memory entity and its row - foundational, and made genuinely safer in modern C# through strongly typed IDs that stop an OrderId from being passed where a CustomerId belongs.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/16-identity-field.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Inheritance Mappers in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-12-03
- **Source:** `docs/article-ideas/17-inheritance-mappers.md`
- **File:** `src/posts/2028-12-03-inheritance-mappers.md`
- **Pitch:** Inheritance Mappers coordinate persistence for an object hierarchy when different classes need different mapping behavior - the layer above table-per-hierarchy, table-per-type, and table-per-concrete-type that decides which mapper handles which class. Covers why EF Core makes this mostly invisible, and why understanding it still matters for reasoning about the generated SQL.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/17-inheritance-mappers.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Foreign Key Mapping in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-12-10
- **Source:** `docs/article-ideas/18-foreign-key-mapping.md`
- **File:** `src/posts/2028-12-10-foreign-key-mapping.md`
- **Pitch:** Objects express relationships with references - order.Customer - while relational databases express them with keys - Orders.CustomerId. Foreign Key Mapping bridges those two representations, and this covers the real design decisions: required vs. optional relationships, whether both a navigation and an explicit ID should exist, and respecting aggregate boundaries.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/18-foreign-key-mapping.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Association Table Mapping in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-12-17
- **Source:** `docs/article-ideas/19-association-table-mapping.md`
- **File:** `src/posts/2028-12-17-association-table-mapping.md`
- **Pitch:** A many-to-many relationship is easy to express with objects - post.Tags - but a relational database needs another table to represent it. Covers EF Core's skip navigations for simple joins, and the important modeling question: once an association gains its own data, like a role and an assignment date, it usually deserves to become a domain concept in its own right.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/19-association-table-mapping.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Dependent Mapping in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-12-24
- **Source:** `docs/article-ideas/20-dependent-mapping.md`
- **File:** `src/posts/2028-12-24-dependent-mapping.md`
- **Pitch:** Dependent Mapping lets the mapper for a parent object also handle persistence for child objects that have no independent lifecycle - Fowler's classic example is an album and its tracks. Covers EF Core owned types, and recognizing the aggregate-boundary warning sign of giving a truly dependent child its own standalone repository.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/20-dependent-mapping.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Embedded Value in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2028-12-31
- **Source:** `docs/article-ideas/21-embedded-value.md`
- **File:** `src/posts/2028-12-31-embedded-value.md`
- **Pitch:** Embedded Value maps a small object into columns in another object's table rather than giving it its own table - especially useful for value objects like Money or Address. Covers EF Core owned mappings, and why this beats flattening the domain model just because persistence found it convenient.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/21-embedded-value.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Serialized LOB in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-01-07
- **Source:** `docs/article-ideas/22-serialized-lob.md`
- **File:** `src/posts/2029-01-07-serialized-lob.md`
- **Pitch:** Serialized LOB persists a graph of objects by serializing it into a single large database value - in a modern .NET application, usually JSON. Covers System.Text.Json value converters, the central trade-off against queryability, and why long-lived serialized data needs a real schema-evolution strategy even though the database enforces none.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/22-serialized-lob.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Single Table Inheritance in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-01-14
- **Source:** `docs/article-ideas/23-single-table-inheritance.md`
- **File:** `src/posts/2029-01-14-single-table-inheritance.md`
- **Pitch:** Single Table Inheritance stores an entire object hierarchy in one database table - EF Core's default table-per-hierarchy (TPH) strategy. Covers the central structural trade-off: query simplicity and strong polymorphic queries, paid for with nullable columns that don't apply to every row.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/23-single-table-inheritance.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Class Table Inheritance in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-01-21
- **Source:** `docs/article-ideas/24-class-table-inheritance.md`
- **File:** `src/posts/2029-01-21-class-table-inheritance.md`
- **Pitch:** Class Table Inheritance represents an inheritance hierarchy with one relational table per class - EF Core's table-per-type (TPT) - so the schema mirrors the object model closely. Covers why that conceptual neatness is paid for in joins, and current EF Core guidance that TPT often performs worse than the TPH default.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/24-class-table-inheritance.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Concrete Table Inheritance in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-01-28
- **Source:** `docs/article-ideas/25-concrete-table-inheritance.md`
- **File:** `src/posts/2029-01-28-concrete-table-inheritance.md`
- **Pitch:** Concrete Table Inheritance creates a table for each concrete class and repeats inherited fields in each one - EF Core's table-per-concrete-type (TPC). Covers why leaf-type queries become simple while base-type queries and referential integrity become genuinely harder, and the key-generation subtlety that comes with it.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/25-concrete-table-inheritance.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Metadata Mapping in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-02-04
- **Source:** `docs/article-ideas/26-metadata-mapping.md`
- **File:** `src/posts/2029-02-04-metadata-mapping.md`
- **Pitch:** Metadata Mapping moves mapping rules out of hand-written persistence code and into data that describes the mapping itself - conventions, attributes, and EF Core's Fluent API are all forms of it. Covers why this is what lets an ORM support large schemas without a custom mapper class for every type, and the danger of over-generalizing it into a second programming language.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/26-metadata-mapping.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Query Object in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-02-11
- **Source:** `docs/article-ideas/27-query-object.md`
- **File:** `src/posts/2029-02-11-query-object.md`
- **Pitch:** Query Object represents a database query as an object, giving repeated business-relevant selection logic - overdue invoices, orders ready to ship - a name and a reusable home instead of scattering it through services. Covers parameterized queries, the overlap with the Specification pattern, and the danger of building a generic query DSL that just reimplements LINQ badly.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/27-query-object.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Repository in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-02-18
- **Source:** `docs/article-ideas/28-repository.md`
- **File:** `src/posts/2029-02-18-repository.md`
- **Pitch:** Repository mediates between the domain model and the data-mapping layer with an interface that feels like a collection of domain objects - and it's also one of the most frequently overused patterns in modern .NET. The real question isn't whether repositories are good, it's whether one gives your application a domain-oriented persistence boundary that EF Core doesn't already provide.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/28-repository.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `orm`

### Model View Controller in Modern ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2029-02-25
- **Source:** `docs/article-ideas/29-model-view-controller.md`
- **File:** `src/posts/2029-02-25-model-view-controller.md`
- **Pitch:** Model View Controller splits user-interface interaction into three roles - few patterns are as widely known, or as inconsistently interpreted. Revisits the pattern through ASP.NET Core MVC, Razor views, and Minimal APIs, and the real meaning of a thin controller: not near-empty, just free of accumulated business rules.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/29-model-view-controller.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `aspnet-core`

### Page Controller in Modern ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2029-03-04
- **Source:** `docs/article-ideas/30-page-controller.md`
- **File:** `src/posts/2029-03-04-page-controller.md`
- **Pitch:** Page Controller assigns a controller object to a specific page or action - MVC actions, Razor Page models, and Minimal API handlers are all modern expressions of the same idea. Covers what belongs in one versus the fat-controller failure mode, and how the pattern pairs naturally with Front Controller's shared pipeline.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/30-page-controller.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `aspnet-core`

### Front Controller in Modern ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2029-03-11
- **Source:** `docs/article-ideas/31-front-controller.md`
- **File:** `src/posts/2029-03-11-front-controller.md`
- **Pitch:** Front Controller channels web requests through a common handler before dispatching to request-specific behavior - a pattern ASP.NET Core's middleware and routing pipeline makes feel almost invisible. Covers centralizing authentication, exception handling, and correlation, without letting the shared pipeline grow into a hidden application service of its own.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/31-front-controller.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `aspnet-core`

### Template View in Modern ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2029-03-18
- **Source:** `docs/article-ideas/32-template-view.md`
- **File:** `src/posts/2029-03-18-template-view.md`
- **Pitch:** Template View renders dynamic output by starting with presentation markup and embedding markers that get replaced with data at runtime - Razor is the obvious modern example. Covers strongly typed view models, layouts, partials, and the discipline of keeping business rules out of the template even though Razor technically allows it.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/32-template-view.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `aspnet-core`

### Transform View in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-03-25
- **Source:** `docs/article-ideas/33-transform-view.md`
- **File:** `src/posts/2029-03-25-transform-view.md`
- **Pitch:** Transform View treats rendering as a transformation - structured data goes in, a complete representation comes out - which is exactly what happens every time a modern API serializes a DTO into JSON. Covers why this is the natural fit for machine-oriented output, and when handcrafted HTML is still better served by Template View instead.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/33-transform-view.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `aspnet-core`

### Two Step View in Modern ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2029-04-01
- **Source:** `docs/article-ideas/34-two-step-view.md`
- **File:** `src/posts/2029-04-01-two-step-view.md`
- **Pitch:** Two Step View renders a response in two stages - domain data becomes a logical page model first, and only then gets rendered into final output - useful when many pages share a strong common structure. Covers design-system-heavy applications and dashboards, and why an ordinary Razor layout is often enough without the extra stage.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/34-two-step-view.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `aspnet-core`

### Application Controller in Modern ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2029-04-08
- **Source:** `docs/article-ideas/35-application-controller.md`
- **File:** `src/posts/2029-04-08-application-controller.md`
- **Pitch:** Page Controller answers what should happen for this request; Application Controller answers where the application should go next. Covers centralizing multi-step workflow navigation - onboarding, checkout, account recovery - so redirect logic doesn't get scattered and duplicated across every handler along the way.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/35-application-controller.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `aspnet-core`

### Remote Facade in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-04-15
- **Source:** `docs/article-ideas/36-remote-facade.md`
- **File:** `src/posts/2029-04-15-remote-facade.md`
- **Pitch:** A method call inside one process is cheap; a network call is not. Remote Facade provides a coarse-grained interface over fine-grained application objects for exactly that reason, and this covers designing operations sized for the network rather than exposing a chatty, RPC-style mirror of the domain model.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/36-remote-facade.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `distributed-systems`

### Data Transfer Object in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-04-22
- **Source:** `docs/article-ideas/37-data-transfer-object.md`
- **File:** `src/posts/2029-04-22-data-transfer-object.md`
- **Pitch:** Data Transfer Object packages data for transfer between processes - simple in concept, but process boundaries change the economics of object interaction entirely. Covers request and response DTOs, why they protect both the domain and the client from each other, and treating serialization contract details as part of the design, not an afterthought.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/37-data-transfer-object.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `distributed-systems`

### Optimistic Offline Lock in Modern .NET and EF Core
- **Status:** `draft`
- **Scheduled:** 2029-04-29
- **Source:** `docs/article-ideas/38-optimistic-offline-lock.md`
- **File:** `src/posts/2029-04-29-optimistic-offline-lock.md`
- **Pitch:** Optimistic Offline Lock lets multiple business transactions work with the same data and detects a conflict only when one tries to commit stale changes - a strong default for web applications where a user may load an edit page and submit changes minutes later. Covers EF Core concurrency tokens, rowversion columns, and deciding what should actually happen when a conflict is detected.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/38-optimistic-offline-lock.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `ef-core`

### Pessimistic Offline Lock in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-05-06
- **Source:** `docs/article-ideas/39-pessimistic-offline-lock.md`
- **File:** `src/posts/2029-05-06-pessimistic-offline-lock.md`
- **Pitch:** Pessimistic Offline Lock prevents conflicting business transactions by requiring a logical lock before work begins - not a database row lock held for milliseconds, but an application-level lease that can survive across multiple requests and fifteen minutes of a user reviewing documents. Covers atomic acquisition, lease expiration, and the distributed-systems problems - the ABA problem included - that come with it.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/39-pessimistic-offline-lock.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `concurrency`

### Coarse-Grained Lock in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-05-13
- **Source:** `docs/article-ideas/40-coarse-grained-lock.md`
- **File:** `src/posts/2029-05-13-coarse-grained-lock.md`
- **Pitch:** Coarse-Grained Lock protects a set of related objects with one lock, rather than independently locking every object that participates in a consistency boundary - a customer and its several addresses, locked as one. Covers aggregate versioning as the natural implementation, and the real trade-off: simpler consistency in exchange for less fine-grained concurrency.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/40-coarse-grained-lock.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `concurrency`

### Implicit Lock in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-05-20
- **Source:** `docs/article-ideas/41-implicit-lock.md`
- **File:** `src/posts/2029-05-20-implicit-lock.md`
- **Pitch:** A locking strategy is only reliable if every relevant operation follows it - Implicit Lock moves that enforcement into framework or infrastructure code so developers can't accidentally forget it. Covers EF Core's automatic concurrency-token checking as the clearest modern example, and why implicit behavior still needs to stay explicit in diagnostics and documentation.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/41-implicit-lock.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `concurrency`

### Client Session State in Modern ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2029-05-27
- **Source:** `docs/article-ideas/42-client-session-state.md`
- **File:** `src/posts/2029-05-27-client-session-state.md`
- **Pitch:** HTTP is stateless, so something has to carry state between requests - Client Session State puts that job on the client, through cookies, query strings, hidden fields, and protected tokens. Covers ASP.NET Core Data Protection for round-tripping values through an untrusted client, and the one rule that governs everything else: never trust client state as authoritative.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/42-client-session-state.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `aspnet-core`

### Server Session State in Modern ASP.NET Core
- **Status:** `draft`
- **Scheduled:** 2029-06-03
- **Source:** `docs/article-ideas/43-server-session-state.md`
- **File:** `src/posts/2029-06-03-server-session-state.md`
- **Pitch:** Server Session State keeps session-specific data on the application side while the client carries only enough to identify the session - HttpContext.Session is the direct modern example. Covers why scale-out changes the design entirely, and the temptation, worth resisting, to store a live domain aggregate in session rather than just an identifier.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/43-server-session-state.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `aspnet-core`

### Database Session State in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-06-10
- **Source:** `docs/article-ideas/44-database-session-state.md`
- **File:** `src/posts/2029-06-10-database-session-state.md`
- **Pitch:** Database Session State stores conversational session data in a database - a specialized form of server-side session that makes it available to every application instance without sticky routing. Covers EF Core persistence for typed session records, cleanup jobs for expired rows, and the important boundary: session state supports a conversation, it shouldn't quietly become the system of record.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/44-database-session-state.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `data-access`

### Gateway in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-06-17
- **Source:** `docs/article-ideas/45-gateway.md`
- **File:** `src/posts/2029-06-17-gateway.md`
- **Pitch:** Gateway encapsulates access to an external system behind an object that presents a useful application-facing interface, so vendor terminology and transport details don't leak into application logic. Covers typed HttpClient integrations, translating vendor failures into application-relevant exceptions, and the difference between a real boundary and a wrapper that just renames SDK methods.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/45-gateway.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Service Stub in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-06-24
- **Source:** `docs/article-ideas/46-service-stub.md`
- **File:** `src/posts/2029-06-24-service-stub.md`
- **Pitch:** External services are often slow, unreliable, rate-limited, or hard to force into edge cases - Service Stub replaces them with a controllable implementation so tests get deterministic behavior instead. Covers hand-written stubs, HttpMessageHandler-level fakes, and the essential caveat: a stub proves your code, not that the real service still matches your assumptions.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/46-service-stub.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `testing`

### Record Set in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-07-01
- **Source:** `docs/article-ideas/47-record-set.md`
- **File:** `src/posts/2029-07-01-record-set.md`
- **Pitch:** Record Set is an in-memory representation of tabular data - rows and columns that closely resemble a relational result, rather than a graph of domain objects. Still genuinely useful for reporting, imports, exports, and dynamic administrative tooling, covering DataTable, typed read-model projections, and when a strongly typed object is the better fit instead.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/47-record-set.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `data-access`

### Mapper in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-07-08
- **Source:** `docs/article-ideas/48-mapper.md`
- **File:** `src/posts/2029-07-08-mapper.md`
- **Pitch:** Mapper moves data between two objects or subsystems that should remain independent - the important word is independent, since mapping is an architectural boundary, not just copying properties. Covers explicit mapping and extension methods, when a mapping library actually helps versus hides a meaningful semantic decision, and where mapping code should live.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/48-mapper.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Layer Supertype in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-07-15
- **Source:** `docs/article-ideas/49-layer-supertype.md`
- **File:** `src/posts/2029-07-15-layer-supertype.md`
- **Pitch:** Layer Supertype is a common superclass for every type in a layer, giving it one place for behavior every member genuinely shares - useful in modern .NET, but inheritance deserves more care here than older enterprise frameworks often gave it. Covers the fragile-base-class problem, and modern C# interfaces with default members as a more flexible alternative to a growing base class.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/49-layer-supertype.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Separated Interface in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-07-22
- **Source:** `docs/article-ideas/50-separated-interface.md`
- **File:** `src/posts/2029-07-22-separated-interface.md`
- **Pitch:** Separated Interface places an interface in a different package from its implementation - a simple move that can reverse the direction of a dependency entirely, and one of the ideas underneath most modern .NET architectures built around dependency inversion. Covers assembly structure, who should own the abstraction, and why an interface next to its only implementation doesn't actually invert anything.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/50-separated-interface.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Registry in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-07-29
- **Source:** `docs/article-ideas/51-registry.md`
- **File:** `src/posts/2029-07-29-registry.md`
- **Pitch:** Registry provides a well-known object other parts of an application use to find shared services - common in older enterprise applications, where modern .NET has a better default for most cases: dependency injection. Covers why hidden dependencies make classes harder to test and reuse, and the narrower cases - strategy catalogs, plugin lookups - where a registry still earns its place.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/51-registry.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Value Object in Modern C#
- **Status:** `draft`
- **Scheduled:** 2029-08-05
- **Source:** `docs/article-ideas/52-value-object.md`
- **File:** `src/posts/2029-08-05-value-object.md`
- **Pitch:** A Value Object is defined by its value rather than an identity - two coordinates with the same latitude and longitude represent the same value. Modern C# records and readonly record structs make this pattern genuinely expressive, covering strongly typed IDs, immutability, and why not every string needs a wrapper.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/52-value-object.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Money in Modern C# and .NET
- **Status:** `draft`
- **Scheduled:** 2029-08-12
- **Source:** `docs/article-ideas/53-money.md`
- **File:** `src/posts/2029-08-12-money.md`
- **Pitch:** A bare decimal for money answers 'how much' but not 'what currency' - Money makes that missing semantic explicit and defines safe rules for arithmetic, rounding, and allocation. Covers why currency mismatches should fail immediately, splitting an amount without losing pennies, and giving monetary precision explicit database scale rather than leaving it accidental.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/53-money.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Special Case in Modern C#
- **Status:** `draft`
- **Scheduled:** 2029-08-19
- **Source:** `docs/article-ideas/54-special-case.md`
- **File:** `src/posts/2029-08-19-special-case.md`
- **Pitch:** Special Case creates an object that represents an exceptional or unusual situation so callers can treat it like an ordinary object - instead of an `if (customer is null)` check scattered everywhere, a GuestCustomer that simply has zero-discount behavior. Covers Null Object as the most common form, modern discriminated-union-style result types, and why the pattern shouldn't be used to quietly hide real operational failures.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/54-special-case.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Plugin in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-08-26
- **Source:** `docs/article-ideas/55-plugin.md`
- **File:** `src/posts/2029-08-26-plugin.md`
- **Pitch:** Plugin links implementations to an application at configuration or runtime rather than hard-coding them into the core - the application defines a stable contract, and independent components implement it. Covers the simplest form via ordinary dependency injection through to AssemblyLoadContext-based discovery, and why in-process loading is never a substitute for a real security boundary.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/55-plugin.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it, and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `extensibility`

---

## 📅 Sunday Track - Modern Application Architecture Patterns in .NET (Volume 2) (September 2029-August 2030)

Forty-nine posts continuing the Modern Application Architecture Patterns in .NET series past Volume I's Fowler-catalog foundation - dependency injection, Clean/Hexagonal/Vertical Slice architecture, Domain-Driven Design building blocks, CQRS, messaging and event-driven patterns, distributed workflow coordination, resilience patterns, and architecture-at-scale concerns such as feature flags, health checks, rate limiting, and leader election. Runs weekly on Sundays immediately following Volume I as a standing series alongside the Tuesday .NET tracks. This is volume 2 of 3; volume 3 will extend the series once drafted into `docs/article-ideas/`. Note: articles 3 and 49 both cover "The Architecture Complexity Ladder" (the series' opening framework and its closing retrospective) - the source drafts share the same `architecture-complexity-ladder` slug, so article 49's destination file and URL use `architecture-complexity-ladder-revisited` to avoid colliding with article 3's published post.

### Modern .NET Architecture: What Changed After PoEAA?
- **Status:** `draft`
- **Scheduled:** 2029-09-02
- **Source:** `docs/article-ideas/01-modern-dotnet-architecture-after-poeaa.md`
- **File:** `src/posts/2029-09-02-modern-dotnet-architecture-after-poeaa.md`
- **Pitch:** Volume II begins where Patterns of Enterprise Application Architecture leaves off: the network, cloud, messaging, DDD, CQRS, resilience, and feature-oriented architecture changed the problems we routinely solve.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/01-modern-dotnet-architecture-after-poeaa.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Patterns, Principles, Styles, and Practices: Know What You're Choosing
- **Status:** `draft`
- **Scheduled:** 2029-09-09
- **Source:** `docs/article-ideas/02-patterns-principles-styles-practices.md`
- **File:** `src/posts/2029-09-09-patterns-principles-styles-practices.md`
- **Pitch:** Separate architectural styles, design patterns, principles, practices, and technologies so architecture discussions become about decisions rather than labels.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/02-patterns-principles-styles-practices.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### The Architecture Complexity Ladder
- **Status:** `draft`
- **Scheduled:** 2029-09-16
- **Source:** `docs/article-ideas/03-architecture-complexity-ladder.md`
- **File:** `src/posts/2029-09-16-architecture-complexity-ladder.md`
- **Pitch:** Learn when a .NET application has earned additional architecture, from straightforward CRUD through domain modeling, CQRS, messaging, and distributed workflows.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/03-architecture-complexity-ladder.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Modular Monolith or Microservices? Start With the Boundary
- **Status:** `draft`
- **Scheduled:** 2029-09-23
- **Source:** `docs/article-ideas/04-modular-monolith-or-microservices.md`
- **File:** `src/posts/2029-09-23-modular-monolith-or-microservices.md`
- **Pitch:** Choose deployment boundaries after identifying business boundaries, and understand why a modular monolith is often the strongest starting point for a modern .NET system.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/04-modular-monolith-or-microservices.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `microservices`

### Don't Start With Patterns: Start With Problems
- **Status:** `draft`
- **Scheduled:** 2029-09-30
- **Source:** `docs/article-ideas/05-start-with-problems-not-patterns.md`
- **File:** `src/posts/2029-09-30-start-with-problems-not-patterns.md`
- **Pitch:** Use forces, failure modes, and explicit trade-offs to decide whether a pattern belongs in a .NET architecture instead of applying patterns by reputation.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/05-start-with-problems-not-patterns.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Dependency Injection Beyond AddScoped
- **Status:** `draft`
- **Scheduled:** 2029-10-07
- **Source:** `docs/article-ideas/06-dependency-injection.md`
- **File:** `src/posts/2029-10-07-dependency-injection.md`
- **Pitch:** Use dependency injection as an architectural composition technique in modern .NET, with explicit dependencies, correct lifetimes, keyed services, factories, decorators, and a disciplined composition root.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/06-dependency-injection.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Clean Architecture in Modern .NET Without the Ceremony
- **Status:** `draft`
- **Scheduled:** 2029-10-14
- **Source:** `docs/article-ideas/07-clean-architecture.md`
- **File:** `src/posts/2029-10-14-clean-architecture.md`
- **Pitch:** Apply Clean Architecture's dependency rule in .NET without blindly copying layers, interfaces, repositories, and project templates that the application does not need.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/07-clean-architecture.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Hexagonal Architecture and Ports & Adapters in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-10-21
- **Source:** `docs/article-ideas/08-hexagonal-architecture-ports-adapters.md`
- **File:** `src/posts/2029-10-21-hexagonal-architecture-ports-adapters.md`
- **Pitch:** Design a .NET application around use-case ports and replaceable adapters so HTTP, databases, brokers, and external APIs remain outside the application core.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/08-hexagonal-architecture-ports-adapters.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Vertical Slice Architecture in Modern .NET
- **Status:** `draft`
- **Scheduled:** 2029-10-28
- **Source:** `docs/article-ideas/09-vertical-slice-architecture.md`
- **File:** `src/posts/2029-10-28-vertical-slice-architecture.md`
- **Pitch:** Organize modern .NET applications around features and use cases instead of technical layers, while keeping shared domain and infrastructure boundaries deliberate.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/09-vertical-slice-architecture.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Mediator in Modern .NET: Useful Boundary or Expensive Method Call?
- **Status:** `draft`
- **Scheduled:** 2029-11-04
- **Source:** `docs/article-ideas/10-mediator.md`
- **File:** `src/posts/2029-11-04-mediator.md`
- **Pitch:** Use mediator-style dispatch deliberately for command/query pipelines and cross-cutting behaviors, and recognize when direct method calls are the simpler .NET design.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/10-mediator.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Entity in Domain-Driven Design
- **Status:** `draft`
- **Scheduled:** 2029-11-11
- **Source:** `docs/article-ideas/11-entity-ddd.md`
- **File:** `src/posts/2029-11-11-entity-ddd.md`
- **Pitch:** Model domain concepts whose identity and continuity matter more than their current attribute values, while protecting invariants with ordinary modern C#.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/11-entity-ddd.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-driven-design`

### Aggregate and Aggregate Root: The Consistency Boundary
- **Status:** `draft`
- **Scheduled:** 2029-11-18
- **Source:** `docs/article-ideas/12-aggregate-aggregate-root.md`
- **File:** `src/posts/2029-11-18-aggregate-aggregate-root.md`
- **Pitch:** Design DDD aggregates around transactional consistency and business invariants instead of object graphs or database relationships.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/12-aggregate-aggregate-root.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-driven-design`

### Domain Service: Behavior That Doesn't Belong to an Entity
- **Status:** `draft`
- **Scheduled:** 2029-11-25
- **Source:** `docs/article-ideas/13-domain-service.md`
- **File:** `src/posts/2029-11-25-domain-service.md`
- **Pitch:** Model domain operations that require domain knowledge but do not naturally belong to one entity or value object, without turning services into an anemic-domain dumping ground.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/13-domain-service.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-driven-design`

### Domain Events: Making Business Consequences Explicit
- **Status:** `draft`
- **Scheduled:** 2029-12-02
- **Source:** `docs/article-ideas/14-domain-events.md`
- **File:** `src/posts/2029-12-02-domain-events.md`
- **Pitch:** Model meaningful facts that have already happened inside a bounded context, defer their dispatch safely, and distinguish domain events from durable integration messages.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/14-domain-events.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-driven-design`

### Specification: Giving Business Predicates a Name
- **Status:** `draft`
- **Scheduled:** 2029-12-09
- **Source:** `docs/article-ideas/15-specification.md`
- **File:** `src/posts/2029-12-09-specification.md`
- **Pitch:** Encapsulate reusable business predicates and composable selection rules without turning every LINQ expression into an abstraction or coupling the domain to persistence mechanics.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/15-specification.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-driven-design`

### Anti-Corruption Layer: Protecting Your Domain From Someone Else's Model
- **Status:** `draft`
- **Scheduled:** 2029-12-16
- **Source:** `docs/article-ideas/16-anti-corruption-layer.md`
- **File:** `src/posts/2029-12-16-anti-corruption-layer.md`
- **Pitch:** Protect a modern .NET domain from legacy systems, vendor APIs, and foreign bounded contexts by translating protocols, data, errors, and semantics at an explicit boundary.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/16-anti-corruption-layer.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-driven-design`

### Command: Modeling an Intent to Change the System
- **Status:** `draft`
- **Scheduled:** 2029-12-23
- **Source:** `docs/article-ideas/17-command.md`
- **File:** `src/posts/2029-12-23-command.md`
- **Pitch:** Model application requests as explicit business intentions, distinguish commands from events and CRUD updates, and design command handling around validation, invariants, transactions, and idempotency.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/17-command.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `cqrs`

### Query: Designing Reads for What the Caller Actually Needs
- **Status:** `draft`
- **Scheduled:** 2029-12-30
- **Source:** `docs/article-ideas/18-query.md`
- **File:** `src/posts/2029-12-30-query.md`
- **Pitch:** Design read operations independently from write-side domain models, project directly into caller-oriented DTOs, and optimize query paths without weakening domain invariants.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/18-query.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `cqrs`

### CQRS: Separate Reads and Writes Before You Separate Databases
- **Status:** `draft`
- **Scheduled:** 2030-01-06
- **Source:** `docs/article-ideas/19-cqrs.md`
- **File:** `src/posts/2030-01-06-cqrs.md`
- **Pitch:** Apply Command Query Responsibility Segregation incrementally in .NET, beginning with separate application models and progressing to independent stores only when scaling, consistency, or query needs justify the cost.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/19-cqrs.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `cqrs`

### Result Pattern: Making Expected Failure Explicit
- **Status:** `draft`
- **Scheduled:** 2030-01-13
- **Source:** `docs/article-ideas/20-result-pattern.md`
- **File:** `src/posts/2030-01-13-result-pattern.md`
- **Pitch:** Represent expected application outcomes explicitly in modern C#, distinguish business failure from exceptional failure, and map results cleanly to HTTP without replacing exceptions indiscriminately.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/20-result-pattern.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Idempotency: Making Retries Safe
- **Status:** `draft`
- **Scheduled:** 2030-01-20
- **Source:** `docs/article-ideas/21-idempotency.md`
- **File:** `src/posts/2030-01-20-idempotency.md`
- **Pitch:** Design HTTP commands and distributed operations so repeated delivery of the same logical request does not repeat harmful effects, using stable operation identity, atomic persistence, replayed responses, and careful expiration.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/21-idempotency.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `reliability`

### Publish/Subscribe: Decoupling Producers From Reactions
- **Status:** `draft`
- **Scheduled:** 2030-01-27
- **Source:** `docs/article-ideas/22-publish-subscribe.md`
- **File:** `src/posts/2030-01-27-publish-subscribe.md`
- **Pitch:** Use publish/subscribe to decouple producers from multiple independent consumers, and understand delivery, ordering, durability, and contract-versioning implications in modern .NET systems.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/22-publish-subscribe.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `messaging`

### Competing Consumers: Scaling Work Horizontally
- **Status:** `draft`
- **Scheduled:** 2030-02-03
- **Source:** `docs/article-ideas/23-competing-consumers.md`
- **File:** `src/posts/2030-02-03-competing-consumers.md`
- **Pitch:** Process queued work with multiple independent workers, while handling at-least-once delivery, ordering constraints, poison messages, concurrency, and partitioning in modern .NET.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/23-competing-consumers.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `messaging`

### Transactional Outbox: Making Database Changes and Events Reliable
- **Status:** `draft`
- **Scheduled:** 2030-02-10
- **Source:** `docs/article-ideas/24-transactional-outbox.md`
- **File:** `src/posts/2030-02-10-transactional-outbox.md`
- **Pitch:** Persist integration messages in the same local transaction as business state, then publish them asynchronously with at-least-once delivery and observable retry semantics.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/24-transactional-outbox.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `reliability`

### Inbox and Idempotent Consumer: Making Duplicate Messages Harmless
- **Status:** `draft`
- **Scheduled:** 2030-02-17
- **Source:** `docs/article-ideas/25-inbox-idempotent-consumer.md`
- **File:** `src/posts/2030-02-17-inbox-idempotent-consumer.md`
- **Pitch:** Detect and safely ignore duplicate message deliveries by persisting consumed message identity with business effects in one local transaction.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/25-inbox-idempotent-consumer.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `reliability`

### Dead Letter Queue: What To Do With Messages That Never Succeed
- **Status:** `draft`
- **Scheduled:** 2030-02-24
- **Source:** `docs/article-ideas/26-dead-letter-queue.md`
- **File:** `src/posts/2030-02-24-dead-letter-queue.md`
- **Pitch:** Quarantine permanently failing messages after bounded retries, preserve diagnostics and replayability, and avoid turning dead-letter queues into invisible data graveyards.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/26-dead-letter-queue.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `messaging`

### Queue-Based Load Leveling: Absorbing Bursts Without Crushing Dependencies
- **Status:** `draft`
- **Scheduled:** 2030-03-03
- **Source:** `docs/article-ideas/27-queue-based-load-leveling.md`
- **File:** `src/posts/2030-03-03-queue-based-load-leveling.md`
- **Pitch:** Use a queue as a buffer between bursty producers and capacity-limited consumers so work is smoothed over time and downstream systems remain stable.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/27-queue-based-load-leveling.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `messaging`

### Event Sourcing: Persisting Facts Instead of Current State
- **Status:** `draft`
- **Scheduled:** 2030-03-10
- **Source:** `docs/article-ideas/28-event-sourcing.md`
- **File:** `src/posts/2030-03-10-event-sourcing.md`
- **Pitch:** Persist domain changes as an append-only stream of events, rebuild state through replay, and understand projections, snapshots, schema evolution, concurrency, and why most systems should not adopt Event Sourcing casually.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/28-event-sourcing.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `event-sourcing`

### Saga: Coordinating a Business Transaction Across Services
- **Status:** `draft`
- **Scheduled:** 2030-03-17
- **Source:** `docs/article-ideas/29-saga.md`
- **File:** `src/posts/2030-03-17-saga.md`
- **Pitch:** Coordinate long-running business workflows across independently committed services using choreography or orchestration, explicit state, idempotency, timeouts, and compensating actions.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/29-saga.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `distributed-systems`

### Compensating Transaction: Undoing Business Effects Without Rewinding Time
- **Status:** `draft`
- **Scheduled:** 2030-03-24
- **Source:** `docs/article-ideas/30-compensating-transaction.md`
- **File:** `src/posts/2030-03-24-compensating-transaction.md`
- **Pitch:** Design semantic undo operations for distributed workflows where committed steps cannot be atomically rolled back, including irreversible effects, compensation ordering, idempotency, and manual recovery.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/30-compensating-transaction.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `distributed-systems`

### Backend for Frontend: APIs Shaped Around Client Needs
- **Status:** `draft`
- **Scheduled:** 2030-03-31
- **Source:** `docs/article-ideas/31-backend-for-frontend.md`
- **File:** `src/posts/2030-03-31-backend-for-frontend.md`
- **Pitch:** Give materially different client experiences their own backend boundary for aggregation, orchestration, security, and client-specific contracts without duplicating core business logic.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/31-backend-for-frontend.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `api-design`

### API Gateway: A Deliberate Edge for Distributed APIs
- **Status:** `draft`
- **Scheduled:** 2030-04-07
- **Source:** `docs/article-ideas/32-api-gateway.md`
- **File:** `src/posts/2030-04-07-api-gateway.md`
- **Pitch:** Use an API Gateway as a shared edge for routing, authentication, rate limiting, policy, and selective aggregation while avoiding a centralized business-logic bottleneck.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/32-api-gateway.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `api-design`

### Retry: Recovering From Transient Failure Without Making Things Worse
- **Status:** `draft`
- **Scheduled:** 2030-04-14
- **Source:** `docs/article-ideas/33-retry.md`
- **File:** `src/posts/2030-04-14-retry.md`
- **Pitch:** Use bounded retries for genuinely transient failures, with backoff, jitter, idempotency, retry budgets, cancellation, and careful placement in modern .NET applications.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/33-retry.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `resilience`

### Circuit Breaker: Stop Calling a Dependency That Is Already Failing
- **Status:** `draft`
- **Scheduled:** 2030-04-21
- **Source:** `docs/article-ideas/34-circuit-breaker.md`
- **File:** `src/posts/2030-04-21-circuit-breaker.md`
- **Pitch:** Fail fast when a dependency is persistently unhealthy, allowing recovery while preventing cascading latency, retry storms, and resource exhaustion.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/34-circuit-breaker.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `resilience`

### Bulkhead: Preventing One Failure From Consuming Everything
- **Status:** `draft`
- **Scheduled:** 2030-04-28
- **Source:** `docs/article-ideas/35-bulkhead.md`
- **File:** `src/posts/2030-04-28-bulkhead.md`
- **Pitch:** Partition concurrency and resources so overload or failure in one dependency or workload cannot exhaust the entire application.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/35-bulkhead.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `resilience`

### Cache-Aside: Faster Reads Without Pretending Caches Are Simple
- **Status:** `draft`
- **Scheduled:** 2030-05-05
- **Source:** `docs/article-ideas/36-cache-aside.md`
- **File:** `src/posts/2030-05-05-cache-aside.md`
- **Pitch:** Load frequently read data into a cache on demand while explicitly handling misses, invalidation, staleness, stampedes, expiration, and multi-instance behavior.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/36-cache-aside.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `caching`

### Modular Monolith: Strong Boundaries Without a Distributed System
- **Status:** `draft`
- **Scheduled:** 2030-05-12
- **Source:** `docs/article-ideas/37-modular-monolith.md`
- **File:** `src/posts/2030-05-12-modular-monolith.md`
- **Pitch:** A modular monolith keeps one deployable application while dividing it into explicit business modules with controlled dependencies.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/37-modular-monolith.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `microservices`

### Strangler Fig: Modernizing Systems Without the Big-Bang Rewrite
- **Status:** `draft`
- **Scheduled:** 2030-05-19
- **Source:** `docs/article-ideas/38-strangler-fig.md`
- **File:** `src/posts/2030-05-19-strangler-fig.md`
- **Pitch:** The Strangler Fig pattern replaces an existing system incrementally.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/38-strangler-fig.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `microservices`

### Feature Flags: Separating Deployment From Release
- **Status:** `draft`
- **Scheduled:** 2030-05-26
- **Source:** `docs/article-ideas/39-feature-flags.md`
- **File:** `src/posts/2030-05-26-feature-flags.md`
- **Pitch:** A feature flag lets deployed code exist without making the behavior available to everyone.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/39-feature-flags.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

### Health Checks: Liveness, Readiness, and Knowing What 'Healthy' Means
- **Status:** `draft`
- **Scheduled:** 2030-06-02
- **Source:** `docs/article-ideas/40-health-checks.md`
- **File:** `src/posts/2030-06-02-health-checks.md`
- **Pitch:** A health endpoint answers an operational question about a running application.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/40-health-checks.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `observability`

### Rate Limiting: Protecting Capacity and Fairness at the Boundary
- **Status:** `draft`
- **Scheduled:** 2030-06-09
- **Source:** `docs/article-ideas/41-rate-limiting.md`
- **File:** `src/posts/2030-06-09-rate-limiting.md`
- **Pitch:** Rate limiting controls how much work a caller may introduce over time.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/41-rate-limiting.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `resilience`

### Timeouts and Deadline Propagation: Giving Distributed Work a Time Budget
- **Status:** `draft`
- **Scheduled:** 2030-06-16
- **Source:** `docs/article-ideas/42-timeouts-deadlines.md`
- **File:** `src/posts/2030-06-16-timeouts-deadlines.md`
- **Pitch:** Every remote call can wait forever unless something decides otherwise.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/42-timeouts-deadlines.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `resilience`

### Optimistic Concurrency: Detecting Conflicting Changes Without Holding Locks
- **Status:** `draft`
- **Scheduled:** 2030-06-23
- **Source:** `docs/article-ideas/43-optimistic-concurrency.md`
- **File:** `src/posts/2030-06-23-optimistic-concurrency.md`
- **Pitch:** Optimistic concurrency assumes conflicts are uncommon enough that work can proceed without holding a long-lived lock.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/43-optimistic-concurrency.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `concurrency`

### Distributed Lock and Lease: Coordinating Exclusive Work Across Processes
- **Status:** `draft`
- **Scheduled:** 2030-06-30
- **Source:** `docs/article-ideas/44-distributed-lock-lease.md`
- **File:** `src/posts/2030-06-30-distributed-lock-lease.md`
- **Pitch:** Sometimes multiple processes must coordinate so that only one performs a piece of work at a time.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/44-distributed-lock-lease.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `concurrency`

### Leader Election: Choosing One Active Coordinator
- **Status:** `draft`
- **Scheduled:** 2030-07-07
- **Source:** `docs/article-ideas/45-leader-election.md`
- **File:** `src/posts/2030-07-07-leader-election.md`
- **Pitch:** Some workloads need many application instances for availability but exactly one active coordinator for a particular responsibility.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/45-leader-election.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `distributed-systems`

### Observability Context Propagation: Following One Operation Across the System
- **Status:** `draft`
- **Scheduled:** 2030-07-14
- **Source:** `docs/article-ideas/46-observability-context-propagation.md`
- **File:** `src/posts/2030-07-14-observability-context-propagation.md`
- **Pitch:** A distributed operation may cross:
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/46-observability-context-propagation.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `observability`

### Consumer-Driven Contract Testing: Catching Integration Breakage Before Deployment
- **Status:** `draft`
- **Scheduled:** 2030-07-21
- **Source:** `docs/article-ideas/47-consumer-driven-contract-testing.md`
- **File:** `src/posts/2030-07-21-consumer-driven-contract-testing.md`
- **Pitch:** Independent deployment creates a dangerous possibility:
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/47-consumer-driven-contract-testing.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `testing`

### Sidecar: Moving Cross-Cutting Runtime Capabilities Beside the Application
- **Status:** `draft`
- **Scheduled:** 2030-07-28
- **Source:** `docs/article-ideas/48-sidecar.md`
- **File:** `src/posts/2030-07-28-sidecar.md`
- **Pitch:** A Sidecar runs a supporting process beside an application instance.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/48-sidecar.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `microservices`

### The Architecture Complexity Ladder: Knowing When Not to Use a Pattern
- **Status:** `draft`
- **Scheduled:** 2030-08-04
- **Source:** `docs/article-ideas/49-architecture-complexity-ladder.md`
- **File:** `src/posts/2030-08-04-architecture-complexity-ladder-revisited.md`
- **Pitch:** We have spent two volumes learning patterns.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/49-architecture-complexity-ladder.md` - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body where present (articles 37 onward in this volume do not open with a duplicate H1), and source em-dash formatting artifacts (literal `---` mid-sentence, which this site's markdown pipeline doesn't convert to a typographic dash) fixed to the house ` - ` convention. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

---

## 📅 Sunday Track - Modern Application Architecture Patterns in .NET (Volume 3) (August 2030-March 2031)

Thirty posts continuing the Modern Application Architecture Patterns in .NET series as a single runnable narrative: the Northstar Architecture Lab, a small ASP.NET Core + EF Core + SQLite commerce application that evolves stage by stage from a plain transaction script through Domain Model, CQRS, Domain Events, Transactional Outbox, Inbox/Idempotent Consumer, an asynchronous Saga over RabbitMQ, resilience and observability, load/capacity controls, Cache-Aside, Optimistic Concurrency, progressive delivery, a deliberate step back down to a Modular Monolith, a Strangler Fig migration, Consumer-Driven Contract Testing, a Sidecar, and a closing retrospective on the Architecture Complexity Ladder. Each article ships with a real, runnable companion download built from the source codebase's own natural solution boundaries (six archives total: the evolving baseline app for articles 1-13, the distributed lab for articles 14-24, and one archive each for the modular monolith, modernization, contract testing, and sidecar stages) - see the new `companion_download` front matter and the "Companion Source Code" section `post.njk` now renders when it's set. Runs weekly on Sundays immediately following Volume II as a standing series alongside the Tuesday .NET tracks. This is volume 3 of 3, closing out the series; the source package's own docs still label these articles `volume: 2` in their frontmatter (an earlier working title carried over from before Volume II shipped) - the site publishes them as Volume III per the intended publication order. Article 0's opening line similarly referenced "Volume II" in prose and was corrected to "Volume III" for the same reason. The finale article also folds in the lab's three closing exercises (`finale/exercises/01-choose-the-next-step.md` through `03-design-your-own-northstar.md`) as its own "Exercises" section rather than publishing them as separate posts.

### Architecture Lab: Northstar Commerce
- **Status:** `draft`
- **Scheduled:** 2030-08-11
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/00-architecture-lab-introduction.md`)
- **File:** `src/posts/2030-08-11-architecture-lab-introduction.md`
- **Pitch:** Introducing the Northstar Architecture Lab: a small ASP.NET Core + EF Core + SQLite commerce app that earns every pattern in this series the same way a real system would - one concrete pressure at a time.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/00-architecture-lab-introduction.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 1: When Transaction Script Starts to Hurt
- **Status:** `draft`
- **Scheduled:** 2030-08-18
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/01-when-transaction-script-starts-to-hurt.md`)
- **File:** `src/posts/2030-08-18-when-transaction-script-starts-to-hurt.md`
- **Pitch:** Northstar's transaction scripts start duplicating business rules across PlaceOrder, CancelOrder, and ChangeOrderQuantity - the first real pressure toward a richer domain model.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/01-when-transaction-script-starts-to-hurt.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 2: The Domain Model Earns Its Keep
- **Status:** `draft`
- **Scheduled:** 2030-08-25
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/02-domain-model-earned.md`)
- **File:** `src/posts/2030-08-25-domain-model-earned.md`
- **Pitch:** The Order becomes an Aggregate Root, Money becomes a real value, and pricing gets a name - Northstar's Domain Model arrives only once the transaction scripts can no longer coherently own the rules.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/02-domain-model-earned.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-driven-design`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 3: When the Write Model Becomes the Wrong Read Model
- **Status:** `draft`
- **Scheduled:** 2030-09-01
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/03-read-model-pressure.md`)
- **File:** `src/posts/2030-09-01-read-model-pressure.md`
- **Pitch:** An approval dashboard and an operations list expose the cost of reading through a rich aggregate: correct, but increasingly the wrong shape for questions the domain model was never built to answer.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/03-read-model-pressure.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `cqrs`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 4: CQRS Without the Circus
- **Status:** `draft`
- **Scheduled:** 2030-09-08
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/04-cqrs-without-the-circus.md`)
- **File:** `src/posts/2030-09-08-cqrs-without-the-circus.md`
- **Pitch:** Northstar gets CQRS with no second database, no broker, and no event sourcing - just dedicated query handlers projecting directly from the same store the domain model already writes to.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/04-cqrs-without-the-circus.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `cqrs`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 5: When One Successful Command Creates Too Many Reactions
- **Status:** `draft`
- **Scheduled:** 2030-09-15
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/05-reaction-pressure.md`)
- **File:** `src/posts/2030-09-15-reaction-pressure.md`
- **Pitch:** Confirmation email, loyalty points, fulfillment work, and analytics all pile into PlaceOrder - the command has quietly become the registry of everyone who cares that an order was placed.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/05-reaction-pressure.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-driven-design`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 6: Domain Events Separate Facts From Reactions
- **Status:** `draft`
- **Scheduled:** 2030-09-22
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/06-domain-events-earned.md`)
- **File:** `src/posts/2030-09-22-domain-events-earned.md`
- **Pitch:** The Order aggregate now simply records that OrderPlaced happened; application handlers react independently, and PlaceOrder stops being a registry of everyone who cares.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/06-domain-events-earned.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `domain-driven-design`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 7: When a Domain Event Needs a Delivery Guarantee
- **Status:** `draft`
- **Scheduled:** 2030-09-29
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/07-integration-event-pressure.md`)
- **File:** `src/posts/2030-09-29-integration-event-pressure.md`
- **Pitch:** Fulfillment needs to hear about every placed order reliably, not just conveniently - and a naive publish-after-commit step reveals exactly why an in-process domain event isn't a delivery guarantee.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/07-integration-event-pressure.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `messaging`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 8: Transactional Outbox Makes the Integration Event Durable
- **Status:** `draft`
- **Scheduled:** 2030-10-06
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/08-transactional-outbox-earned.md`)
- **File:** `src/posts/2030-10-06-transactional-outbox-earned.md`
- **Pitch:** The Order row and the Outbox row now commit together in one local transaction, and a separate dispatcher owns the remote publish - Northstar trades a hole in the workflow for an honest at-least-once guarantee.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/08-transactional-outbox-earned.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `reliability`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 9: At-Least-Once Delivery Means Duplicate Effects Are Your Problem
- **Status:** `draft`
- **Scheduled:** 2030-10-13
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/09-duplicate-delivery-pressure.md`)
- **File:** `src/posts/2030-10-13-duplicate-delivery-pressure.md`
- **Pitch:** Sending the same integration event twice produces two Fulfillment work records - proof that once delivery is at-least-once, the consumer, not the publisher, owns the duplicate-effect problem.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/09-duplicate-delivery-pressure.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `messaging`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 10: Inbox Makes Duplicate Delivery Harmless
- **Status:** `draft`
- **Scheduled:** 2030-10-20
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/10-inbox-idempotent-consumer-earned.md`)
- **File:** `src/posts/2030-10-20-inbox-idempotent-consumer-earned.md`
- **Pitch:** An Inbox marker and the resulting Fulfillment work now commit together under one unique key - the same duplicate delivery that created two work items before now produces exactly one.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/10-inbox-idempotent-consumer-earned.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `reliability`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 11: When One Business Operation Stops Being One Transaction
- **Status:** `draft`
- **Scheduled:** 2030-10-27
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/11-distributed-workflow-pressure.md`)
- **File:** `src/posts/2030-10-27-distributed-workflow-pressure.md`
- **Pitch:** Checkout now spans Order, Inventory, and Payment as three independently committed responsibilities - when Payment declines after Inventory has already reserved stock, there is no local transaction left to roll back.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/11-distributed-workflow-pressure.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `distributed-systems`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 12: Saga Makes Distributed Workflow State Explicit
- **Status:** `draft`
- **Scheduled:** 2030-11-03
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/12-saga-earned.md`)
- **File:** `src/posts/2030-11-03-saga-earned.md`
- **Pitch:** A durable CheckoutSaga now remembers exactly where a workflow stands and treats a Payment decline as a business action - releasing inventory - rather than a rollback that no longer exists.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`docs/12-saga-earned.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-baseline.zip` (built from the source package's own root `src`/`tests` folders) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `distributed-systems`
- **Companion download:** `src/downloads/northstar-baseline.zip`

### Lab 13: The Saga Crosses the Network
- **Status:** `draft`
- **Scheduled:** 2030-11-10
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/13-async-saga-rabbitmq.md`)
- **File:** `src/posts/2030-11-10-async-saga-rabbitmq.md`
- **Pitch:** The same Saga state machine crosses RabbitMQ: Ordering now emits commands and waits for facts, and stopping a worker mid-checkout proves the workflow survives outages a synchronous coordinator never could.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/13-async-saga-rabbitmq.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `messaging`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 14: Reliability Repeats at Every Transaction Boundary
- **Status:** `draft`
- **Scheduled:** 2030-11-17
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/14-reliable-saga-participants.md`)
- **File:** `src/posts/2030-11-17-reliable-saga-participants.md`
- **Pitch:** Inventory and Payments each get their own Inbox, business effect, and reply Outbox committed together - the same reliability rule Ordering learned earlier turns out to repeat at every local transaction boundary.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/14-reliable-saga-participants.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `reliability`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 15: Correct but Unhealthy
- **Status:** `draft`
- **Scheduled:** 2030-11-24
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/15-operational-pressure.md`)
- **File:** `src/posts/2030-11-24-operational-pressure.md`
- **Pitch:** Northstar can now survive duplicate delivery and broker interruptions without corrupting state - and then Payment gets slow, proving that correctness and health are not the same question.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/15-operational-pressure.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `observability`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 16: Resilience Is Observable Policy
- **Status:** `draft`
- **Scheduled:** 2030-12-01
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/16-resilience-observability.md`)
- **File:** `src/posts/2030-12-01-resilience-observability.md`
- **Pitch:** Bounded retry with jitter, timeouts, a circuit breaker, and OpenTelemetry traces turn Northstar's resilience from folklore into an observable, testable policy - stop Payment, watch the circuit open, then watch it recover.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/16-resilience-observability.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `resilience`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 17: Dead Lettering Stops Poison Work From Owning the Queue
- **Status:** `draft`
- **Scheduled:** 2030-12-08
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/17-dead-letter-recovery.md`)
- **File:** `src/posts/2030-12-08-dead-letter-recovery.md`
- **Pitch:** Each queue now gets a dead-letter exchange so a permanently failing message stops competing with healthy work - quarantined, not lost, and safe to replay because the consumer is already idempotent.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/17-dead-letter-recovery.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `messaging`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 18: Load Is an Architectural Force
- **Status:** `draft`
- **Scheduled:** 2030-12-15
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/18-load-and-capacity.md`)
- **File:** `src/posts/2030-12-15-load-and-capacity.md`
- **Pitch:** Queue-based load leveling, competing consumers, a bounded Payment bulkhead, and rate limiting turn capacity from an infrastructure sizing afterthought into an explicit part of Northstar's application behavior.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/18-load-and-capacity.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `resilience`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 19: When the Read Side Becomes Expensive
- **Status:** `draft`
- **Scheduled:** 2030-12-22
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/19-read-performance-pressure.md`)
- **File:** `src/posts/2030-12-22-read-performance-pressure.md`
- **Pitch:** Running hammer-dashboard.ps1 200 times reveals the real problem: the operations dashboard's data changes far less often than it's requested, which is exactly the trade caching exists to make.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/19-read-performance-pressure.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `caching`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 20: Cache-Aside Is a Consistency Trade
- **Status:** `draft`
- **Scheduled:** 2030-12-29
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/20-cache-aside-earned.md`)
- **File:** `src/posts/2030-12-29-cache-aside-earned.md`
- **Pitch:** A five-second TTL, request-coalescing against cache-stampede, and an explicit invalidation endpoint make Northstar's Cache-Aside an honest, bounded staleness trade rather than a vague promise of speed.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/20-cache-aside-earned.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `caching`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 21: Optimistic Concurrency Protects Intent
- **Status:** `draft`
- **Scheduled:** 2031-01-05
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/21-optimistic-concurrency.md`)
- **File:** `src/posts/2031-01-05-optimistic-concurrency.md`
- **Pitch:** CheckoutSaga now carries a version, and an operator action built against a stale version is refused rather than silently overwriting newer state - detection at commit, not a lock held for the length of a decision.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/21-optimistic-concurrency.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `concurrency`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 22: Safe Change Needs Runtime Controls
- **Status:** `draft`
- **Scheduled:** 2031-01-12
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/22-progressive-delivery-health.md`)
- **File:** `src/posts/2031-01-12-progressive-delivery-health.md`
- **Pitch:** A disabled feature flag separates deploying the new checkout flow from releasing it, while distinct liveness and readiness endpoints stop Northstar from conflating three very different operational questions.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/22-progressive-delivery-health.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `observability`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 23: Did These Boundaries Need to Be Services?
- **Status:** `draft`
- **Scheduled:** 2031-01-19
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/23-modular-monolith-pressure.md`)
- **File:** `src/posts/2031-01-19-modular-monolith-pressure.md`
- **Pitch:** Before changing any code, Northstar asks a harder question of Inventory, Payments, and Fulfillment: which of these boundaries need independent deployment badly enough to keep paying for distributed failure?
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`distributed/docs/23-modular-monolith-pressure.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-distributed.zip` (built from the source package's own `distributed` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `microservices`
- **Companion download:** `src/downloads/northstar-distributed.zip`

### Lab 24: Moving Down the Complexity Ladder
- **Status:** `draft`
- **Scheduled:** 2031-01-26
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`modular-monolith/docs/24-modular-monolith.md`)
- **File:** `src/posts/2031-01-26-modular-monolith.md`
- **Pitch:** Northstar collapses Ordering, Inventory, and Fulfillment back into one deployable host while keeping their module contracts intact - removing the broker, the Inbox, and the Outbox without erasing the boundary.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`modular-monolith/docs/24-modular-monolith.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-modular-monolith.zip` (built from the source package's own `modular-monolith` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `microservices`
- **Companion download:** `src/downloads/northstar-modular-monolith.zip`

### Lab 25: Modernization Is a Migration Problem
- **Status:** `draft`
- **Scheduled:** 2031-02-02
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`modernization/docs/25-strangler-pressure.md`)
- **File:** `src/posts/2031-02-02-strangler-pressure.md`
- **Pitch:** A legacy Shipping capability full of unknown client dependencies gets a routing boundary in front of it - at first sending 100% of traffic to Legacy, but planting the seed a Strangler Fig migration needs.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`modernization/docs/25-strangler-pressure.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-modernization.zip` (built from the source package's own `modernization` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `microservices`
- **Companion download:** `src/downloads/northstar-modernization.zip`

### Lab 26: Strangler Fig Moves One Capability at a Time
- **Status:** `draft`
- **Scheduled:** 2031-02-09
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`modernization/docs/26-strangler-fig.md`)
- **File:** `src/posts/2031-02-09-strangler-fig.md`
- **Pitch:** The routing boundary starts sending shipping status to a new Fulfillment module behind an Anti-Corruption Layer, translating legacy status codes into Northstar's own language while keeping the old path one toggle away.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`modernization/docs/26-strangler-fig.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-modernization.zip` (built from the source package's own `modernization` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `microservices`
- **Companion download:** `src/downloads/northstar-modernization.zip`

### Lab 27: Contract Tests Catch Boundary Breakage Early
- **Status:** `draft`
- **Scheduled:** 2031-02-16
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`contracts/docs/27-contract-testing.md`)
- **File:** `src/posts/2031-02-16-contract-testing.md`
- **Pitch:** A consumer-driven contract now records exactly what the Shipping/Fulfillment consumer depends on - nothing about internal legacy fields or provider implementation - so independent deploys stop meeting each other for the first time in production.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`contracts/docs/27-contract-testing.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-contracts.zip` (built from the source package's own `contracts` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `testing`
- **Companion download:** `src/downloads/northstar-contracts.zip`

### Lab 28: Sidecar Moves Runtime Capability Beside the App
- **Status:** `draft`
- **Scheduled:** 2031-02-23
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`sidecar/docs/28-sidecar.md`)
- **File:** `src/posts/2031-02-23-sidecar.md`
- **Pitch:** A small telemetry/proxy sidecar runs beside Northstar rather than inside it - and stopping the sidecar on purpose proves the app degrades gracefully instead of treating optional infrastructure as a hard dependency.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`sidecar/docs/28-sidecar.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. `companion_download`/`companion_download_label` front matter added, pointing at `src/downloads/northstar-sidecar.zip` (built from the source package's own `sidecar` solution folder, docs excluded) so `post.njk` renders a "Companion Source Code" download section. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `microservices`
- **Companion download:** `src/downloads/northstar-sidecar.zip`

### Lab 29: The Architecture Complexity Ladder
- **Status:** `draft`
- **Scheduled:** 2031-03-02
- **Source:** `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`finale/docs/29-architecture-complexity-ladder.md`)
- **File:** `src/posts/2031-03-02-architecture-complexity-ladder-lab-retrospective.md`
- **Pitch:** Northstar's full stage map, its complexity budget, and the closing lesson of the lab: the best architecture is not the one with the most patterns, but the least complicated one that responsibly handles the forces the system actually faces.
- **Angle:** Adapted from the fully-drafted source at `docs/article-ideas/northstar-architecture-lab-v30-complexity-ladder-finale.zip` (`finale/docs/29-architecture-complexity-ladder.md`) - frontmatter converted to house style (author/date/image/image_alt/image_prompt/layout/site_title/summary/tags/title), duplicate H1 title stripped from the body since the hero already renders it. No companion download - this is the closing retrospective with no code of its own; the lab's three closing exercises are folded into the post body instead. Pattern content, C# examples, and structure are otherwise unchanged from the original draft.
- **Tags:** `dotnet`, `architecture`, `design-patterns`, `software-design`

---

## 📅 November-December 2026 - AI Agents in Practice

Eight posts on building, deploying, and operating AI agents in production. Foundation for the Azure/AWS/GCP AI tracks that follow.

### AI Agents: From Toy Demos to Production (Part 1 - When to Build an Agent vs. a Simple LLM Call)
- **Status:** `draft`
- **Scheduled:** 2026-11-06
- **File:** `src/posts/2026-11-06-ai-agents-production-part-1-when-to-build.md`
- **Pitch:** Not every problem needs an agent - agents add complexity (tool calling, planning loops, error handling). This post builds mental models for when agents actually win.
- **Angle:** Contrasts simple LLM chains (prompt + response) against agents (plan + tool use + reflection). Shows cost and latency implications of planning loops vs. direct prompts. Covers five real scenarios: customer support (good for agents), personalization (simpler), code generation (hybrid), research (agents shine), and data extraction (probably not). Includes decision tree you can use with your team.
- **Tags:** `ai-agents`, `llm`, `system-design`, `production-ai`

### Building Reliable Agent Loops: Tool Calling, Retries, and Failure Handling at Scale
- **Status:** `draft`
- **Scheduled:** 2026-11-13
- **File:** `src/posts/2026-11-13-agent-loops-reliability-tool-calling.md`
- **Pitch:** Agent loops (observe → act → reflect) fail in production when tool calls error out, LLMs hallucinate function arguments, or loops run forever. This post shows production-grade patterns.
- **Angle:** Covers tool calling contracts (function schemas, parameter validation), retry strategies (exponential backoff for transient failures vs. fast-fail for logic errors), and loop termination (token budgets, step limits, semantic stopping conditions). Implements a real example: an agent that queries a database, interprets results, and adapts its strategy. Includes observability: what to log at each step, how to debug "why did the agent choose that tool?".
- **Tags:** `ai-agents`, `llm`, `reliability`, `observability`

### Memory in AI Agents: Conversation History, Retrieval, and Context Window Trade-offs
- **Status:** `draft`
- **Scheduled:** 2026-11-20
- **File:** `src/posts/2026-11-20-ai-agent-memory-context-retrieval.md`
- **Pitch:** Agents forget everything between requests unless you give them memory - but naive approaches (storing everything) blow your context window budget and increase latency and cost.
- **Angle:** Compares memory approaches: short-term (conversation history), long-term (vector database with semantic search), and hybrid (recent history + relevant summaries). Shows the token cost of each approach. Builds a real example: a support agent that remembers customer history across sessions, but only brings relevant facts into each prompt. Covers edge cases: how long to keep short-term history, when to summarize, how to handle conflicting memories.
- **Tags:** `ai-agents`, `llm`, `memory`, `rag`, `retrieval`

### Multi-Agent Coordination: When One Agent Isn't Enough
- **Status:** `draft`
- **Scheduled:** 2026-11-27
- **File:** `src/posts/2026-11-27-multi-agent-coordination-patterns.md`
- **Pitch:** Single agents solve point problems; multi-agent systems handle complexity (specialized agents, parallel work, debate-style decisions). But coordination gets hard fast.
- **Angle:** Covers orchestration patterns: sequential (agent A → agent B → agent C), hierarchical (manager agent delegates to workers), and consensus (multiple agents vote/debate). Builds a real example: a system where one agent researches options, another evaluates cost, another checks compliance - then a manager synthesizes recommendations. Covers failure modes: agents contradicting each other, deadlock, and runaway loops. Includes observability for multi-agent traces.
- **Tags:** `ai-agents`, `multi-agent`, `orchestration`, `llm`

### Evaluating Agent Outputs: When You Can't Trust the LLM's Self-Assessment
- **Status:** `draft`
- **Scheduled:** 2026-12-04
- **File:** `src/posts/2026-12-04-evaluating-agent-outputs-grading-llm-work.md`
- **Pitch:** Agents complete tasks, but "did it actually work?" is hard to check without human review. This post shows how to automate quality gates for agent outputs.
- **Angle:** Covers multiple evaluation approaches: deterministic checks (does the output match schema?), LLM grading (ask another model to evaluate), and hybrid (LLM grade + human spot-check). Shows how to build datasets for measuring agent quality over time (RAGAS, custom metrics). Practical: integrating evaluations into CI/CD so you catch regressions when you update prompts or models.
- **Tags:** `ai-agents`, `evaluation`, `quality-assurance`, `llm`

### Prompt Engineering for Agents: Instruction Design That Survives Model Updates
- **Status:** `draft`
- **Scheduled:** 2026-12-11
- **File:** `src/posts/2026-12-11-prompt-engineering-agents-system-design.md`
- **Pitch:** Agents are more sensitive to prompt quality than simple LLM calls because errors compound across steps. This post shows how to write agent prompts that are robust and maintainable.
- **Angle:** Covers prompt components: role/persona (establishes tone), constraints (what the agent can't do), tools description (precise function specs), and reasoning format (Chain-of-Thought for planning). Shows versioning strategies (date your prompts, A/B test before deploy), testing patterns (golden dataset of inputs/expected outputs), and debugging (what to log when agents fail). Includes the "why did this prompt suddenly break?" troubleshooting guide when models get updated.
- **Tags:** `ai-agents`, `prompt-engineering`, `system-design`, `llm`

### Streaming Agent Outputs: Real-Time Feedback Without Hallucinating Progress
- **Status:** `draft`
- **Scheduled:** 2026-12-18
- **File:** `src/posts/2026-12-18-streaming-agents-real-time-output.md`
- **Pitch:** Users hate waiting for agents to think - streaming agent thoughts/actions gives feedback, but you have to be careful not to stream hallucinations as truth.
- **Angle:** Shows how to stream token-by-token output while an agent runs tools (research progress, queries executed). Covers the UI challenge: showing "agent is thinking" vs. "agent took action" vs. "agent found result". Implements a React component that displays agent steps in real-time. Addresses the gotcha: when an agent corrects itself mid-stream, how to handle user confusion.
- **Tags:** `ai-agents`, `streaming`, `ux`, `real-time`, `llm`

### Agent Cost Analysis: Why Your Support Bot Costs $0.50/Conversation (And How to Fix It)
- **Status:** `draft`
- **Scheduled:** 2026-12-25
- **File:** `src/posts/2026-12-25-agent-cost-analysis-optimization.md`
- **Pitch:** Agents planning, reflecting, and retrying can ring up token bills fast - this post shows where costs come from and how to profile and optimize.
- **Angle:** Breaks down agent costs: LLM calls (prompt + completion tokens per step), tool calls (API latency = higher token cost if you're charged per-request), retrieval (embedding calls + vector store queries), and overhead (retries, failed loops). Builds a cost profiler that attributes every token to a step. Shows concrete optimizations: caching tool results, batch embedding, early termination. Includes a template for "max cost per conversation" guardrails that prevent runaway agents.
- **Tags:** `ai-agents`, `cost-optimization`, `llm`, `performance`

---

## 📅 January-February 2027 - Open

Eight posts to kick off the year with foundational multi-cloud patterns and cost optimization strategies.

### AWS Lambda in 2027: Container Images, Performance Insights, and the $0.20/Million Invocation Reality
- **Status:** `draft`
- **Scheduled:** 2027-01-07
- **File:** `src/posts/2027-01-07-aws-lambda-in-2027-container-images-performance-cost.md`
- **Pitch:** Lambda dominates serverless, but most teams leave performance and cost on the table by not understanding the container image layer, initialization times, and the often-hidden scaling costs at high volume.
- **Angle:** Deep dive into Lambda's modern runtime (container images, SnapStart for Java, provisioned concurrency trade-offs), profiling cold-start times per language, right-sizing memory for CPU scaling, and a cost model showing when Lambda stops making sense vs. ECS/EC2. Practical: comparing a Dockerfile-based function vs. a minimal ZIP deployment.
- **Tags:** `aws`, `serverless`, `cost-optimization`, `lambda`, `devops`

### Google Cloud Run: From Container to Production Without Thinking About Infrastructure
- **Status:** `idea`
- **Scheduled:** 2027-01-14
- **Pitch:** Cloud Run abstracts away infrastructure completely - you push a container, get a URL, it scales - but the simplicity hides knobs you'll wish you'd found sooner (concurrency, max instances, request timeouts, startup overhead).
- **Angle:** Walkthrough deploying a real app (Node.js, Python, Go) to Cloud Run, comparing startup latency vs. Lambda, understanding concurrent request handling and autoscaling limits, debugging the "request timeout after 60s" wall, and a checklist for production readiness. Cost comparison: when Cloud Run beats Lambda and when it doesn't.
- **Tags:** `gcp`, `serverless`, `google-cloud-run`, `containers`, `devops`

### Cost Optimization Across AWS, Azure, and GCP: The Three-Month Audit Framework
- **Status:** `idea`
- **Scheduled:** 2027-01-21
- **Pitch:** Cloud cost management is a discipline, not a tool - this post builds a repeatable framework for finding and eliminating 20-40% waste that every enterprise cloud bill carries.
- **Angle:** Structured audit covering: compute right-sizing (VMs running at 5% CPU), storage sprawl (old snapshots, unused backups), data transfer costs (cross-region egress you forgot about), and idle resources. Cloud-native tools: AWS Compute Optimizer, Azure Advisor, GCP Recommender. Includes a GitHub Actions workflow that runs this audit weekly and posts a dashboard to a Slack channel.
- **Tags:** `cloud-cost`, `aws`, `azure`, `gcp`, `devops`, `platform-engineering`

### Terraform Modules for Multi-Cloud: Writing Once, Deploying Everywhere (and When Not To)
- **Status:** `idea`
- **Scheduled:** 2027-01-28
- **Pitch:** Write-once infrastructure sounds good until you try to abstract AWS, Azure, and GCP into the same module - this post shows what's actually portable and what requires vendor-specific implementations.
- **Angle:** Case study: deploying the same web app (containerized Node.js + database + cache) across all three clouds using Terraform. Covers what abstracts cleanly (compute, networking basics), what doesn't (database engines, auth mechanisms, managed services), and the pragmatic pattern: shared core module + cloud-specific submodules. Includes real examples of where multi-cloud abstractions saved effort vs. where they added complexity.
- **Tags:** `terraform`, `infrastructure-as-code`, `aws`, `azure`, `gcp`, `devops`

### AWS EventBridge: Event-Driven Architecture Without the Operational Debt
- **Status:** `idea`
- **Scheduled:** 2027-02-04
- **Pitch:** EventBridge is AWS's underrated superpower - a serverless event bus that decouples services and scales without maintenance, but most teams implement it wrong and end up with spaghetti event schemas.
- **Angle:** Builds an event-driven workflow from scratch (order placed → payment processed → inventory updated → notification sent), showing how EventBridge Routes preserve the audit trail and enable replay. Covers schema validation, dead-letter handling, and the critical decision: archive events or replay them. Compares to SNS/SQS and explains when EventBridge actually wins.
- **Tags:** `aws`, `event-driven-architecture`, `eventbridge`, `serverless`, `devops`

### GCP Pub/Sub vs. AWS SQS/SNS: Picking the Right Messaging Layer
- **Status:** `idea`
- **Scheduled:** 2027-02-11
- **Pitch:** Every cloud has a messaging service and they're not interchangeable - this post cuts through the feature spreadsheets and shows you the operational and cost differences that actually matter.
- **Angle:** Compares the three across: ordering guarantees (Pub/Sub topics are unordered; SQS FIFO adds cost; Pub/Sub subscriptions allow filtering), replay semantics, pricing under different load patterns, and migration paths if you start with one and outgrow it. Includes worked examples of a real workflow on each platform.
- **Tags:** `gcp`, `aws`, `messaging`, `devops`, `architecture`

### Azure Container Apps: When You Need More Than Functions But Less Than Kubernetes
- **Status:** `idea`
- **Scheduled:** 2027-02-18
- **Pitch:** Container Apps is Azure's answer to Google Cloud Run, but with tighter Kubernetes integration and a different scaling model - it fills a real gap for teams using AKS but needing simpler deployments for microservices.
- **Angle:** Compares Container Apps to Azure Functions, App Service, and AKS (when to pick each). Deploys a multi-container application with environment scaling rules, explores the cost model vs. Functions and App Service, and shows how managed identity authentication works without secrets in environment variables. Addresses the learning curve: just enough Kubernetes without running a full cluster.
- **Tags:** `azure`, `container-apps`, `serverless`, `kubernetes`, `devops`

### Multi-Cloud Cost Visibility: Building a Central Dashboard in 10 Hours With GitHub Actions and BigQuery
- **Status:** `idea`
- **Scheduled:** 2027-02-25
- **Pitch:** Cost reporting from AWS, Azure, and GCP stays siloed by default - this post shows how to pull all three APIs into a BigQuery dataset and build a dashboard that executives can actually read.
- **Angle:** Uses AWS Cost Explorer, Azure Cost Management, and GCP Cloud Billing APIs to feed a daily ETL into BigQuery. Builds a Looker Studio dashboard (or equivalent) showing cost by cloud, by service, cost trends. Includes a GitHub Actions workflow that runs the ETL nightly and alerts Slack if any single day's spend exceeds forecast. Practical: starting with your own account, scaling to org-level multi-account/multi-project setups.
- **Tags:** `cloud-cost`, `aws`, `azure`, `gcp`, `dashboards`, `devops`

---

## 📅 March-May 2027 - Open

Twelve posts on cloud-native infrastructure patterns, IaC at scale, and multi-cloud networking.

### AWS Lambda Power Tuning and Performance Profiling: Finding the Optimal Memory-Cost Sweet Spot
- **Status:** `idea`
- **Scheduled:** 2027-03-04
- **Pitch:** Lambda billing on memory (and therefore CPU) means every 128MB increment changes cost and latency - most teams guess. This post shows how to profile scientifically and find the true optimal point.
- **Angle:** Walks through the AWS Lambda Power Tuning open-source tool, profiling a real function across memory configurations, analyzing the cost/performance curve, and automating this profiling in CI. Shows how latency usually improves linearly with memory up to a point, then plateaus due to contention elsewhere (database, API). Practical: when to invest in profiling vs. just bumping memory.
- **Tags:** `aws`, `lambda`, `performance`, `cost-optimization`, `devops`

### GCP Cloud Functions to Cloud Run Migration: When to Upgrade and How to Do It Without Downtime
- **Status:** `idea`
- **Scheduled:** 2027-03-11
- **Pitch:** Cloud Functions 2nd gen runs on Cloud Run under the hood - migrating existing Gen 1 functions is straightforward but has gotchas (dependency injection changes, concurrency model, pricing).
- **Angle:** Side-by-side comparison of Gen 1 and Gen 2 syntax, shows the migration path for a real function (async handler, dependency injection, startup time), addresses the concurrency model change (Gen 1: one request per instance; Gen 2: multiple requests concurrently). Includes zero-downtime migration pattern using Cloud Load Balancer and traffic splitting.
- **Tags:** `gcp`, `cloud-functions`, `cloud-run`, `migration`, `devops`

### Bicep on Azure: Infrastructure as Code Without YAML Fatigue
- **Status:** `idea`
- **Scheduled:** 2027-03-18
- **Pitch:** Bicep is Azure's answer to Terraform - a domain-specific language for ARM templates that's cleaner and more maintainable than either ARM JSON or YAML wrappers.
- **Angle:** Refactors a realistic Azure deployment (app service + database + storage + networking) from ARM JSON to Bicep, shows how Bicep modules compose for reuse, compares syntax and ergonomics to Terraform, and explains when Bicep wins (deep integration with ARM, native to Azure tooling, no state management learning curve) and when Terraform is better (multi-cloud, larger community).
- **Tags:** `azure`, `bicep`, `infrastructure-as-code`, `iac`, `devops`

### AWS CodePipeline as a Multi-Account Deployment Orchestrator: Centralizing CI/CD Across Your AWS Organization
- **Status:** `idea`
- **Scheduled:** 2027-03-25
- **Pitch:** At enterprise scale, you need a single source of truth for deployments across dev/staging/prod accounts - AWS CodePipeline can be that orchestrator if you set up cross-account roles correctly.
- **Angle:** Builds a pipeline that tests in a shared account, then deploys to dev/staging/prod accounts using IAM role assumption and artifact handoff. Covers the IAM policy dance (what each account needs to assume), how to pass artifacts across accounts securely, and integrating CodePipeline with third-party gates (approval workflows, integration tests in isolated accounts). Compares to GitHub Actions + AWS OIDC for teams wanting to stay GitHub-centric.
- **Tags:** `aws`, `codepipeline`, `ci-cd`, `multi-account`, `governance`, `devops`

### OpenTofu: The Open-Source Terraform Fork and When to Make the Switch
- **Status:** `idea`
- **Scheduled:** 2027-04-01
- **Pitch:** HashiCorp's license change forked the Terraform community - OpenTofu is a fully compatible open-source fork with momentum. This post helps you decide if and when to migrate.
- **Angle:** Compares OpenTofu and Terraform head-to-head (compatibility, performance, community pace), shows that most `.tf` files run identically on both, covers the migration process (spoiler: usually just a binary swap), and discusses the organizational calculus: open-source assurance vs. vendor support trade-offs. Includes a GitHub Actions workflow that tests infrastructure code against both tools.
- **Tags:** `terraform`, `opentofu`, `infrastructure-as-code`, `open-source`, `devops`

### Secrets Management Across AWS, Azure, and GCP: The Multi-Cloud Pattern Without the Complexity
- **Status:** `idea`
- **Scheduled:** 2027-04-08
- **Pitch:** Each cloud has a secrets service (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager) - syncing secrets across clouds creates operational debt. This post shows the minimal viable pattern.
- **Angle:** Introduces the concept of a "source of truth" cloud (often whichever hosts your primary database or auth system), then shows how to read secrets from that cloud in the others (using IAM roles for fine-grained access). Covers rotation strategies that work across clouds. Compares to external secret sync solutions (HashiCorp Vault, External Secrets Operator) and why you probably don't need them until you hit enterprise compliance requirements.
- **Tags:** `aws`, `azure`, `gcp`, `security`, `secrets-management`, `devops`

### Networking Across AWS, Azure, and GCP: VPN, Virtual Peering, and When to Build a Private Network Fabric
- **Status:** `idea`
- **Scheduled:** 2027-04-15
- **Pitch:** Connecting workloads across clouds sounds simple (VPN or peering) until you hit DNS resolution, routing conflicts, and compliance requirements - this post builds the right mental model.
- **Angle:** Case study: connecting a web tier in AWS, a database in Azure, and APIs in GCP. Covers the networking options (VPN with overlapping CIDRs, vnet/VPC peering, private connectivity services), DNS strategies (split-view DNS, conditional forwarding), and when to add a WAF/firewall in front. Addresses the operational overhead: monitoring cross-cloud traffic, debugging connectivity, auditing who has access. Practical: when a VPN is enough vs. when you need a dedicated network orchestration layer.
- **Tags:** `aws`, `azure`, `gcp`, `networking`, `devops`, `architecture`

### AWS VPC Endpoints: Reducing Data Egress Costs and Improving Security Posture
- **Status:** `idea`
- **Scheduled:** 2027-04-22
- **Pitch:** Every GB of data leaving AWS costs money and creates a security surface - VPC Endpoints let you talk to AWS services and external APIs without leaving the VPC, but the configuration is counterintuitive.
- **Angle:** Covers gateway endpoints (S3, DynamoDB - free, simple) and interface endpoints (most other services - more flexible, small charge). Shows how to set up an endpoint for S3, verify it's being used (CloudTrail logging), and save on egress. Addresses common gotchas: DNS resolution, security groups, and the "why is my Lambda still going through NAT Gateway" debugging journey.
- **Tags:** `aws`, `vpc`, `cost-optimization`, `security`, `devops`

### GCP VPC Service Controls: Perimeter-Based Access Control and Compliance Automation
- **Status:** `idea`
- **Scheduled:** 2027-04-29
- **Pitch:** VPC Service Controls creates a security perimeter around GCP services - once you're inside, no exfiltration is possible without leaving the perimeter. It's a compliance superpower if configured correctly.
- **Angle:** Sets up a service perimeter for a real project (container registry, storage, BigQuery), then attempts to exfiltrate data (shows it fails). Covers ingress/egress policies, exemptions for emergencies, and integration with Cloud Audit Logs for compliance reporting. Compares to AWS PrivateLink/VPC Endpoints for teams building on both clouds.
- **Tags:** `gcp`, `security`, `compliance`, `devops`, `network-security`

### Database Replication Across AWS Regions and Clouds: Consistency Models You Can Actually Understand
- **Status:** `idea`
- **Scheduled:** 2027-05-06
- **Pitch:** Replicating a database across regions or clouds is table-stakes for availability, but the consistency guarantees and failure semantics are different for each engine and deployment model - get this wrong and you get lost updates or diverged state.
- **Angle:** Covers the consistency spectrum (immediate consistency, eventual consistency, causal consistency) with real examples. Compares approaches: managed replication (AWS RDS cross-region read replica, Azure Replication, GCP Cloud SQL), application-layer replication (event sourcing, CQRS), and hybrid approaches. Includes a test suite that catches consistency bugs before they hit production.
- **Tags:** `databases`, `replication`, `aws`, `azure`, `gcp`, `distributed-systems`

### Infrastructure Testing for Multi-Cloud: Validating Configuration Without Breaking Production
- **Status:** `idea`
- **Scheduled:** 2027-05-13
- **Pitch:** IaC gives you a single source of truth, but if that source is wrong, you've now automated your mistakes across multiple clouds - this post shows how to test infrastructure code as rigorously as application code.
- **Angle:** Covers local testing (Terraform plan, policy as code validation), integration testing (spinning up resources in a test account, validating they work, tearing down), and compliance testing (ensuring the deployed configuration matches org policy). Tools: Terraform test blocks, OPA, Checkov across all three clouds. Includes patterns for CI/CD gates that catch misconfigurations before they deploy.
- **Tags:** `terraform`, `testing`, `devops`, `infrastructure-as-code`, `policy-as-code`

### Observability and Monitoring for Multi-Cloud: Unified Visibility Without Vendor Lock-In
- **Status:** `idea`
- **Scheduled:** 2027-05-20
- **Pitch:** Monitoring AWS, Azure, and GCP from three separate dashboards defeats the purpose - this post shows how to collect signals uniformly and route them to a single pane of glass.
- **Angle:** Uses OpenTelemetry (logs, metrics, traces) as the common layer - each cloud has its own receiver (AWS CloudWatch, Azure Monitor, GCP Cloud Logging), but all feed into a central OTEL collector (self-hosted or cloud-hosted). Compares to managed observability vendors (Datadog, New Relic, Splunk) and shows the cost/flexibility trade-off. Practical: starting with metrics, adding traces, gradually onboarding logs.
- **Tags:** `observability`, `monitoring`, `opentelemetry`, `aws`, `azure`, `gcp`, `devops`

---

## 📅 June-August 2027 - Open

Thirteen posts on agentic development at scale, multi-cloud AI workloads, and cost optimization for ML.

### AWS Bedrock Agents: Building Multi-Step Workflows Without Managing Infrastructure
- **Status:** `idea`
- **Scheduled:** 2027-06-03
- **Pitch:** Bedrock Agents runs agents on AWS infrastructure without you managing Lambda functions, containers, or state - it's serverless AI orchestration, and it changes the cost/complexity game for agentic applications.
- **Angle:** Builds a real agent (e.g., a customer support agent that can look up orders, process refunds, escalate to human) from scratch using Bedrock Agents. Covers tool definition (XML syntax), memory management, multi-turn conversations, and the pricing model (per invocation). Compares to building agents on Lambda + API Gateway + Step Functions (more control, more operational burden).
- **Tags:** `aws`, `bedrock`, `ai-agents`, `serverless`, `agentic-development`

### GCP Vertex AI Agents: Google's Agentic Framework and When It Beats Multi-Cloud Abstractions
- **Status:** `idea`
- **Scheduled:** 2027-06-10
- **Pitch:** Vertex AI Agents are Google's vertically-integrated agent platform (models, evaluation, deployment, monitoring all in one place) - this post evaluates whether vendor lock-in is worth the integration gains.
- **Angle:** Builds the same customer support agent on Vertex AI Agents, then compares the development experience, cost, and operational overhead to an AWS Bedrock version. Shows what Vertex AI does exceptionally well (model selection, prompt evaluation, monitoring) and where it creates lock-in. Addresses the question: for teams committed to GCP, is Vertex AI Agents better than a general framework like LangChain?
- **Tags:** `gcp`, `vertex-ai`, `ai-agents`, `agentic-development`, `llm`

### Evaluating Agents at Scale: Cost-Effective Testing for Agentic Applications
- **Status:** `idea`
- **Scheduled:** 2027-06-17
- **Pitch:** Agent evaluation is harder than LLM evaluation because agents have tool calls, multi-step reasoning, and stochastic behavior - this post builds a practical framework for catching regressions without breaking the budget.
- **Angle:** Covers deterministic evaluation (tool call correctness, output format), semantic evaluation (using an LLM to grade agent reasoning), and production evaluation (sampling real user interactions, manual review). Shows how to integrate agent evaluation into CI so bad prompts and tool definitions don't ship. Uses AWS Bedrock or Vertex AI as the evaluation backbone and GitHub Actions for orchestration.
- **Tags:** `ai-agents`, `testing`, `evaluation`, `agentic-development`, `aws`, `gcp`

### Multi-Agent Orchestration Patterns: When to Use Central Coordinator vs. Direct Handoff
- **Status:** `idea`
- **Scheduled:** 2027-06-24
- **Pitch:** Single agents hit a ceiling - real agentic systems route tasks across specialists - this post shows the three patterns that actually work and when to use each.
- **Angle:** Covers: (1) central coordinator agent that decides which specialist to call, (2) direct handoff where one agent calls another agent, and (3) self-organizing where agents negotiate. Shows concrete trade-offs: coordinator is simpler but a bottleneck; handoff is faster but harder to debug; self-organizing is elegant but requires teaching agents to cooperate. Uses AWS Bedrock or Vertex AI Agents as the runtime.
- **Tags:** `ai-agents`, `multi-agent`, `agentic-development`, `architecture`

### Cost Optimization for LLM Inference: Caching, Batch Processing, and Knowing When to Fine-Tune
- **Status:** `idea`
- **Scheduled:** 2027-07-01
- **Pitch:** LLM inference costs scale with token volume - this post shows where you're burning money and how to cut 30-50% without sacrificing quality.
- **Angle:** Covers prompt caching (reducing redundant prefill overhead), batch processing (cheaper token rates, same results), distillation (switching to smaller models for specific tasks), and fine-tuning (only when it actually saves tokens). Includes a framework for deciding which optimization to apply to your bottleneck. Cost accounting: showing which parts of your agentic application are expensive and where to focus.
- **Tags:** `llm`, `cost-optimization`, `ai-agents`, `aws`, `gcp`, `azure-ai-foundry`

### Agentic Observability: Tracing Multi-Step Workflows and Debugging Tool Call Failures
- **Status:** `idea`
- **Scheduled:** 2027-07-08
- **Pitch:** When an agent fails in production, you need to see every step: what it was thinking, what it tried to do, where the tool call failed - standard application monitoring isn't enough.
- **Angle:** Covers OpenTelemetry instrumentation for agentic applications (capturing agent thoughts, tool calls, results as spans), distributed tracing across agent boundaries, and the critical: root-cause attribution. Shows how to build a dashboard that surfaces `agent_id, user_id, step_number, tool_name, error` so on-call can triage incidents. Includes a pattern for replay-driven debugging (re-run the agent with the exact same inputs to reproduce failures).
- **Tags:** `observability`, `ai-agents`, `monitoring`, `opentelemetry`, `agentic-development`

### Azure Prompt Flow at Scale: Production Workflows for Complex Agentic Applications
- **Status:** `idea`
- **Scheduled:** 2027-07-15
- **Pitch:** Azure Prompt Flow is built for multi-step LLM workflows - this post shows how to move Prompt Flow applications from prototyping to production with monitoring, versioning, and A/B testing.
- **Angle:** Builds a real workflow (multi-step research task that queries APIs, reasons about results, and synthesizes a report), versions it with Git, sets up evaluation gates in CI, deploys to Azure Container Apps, and runs A/B tests on prompt variations. Covers the prompt flow development experience (web UI, CLI, SDK), comparing it to code-first frameworks like LangChain.
- **Tags:** `azure`, `azure-ai-foundry`, `prompt-flow`, `agentic-development`, `llm`

### Agentic Code Generation: Using Agents to Scaffold and Refactor Code Without Hallucination
- **Status:** `idea`
- **Scheduled:** 2027-07-22
- **Pitch:** Agents that write code sound scary but they're useful for specific tasks - scaffolding repetitive patterns, refactoring, generating tests - if constrained correctly.
- **Angle:** Builds an agent that takes a Python class definition and generates comprehensive unit tests, then one that refactors legacy code toward modern patterns. Covers the constraints that make this safe: code analysis for groundedness (generated code parses), static analysis to catch obvious mistakes, human review gates. Shows where code-generating agents fail (novel algorithms, domain-specific problems) and where they excel (boilerplate, known patterns).
- **Tags:** `ai-agents`, `code-generation`, `agentic-development`, `testing`, `developer-productivity`

### Fine-Tuning LLMs for Agentic Tasks: When Domain Adaptation Actually Helps Agent Reasoning
- **Status:** `idea`
- **Scheduled:** 2027-07-29
- **Pitch:** Most fine-tuning projects fail - this post shows the narrow slice where fine-tuning actually improves agent reasoning (not just task accuracy) and how to measure whether you've crossed that line.
- **Angle:** Covers the decision framework: few-shot prompting rarely works for agents (multi-step reasoning is too brittle), RAG helps with grounding but not reasoning, fine-tuning is expensive but can improve planning. Shows how to evaluate whether your domain-specific tasks would benefit from fine-tuning by running ablations: base model vs. fine-tuned on test queries. Addresses the cost calculus: fine-tuning investment vs. API cost savings.
- **Tags:** `llm`, `fine-tuning`, `ai-agents`, `agentic-development`, `azure-ai-foundry`

### Responsible AI Governance for Agents: Automated Checks for Bias, Safety, and Compliance
- **Status:** `idea`
- **Scheduled:** 2027-08-05
- **Pitch:** Agentic systems make decisions that affect users - governance (logging, review, rollback) isn't optional. This post builds audit-grade infrastructure into agent deployments.
- **Angle:** Covers: (1) capturing every decision the agent made (input, reasoning, action, outcome), (2) auditing for bias (systematic differences in behavior across user demographics), (3) safety checks (preventing agents from making harmful commitments), and (4) compliance reporting. Uses Azure AI Content Safety or similar for automated filtering, and GitHub Actions for compliance dashboards.
- **Tags:** `responsible-ai`, `governance`, `ai-agents`, `compliance`, `agentic-development`

### Building Agent Personas: Teaching Agents to Adopt Different Styles and Constraints for Different Users
- **Status:** `idea`
- **Scheduled:** 2027-08-12
- **Pitch:** A single agent prompt doesn't serve all users - sales agents need urgency, support agents need patience, compliance officers need precision - this post shows how to prompt-engineer for personas without forking the codebase.
- **Angle:** Covers prompt techniques for personas (instruction layers, dynamic system prompt construction), testing that personas behave as designed, and the operational cost (more prompt variations = more evaluation, more testing). Shows a pattern where persona instructions are stored in a database so ops can update tone/constraints without re-deploying.
- **Tags:** `ai-agents`, `prompt-engineering`, `agentic-development`, `personalization`

### Agent Hallucination: Detecting, Measuring, and Mitigating False Confident Behavior
- **Status:** `idea`
- **Scheduled:** 2027-08-19
- **Pitch:** Agents hallucinate differently than LLMs - they can confidently call a tool with made-up parameters, making a request that sounds plausible but fails at runtime. This post teaches you to catch and fix it.
- **Angle:** Covers detection techniques (semantic validation of tool calls before execution, consistency checks across multi-step workflows), measurement (how to score hallucination in evaluation datasets), and mitigation (constraining tool parameters via schema, teaching agents to check before acting). Shows how to add a "confidence scoring" layer that lets you deprioritize low-confidence agent decisions.
- **Tags:** `ai-agents`, `hallucination`, `agentic-development`, `safety`

### From Prompt Engineering to Agentic Engineering: Teaching LLMs to Reason and Act Reliably
- **Status:** `idea`
- **Scheduled:** 2027-08-26
- **Pitch:** Agentic engineering is an emerging discipline - this post maps the progression from one-shot prompts to full agents and the different skill set required.
- **Angle:** Structured as a learning path: (1) prompting (static instructions), (2) dynamic prompting (context-aware instructions), (3) in-context learning (few-shot examples), (4) tool use (agent can call functions), (5) planning (agent breaks down problems), (6) memory (agent learns over conversations). Each step trades prompt simplicity for reasoning capability. Includes mental models and debugging techniques for each level.
- **Tags:** `ai-agents`, `prompt-engineering`, `agentic-development`, `learning-path`

---

## 📅 September-November 2027 - Open

Fourteen posts on platform engineering at scale, cost management, and enterprise agentic deployment.

### Platform Engineering Beyond Backstage: Building Internal Developer Platforms at Enterprise Scale
- **Status:** `idea`
- **Scheduled:** 2027-09-02
- **Pitch:** Backstage is a good foundation but most enterprises need more - this post shows what's missing and how to build it.
- **Angle:** Covers: (1) golden paths (curated templates for common workloads), (2) self-service infrastructure (VMs, databases, caches), (3) cost transparency (which team owns which resources), and (4) compliance automation (policies enforced on infrastructure). Real examples: service mesh integration (Istio, Linkerd), policy as code enforcement (OPA), audit logging. Shows how to wire all of this into your IDP so developers get productivity without compliance headaches.
- **Tags:** `platform-engineering`, `developer-productivity`, `internal-developer-platform`, `devops`

### AWS Service Catalog at Scale: Self-Service Infrastructure Without the Operational Debt
- **Status:** `idea`
- **Scheduled:** 2027-09-09
- **Pitch:** Service Catalog is AWS's self-service infrastructure tool - this post shows how to build it correctly so developers get speed without creating sprawl or cost surprise.
- **Angle:** Covers: setting up an AWS Service Catalog portfolio with AWS CloudFormation and Terraform backends, defining constraints (cost limits, allowed instance sizes), role-based access, and cost reporting. Shows the pattern where dev teams can self-provision (databases, VMs, load balancers) within guardrails set by platform teams. Addresses the most common failure mode: unconstrained self-service creates chaos (everyone spins up expensive resources).
- **Tags:** `aws`, `service-catalog`, `platform-engineering`, `self-service-infrastructure`

### GCP Service Management and Config Controller: Policy Enforcement for Self-Service Infrastructure
- **Status:** `idea`
- **Scheduled:** 2027-09-16
- **Pitch:** Google's Config Controller brings Kubernetes-native policy enforcement to GCP infrastructure - teams define Intent, infrastructure self-heals to match.
- **Angle:** Covers setting up Config Controller, defining policies for resource naming, location constraints, security settings, and cost controls. Shows how developers submit desired state (as Kubernetes-like manifests) and Config Controller creates the GCP infrastructure. Compares to AWS Service Catalog and Terraform - different strengths.
- **Tags:** `gcp`, `platform-engineering`, `config-controller`, `policy-enforcement`, `infrastructure-as-code`

### Multi-Cloud CI/CD: A Single Workflow That Deploys to AWS, Azure, and GCP Simultaneously
- **Status:** `idea`
- **Scheduled:** 2027-09-23
- **Pitch:** Deploying to multiple clouds from a single CI/CD workflow sounds like complexity, but with the right abstractions it's simpler than maintaining separate pipelines.
- **Angle:** Builds a GitHub Actions workflow that tests once, then deploys the same artifact to AWS (via CodeDeploy), Azure (via Resource Manager), and GCP (via Cloud Deploy) in parallel. Covers the abstraction layer: Terraform modules that work across all three clouds. Includes failure handling (if one cloud fails, what's the rollback strategy?).
- **Tags:** `ci-cd`, `github-actions`, `aws`, `azure`, `gcp`, `multi-cloud`, `deployment`

### FinOps Culture: Making Cloud Cost Everyone's Problem
- **Status:** `idea`
- **Scheduled:** 2027-09-30
- **Pitch:** FinOps isn't just about tools - it's about culture shift where developers and ops own the cost impact of their choices.
- **Angle:** Covers: (1) cost allocation (tagging/labeling so each team sees its own bill), (2) budgets and alerts (financial controls), (3) cost-aware architecture decisions (does this need multi-cloud or is one region enough?), and (4) incentives (should teams get credits if they save costs?). Includes patterns for cost reviews (quarterly retrospectives on spend), developer education (teaching cost implications of architectural choices), and executive visibility (dashboards that don't require a finance degree to understand).
- **Tags:** `cloud-cost`, `finops`, `platform-engineering`, `devops`, `governance`

### Compliance Automation for Enterprise Cloud: From Manual Audits to Self-Healing Infrastructure
- **Status:** `idea`
- **Scheduled:** 2027-10-07
- **Pitch:** Compliance audits are manual, expensive, and slow - this post shows how to automate compliance checks and even auto-remediate common violations.
- **Angle:** Covers: (1) policy scanning (Checkov, OPA, native tools), (2) automated remediation (if encryption is disabled, enable it), (3) audit logging (capture who changed what), and (4) compliance reporting (aggregating results for auditors). Practical example: enforcing SOC 2 requirements across AWS, Azure, and GCP without hiring a compliance team. Addresses the tension: automation can reduce burden but over-automation can block legitimate operations.
- **Tags:** `compliance`, `devsecops`, `governance`, `automation`, `aws`, `azure`, `gcp`

### Disaster Recovery and Business Continuity for Multi-Cloud Workloads
- **Status:** `idea`
- **Scheduled:** 2027-10-14
- **Pitch:** Disaster recovery is boring until you need it, then it's critical - this post teaches you to design for it from the start without over-engineering.
- **Angle:** Covers: (1) RTO/RPO targets (how fast must recovery be, how much data can you lose), (2) failover strategies (active-active, active-passive, multi-cloud redundancy), (3) testing (chaos engineering, regular DR drills), and (4) cost-effective approaches (you don't need hot standby everywhere). Includes templates for DR architecture across AWS/Azure/GCP and a GitHub Actions workflow that periodically tests failover.
- **Tags:** `disaster-recovery`, `reliability`, `aws`, `azure`, `gcp`, `architecture`

### Testing AI-Assisted Development: Coverage, Evaluation, and Guardrails for Copilot at Scale
- **Status:** `idea`
- **Scheduled:** 2027-10-21
- **Pitch:** Copilot and similar AI coding tools are powerful but they can introduce subtle bugs if you're not careful - this post builds the testing strategy that catches them.
- **Angle:** Covers: (1) coverage implications (can AI suggestions reduce test coverage?), (2) correctness evaluation (do suggested code pass tests?), (3) security scanning (does Copilot suggest vulnerable patterns?), and (4) cost/benefit analysis (is the dev velocity gain worth the review overhead?). Shows how to integrate Copilot output into your CI, add extra scrutiny to AI-generated code, and measure whether teams using Copilot actually ship faster.
- **Tags:** `github-copilot`, `testing`, `ai-assisted-development`, `code-quality`, `ci-cd`

### Agent-Assisted Operations: Using Agents to Automate Incident Response and Post-Mortems
- **Status:** `idea`
- **Scheduled:** 2027-10-28
- **Pitch:** Agents can help ops teams by detecting anomalies, gathering context, suggesting remediation, and even executing fixes - this post shows how to build safe automation for operational tasks.
- **Angle:** Covers: (1) anomaly detection (agent triggers when conditions match), (2) context gathering (agent pulls logs, metrics, recent changes), (3) remediation suggestions (agent recommends fix but requires human approval), and (4) autonomous remediation (for safe operations, agent executes fixes directly). Shows a real example: agent detects high error rate, gathers evidence, suggests rollback, gets approval, rolls back. Addresses the critical safety requirement: agents need guardrails (what they can do, what requires approval).
- **Tags:** `ai-agents`, `operations`, `devops`, `incident-response`, `automation`

### Agentic Testing: AI Agents That Generate, Execute, and Improve Test Cases
- **Status:** `idea`
- **Scheduled:** 2027-11-04
- **Pitch:** Agents can augment your test suite by generating edge cases, running exploratory testing, and suggesting improvements - this post shows where the pattern works and where it still breaks.
- **Angle:** Covers: (1) agent-generated test cases (agent reads code, generates tests), (2) exploratory testing (agent finds edge cases humans miss), (3) flakiness detection (agent runs tests multiple times and catches intermittent failures), and (4) test improvement (agent suggests coverage gaps). Shows the limitations: agents still hallucinate (suggesting tests for methods that don't exist), and they need guardrails (not every test agent generates is worth keeping). Frames this as augmentation, not replacement.
- **Tags:** `ai-agents`, `testing`, `test-generation`, `agentic-development`, `quality-assurance`

### Building Observability Into Agents From Day One: Instrumentation Patterns for Production Safety
- **Status:** `idea`
- **Scheduled:** 2027-11-11
- **Pitch:** Production agents are worth nothing if you can't debug them - this post builds observation into agents from the start, not as an afterthought.
- **Angle:** Covers: (1) structured logging (agent thoughts, tool calls, results in queryable format), (2) distributed tracing (following a user request through an agent chain), (3) metrics (latency, error rate, tool call frequency), and (4) alerting (anomaly detection for agent behavior). Uses OpenTelemetry as the common layer. Shows how to set up a dashboard that surfaces `agent_id, user_id, step, tool, error` so you can debug incidents. Includes a pattern for reproducing agent behavior (replay the same inputs to see if it happens again).
- **Tags:** `observability`, `ai-agents`, `monitoring`, `opentelemetry`, `devops`

### Designing Agents That Learn From Feedback: Building Human-in-the-Loop Systems Without the Operational Chaos
- **Status:** `idea`
- **Scheduled:** 2027-11-18
- **Pitch:** Agents that improve over time sound great, but feedback loops and continuous retraining create operational burden if not designed carefully.
- **Angle:** Covers: (1) feedback collection (capturing user corrections), (2) signal quality (not all feedback is equal), (3) retraining cadence (daily, weekly, only on significant changes), and (4) safety gates (bad updates can't ship without review). Shows patterns that work: ranking feedback by confidence, requiring multiple reports before action, and human review gates for significant model/prompt changes. Addresses the organizational question: who owns continuous improvement - ML team, product team, ops?
- **Tags:** `ai-agents`, `feedback-loops`, `continuous-improvement`, `agentic-development`, `governance`

### Multi-Tenant Agent Platforms: Isolation, Cost Allocation, and Compliance for SaaS
- **Status:** `idea`
- **Scheduled:** 2027-11-25
- **Pitch:** Running agents for multiple customers in a SaaS requires isolation (one customer's data doesn't leak), cost tracking (who pays for API calls), and compliance (audits per tenant) - this post shows how to build it without the overhead.
- **Angle:** Covers: (1) logical isolation (separate Azure AI Foundry projects per tenant vs. shared project with tenant context), (2) cost tracking (API call attribution to customer), (3) quota enforcement (prevent one customer from consuming all resources), and (4) audit logging (compliance per tenant). Shows the trade-off: more isolation = more operational burden but easier compliance; shared infrastructure = cheaper but harder to audit.
- **Tags:** `ai-agents`, `multi-tenant`, `saas`, `compliance`, `cost-allocation`

---

## 📅 December 2027 - Open

Five posts to close the year with reflection and forward-looking content.

### The Agentic Year in Review 2027: What Shipped, What Actually Mattered, What's Ahead
- **Status:** `idea`
- **Scheduled:** 2027-12-02
- **Pitch:** A retrospective on agentic development in 2027 - what left the prototype phase, what turned out to be hype, and what's worth watching in 2028.
- **Angle:** Structured as three sections: what shipped (agentic products, platforms, tools), what mattered (which approaches actually worked in production), and what broke (hype that didn't materialize). Personal and opinionated, grounded in experience shipping agents. Covers the emerging best practices that crystallized in 2027 (evaluation methods, safety patterns, cost models).
- **Tags:** `ai-agents`, `agentic-development`, `year-in-review`, `editorial`

### Multi-Cloud Platform Engineering: The 2027-2028 Transition
- **Status:** `idea`
- **Scheduled:** 2027-12-09
- **Pitch:** Multi-cloud strategies matured in 2027 - this post reflects on what worked, what we got wrong, and where the field is headed.
- **Angle:** Covers: (1) tools that matured (Terraform, OpenTelemetry, OTEL collectors), (2) patterns that stuck (avoid true multi-cloud apps in favor of multi-cloud deployment of single-cloud architectures), (3) where abstractions still fail (managed services remain cloud-specific), and (4) organizational lessons (FinOps, cost ownership). Opinionated take on whether true portability is a goal worth pursuing or whether cloud-specific expertise is better.
- **Tags:** `multi-cloud`, `platform-engineering`, `architecture`, `editorial`

### Cloud Native Security in Retrospect: What's Still Hard, What's Table Stakes Now
- **Status:** `idea`
- **Scheduled:** 2027-12-16
- **Pitch:** Security tooling matured dramatically in 2027 - this post reflects on what's now expected baseline vs. still cutting-edge.
- **Angle:** Covers: (1) baseline expectations (policy as code, shift-left scanning, RBAC), (2) still hard (supply chain security at scale, evaluating third-party tools), (3) emerging threats (agentic system attacks, multi-cloud exploitation). Includes a security self-assessment checklist for 2028: have you covered the fundamentals?
- **Tags:** `security`, `devsecops`, `cloud-native`, `editorial`, `year-in-review`

### Building for Humans: The Non-Technical Skills That Separate Senior Teams From the Rest
- **Status:** `idea`
- **Scheduled:** 2027-12-23
- **Pitch:** Technical skills got us here, but async communication, documentation discipline, and decision-making processes are what scale teams - this post reflects on the non-technical stuff that matters.
- **Angle:** Light enough for the holiday week, substantive enough to be worth reading. Covers: (1) writing skills (good documentation and commit messages), (2) async-first communication (GitHub Discussions, ADRs instead of Slack threads), (3) decision frameworks (How do we choose between AWS and GCP?), and (4) learning culture (encouraging experimentation without chaos).
- **Tags:** `team-culture`, `developer-productivity`, `writing-for-engineers`, `editorial`

### Thinking Forward: What DevSecOps, Platform Engineering, and Agentic Development Will Look Like in 2028
- **Status:** `idea`
- **Scheduled:** 2027-12-30
- **Pitch:** The year is ending - time to think about what's next. This post makes predictions on where the field is headed and what bets worth making.
- **Angle:** Opinionated but grounded: (1) agentic systems will hit production at scale, (2) multi-cloud will continue but with clearer trade-offs understood, (3) FinOps will be table stakes (every org tracks cost per team), (4) platform engineering consolidates around Backstage + cloud service catalogs, (5) security shifts to runtime anomaly detection (shift right). Includes things worth learning in early 2028 (specific agents for your domain, cost modeling for your workload, new evaluation methods as they emerge).
- **Tags:** `editorial`, `predictions`, `devops`, `platform-engineering`, `ai-agents`

---

## 📅 January-February 2028 - Production AI at Scale

Eight posts on deploying agentic systems to production, governance, safety, and long-term operational patterns.

### Evaluating LLMs for Production: Speed, Cost, and Capability Trade-offs in January 2028
- **Status:** `idea`
- **Scheduled:** 2028-01-06
- **File:** `src/posts/2028-01-06-evaluating-llms-production-january-2028.md`
- **Pitch:** The LLM landscape shifted dramatically in 2027 - smaller models got faster, prices dropped, and specialized models emerged. This post helps you pick the right model for production in 2028.
- **Angle:** Compares major models (GPT-4 Turbo, Claude 3, Gemini, open-source options) on latency (p50, p99), cost per token, context window, and capability for specific tasks (classification, reasoning, code generation). Shows how to run benchmarks on your actual workload instead of trusting marketing benchmarks. Covers the trade-off: using smaller, cheaper models locally vs. paying for high-capability APIs. Includes a template for "which model should we use for this task?" decision-making.
- **Tags:** `llm`, `model-selection`, `production-ai`, `cost-optimization`

### LLMOps: Versioning, Testing, and Deploying Prompts as First-Class Artifacts
- **Status:** `idea`
- **Scheduled:** 2028-01-13
- **File:** `src/posts/2028-01-13-llmops-versioning-testing-prompts.md`
- **Pitch:** Prompts change constantly - you need version control, testing, and rollback capabilities like you have for code. This post shows the tools and practices emerging for LLMOps.
- **Angle:** Covers prompt versioning (git + YAML structure), evaluation frameworks (golden datasets to catch regressions), A/B testing (running two versions in parallel to compare outputs), and safe rollbacks (when a new prompt degrades quality, roll back in 60 seconds). Tools: Promptfoo, LangSmith, Braintrust. Shows how to integrate prompt testing into CI/CD so you catch regressions before production.
- **Tags:** `llmops`, `prompt-engineering`, `mlops`, `testing`, `ci-cd`

### Observability for AI Systems: Tracing Agent Steps, Evaluating Quality, and Debugging Production Issues
- **Status:** `idea`
- **Scheduled:** 2028-01-20
- **File:** `src/posts/2028-01-20-observability-ai-systems-tracing-evaluation.md`
- **Pitch:** Traditional logging doesn't work for agents - you need to trace every tool call, LLM invocation, and decision. This post shows how to build observability for AI systems that actually catches real problems.
- **Angle:** Covers instrumentation (Langfuse, OpenLLMetry for tracing), custom metrics (token counts, model latency, tool success rates), and debugging patterns (what to log when an agent fails). Shows how to build dashboards that alert on degradation (agent success rate drops 10%, average latency increases). Practical: starting with span traces, adding metrics, graduating to evaluations.
- **Tags:** `observability`, `ai-agents`, `monitoring`, `llmops`, `devops`

### AI Safety in Production: Guardrails, Content Filtering, and Preventing Misuse
- **Status:** `idea`
- **Scheduled:** 2028-01-27
- **File:** `src/posts/2028-01-27-ai-safety-production-guardrails-filtering.md`
- **Pitch:** Before shipping AI to users, you need safety measures - guardrails, output validation, and abuse detection. This post covers the patterns and tools.
- **Angle:** Covers multiple layers of safety: (1) input validation (detecting and blocking prompt injection attacks), (2) output filtering (detecting harmful responses before showing users), (3) rate limiting (preventing abuse/cost explosion), (4) user feedback loops (flagging bad outputs). Tools: LLM Guard, Guardrails AI, semantic validators. Shows how to build a safety layer that catches 90% of issues without blocking legitimate use cases.
- **Tags:** `ai-safety`, `security`, `content-filtering`, `production-ai`

### AI Cost Optimization: Caching, Batching, and Intelligent Model Selection
- **Status:** `idea`
- **Scheduled:** 2028-02-03
- **File:** `src/posts/2028-02-03-ai-cost-optimization-caching-batching.md`
- **Pitch:** Running AI systems at scale gets expensive fast - this post shows cost optimization strategies that actually work without sacrificing quality.
- **Angle:** Covers caching strategies (semantic caching for similar queries, prompt caching for repeated context), batching (request batching for lower per-token cost), intelligent routing (smaller models for simple tasks, bigger models only when needed), and usage monitoring (setting cost alerts). Shows real examples: support chatbot that went from $0.50 to $0.08 per query through optimization. Includes profiling tools and ROI calculations.
- **Tags:** `cost-optimization`, `ai-systems`, `llm`, `production-ai`, `devops`

### Fine-Tuning vs. In-Context Learning: When Custom Models Actually Make Sense
- **Status:** `idea`
- **Scheduled:** 2028-02-10
- **File:** `src/posts/2028-02-10-fine-tuning-vs-in-context-learning.md`
- **Pitch:** The debate rages: should you fine-tune a model for your domain or use few-shot examples? This post settles it with real data.
- **Angle:** Compares the two approaches on accuracy, cost, latency, and maintenance burden. Fine-tuning wins when you have lots of labeled data (1k+ examples) and need to optimize for specific tasks; in-context learning is faster to iterate and works with fewer examples. Shows how to decide based on your constraints. Covers practical fine-tuning (QLoRA for cheap fine-tuning, how to build training datasets, evaluation). Honest about the "fine-tuning was the bottleneck" failure modes.
- **Tags:** `llm`, `fine-tuning`, `machine-learning`, `cost-optimization`

### Open-Source vs. Proprietary Models: The 2028 Landscape and Choosing Your Infrastructure
- **Status:** `idea`
- **Scheduled:** 2028-02-17
- **File:** `src/posts/2028-02-17-open-source-vs-proprietary-models-2028.md`
- **Pitch:** Open-source models got dramatically better in 2027 - this post compares the state of the art and helps you choose between self-hosting, API providers, and hybrid approaches.
- **Angle:** Covers the current leaders (Llama 3+, Mistral, DeepSeek) and their trade-offs. Self-hosting wins when you need: data privacy, cost at massive scale, or latency guarantees; APIs win when you need: minimal ops overhead, access to frontier models, automatic scaling. Shows cost calculations for different scenarios (small startup vs. enterprise). Addresses the hidden costs: fine-tuning, setup, ongoing maintenance. Includes a decision matrix.
- **Tags:** `llm`, `open-source`, `infrastructure`, `cost-optimization`, `ai-systems`

### Agentic Governance: Managing AI Teams, Tools, and Guardrails at Enterprise Scale
- **Status:** `idea`
- **Scheduled:** 2028-02-24
- **File:** `src/posts/2028-02-24-agentic-governance-enterprise-teams.md`
- **Pitch:** As AI systems proliferate, you need governance - approved models, cost controls, audit trails, and safety standards. This post covers what enterprise governance for AI actually looks like.
- **Angle:** Covers: (1) model governance (approved models list, versioning policy), (2) cost controls (per-team budgets, usage limits), (3) safety standards (what safety measures are required by default), (4) audit logging (compliance for regulated industries), (5) knowledge sharing (how to prevent duplicate AI projects across teams). Shows how to enforce these through platform engineering (self-service infrastructure + guardrails). Practical templates for your org.
- **Tags:** `governance`, `compliance`, `ai-systems`, `enterprise`, `platform-engineering`

---

## 📅 March-May 2028 - Personal and Edge AI

Nine posts on running AI locally - Ollama, quantized models, on-device inference, and the return of offline-first computing.

### Running LLMs Locally: Ollama, Llama.cpp, and When to Abandon the Cloud
- **Status:** `idea`
- **Scheduled:** 2028-03-02
- **File:** `src/posts/2028-03-02-running-llms-locally-ollama-llamacpp.md`
- **Pitch:** Your laptop can run a capable LLM now - Ollama makes it trivial. This post shows how to set it up and when local models make sense.
- **Angle:** Walks through installing and running Ollama with Llama 2/3, measuring inference speed and memory usage on Mac/Linux/Windows. Compares to cloud APIs on latency and cost for different workload types. Covers the advantages (no API costs, complete data privacy, offline-first) and trade-offs (slower, limited to your hardware). Shows practical workflows: local for development/testing, cloud for production. Includes performance tuning (quantization levels, hardware selection).
- **Tags:** `llm`, `edge-ai`, `local-ai`, `ollama`, `privacy`

### Quantization Deep Dive: Trading Accuracy for Speed (And Why It Works)
- **Status:** `idea`
- **Scheduled:** 2028-03-09
- **File:** `src/posts/2028-03-09-quantization-deep-dive-accuracy-speed.md`
- **Pitch:** Quantization shrinks models from 70B parameters to something your laptop can run - this post explains how it works and shows you when to use which quantization levels.
- **Angle:** Covers the theory (reducing precision from float32 to int8), the tools (GGML, bitsandbytes, AWQ), and the practice (building a benchmark for your task with different quantization levels). Shows real examples: Llama 3 70B quantized to 4-bit is faster and only slightly less accurate for most tasks. Includes cost/benefit analysis: when does quantization help vs. hurt? When should you pick a smaller model instead?
- **Tags:** `quantization`, `llm`, `edge-ai`, `performance`, `optimization`

### Fine-Tuning Open Models Locally: Building Custom LLMs on Your Hardware
- **Status:** `idea`
- **Scheduled:** 2028-03-16
- **File:** `src/posts/2028-03-16-fine-tuning-open-models-locally.md`
- **Pitch:** You can now fine-tune models on consumer hardware using QLoRA - this post shows how to build a custom model for your domain.
- **Angle:** Walks through the full pipeline: (1) preparing a dataset (1k-10k examples), (2) setting up training (QLoRA for efficiency), (3) evaluating quality, (4) deploying locally. Real example: fine-tuning a model on your company's internal documentation so it can answer support questions accurately. Covers the time/cost tradeoffs and when it's worth the effort vs. using RAG. Practical scripts and tools.
- **Tags:** `fine-tuning`, `llm`, `edge-ai`, `machine-learning`

### Retrieval-Augmented Generation (RAG) Offline: Building Knowledge Bases That Work Without the Cloud
- **Status:** `idea`
- **Scheduled:** 2028-03-23
- **File:** `src/posts/2028-03-23-rag-offline-local-knowledge-bases.md`
- **Pitch:** RAG (grounding LLMs with your data) is most powerful locally - this post shows how to build offline-first RAG systems.
- **Angle:** Covers the full pipeline: (1) embedding generation (local models with Ollama + Nomic embeddings), (2) vector database (Chroma, Milvus for single-machine use), (3) retrieval (BM25 + semantic search hybrid), (4) prompting (how to structure context for local models). Real example: a personal assistant that knows everything about your files, email, and documents without sending anything to the cloud. Performance tuning for different hardware.
- **Tags:** `rag`, `edge-ai`, `privacy`, `local-ai`, `search`

### Building AI-Powered CLI Tools: Bring Your Models Into Your Workflow
- **Status:** `idea`
- **Scheduled:** 2028-03-30
- **File:** `src/posts/2028-03-30-building-ai-powered-cli-tools.md`
- **Pitch:** AI doesn't have to live in web apps - this post shows how to build command-line tools that use local LLMs to augment your workflow.
- **Angle:** Builds several practical tools: (1) code review assistant (pipe code through an LLM), (2) commit message generator, (3) documentation writer from source code, (4) error message decoder. Tools: LangChain CLI, Ollama API, direct subprocess calls. Shows how to make tools fast (run locally, cache results), and keep them focused (do one thing well). Practical scripts you can fork and customize.
- **Tags:** `cli-tools`, `ai-automation`, `developer-productivity`, `edge-ai`

### Multi-Model Inference: Using Different Models for Different Tasks on the Same Machine
- **Status:** `idea`
- **Scheduled:** 2028-04-06
- **File:** `src/posts/2028-04-06-multi-model-inference-local.md`
- **Pitch:** You can run multiple models on one machine - small fast model for simple tasks, large capable model for hard reasoning. This post shows the patterns.
- **Angle:** Covers model selection strategies (routing based on task complexity, input length, or user tier), GPU/CPU sharing, and memory management. Real example: a system that routes simple requests (classification, extraction) to a small model, complex requests (reasoning, generation) to a large model. Addresses the gotcha: model loading/unloading overhead. Includes benchmarking and profiling tools.
- **Tags:** `llm`, `inference`, `edge-ai`, `performance`, `multi-model`

### Privacy-First AI: Building Systems Where Your Data Never Leaves Your Device
- **Status:** `idea`
- **Scheduled:** 2028-04-13
- **File:** `src/posts/2028-04-13-privacy-first-ai-local-only.md`
- **Pitch:** For regulated industries (healthcare, finance) and privacy-conscious users, local-only AI is table-stakes. This post shows how to build it.
- **Angle:** Covers the architecture decisions (local inference, encrypted storage, audit logging), the trade-offs (slower, limited to available hardware), and the compliance benefits (GDPR, HIPAA, PCI-DSS). Real example: a healthcare chatbot that processes patient data entirely locally. Tools and frameworks for building privacy-first systems. When to use local vs. cloud (hybrid approaches).
- **Tags:** `privacy`, `compliance`, `edge-ai`, `security`, `healthcare`

### From Notebooks to Production: Deploying Edge AI Applications
- **Status:** `idea`
- **Scheduled:** 2028-04-20
- **File:** `src/posts/2028-04-20-deploying-edge-ai-applications.md`
- **Pitch:** You've built a local AI tool - now how do you ship it to users' laptops? This post covers packaging, distribution, and maintenance.
- **Angle:** Covers: (1) packaging (Docker, Nix, native installers), (2) dependency management (bundling models, handling updates), (3) auto-updating (how to push new models without breaking installs), (4) metrics (understanding user behavior without seeing their data). Shows practical patterns for Electron apps, Docker containers, and native applications. Addresses the challenge: shipping the model with the app (huge file sizes) vs. downloading on first run.
- **Tags:** `deployment`, `edge-ai`, `devops`, `packaging`, `distribution`

### Combining Local and Cloud AI: Hybrid Architectures for Cost and Capability
- **Status:** `idea`
- **Scheduled:** 2028-04-27
- **File:** `src/posts/2028-04-27-hybrid-ai-local-and-cloud.md`
- **Pitch:** Local AI doesn't have to mean "all local" - hybrid approaches give you privacy where it matters and capability where you need it.
- **Angle:** Covers hybrid patterns: (1) local-first with cloud fallback (process locally, use cloud for complex reasoning), (2) edge inference with cloud training (keep data local, update models in the cloud), (3) asymmetric (sensitive operations local, everything else cloud). Real example: a research tool that processes papers locally but uses cloud API for complex synthesis. Cost/privacy/capability trade-offs for each pattern.
- **Tags:** `hybrid-architecture`, `edge-ai`, `cloud`, `cost-optimization`, `privacy`

---

## 📅 June-August 2028 - Capstone & Forward Look

Nine posts wrapping up the year's threads and previewing what's next.

### Reflecting on Two Years of Agentic Development: What Actually Shipped, What Disappeared, What's Next
- **Status:** `idea`
- **Scheduled:** 2028-06-07
- **File:** `src/posts/2028-06-07-agentic-development-two-year-retrospective.md`
- **Pitch:** Two years into mainstream agentic AI (2026-2028), patterns are clear. This post reflects on what worked, what didn't, and where the field is headed in 2029+.
- **Angle:** Structured look at: (1) what shipped (agentic products at scale, successful agent use cases), (2) what disappeared (hype cycles that didn't materialize), (3) what crystallized (best practices for prompt engineering, evaluation, safety). Personal, opinionated, grounded in shipped work. Covers emerging consensus on hard problems: hallucination detection, cost models, safety. Predictions for 2028-2029: model specialization, efficiency, reasoning on local hardware.
- **Tags:** `ai-agents`, `year-in-review`, `retrospective`, `editorial`

### The State of Local AI: Personal Computing Returns (But Different)
- **Status:** `idea`
- **Scheduled:** 2028-06-14
- **File:** `src/posts/2028-06-14-state-of-local-ai-personal-computing.md`
- **Pitch:** Local AI went from novelty to practical in 2027-2028. This post reflects on the shift back toward edge-first computing and what it means.
- **Angle:** Covers the technology shift (faster quantization, smaller capable models), the market shift (privacy concerns driving adoption), and the cultural shift (developers realizing cloud isn't always better). Real examples of things that are now better local (development, prototyping, document analysis) vs. still better in cloud (massive scale, fine-tuning, frontier models). Predictions on hardware (Apple's Neural Engine, specialized AI chips) and what that means for developers.
- **Tags:** `edge-ai`, `local-ai`, `personal-computing`, `privacy`, `hardware`

### Platform Engineering and AI: Self-Service Model Deployment Without Chaos
- **Status:** `idea`
- **Scheduled:** 2028-06-21
- **File:** `src/posts/2028-06-21-platform-engineering-ai-self-service.md`
- **Pitch:** AI is becoming like databases or queues - platform teams need to provide self-service infrastructure for models and agents.
- **Angle:** Covers what a platform for AI looks like: (1) model marketplace (approved models, easy deployment), (2) evaluation infrastructure (teams can test models on their data), (3) cost transparency (attribution to teams), (4) safety guardrails (baseline requirements for every deployment). Practical patterns: internal model catalogs, wrapper services for common model use cases. Addresses the challenge: not every team needs every model; how do you avoid chaos?
- **Tags:** `platform-engineering`, `ai-systems`, `internal-developer-platform`, `devops`

### Multi-Cloud AI: Building Systems That Aren't Locked Into One Provider
- **Status:** `idea`
- **Scheduled:** 2028-06-28
- **File:** `src/posts/2028-06-28-multi-cloud-ai-avoiding-lock-in.md`
- **Pitch:** Azure AI, AWS Bedrock, GCP Vertex AI all have different capabilities and pricing - smart teams use all three for different workloads.
- **Angle:** Covers: (1) selecting models/services per cloud (when Azure wins, when AWS wins, when GCP wins), (2) abstraction layers (OpenAI API compatibility, vLLM proxy), (3) cost optimization (routing workloads to cheapest cloud), (4) compliance (storing data in specific regions). Shows real examples: development on Azure, production on AWS for cost, GCP for analytics. Addresses multi-cloud complexity: more control vs. more ops burden.
- **Tags:** `multi-cloud`, `ai-systems`, `cost-optimization`, `architecture`

### Building Developer Tools With AI: Starting, Shipping, Sustaining
- **Status:** `idea`
- **Scheduled:** 2028-07-05
- **File:** `src/posts/2028-07-05-developer-tools-with-ai-shipping.md`
- **Pitch:** AI is a powerful material for developer tools - this post reflects on what works, what doesn't, and how to build tools that developers actually want.
- **Angle:** Covers the lifecycle: (1) ideas that sound great on paper but annoy developers (AI that second-guesses you constantly), (2) ideas that ship quietly but delight (AI that helps when asked, gets out of the way otherwise), (3) measurement (how do you know if developers like your AI feature?). Real examples from Claude Code, GitHub Copilot evolution, and smaller tools. Includes the failure modes: AI that's "always on" drives developers away. Future: AI assistants that learn your project, codebase, and style.
- **Tags:** `developer-tools`, `ai-ux`, `product-design`, `ai-systems`

### The Economics of AI Startups: Unit Economics, Margins, and When to Go Local
- **Status:** `idea`
- **Scheduled:** 2028-07-12
- **File:** `src/posts/2028-07-12-economics-ai-startups-unit-economics.md`
- **Pitch:** AI startup unit economics are brutal - high inference costs can make a business unsustainable. This post shows what works.
- **Angle:** Covers: (1) cost structures (API costs, hosting, data), (2) pricing models (per-token too aggressive; per-user or subscription more sustainable), (3) margin math (how many customers do you need to break even?), (4) optimization (when does fine-tuning help margins? Local inference?). Case studies: winners and failures. Predicts which business models survive: high-margin applications (compliance, security), vertical-specific tools (healthcare, legal), B2B infrastructure.
- **Tags:** `startup`, `business`, `ai-systems`, `economics`, `cost-optimization`

### Safety, Compliance, and AI: Building For Regulated Industries Without Getting Sued
- **Status:** `idea`
- **Scheduled:** 2028-07-19
- **File:** `src/posts/2028-07-19-ai-safety-compliance-regulated-industries.md`
- **Pitch:** Healthcare, finance, and legal are adopting AI but carrying massive liability. This post covers the risk-management approach that works.
- **Angle:** Covers: (1) liability models (who's responsible when the AI is wrong?), (2) audit trails (compliance requirements), (3) human-in-the-loop (when AI makes suggestions, humans decide), (4) evaluation and monitoring (catching regressions before they hurt patients/money). Practical frameworks from healthcare (FDA considerations) and finance (fair lending requirements). The uncomfortable truth: most AI in regulated industries today lives behind human review because the liability is too high to automate.
- **Tags:** `compliance`, `safety`, `healthcare`, `finance`, `risk-management`

### What's Next: Predictions for 2029 and Beyond
- **Status:** `idea`
- **Scheduled:** 2028-07-26
- **File:** `src/posts/2028-07-26-predictions-2029-and-beyond.md`
- **Pitch:** The field is moving fast - this post makes predictions on models, infrastructure, adoption, and what matters to learn now.
- **Angle:** Covers: (1) model trends (specialization, efficiency, multimodal), (2) infrastructure (continued commoditization, edge gains, open-source parity), (3) adoption (consolidation around proven patterns, enterprise maturity), (4) challenges (hallucination, safety, energy). Bets worth making: learning LLMOps, safety patterns, specialized domains (your industry-specific knowledge + AI). Personal view on what to watch: which startups, which research papers, which skills will matter most.
- **Tags:** `predictions`, `editorial`, `ai-systems`, `strategy`

---

## 📐 How to Use This Calendar

### Moving items between sections

Pull entries **forward** as publishing horizons approach - never delete. Sections are named by month range and suffixed `- Open` (not yet started) or `- Completed` (fully published); the active section in between (currently **📅 Pipeline - June-December 2026**) holds whatever's actually being worked. When a backlog item becomes a near-term priority, cut it from a later `- Open` section (e.g. **📅 January-February 2027 - Open**) and paste it into the active section. When a section fully publishes, retitle its suffix to `- Completed`; any entries that didn't make it roll forward into the next `- Open` section instead.

### Updating status

Change the `**Status:**` field in-place as the post moves through the pipeline:

| Status | Meaning |
|---|---|
| `idea` | Topic captured, not yet started |
| `draft` | Outline or first draft exists (link the draft file or branch) |
| `in-progress` | Actively being written or revised |
| `published` | Live on the site - record the date in `**Published:**` and the source path in `**File:**` |

### Linking draft source material

When an entry has existing draft material in `docs/article-ideas/`, add a `- **Source:**` line with the path to that file, in the position `- **File:**` would otherwise occupy. It applies only to `idea` entries that have something to write from but no post in `src/posts/` yet, and it's replaced by `- **File:**` once the post is actually written into `src/posts/`.

### Linking GitHub Issues

Once you open a GitHub Issue for a post, add an `- **Issue:**` line with the issue number (e.g. `#42`) - entries without an issue yet simply omit this line rather than using a placeholder. The `#42` syntax auto-links in GitHub's Markdown renderer. One issue per post; use the issue for draft feedback, outline review, and final sign-off comments.

### Agent-Based Workflow for Blog Posts

Blog posts flow through the Planner → Blog-Writer → Reviewer → Scribe pipeline:

**1. When a post is ready to work on (move it into the active 📅 Pipeline - June-December 2026 section):**
   - Create a GitHub Issue: `[Blog Post] Post Title Here` with a body containing the Pitch and Angle from this calendar
   - Link the issue: update this calendar entry with `#NNN`

**2. To draft the post:**
   - Invoke Blog-Writer: 
     ```
     Blog-Writer, draft this post per the editorial calendar:
     [copy the post entry from this calendar]
     ```
   - Blog-Writer will read the editorial plan and similar posts, then produce a complete draft with front matter, structure, and prose

**3. To review the draft:**
   - Invoke Reviewer:
     ```
     Reviewer, validate this draft:
     Title: [title]
     File: src/posts/YYYY-MM-DD-slug.md
     
     Check: front matter completeness, prose quality, technical accuracy, links work
     ```

**4. To publish:**
   - Commit the post to main
   - Update status to `published` and add the live URL

**5. Optional: Document learnings (if the post introduced new content patterns):**
   - Invoke Scribe:
     ```
     Scribe, document learnings from this post:
     [context about the post and any new patterns]
     ```

### Session checklist

At the start of each working session:

1. Review this calendar for posts that are:
   - Scheduled but still in `idea` status (likely overdue)
   - In `in-progress` for more than a week (likely blocked)
   - Ready to promote from a later `- Open` section into the active section

2. For each item needing work:
   - Create or update its GitHub Issue (if not already created)
   - Invoke Planner to design how to approach it, or
   - Invoke Blog-Writer directly if it's a straightforward post draft

3. At session close:
   - Update status fields in this calendar
   - Commit the calendar so the next session has fresh state

See `CLAUDE.md` and `docs/AGENT_ARCHITECTURE.md` for complete agent documentation.
