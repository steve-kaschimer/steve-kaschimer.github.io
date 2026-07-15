---
author: Steve Kaschimer
date: 2026-12-18
image: /images/posts/2026-12-18-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, amber, and teal accents, styled like an annual report cover. A large '2026' rendered in a clean geometric font across the center, with small orbiting icons around it: a GitHub Octocat-style branch icon, a small agent/brain icon, a shield icon, and a policy-document icon, each connected to the numerals by thin light-trail arcs. Below, a minimalist three-column footer of small bar-chart glyphs labeled 'Shipped', 'Mattered', '2027', each with a short upward or flat trend line. The mood is reflective and confident - a year-end retrospective, not a product launch."
layout: post.njk
site_title: Tech Notes
summary: "A personal, opinionated retrospective on the year in developer security, CI/CD, and AI-assisted development - structured as what shipped, what actually mattered in practice versus what stayed theoretical, and what's worth watching going into 2027. Written for practitioners who lived through the year's actual rollouts, not the press releases."
tags: ["devsecops", "year-in-review", "github", "azure-ai-foundry", "editorial"]
title: "The DevSecOps Year in Review 2026: What Shipped, What Mattered, What's Next"
---

Every year-in-review risks being a list of announcements dressed up as insight. This one tries to avoid that by being explicit about the distinction: a lot shipped in 2026, a meaningfully smaller subset of it actually changed how teams work day to day, and an even smaller subset is worth carrying real attention into 2027. What follows is opinionated on purpose - a year spent writing about most of this in detail earns a strong opinion about which parts of it were real.

***

## What Shipped

**GitHub's security surface kept consolidating.** Rulesets matured into the default way to enforce branch and tag standards, [replacing branch protection rules](/posts/2026-05-08-github-branch-protection-rules-vs-rulesets/) as the more powerful, more auditable option. Merge queues went from a nice-to-have to [genuinely load-bearing infrastructure](/posts/2026-09-11-github-merge-queues/) for any repo with real PR volume. GitHub Advanced Security kept expanding what it covers by default, to the point where [rolling it out across a large org](/posts/2026-12-04-github-advanced-security-org-rollout/) became a sequencing problem worth its own playbook rather than a single settings toggle.

**Azure AI Foundry went from "first look" to genuinely production-shaped.** The year started with [an introductory look at agentic workflows](/posts/2026-06-19-azure-ai-foundry-first-look-agentic-ai-workflows/) and by year's end had accumulated the full stack a production agent actually needs: [evaluation in CI](/posts/2026-08-21-evaluating-llm-outputs-in-ci-cd/), [memory and RAG](/posts/2026-09-04-azure-ai-foundry-agents-memory-tool-calling-rag/), [multi-agent orchestration](/posts/2026-07-24-multi-agent-patterns-azure-ai-foundry-orchestration-handoff-shared-state/), [fine-tuning decision frameworks](/posts/2026-11-06-azure-ai-foundry-fine-tuning-customize-vs-prompt/), [prompt versioning as a first-class deployment artifact](/posts/2026-10-30-llmops-versioning-testing-deploying-prompts/), and [MCP-based tool servers](/posts/2026-12-11-azure-ai-foundry-mcp-servers-custom-tools/) that let agents share capabilities instead of each reimplementing them. That's a genuinely complete LLMOps toolchain that didn't fully exist at the start of the year.

**Agentic tooling started showing up inside the development process itself, not just as a feature teams build.** [Copilot doing PR review](/posts/2026-06-05-github-copilot-in-ci/) was the early version; by year's end that had extended to [agents enforcing specific architecture rules](/posts/2026-10-16-agentic-code-review-architecture-rules/) and [agents drafting test suites](/posts/2026-11-27-agentic-qa-ai-test-generation-exploratory-testing/) - the tooling turning inward, on the process that builds software, not just the AI features that software ships.

***

## What Actually Mattered in Practice

The honest signal on adoption, from a year of writing about this stuff in enough depth to see which posts described something teams were genuinely doing versus something that sounded good in a keynote:

**Merge queues and Rulesets mattered immediately and obviously**, because they solve a problem every team with more than a few contributors already has - a broken `main` from a race condition between two passing PRs, or a branch protection rule with a bypass nobody remembered granting. Adoption here wasn't a hard sell.

**Policy as code and [agentic architecture enforcement](/posts/2026-10-16-agentic-code-review-architecture-rules/) mattered more slowly, and more selectively**, than the pitch for either suggested it would. Both are genuinely valuable, and both require an org to already have its standards written down clearly enough to encode - which turned out to be the actual bottleneck more often than the tooling. A team without a settled answer to "what's our dependency-direction rule" doesn't get more clarity from an [OPA policy](/posts/2026-11-13-policy-as-code-opa-github-actions/) or an enforcement agent; it gets a tool with nothing correct to enforce yet.

**Fine-tuning stayed a narrow, deliberate tool, not the default upgrade path** it's often pitched as. The [decision framework](/posts/2026-11-06-azure-ai-foundry-fine-tuning-customize-vs-prompt/) - try better prompting, then RAG, then fine-tune only for the residual problem neither solves - held up in practice. Teams that reached for fine-tuning first, skipping that sequence, mostly rediscovered that the real problem was a retrieval gap or an under-iterated prompt.

**Agentic QA stayed genuinely early**, exactly as [that post predicted](/posts/2026-11-27-agentic-qa-ai-test-generation-exploratory-testing/) - useful as a fast first draft for the tedious 80% of test-writing, not yet trustworthy unsupervised, and the "augmentation, not replacement" framing turned out to be load-bearing rather than a hedge.

***

## What to Watch in 2027

**Agentic pipelines becoming the default shape of CI, not an add-on to it.** 2026 was the year agents got added to existing pipelines - a review step here, a test-generation step there. 2027 is likely the year some teams start designing the pipeline around an agent's involvement from the start, rather than bolting one onto a pipeline that was designed for purely deterministic steps.

**AI-native security tooling maturing past "LLM wrapped around a scanner."** Most of what shipped in 2026 under this label was existing static/dynamic analysis with an LLM summarizing or triaging the output - genuinely useful, but not a different category of tool yet. The interesting open question for 2027 is whether tooling emerges that reasons about vulnerability classes the way an agent reasons about a codebase, rather than just narrating a traditional scanner's findings in friendlier language.

**Platform engineering consolidation continuing**, with [internal developer platforms wired directly to GitHub as the source of truth](/posts/2026-11-20-internal-developer-platforms-backstage-github-api/) rather than a separately maintained catalog - the pattern that actually solves staleness, versus the pattern that just adds a UI on top of a problem that isn't fixed. Expect more of the ecosystem to follow that same "read from the source of truth, don't duplicate it" shape, because the alternative keeps failing the same way it failed before agents and IDPs were part of the conversation.

***

## Closing

The throughline across this whole year, more than any single feature: the tools that mattered were the ones that removed a step a human used to do from memory - remembering a rule, remembering to update a catalog, remembering to test an edge case - and replaced it with something that runs the same way every time. The tools that didn't move the needle as fast as their pitch suggested were mostly the ones that assumed the hard organizational work (writing the rule down clearly, deciding what "good" actually means) was already done. Going into 2027, that's still the actual bottleneck worth watching - not whether the tooling gets more capable, which it reliably will, but whether teams do the unglamorous work of making their own standards explicit enough for any of it to enforce.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
