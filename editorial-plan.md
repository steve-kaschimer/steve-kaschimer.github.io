# Editorial Calendar

> A living schedule for blog content on steve-kaschimer.github.io. Each section represents a publishing horizon - move entries forward as they progress, update their status, and link GitHub Issues once created. See **📐 How to Use This Calendar** at the bottom for the full workflow.

---

## � March 2026 - Completed

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

## � April-May 2026 - Completed

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

## � This Period - May 2026

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

## � Pipeline - June-December 2026

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
- **Status:** `draft`
- **Scheduled:** 2026-06-26
- **Issue:** [#116](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/116) ✅ closed
- **File:** `src/posts/2026-06-26-github-projects-automation-custom-fields-workflows-graphql-api.md`
- **Pitch:** GitHub Projects v2 has a powerful automation layer that most teams barely touch - this post shows how to build a lightweight engineering workflow without leaving GitHub.
- **Angle:** Covers custom field types (iteration, single-select, number), built-in auto-add and status workflows, and the GraphQL API for programmatic project updates from GitHub Actions. Practical example: auto-assigning sprint, linking PR status to issue progress, and generating a weekly digest via a scheduled workflow.
- **Tags:** `github`, `developer-productivity`, `project-management`, `github-actions`

---

### Semantic Kernel and Azure AI Foundry: Building Your First AI Agent in .NET
- **Status:** `draft`
- **Scheduled:** 2026-07-03
- **Issue:** [#117](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/117) ✅ closed
- **File:** `src/posts/2026-07-03-semantic-kernel-azure-ai-foundry-first-agent-dotnet.md`
- **Pitch:** Semantic Kernel is Microsoft's open-source SDK for building AI agents, and Azure AI Foundry is its natural deployment target - together they give .NET developers a production path for agentic apps.
- **Angle:** Builds a working agent that uses a Foundry-hosted model, registers a plugin with a tool function, and executes a multi-step plan. Explains the kernel, memory, planner, and plugin concepts in concrete code rather than diagrams. Includes a GitHub Actions workflow for deploying the agent to Azure Container Apps.
- **Tags:** `azure-ai-foundry`, `semantic-kernel`, `ai-agents`, `dotnet`, `agentic-development`

### GitHub Actions Advanced Caching: Strategies That Actually Cut Build Times
- **Status:** `draft`
- **Scheduled:** 2026-07-10
- **Issue:** [#118](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/118) ✅ closed
- **File:** `src/posts/2026-07-10-github-actions-advanced-caching-strategies.md`
- **Pitch:** Most teams use `actions/cache` with a single key and wonder why cache hit rates are low - this post covers the cache key strategies that actually work for real build systems.
- **Angle:** Covers restore-keys fallback chains, scoping cache by branch vs. by PR, matrix-aware cache keys, and per-job vs. per-workflow cache sharing. Includes worked examples for npm, Gradle, pip, and Docker layer caching. Addresses the cache poisoning risk and how GitHub's isolation model mitigates it.
- **Tags:** `github-actions`, `ci-cd`, `developer-productivity`, `performance`

### Container Image Security in CI: Scanning with Trivy and GitHub Advanced Security
- **Status:** `draft`
- **Scheduled:** 2026-07-17
- **Issue:** [#119](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/119) ✅ closed
- **File:** `src/posts/2026-07-17-container-image-security-trivy-github-advanced-security.md`
- **Pitch:** Scanning container images for vulnerabilities before they ship is table stakes for DevSecOps, but most teams don't know how to get actionable signal out of the noise.
- **Angle:** Shows how to run Trivy in a GitHub Actions workflow, convert output to SARIF, upload to the GitHub Security tab, and configure severity thresholds that block builds without creating alert fatigue. Also covers base image pinning, multi-stage build hardening, and what to do when your base image has unfixable CVEs.
- **Tags:** `container-security`, `github-advanced-security`, `devsecops`, `trivy`, `docker`

### Multi-Agent Patterns with Azure AI Foundry: Orchestration, Handoff, and Shared State
- **Status:** `draft`
- **Scheduled:** 2026-07-24
- **Issue:** [#120](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/120) ✅ closed
- **File:** `src/posts/2026-07-24-multi-agent-patterns-azure-ai-foundry-orchestration-handoff-shared-state.md`
- **Pitch:** Single agents hit a ceiling quickly - real agentic applications route tasks across specialized agents, and Azure AI Foundry provides the primitives to do this without building your own orchestration layer.
- **Angle:** Covers the three core multi-agent patterns (sequential pipeline, parallel fan-out, hierarchical orchestrator/sub-agent) with concrete Foundry implementations. Discusses shared memory and state management across agents, error handling when a sub-agent fails, and observability - how to trace a user request through a chain of agents.
- **Tags:** `azure-ai-foundry`, `ai-agents`, `agentic-development`, `multi-agent`, `azure`

### IaC Security Scanning in CI: Catching Terraform and Bicep Misconfigurations Before They Deploy
- **Status:** `draft`
- **Scheduled:** 2026-07-31
- **Issue:** [#121](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/121) ✅ closed
- **File:** `src/posts/2026-07-31-iac-security-scanning-terraform-bicep-ci.md`
- **Pitch:** Misconfigured infrastructure is one of the most common causes of cloud security incidents, and catching it in CI costs nothing compared to fixing it post-deployment.
- **Angle:** Shows how to integrate Checkov and tfsec into a GitHub Actions workflow for Terraform, and PSRule for Bicep. Covers converting results to SARIF for the GitHub Security tab, setting break-on-severity thresholds, and handling false positives with inline suppressions that are reviewable in PRs.
- **Tags:** `infrastructure-as-code`, `security`, `devsecops`, `terraform`, `github-actions`

---

### Prompt Engineering for Developers: Writing Reliable Instructions for Agentic Systems
- **Status:** `idea`
- **Scheduled:** 2026-08-07
- **Issue:** [#122](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/122)
- **Pitch:** Prompt engineering for agents is different from prompting a chatbot - reliability, tool use, and output format predictability matter far more than creativity.
- **Angle:** Covers system prompt structure for agents (role, context, constraints, output format), few-shot examples for tool selection, handling ambiguous user input gracefully, and testing prompts systematically rather than eyeballing outputs. Uses Azure AI Foundry's prompt flow as the testing harness.
- **Tags:** `prompt-engineering`, `ai-agents`, `agentic-development`, `azure-ai-foundry`, `llm`

### GitHub Environments Deep Dive: Deployment Protection Rules, Secrets, and Variables
- **Status:** `idea`
- **Scheduled:** 2026-08-14
- **Issue:** [#123](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/123)
- **Pitch:** GitHub Environments are the right place to model staging/production deployment gates, but most teams use them only for required reviewer approval and miss the rest of the capability.
- **Angle:** Covers deployment protection rules (required reviewers, wait timers, branch filters, custom rules via webhooks), the difference between environment secrets and repository secrets, and how to use environment variables to manage config promotion across environments. Includes a GitHub Actions workflow that enforces a staging smoke test before production is unlocked.
- **Tags:** `github-actions`, `ci-cd`, `deployment`, `devsecops`, `environments`

### Evaluating LLM Outputs in CI/CD: Testing Your AI Features Like Production Code
- **Status:** `idea`
- **Scheduled:** 2026-08-21
- **Issue:** [#124](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/124)
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

Pull entries **forward** as publishing horizons approach - never delete. When a backlog item becomes a near-term priority, cut it from **📦 Backlog** and paste it into **📋 Next Up** (or directly into **🗓 This Period** if it's urgent). When a period closes, any unstarted entries roll back down to **📋 Next Up** or **📦 Backlog** depending on priority.

### Updating status

Change the `**Status:**` field in-place as the post moves through the pipeline:

| Status | Meaning |
|---|---|
| `idea` | Topic captured, not yet started |
| `draft` | Outline or first draft exists (link the draft file or branch) |
| `in-progress` | Actively being written or revised |
| `published` | Live on the site - add the URL next to the status |

### Linking GitHub Issues

Once you open a GitHub Issue for a post, replace `#TBD` with the issue number (e.g. `#42`). The `#42` syntax auto-links in GitHub's Markdown renderer. One issue per post; use the issue for draft feedback, outline review, and final sign-off comments.

### Agent-Based Workflow for Blog Posts

Blog posts flow through the Planner → Blog-Writer → Reviewer → Scribe pipeline:

**1. When a post is ready to work on (move from 📦 Backlog to 🗓 This Period):**
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
   - Ready to promote from 📦 Backlog to 🗓 This Period

2. For each item needing work:
   - Create or update its GitHub Issue (if not already created)
   - Invoke Planner to design how to approach it, or
   - Invoke Blog-Writer directly if it's a straightforward post draft

3. At session close:
   - Update status fields in this calendar
   - Commit the calendar so the next session has fresh state

See `CLAUDE.md` and `docs/AGENT_ARCHITECTURE.md` for complete agent documentation.
