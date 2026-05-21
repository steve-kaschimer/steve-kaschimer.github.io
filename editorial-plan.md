# Editorial Calendar

> A living schedule for blog content on steve-kaschimer.github.io. Each section represents a publishing horizon - move entries forward as they progress, update their status, and link GitHub Issues once created. See **📐 How to Use This Calendar** at the bottom for the full workflow.

---

## � March 2026 - Completed

All three posts in this batch have been published.

### Deploying to GitHub Pages with GitHub Actions: Beyond the Defaults
- **Status:** `published`
- **Published:** 2026-03-18
- **Issue:** [#95](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/95) ✅ closed
- **File:** 
- **Pitch:** The default `peaceiris/actions-gh-pages` workflow gets you up and running, but it leaks build artifacts, skips caching, and doesn't handle environment protection or OIDC - this post shows the production-grade version.
- **Angle:** Rebuilds the deployment pipeline from scratch using the official `actions/deploy-pages` action with OIDC token authentication (no `GITHUB_TOKEN` secret exposure), proper cache keys for the build tool, and a staging environment that requires reviewer approval before the production deploy.
- **Tags:** `github-actions`, `github-pages`, `ci-cd`, `eleventy`, `deployment`

### The GitHub Actions `permissions` Block: Principle of Least Privilege for Workflows
- **Status:** `published`
- **Published:** 2026-03-25
- **Issue:** [#96](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/96) ✅ closed
- **File:** 
- **Pitch:** By default, GitHub Actions workflows run with a token that has write access to your entire repository - explicitly scoping `permissions` to the minimum required is a one-line security improvement most workflows skip.
- **Angle:** Shows the blast radius of a compromised workflow token with default permissions (hint: an attacker can push to main, create releases, and exfiltrate secrets). Walks through the permissions model, explains why `contents: read` should be the default, and provides a hardened workflow template for the five most common workflow patterns: test, release, deploy, PR comment, and dependency update.
- **Tags:** `github-actions`, `security`, `devsecops`, `ci-cd`

### Tailwind CSS v4: What Actually Changed and How to Migrate
- **Status:** `published`
- **Published:** 2026-04-01
- **Issue:** [#97](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/97) ✅ closed
- **File:** 
- **Pitch:** Tailwind v4 ships a completely rewritten engine, drops `tailwind.config.js` in favor of CSS-native configuration, and changes how plugins and themes work - this post is the migration guide for developers already using v3.
- **Angle:** Side-by-side comparison of v3 vs. v4 config syntax with a real migration of this blog's `tailwind.config.js`. Benchmarks cold build time before and after, explains what `@theme` and `@utility` replace, and flags the three breaking changes most likely to burn you (custom screen breakpoints, arbitrary value syntax, dark mode configuration).
- **Tags:** `tailwind-css`, `css`, `static-sites`, `eleventy`

---

## � April–May 2026 - Completed

Both posts in this batch have been published.

### GitHub Actions: Reusable Workflows vs. Composite Actions - Know the Difference
- **Status:** `published`
- **Published:** 2026-03-13
- **Issue:** [#98](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/98) ✅ closed
- **File:** 
- **Pitch:** Reusable workflows and composite actions both let you DRY up your pipelines, but they have fundamentally different scoping rules, secret-passing behaviors, and failure semantics - choosing the wrong one causes subtle bugs.
- **Angle:** Side-by-side comparison driven by concrete failure scenarios: a secret that silently disappears, a matrix that can't be inherited, a status check that reports to the wrong job. Readers finish knowing exactly which abstraction to reach for and why.
- **Tags:** `github-actions`, `ci-cd`, `devops`, `workflow-design`

### GitHub Branch Protection Rules vs. Rulesets: The New Way to Enforce Standards
- **Status:** `published`
- **Published:** 2026-05-08
- **Issue:** [#99](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/99) ✅ closed
- **File:** 
- **Pitch:** GitHub Rulesets replace the old branch protection model and are strictly more powerful, but the migration path and new capabilities are poorly documented - this post maps what changed and what you should migrate today.
- **Angle:** Covers the key differences: Rulesets apply to tags and branches, support bypass actors, and work at the organization level. Includes a YAML-driven Ruleset template for a typical open-source project and a GitHub Actions workflow that audits whether all repos in an org have Rulesets configured.
- **Tags:** `github`, `branch-protection`, `devsecops`, `platform-engineering`

---

## � This Period - May 2026

One post scheduled and ready to publish on May 29.

### Enforcing Code Quality with GitHub Actions Status Checks You Can Actually Trust
- **Status:** `in-progress` - scheduled 2026-05-29
- **Issue:** [#100](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/100) ✅ closed
- **File:** 
- **Pitch:** Status checks only work as a quality gate if they're fast enough for developers to respect and strict enough to be meaningful - most pipelines fail one or both criteria.
- **Angle:** Covers the four failure modes of status checks (flaky tests, slow linters, bypass-able required checks, missing branch coverage enforcement) and a concrete remediation for each. Includes workflow patterns for parallelizing linters, using `paths` filters to skip irrelevant checks, and configuring required status checks via the GitHub API so they can't be bypassed even by repo admins.
- **Tags:** `github-actions`, `ci-cd`, `code-quality`, `developer-productivity`

### Trunk-Based Development in Practice: What They Don't Tell You
- **Status:** `published`
- **Published:** 2026-03-20
- **Issue:** [#101](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/101) ✅ closed
- **File:** 
- **Pitch:** Trunk-based development is the delivery model behind high-performing engineering teams, but the advice online glosses over the cultural and tooling prerequisites that make it safe.
- **Angle:** Covers the hard parts: feature flags as a first-class citizen, how to handle database migrations without long-lived branches, the minimum branch protection ruleset you need, and how to talk your team out of GitFlow. Grounded in The Accelerate research.
- **Tags:** `git`, `devops`, `ci-cd`, `developer-productivity`, `branching-strategy`

### Dependabot Advanced: Getting Past the Noise
- **Status:** `published`
- **Published:** 2026-03-27
- **Issue:** [#102](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/102) ✅ closed
- **File:** 
- **Pitch:** Default Dependabot configuration floods teams with low-signal PRs; this post shows how to tune grouping, scheduling, versioning strategies, and auto-merge rules so you actually merge dependency updates instead of ignoring them.
- **Angle:** Starts from a realistic monorepo with npm, Docker, and GitHub Actions dependencies. Walks through a battle-tested `dependabot.yml` that cuts PR volume by 70% while keeping security updates fast. Also covers when to switch to Renovate and why.
- **Tags:** `dependabot`, `supply-chain-security`, `github`, `dependency-management`

### Understanding CVSS Scores: A Practical Guide for Developers
- **Status:** `published`
- **Published:** 2026-04-03
- **Issue:** [#103](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/103) ✅ closed
- **File:** 
- **Pitch:** CVSS scores show up in Dependabot alerts and security advisories every day, but most developers treat them as black boxes - this post teaches you to read them critically so you can triage accurately instead of panic-patching.
- **Angle:** Breaks down the CVSS v3.1 vector string (AV, AC, PR, UI, S, C, I, A) using real CVEs pulled from npm and GitHub Advisory Database examples. Shows how the same "Critical 9.8" can be a fire drill or a non-issue depending on your deployment context.
- **Tags:** `security`, `vulnerability-management`, `devsecops`, `developer-education`

### Generating and Using SBOMs with GitHub Actions
- **Status:** `published`
- **Published:** 2026-04-10
- **Issue:** [#104](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/104) ✅ closed
- **File:** 
- **Pitch:** A Software Bill of Materials (SBOM) is becoming a compliance requirement for many development teams, and GitHub Actions makes generating, attesting, and publishing one surprisingly straightforward.
- **Angle:** Practical walkthrough using `anchore/sbom-action` and GitHub's artifact attestation to produce a CycloneDX SBOM, attach it to a release, and validate it downstream. Addresses why the SBOM matters beyond compliance - it's also a debugging tool for transitive dependency surprises.
- **Tags:** `sbom`, `supply-chain-security`, `github-actions`, `compliance`

### GitHub CLI Power User: 10 `gh` Commands That Replace Browser Tabs
- **Status:** `published`
- **Published:** 2026-04-17
- **Issue:** [#105](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/105) ✅ closed
- **File:** 
- **Pitch:** The `gh` CLI can handle PR reviews, issue triage, secret management, and workflow triggers without leaving the terminal - most developers use 20% of it and miss the most productive parts.
- **Angle:** Focused on commands that replace real browser workflows: `gh pr checkout`, `gh run watch`, `gh secret set`, `gh repo clone --template`, `gh issue develop`. Includes shell aliases and a practical script for daily standup prep.
- **Tags:** `github-cli`, `developer-productivity`, `tooling`, `terminal`

### Writing Commit Messages That Make Code Review Faster
- **Status:** `published`
- **Published:** 2026-04-24
- **Issue:** [#106](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/106) ✅ closed
- **File:** 
- **Pitch:** A well-written commit message is the smallest unit of developer communication, and most engineers write them badly - this post teaches a repeatable format that makes diffs self-documenting and `git log` actually useful.
- **Angle:** Uses the Conventional Commits spec as a baseline but goes further: how to write the body (`why`, not `what`), how to link issues and PRs correctly, how to use `git notes` for post-merge context, and how to configure a commit-msg hook that enforces format in CI.
- **Tags:** `git`, `developer-productivity`, `writing-for-engineers`, `code-review`

### Architecture Decision Records: The 30-Minute Investment That Pays Off for Years
- **Status:** `published`
- **Published:** 2026-05-01
- **Issue:** [#107](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/107) ✅ closed
- **File:** 
- **Pitch:** ADRs are the most underused documentation practice in software engineering - a lightweight Markdown file per decision that eliminates "why did we do it this way?" forever.
- **Angle:** Walks through creating an ADR template, storing ADRs in a `docs/decisions/` folder in the repo, linking them from PR descriptions, and using GitHub Discussions for the deliberation phase. Includes a real-world example: choosing between Nunjucks and Liquid for an Eleventy project.
- **Tags:** `documentation`, `architecture`, `writing-for-engineers`, `developer-productivity`

### Shift Right: Why Production Observability Is a Security Practice
- **Status:** `published`
- **Published:** 2026-05-15
- **Issue:** [#108](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/108) ✅ closed
- **File:** 
- **Pitch:** Shifting left catches vulnerabilities before deployment, but attackers operate in production - runtime observability (logs, traces, alerts) is the underinvested complement to a strong shift-left posture.
- **Angle:** Argues that observability and security share the same data (anomalous request patterns, unexpected process spawns, unusual outbound connections) and should share the same tooling. Shows how to instrument a Node.js app with OpenTelemetry, route signals to GitHub's security alerts via a custom action, and define alert thresholds that distinguish abuse from bugs.
- **Tags:** `observability`, `security`, `devsecops`, `opentelemetry`, `nodejs`

---

## � Pipeline - June-December 2026

One post per Friday through end of year. Topics rotate across the established DevSecOps/GitHub/CI-CD themes plus a new Azure AI Foundry and agentic development thread.

---

### GitHub Copilot in CI: Automating Code Review at Scale
- **Status:** `published`
- **Scheduled:** 2026-06-05
- **Issue:** [#113](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/113) ✅ closed
- **File:** 
- **Pitch:** Copilot can do more than autocomplete in an IDE - used in CI it can flag issues on every PR without a human reviewer being available, and this post shows how to wire it up safely.
- **Angle:** Walks through the `github/copilot-code-review` action, how to constrain it to specific file patterns, how to prevent it from approving its own suggestions, and how to read its output as a non-blocking signal vs. a hard gate.
- **Tags:** `github-copilot`, `github-actions`, `ai`, `code-review`, `developer-productivity`

### OpenID Connect in GitHub Actions: Replacing Long-Lived Secrets with Short-Lived Tokens
- **Status:** `published`
- **Published:** 2026-06-12
- **Issue:** [#114](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/114) ✅ closed
- **File:** 
- **Pitch:** Long-lived cloud credentials stored as GitHub secrets are a supply-chain risk - OIDC lets GitHub Actions authenticate to AWS, Azure, and GCP without any stored secret at all.
- **Angle:** Covers the trust model (GitHub as OIDC provider, cloud as relying party), shows the exact IAM/role configuration for Azure and AWS, and demonstrates a deployment workflow that uses no secrets whatsoever. Includes a checklist for auditing existing workflows still using static credentials.
- **Tags:** `github-actions`, `security`, `devsecops`, `oidc`, `ci-cd`

### Azure AI Foundry: A Developer's First Look at Agentic AI Workflows
- **Status:** `published`
- **Scheduled:** 2026-06-19
- **Issue:** [#115](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/115) ✅ closed
- **File:** 
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
- **Status:** `idea`
- **Scheduled:** 2026-07-10
- **Issue:** [#118](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/118)
- **Pitch:** Most teams use `actions/cache` with a single key and wonder why cache hit rates are low - this post covers the cache key strategies that actually work for real build systems.
- **Angle:** Covers restore-keys fallback chains, scoping cache by branch vs. by PR, matrix-aware cache keys, and per-job vs. per-workflow cache sharing. Includes worked examples for npm, Gradle, pip, and Docker layer caching. Addresses the cache poisoning risk and how GitHub's isolation model mitigates it.
- **Tags:** `github-actions`, `ci-cd`, `developer-productivity`, `performance`

### Container Image Security in CI: Scanning with Trivy and GitHub Advanced Security
- **Status:** `idea`
- **Scheduled:** 2026-07-17
- **Issue:** [#119](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/119)
- **Pitch:** Scanning container images for vulnerabilities before they ship is table stakes for DevSecOps, but most teams don't know how to get actionable signal out of the noise.
- **Angle:** Shows how to run Trivy in a GitHub Actions workflow, convert output to SARIF, upload to the GitHub Security tab, and configure severity thresholds that block builds without creating alert fatigue. Also covers base image pinning, multi-stage build hardening, and what to do when your base image has unfixable CVEs.
- **Tags:** `container-security`, `github-advanced-security`, `devsecops`, `trivy`, `docker`

### Multi-Agent Patterns with Azure AI Foundry: Orchestration, Handoff, and Shared State
- **Status:** `idea`
- **Scheduled:** 2026-07-24
- **Issue:** [#120](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/120)
- **Pitch:** Single agents hit a ceiling quickly - real agentic applications route tasks across specialized agents, and Azure AI Foundry provides the primitives to do this without building your own orchestration layer.
- **Angle:** Covers the three core multi-agent patterns (sequential pipeline, parallel fan-out, hierarchical orchestrator/sub-agent) with concrete Foundry implementations. Discusses shared memory and state management across agents, error handling when a sub-agent fails, and observability - how to trace a user request through a chain of agents.
- **Tags:** `azure-ai-foundry`, `ai-agents`, `agentic-development`, `multi-agent`, `azure`

### IaC Security Scanning in CI: Catching Terraform and Bicep Misconfigurations Before They Deploy
- **Status:** `idea`
- **Scheduled:** 2026-07-31
- **Issue:** [#121](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/121)
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
- **Status:** `idea`
- **Scheduled:** 2026-08-28
- **Issue:** [#125](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/125)
- **Pitch:** GitHub's built-in secret scanning covers common provider tokens, but internal API keys, connection strings, and proprietary credential formats require custom patterns - which most teams never configure.
- **Angle:** Walks through writing a custom secret scanning pattern (regex + test strings), deploying it at the org level, setting up push protection to block commits containing matches, and routing alerts to a security dashboard. Includes patterns for common internal formats: JWT with known issuer, internal API key prefix, database connection strings.
- **Tags:** `secret-scanning`, `github-advanced-security`, `devsecops`, `security`

---

### Azure AI Foundry Agents: Memory, Tool Calling, and Retrieval-Augmented Generation
- **Status:** `idea`
- **Scheduled:** 2026-09-04
- **Issue:** [#126](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/126)
- **Pitch:** Memory and RAG are what separate a useful agent from a stateless chatbot - this post covers the Foundry primitives for both and when to use each.
- **Angle:** Distinguishes conversation memory (thread state), semantic memory (vector search over documents), and episodic memory (structured facts about the user/session). Shows how to connect an Azure AI Search index to a Foundry agent, write a tool function that queries it, and ground responses in retrieved context without hallucinating citations.
- **Tags:** `azure-ai-foundry`, `ai-agents`, `rag`, `azure-ai-search`, `agentic-development`

### GitHub Merge Queues: Safe, Scalable Merging Without Branch Protection Bottlenecks
- **Status:** `idea`
- **Scheduled:** 2026-09-11
- **Issue:** [#127](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/127)
- **Pitch:** At scale, required status checks on protected branches create a thundering herd problem where every PR re-runs CI after every merge - merge queues solve this without sacrificing safety.
- **Angle:** Explains the merge queue model (batching, pre-merge CI, jump-the-queue for urgent fixes), shows how to configure one via Rulesets, and covers the failure modes (stale base detection, batch splitting on failure). Compares merge queues to the older `bors`/`homu` bots used in large open-source projects.
- **Tags:** `github`, `ci-cd`, `developer-productivity`, `branch-protection`, `platform-engineering`

### RAG in Production: Chunking, Indexing, and Observability with Azure AI Search
- **Status:** `idea`
- **Scheduled:** 2026-09-18
- **Issue:** [#128](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/128)
- **Pitch:** Getting a RAG prototype working is easy - getting it to produce accurate, grounded responses at scale requires deliberate decisions about chunking strategy, index design, and retrieval evaluation.
- **Angle:** Covers chunking strategies (fixed-size, sentence-boundary, semantic), hybrid search (keyword + vector), re-ranking with Azure AI Search semantic ranker, and how to measure retrieval quality. Includes an Azure AI Foundry evaluation run that scores groundedness and relevance on a test query set.
- **Tags:** `rag`, `azure-ai-search`, `azure-ai-foundry`, `llm`, `agentic-development`

### GitHub Packages as an Internal Registry: Publishing and Consuming npm, Docker, and Maven Artifacts
- **Status:** `idea`
- **Scheduled:** 2026-09-25
- **Issue:** [#129](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/129)
- **Pitch:** GitHub Packages is an underused alternative to JFrog, Nexus, or a public registry for teams that want artifact management without extra infrastructure.
- **Angle:** Covers publishing npm packages, Docker images, and Maven artifacts to GitHub Packages from a GitHub Actions workflow, consuming them in downstream workflows using the GITHUB_TOKEN (no PAT required), and setting package visibility and retention policies. Addresses the one real limitation: cross-org consumption requires a PAT.
- **Tags:** `github-packages`, `github-actions`, `ci-cd`, `artifact-management`, `platform-engineering`

---

### Responsible AI in the SDLC: Governance Gates You Can Automate with GitHub Actions
- **Status:** `idea`
- **Scheduled:** 2026-10-02
- **Issue:** [#130](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/130)
- **Pitch:** Responsible AI isn't just a policy document - it's a set of checks you can automate into your deployment pipeline to catch bias, safety violations, and compliance issues before they ship.
- **Angle:** Maps the Microsoft Responsible AI principles to concrete CI checks: content safety filtering via Azure AI Content Safety, bias detection on model evaluation datasets, documentation completeness for model cards, and sign-off gates in GitHub Environments. Shows how to fail a deployment workflow when a content safety score exceeds a threshold.
- **Tags:** `responsible-ai`, `azure-ai-foundry`, `devsecops`, `compliance`, `governance`

### GitHub Codespaces for Team Onboarding: Eliminating "Works on My Machine" at Scale
- **Status:** `idea`
- **Scheduled:** 2026-10-09
- **Issue:** [#131](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/131)
- **Pitch:** A well-configured Codespace means a new team member goes from zero to running the app in under five minutes on any device - this post shows how to build one.
- **Angle:** Covers `devcontainer.json` from scratch (base image, features, lifecycle commands, port forwarding), pre-building images to eliminate cold-start time, dotfiles integration for personal preferences, and Codespace secrets for environment-specific config. Includes a cost model for teams considering Codespaces vs. local dev.
- **Tags:** `github-codespaces`, `developer-productivity`, `devcontainer`, `onboarding`

### Agentic Code Review: Using AI Agents to Enforce Architecture Rules on Every PR
- **Status:** `idea`
- **Scheduled:** 2026-10-16
- **Issue:** [#132](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/132)
- **Pitch:** Architecture rules that live in documents get violated; architecture rules enforced by an agent on every PR get followed - this post shows how to build the latter.
- **Angle:** Builds a GitHub Actions-triggered agent that reads a PR diff, checks it against a set of architecture constraints stored in the repo (ADRs, dependency rules, naming conventions), and posts a structured review comment. Uses Azure AI Foundry for the agent runtime and the GitHub REST API for PR interaction. Covers how to keep the rules up to date as the architecture evolves.
- **Tags:** `ai-agents`, `code-review`, `azure-ai-foundry`, `github-actions`, `architecture`

### GitHub Actions Self-Hosted Runners: Security Hardening for Production Workloads
- **Status:** `idea`
- **Scheduled:** 2026-10-23
- **Issue:** [#133](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/133)
- **Pitch:** Self-hosted runners unlock private network access and custom hardware, but they introduce security risks that GitHub-hosted runners don't have - most teams running them haven't hardened them.
- **Angle:** Covers the attack surface (persistent runner compromise, malicious PR targeting, secret exfiltration via environment), and the mitigations: ephemeral runners with autoscaling (ARC), network egress controls, workflow approval for external contributors, and runner groups scoped to specific repos. Includes an Azure Container Apps-based ephemeral runner setup.
- **Tags:** `github-actions`, `security`, `devsecops`, `runners`, `platform-engineering`

### LLMOps: Versioning, Testing, and Deploying Prompts as First-Class Artifacts
- **Status:** `idea`
- **Scheduled:** 2026-10-30
- **Issue:** [#134](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/134)
- **Pitch:** Prompts are code - they need versioning, testing, and a deployment pipeline. Most teams manage them as strings scattered across application code, which makes regression invisible.
- **Angle:** Covers storing prompts as versioned files in the repo, running evaluation tests against them in CI using Azure AI Foundry prompt flow, gating deployments on evaluation score thresholds, and rolling back a prompt version the same way you'd roll back a code deployment. Draws the analogy to feature flags for gradual prompt rollout.
- **Tags:** `llmops`, `azure-ai-foundry`, `prompt-engineering`, `ci-cd`, `agentic-development`

---

### Azure AI Foundry Fine-Tuning: When to Customize a Model vs. When to Prompt Better
- **Status:** `idea`
- **Scheduled:** 2026-11-06
- **Issue:** [#135](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/135)
- **Pitch:** Fine-tuning is often the wrong answer - it's expensive, opaque, and fragile - but for the right problem it dramatically outperforms prompt engineering alone. This post helps you decide.
- **Angle:** Sets up the decision framework: when few-shot examples consistently get the format right but aren't reliable enough (fine-tune), vs. when the model doesn't have the domain knowledge (RAG). Shows how to prepare a training dataset, run a supervised fine-tune job in Azure AI Foundry, evaluate the fine-tuned model against the base, and deploy both behind an A/B traffic split.
- **Tags:** `azure-ai-foundry`, `fine-tuning`, `llm`, `agentic-development`, `azure`

### Policy as Code with OPA and GitHub Actions: Enforcing Org Standards at the Merge Gate
- **Status:** `idea`
- **Scheduled:** 2026-11-13
- **Issue:** [#136](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/136)
- **Pitch:** Open Policy Agent lets you express compliance rules as code and enforce them in CI - this post shows how to use it to gate merges on policy rather than on a human reviewer's memory.
- **Angle:** Covers writing Rego policies for common engineering standards (required labels on PRs, allowed base images in Dockerfiles, required fields in workflow files), running OPA in a GitHub Actions workflow, and surfacing policy violations as PR check failures with actionable messages. Includes a policy for enforcing the `permissions` block on all workflow files.
- **Tags:** `policy-as-code`, `opa`, `github-actions`, `devsecops`, `compliance`

### Internal Developer Platforms with GitHub: Backstage, Service Catalog, and the GitHub API
- **Status:** `idea`
- **Scheduled:** 2026-11-20
- **Issue:** [#137](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/137)
- **Pitch:** Backstage is the most widely adopted IDP framework, and GitHub is its most natural data source - this post shows how to wire them together so your catalog stays in sync with your actual codebase.
- **Angle:** Covers deploying Backstage with the GitHub integration, writing catalog-info.yaml for a real service, auto-discovering catalog entries from GitHub repos using the GitHub Entity Provider, and using GitHub Actions to keep the catalog updated when repos are created or archived. Includes a GitHub App setup that gives Backstage read-only access without a PAT.
- **Tags:** `developer-platform`, `backstage`, `github`, `platform-engineering`, `developer-productivity`

### Agentic QA: How AI Agents Are Reshaping Test Generation and Exploratory Testing
- **Status:** `idea`
- **Scheduled:** 2026-11-27
- **Issue:** [#138](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/138)
- **Pitch:** AI agents that understand a codebase can generate regression tests, explore edge cases, and find issues a human tester would miss - the tooling is early but the results are already useful.
- **Angle:** Surveys the current landscape (GitHub Copilot test generation, Azure AI Foundry-based test agents, open-source options), builds a simple agent that reads a function and generates a parameterized test suite for it, and discusses where the pattern breaks down (flaky agents, hallucinated assertions, coverage theater). Frames it as augmentation not replacement.
- **Tags:** `ai-agents`, `testing`, `agentic-development`, `azure-ai-foundry`, `developer-productivity`

---

### GitHub Advanced Security at the Org Level: Rolling Out GHAS Across 100+ Repos
- **Status:** `idea`
- **Scheduled:** 2026-12-04
- **Issue:** [#139](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/139)
- **Pitch:** Enabling GHAS on one repo is easy; rolling it out consistently across a large org without alert fatigue or developer friction requires a deliberate strategy.
- **Angle:** Covers the rollout sequence (secret scanning first, then code scanning, then Dependabot alerts with auto-dismiss rules), using the GitHub REST API and `gh` CLI to audit enablement status across repos, setting org-level default setup for CodeQL, and building a compliance dashboard with GitHub Actions that reports on coverage weekly.
- **Tags:** `github-advanced-security`, `devsecops`, `platform-engineering`, `codeql`, `secret-scanning`

### Azure AI Foundry MCP Servers: Building and Registering Custom Tools for Your Agents
- **Status:** `idea`
- **Scheduled:** 2026-12-11
- **Issue:** [#140](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/140)
- **Pitch:** The Model Context Protocol lets agents call external tools over a standard interface - Azure AI Foundry's MCP server support means you can extend your agents with custom capabilities without forking the runtime.
- **Angle:** Builds an MCP server that exposes two tools (a GitHub API wrapper and an internal knowledge base query), registers it with a Foundry agent, and shows the agent routing tool calls correctly. Covers the MCP schema, authentication between the agent and the server, and deploying the MCP server as an Azure Container App alongside the agent.
- **Tags:** `azure-ai-foundry`, `mcp`, `ai-agents`, `agentic-development`, `azure`

### The DevSecOps Year in Review 2026: What Shipped, What Mattered, What's Next
- **Status:** `idea`
- **Scheduled:** 2026-12-18
- **Issue:** [#141](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/141)
- **Pitch:** A retrospective on the year's most significant shifts in developer security, CI/CD, and AI-assisted development - written for practitioners who want signal, not press releases.
- **Angle:** Structured as three sections: what shipped (concrete features from GitHub, Azure, and the ecosystem), what actually mattered in practice (the things teams adopted vs. the things that stayed theoretical), and what to watch in 2027 (agentic pipelines, AI-native security tooling, platform engineering consolidation). Personal and opinionated.
- **Tags:** `devsecops`, `year-in-review`, `github`, `azure-ai-foundry`, `editorial`

### Async-First Development: Writing Code and Processes That Work Across Time Zones
- **Status:** `idea`
- **Scheduled:** 2026-12-25
- **Issue:** [#142](https://github.com/steve-kaschimer/steve-kaschimer.github.io/issues/142)
- **Pitch:** The best remote engineering teams aren't just distributed - they're async-first, which means their code, processes, and tooling are designed to work without real-time coordination.
- **Angle:** Covers the practices that separate async-capable teams from ones that just have standup on Zoom: commit message discipline, ADR-driven decision-making, self-documenting PRs, GitHub Discussions for async deliberation, and using GitHub Actions to automate the status updates that would otherwise require a Slack message. Light enough for the holiday week, substantive enough to be worth reading.
- **Tags:** `developer-productivity`, `remote-work`, `writing-for-engineers`, `git`, `async`

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

### Session kickoff ritual

1. **Ralph** opens the session and queries the calendar for any entries whose status has changed or whose target period has elapsed.
2. Ralph reports the backlog count and flags any posts that are overdue or blocked.
3. The coordinator fans out tasks: **Trenton** picks up a writing or editing task; **Mr. Robot** handles any tooling or deployment work surfaced during the review.
4. At session close, update status fields and commit the calendar so the next session opens with fresh state.
