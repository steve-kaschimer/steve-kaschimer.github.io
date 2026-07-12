# Glossary

Repo-specific terminology. Generic Eleventy/Tailwind/GitHub Actions vocabulary is skipped unless this repo uses it in a non-obvious way.

## Terms

| Term | Meaning | Evidence / Notes |
|------|---------|------------------|
| Hero image | A post's full-bleed header image, `.webp`, with `-400w`/`-600w`/`-800w` responsive variants alongside the full-size file and a `.png` source. Optional - posts without one get a gradient fallback. | `CLAUDE.md` Content model section; `src/_layouts/post.njk` |
| `image_prompt` | Front-matter field documenting the AI image-gen prompt for a post's hero. Not rendered anywhere - kept purely for provenance so the maintainer can regenerate the image later. | `CLAUDE.md`; every post in `src/posts/` |
| The handoff | Shorthand for the manual hero-image workflow: Claude writes `image_prompt`, the maintainer runs it through ChatGPT (not automatable in-session - `api.openai.com` is network-blocked here), sends the image back, Claude converts it to the standard asset set. | `docs/decisions/`, `CLAUDE.md` |
| Ruleset | GitHub's newer branch/tag protection system (as opposed to "classic branch protection"). Supports org-level enforcement, bypass actors, tag protection, evaluation mode, and the `merge_queue` rule type. This repo's blog covers Rulesets extensively; the repo's own branch protection setup is not verified against this glossary entry. | `src/posts/2026-05-08-github-branch-protection-rules-vs-rulesets.md`, `src/posts/2026-09-11-github-merge-queues.md` |
| Zero-baseline permissions | The `permissions: {}` pattern at workflow level, with every job declaring exactly the scopes it needs, as opposed to `permissions: read-all` or the (dangerous) unset default. Established convention this blog's own example workflows follow. | `src/posts/2026-03-25-github-actions-permissions-block.md`; reused in `src/posts/2026-09-11-github-merge-queues.md` and `src/posts/2026-09-25-github-packages-internal-registry.md` |
| The Squad | A dormant multi-agent editorial-automation framework with named personas (Trenton/content, Mr. Robot/build, Darlene/CI, Romero/deploy, Elliot/architecture, Ralph/monitoring, Scribe/decision-logging). Not the same thing as a Claude Code session working on this repo. | `.squad/`, `.github/workflows/squad-*.yml` |
| Editorial calendar | `editorial-plan.md` - the single source of truth for what content is planned/drafted/published, organized into monthly batches plus a rolling `Pipeline` section. Each entry tracks `Status` (`idea` → `draft` → `published`), `Scheduled` date, GitHub `Issue`, and `File` once drafted. | `editorial-plan.md`; `.squad/WORKFLOW.md` describes the intended (Squad-era) editing ritual |
| a11y-check | Shorthand used in this repo's own working conventions for running `scripts/a11y-check.js` - an axe-core WCAG scan, not a generic term. | `CLAUDE.md` Accessibility section |

## Synonyms to Avoid

| Preferred | Avoid |
|-----------|-------|
| Ruleset | "branch protection rule" (ambiguous - classic branch protection and Rulesets are different GitHub systems, both discussed in this blog) |
| `merge_queue` rule type | "merge queue feature" (the blog post is precise that it's a Ruleset *rule type*, not a separate GitHub feature) |

## Abbreviations and Acronyms

| Abbreviation | Full Term | Meaning / Context |
|--------------|-----------|-------------------|
| GHAS | GitHub Advanced Security | Referenced across several posts (secret scanning, code scanning); not something this repo itself has enabled - it's blog subject matter |
| RAG | Retrieval-Augmented Generation | Central topic of two September posts; also unrelated to this repo's own (nonexistent) retrieval infrastructure |
| WCAG | Web Content Accessibility Guidelines | The standard `scripts/a11y-check.js` verifies against (2.1 A/AA) |

## Notes

- Terms specific to *blog post subject matter* (Azure AI Foundry SDK classes, GitHub Packages registry formats, etc.) are intentionally excluded here - they're documented within their respective posts and don't affect how this repo itself is built or maintained.
- This glossary reflects the repo as of 2026-07-12. Re-verify entries tied to `.squad/` if that framework becomes active again.
