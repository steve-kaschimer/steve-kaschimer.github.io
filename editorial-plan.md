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

## 📅 Backlog - Unscheduled Series

Two six-post series remain unscheduled, drawn from the drafts in `docs/article-ideas/`. They continue the Tuesday cadence once the .NET Deployment Options series ends on 2028-05-16, and they're listed here in priority order. They're deliberately undated - that horizon is too far out to put honest dates against - so each series gets one entry rather than six speculative ones, and entries are expanded into individual dated posts when a series moves onto the calendar.

### Auth & Identity for .NET (6 posts)
- **Status:** `idea`
- **Source:** `docs/article-ideas/top-5-auth-identity-solutions-dotnet-compared.md` + 5 getting-started drafts
- **Series:** Top 5 comparison, then ASP.NET Core Identity, Microsoft Entra External ID, Duende IdentityServer, Keycloak, Auth0
- **Pitch:** Duende IdentityServer - the direct successor to the free, widely-loved IdentityServer4 - now requires a commercial license for production use above a revenue threshold. That single change reshaped how .NET teams think about self-hosted identity, and this series runs into the same commercial-shift pattern the mapping and mocking series both hit.
- **Angle:** Compares the five across three genuinely different categories: an embedded user-management library, self-hosted protocol servers you operate yourself, and fully managed identity platforms you configure rather than run. The decision isn't a feature checklist, it's how much of the identity stack you want to own - including uptime, scaling, and security patching, which is where self-hosting costs are usually underestimated. Names OpenIddict as the free, .NET-native alternative that rose directly out of Duende's licensing change, even though it isn't one of the five deep dives.
- **Tags:** `dotnet`, `security`, `identity`, `oidc`, `architecture`

### .NET IDEs & Editors (6 posts)
- **Status:** `idea`
- **Source:** `docs/article-ideas/top-5-dotnet-ides-editors-compared.md` + 5 getting-started drafts
- **Series:** Top 5 comparison, then Visual Studio, JetBrains Rider, VS Code, Cursor, Neovim
- **Pitch:** "Visual Studio on Windows" stopped being the automatic answer. Rider has a real claim to being better for day-to-day C# work, VS Code became genuinely solid once the C# Dev Kit shipped, and in mid-2026 JetBrains extended full C# tooling - debugging included - to Cursor and other VS Code-compatible editors.
- **Angle:** Compares the five on platform support, cost, C# intelligence, and debugging, with Neovim included specifically for the terminal-first crowd rather than as a novelty entry. States the licensing detail that drives most of the current landscape upfront: Microsoft's C# Dev Kit is licensed for genuine VS Code only and does not run on Cursor or other forks, which is exactly the gap JetBrains moved into. Deliberately scoped to the core development experience and cross-references the AI Coding Agents track rather than re-litigating agent capability.
- **Tags:** `dotnet`, `tooling`, `developer-productivity`, `ai-coding-tools`

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
