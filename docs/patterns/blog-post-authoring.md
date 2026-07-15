# Blog Post Authoring

**Status**: Established
**Last Updated**: 2026-07-12

## Overview

The repeatable process for taking an editorial-calendar entry from `idea` to a merged, published post. Established over the March-September 2026 posts; most recently exercised drafting #126-129 (the September 2026 batch) in this session.

## Structure

1. Pull the entry from `editorial-plan.md` (`Pitch`/`Angle`/`Tags`/`Scheduled` date/`Issue` number).
2. Check 1-2 topically-related prior posts and reuse their established conventions rather than inventing new ones - SDK class names and call patterns for Azure AI Foundry posts (`AIProjectClient`, `FunctionTool`, `ToolSet`, `MessageRole`, etc.), Ruleset JSON schema for GitHub-Rulesets-adjacent posts, `permissions: {}` zero-baseline for any workflow YAML. Cross-link the prior post with a relative URL in the intro.
3. Write the post: front matter (`author`, `date`, `image_prompt`, `layout: post.njk`, `site_title`, `summary`, `tags`, `title` - alphabetical, `image` added later once a hero exists), then prose sections separated by `***`, `##`/`###` headings, code fences.
4. **Verify technical claims, don't just assert them.** Real regex patterns get tested against real match/no-match strings (Python `re`) before being written into a post. Real SDK class/parameter names get cross-checked against sibling posts already using that SDK, or against training-data confidence, not invented on the spot.
5. Build (`npm run deploy`) and check structure: heading count, code-block count/language, title tag - `grep -c "<h2"` / `grep -oE 'language-[a-z]+'` against the built `_site/posts/<slug>/index.html`.
6. Run the accessibility scan (`node scripts/a11y-check.js`, after `npm install --no-save axe-core playwright` if not already installed this session) - both the standard 6-page sweep and a direct check of the new post's own page, since the standard sweep only tests one arbitrarily-picked existing post.
7. Update the `editorial-plan.md` entry: `Status: idea` → `draft`, add the `File:` line.
8. Commit content and any incidental infra fixes (e.g. a missing Prism language component) as **separate commits** - keeps `git log`/PR history reviewable.
9. Open or update a PR, with **`Closes #<issue-number>`** in the body so merging auto-closes the tracking issue - this was missed for #125-129 (all closed manually after the fact, 2026-07-15) and shouldn't be repeated. If a PR from the same branch already exists and is still open, new commits land on it automatically - update the PR title/body to summarize everything currently included, since these PRs tend to accumulate multiple posts/fixes across a working session.
10. Hero image is a separate, later step - see `docs/decisions/2026-07-12-hero-images-are-a-manual-handoff.md`. A post ships and can even go live without one; it falls back to a gradient header/card.
11. Once merged, verify the linked issue actually closed (auto-close only fires if the PR that contains `Closes #N` is the one GitHub merges to the default branch - a squash-merge from a PR without that text in its final body won't trigger it). Also double check the issue's content actually matches what got published - the issue's `Pitch`/`Angle` was written before the post existed and can drift from what the post ended up covering.

## Example

`src/posts/2026-09-04-azure-ai-foundry-agents-memory-tool-calling-rag.md` cross-links and reuses conventions from two prior posts (`2026-07-24-multi-agent-patterns-...` for the `AIProjectClient`/`FunctionTool` SDK vocabulary, `2026-08-21-evaluating-llm-outputs-in-ci-cd` for `GroundednessEvaluator`/`RelevanceEvaluator` usage) rather than introducing new patterns for concepts already established.

## When to Use

- Every new post drafted against the editorial calendar.

## When NOT to Use

- One-off site changes (SEO, accessibility, template work) - those follow the change-then-`a11y-check` pattern documented in `CLAUDE.md` directly, not this content-authoring flow.

## Related

- `CLAUDE.md` Content model and Accessibility sections
- `docs/decisions/2026-07-12-hero-images-are-a-manual-handoff.md`
- `editorial-plan.md`
