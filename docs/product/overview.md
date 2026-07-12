# Product Overview

## What This Project Does Today

`steve-kaschimer.github.io` is a personal technical blog ("Tech Notes") - a static site built with Eleventy v2 and Tailwind v4, deployed to GitHub Pages. Content is DevOps/security/cloud/AI-agent-focused markdown posts, published on a weekly (Friday) cadence per `editorial-plan.md`. There is no backend, no database, and no user accounts - every page is pre-rendered HTML served directly by GitHub Pages.

The site's outcome is straightforward: give one author (Steve Kaschimer) a fast, low-maintenance publishing surface with the production concerns a "real" site needs - SEO (JSON-LD, OG/Twitter cards, sitemap), accessibility (axe-core-verified WCAG 2.1 AA), an RSS/Atom feed, tag-based discovery, dark mode - without introducing a CMS, a database, or server-side code.

## Users, Actors, or Consumers

- **Readers**: consume posts via the homepage grid (progressively loaded, tag-filterable), direct post URLs, or the Atom feed at `/feed/`. No accounts, no comments, no server-side personalization.
- **Steve Kaschimer (author/maintainer)**: writes and reviews content, generates hero images externally via ChatGPT (this repo's Claude Code sessions cannot call `api.openai.com` directly - see `docs/decisions/`), reviews and merges PRs.
- **Claude Code sessions** (this session included): draft posts against the editorial calendar, maintain the build/template/CSS layer, run accessibility and SEO passes, and open PRs. Session-specific instructions live in `CLAUDE.md`.
- **The "Squad" framework** (`.squad/`, `.github/workflows/squad-*.yml`): a dormant multi-agent editorial-automation framework (named personas - Trenton for content, Mr. Robot for Eleventy/build, Darlene for CI, Romero for deployment, Elliot for architecture, Ralph for status monitoring). Its scheduled heartbeat is commented out (`squad-heartbeat.yml`), and its decision log (`.squad/decisions.md`) has one entry from 2026-03-11 with nothing since - **assumption**: not in active use, but its labels (`squad:trenton`, `type:feature`, etc.) are still applied to the editorial-calendar GitHub Issues, so `taskstoissues`-style tooling should keep using them.

## Implementation-Relevant Rules

- **Front-matter `date` gates visibility, not the filename.** Filenames follow `YYYY-MM-DD-slug.md` for on-disk ordering only. The `posts` collection (`.eleventy.js`) filters out any post whose front-matter `date` is in the future from the homepage/RSS/sitemap - but Eleventy still builds a real, public HTML page for every post file regardless of date. A future-dated post's URL is live (unlinked, not indexed via sitemap, no `noindex` meta) before its listed publish date. This is a known, intentional tradeoff - explicitly confirmed with the maintainer (see `docs/context/gaps.md`), not something to "fix" unprompted.
- **Hero images require a manual handoff.** This environment's outbound network policy blocks direct calls to `api.openai.com` (confirmed via both `curl` and an MCP-based `openai-gpt-image-mcp` server - both hit a `403`/proxy-level policy denial). Image generation cannot be automated from inside a Claude Code session here. The maintainer generates images via ChatGPT from the post's `image_prompt` front-matter field and hands the result back for conversion into the standard asset set.
- **Every new post or template/CSS change requires an accessibility scan** (`npm run deploy && node scripts/a11y-check.js`) before being considered done - documented in `CLAUDE.md`, and this is not optional per explicit maintainer instruction (2026-07-12).
- **No test suite exists.** `scripts/a11y-check.js` is the closest thing to an automated correctness check; everything else is `npm run deploy` succeeding plus manual/agent-driven review.

## Observed Evidence

- `.eleventy.js` (posts collection date filtering), `CLAUDE.md` (hero image / accessibility workflow rules), `editorial-plan.md` (publishing cadence and per-post status tracking), `.squad/` + `.github/workflows/squad-*.yml` (dormant automation framework), `scripts/a11y-check.js` (the only automated check in the repo).

## Assumptions and Open Questions

See `docs/context/gaps.md` for the full list - notably the Squad framework's real-world usage status and a `package.json` engines/`​.nvmrc` version mismatch are inferred from evidence, not confirmed with the maintainer.
