# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static blog ("Tech Notes") built with Eleventy (11ty) v2 and Tailwind CSS v4, deployed to GitHub Pages (`steve-kaschimer.github.io`). Content is DevOps/security/cloud-focused markdown posts under `src/posts/`.

## Commands

- `npm run dev` - primary local dev loop: runs the Eleventy dev server (http://localhost:8080, live reload) and the Tailwind watcher in parallel
- `npm run start` - Eleventy dev server only (won't pick up Tailwind/CSS changes)
- `npm run watch:css` - Tailwind watcher only
- `npm run build` - Eleventy build only (templates/content to `_site`), does **not** build CSS
- `npm run build:css` - one-shot minified Tailwind build, `src/styles/input.css` -> `_site/styles/output.css`
- `npm run deploy` - `build` + `build:css`; this is the full production build and what CI runs

There is no test suite and no lint script in this repo. Node 24 is required (`.nvmrc`, `package.json#engines`, and CI all pin to it).

## Architecture

### Eleventy config (`.eleventy.js`)

- `input: src`, `output: _site`, includes/layouts dirs under `src/_includes` / `src/_layouts`
- `templateFormats: ["md", "njk", "html"]`; `markdownTemplateEngine: false` (markdown is rendered as-is, then wrapped by the `njk` layout named in front matter)
- Passthrough copy: `src/images/**` and `src/js/**` go straight to `_site` unprocessed
- `posts` collection: globs `src/posts/*.md`, **filters out posts whose front-matter `date` is in the future**, sorted newest-first. Note: this only gates the homepage/RSS/sitemap listing - Eleventy still builds a real, public, unauthenticated HTML page for every post file regardless of date, so a future-dated post's URL is live (just unlinked) before its listed publish date. This is a known, intentional tradeoff (not currently gated with `noindex`).
- `tagListWithCounts` collection: aggregates tag counts across non-future posts (excludes the `posts`/`all` tags), drives the homepage tag-filter sidebar
- `readableDate` filter formats dates for display
- `findByUrl` filter: `collection | findByUrl(url)` - finds a page in a collection by its output `url`; used by `sitemap.njk` to read each static page's own `date` for `<lastmod>`

### Content model (`src/posts/*.md`)

Front matter used across templates: `layout: post.njk`, `title`, `author`, `date` (YYYY-MM-DD - this is what gates publish/visibility and sort order, independent of the filename), `image` (path under `/images/posts/`, `.webp`; the homepage card derives a responsive `srcset` by swapping in `-400w`/`-600w`/`-800w` filename suffixes), `image_prompt` (documents the AI image-gen prompt for the hero - not rendered, kept for provenance), `summary` (used for the card excerpt, meta/OG description, and RSS), `tags` (array - drives the tag filter UI and RSS `<category>` entries), `site_title`.

Filenames follow `YYYY-MM-DD-slug.md`; that date is just for ordering files on disk - the front-matter `date` is authoritative.

**Hero images:** this environment's outbound network policy blocks direct calls to `api.openai.com`, so image generation can't be automated from inside a Claude Code session here. When a post is drafted without a hero image, remind the user to generate one from the post's `image_prompt` field using **ChatGPT** (their preferred tool), then hand the resulting image back so it can be converted into the standard asset set (`<slug>-hero.png` source, full-size `.webp`, plus `-400w`/`-600w`/`-800w` responsive variants at quality 95, matching the existing posts).

### Layouts (`src/_layouts/`)

- `base.njk`: full HTML shell - nav, theme toggle, footer, all `<head>` metadata (OG/Twitter cards fall back to `/images/og-default.png` if a post has no `image`), Clarity + GA4 analytics, loads `/styles/output.css`. Loads `theme.js` synchronously in `<head>` (avoids flash-of-wrong-theme) and `tag-filter-checkboxes.js` / `code-copy.js` at the end of `<body>`, plus Prism.js + per-language components via CDN (currently yaml/bash/javascript/json/python/markup(html/xml) - add another `<script src=".../prism-<lang>.min.js">` here if a post needs highlighting for another language; several existing posts already use csharp/sql/hcl/graphql/typescript code fences that render unhighlighted since those components aren't loaded yet).
  - SEO: `og:type` is `article` (with `article:published_time`/`article:author`) on `/posts/*` URLs and `website` elsewhere, detected via `page.url.startsWith('/posts/')`. JSON-LD is emitted in `<head>` - `BlogPosting` + `BreadcrumbList` (`@graph`) on posts, `WebSite` elsewhere - built as a Nunjucks object literal and serialized with the `dump` filter (`| dump | safe`, not manual string interpolation, so titles/descriptions containing quotes don't break the JSON). Any page can opt into `<meta name="robots">` by setting a `robots` front-matter value (used by `404.njk` for `noindex`).
- `post.njk`: extends `base.njk`. Renders a hero - full-bleed image with `<picture>`/webp source if `image` is set, otherwise a gradient fallback - then post content inside `.prose`, then a "Back to all posts" link.

### Top-level pages (`src/*.njk`)

`index.njk` (homepage post grid + tag-filter sidebar over `collections.posts` / `collections.tagListWithCounts`), `feed.njk` (Atom feed at `/feed/` via `@11ty/eleventy-plugin-rss`), `about.njk`, `privacy.njk`, `terms.njk`, `robots.njk`, `sitemap.njk` (uses the custom `findByUrl` Eleventy filter to pull each static page's own git-derived `date` for an accurate `<lastmod>`), `404.njk` (permalink `/404.html` - GitHub Pages serves this automatically for unmatched URLs; sets `robots: noindex`).

### Client-side JS (`src/js/`, passthrough-copied, no bundler/build step)

- `theme.js`: light/dark mode via `localStorage['theme-preference']` + `.dark` class on `<html>`, toggled by `#theme-toggle`, synced across tabs via the `storage` event.
- `tag-filter-checkboxes.js`: client-side filter of `#posts-grid .post-card` elements against checked `.tag-checkbox` inputs - **OR logic** (a post shows if it matches *any* checked tag), persists selection to the URL hash (`#tags=...`) and restores it on load. Also owns progressive rendering of the (already fully server-rendered) grid: only the first 10 matching posts are shown at a time; the `#posts-load-more` button reveals 10 more per click and auto-triggers via `IntersectionObserver` as it scrolls into view. Filter changes reset back to the first 10.
- `code-copy.js`: adds copy-to-clipboard buttons to Prism-highlighted code blocks. Also sets `tabindex="0"` + `aria-label` on every `<pre>` (WCAG 2.1.1 - wide blocks overflow horizontally and need keyboard-focusable scroll); deliberately no `role="region"`, which would landmark every code block and trip axe's `landmark-unique` rule instead.

### Styling (`src/styles/input.css` -> `_site/styles/output.css`)

Tailwind v4 with **CSS-native config** (`@theme`, `@utility`, `@variant`) - there is no `tailwind.config.js`. Notable pieces:

- `@variant dark (&:where(.dark, .dark *))` - dark mode keys off the `.dark` class set by `theme.js`, not `prefers-color-scheme`
- Custom `primary-*` color scale and font vars for Space Grotesk / DM Sans / DM Mono (fonts loaded from Google Fonts in `base.njk`)
- Custom utilities for post/UI chrome: `callout-box`, `card`, `btn`/`btn-primary`, `code-block-wrapper`/`copy-code-button`, etc.
- GitHub-light/dark Prism token colors are defined **twice** (once under `.prose`, once as a standalone `@utility token` block) - keep both in sync when changing syntax-highlight colors

## Accessibility

Lighthouse CI's accessibility category (`.lighthouserc.json`, `>=0.9 error`) only catches a fraction of real WCAG issues - it's not a substitute for a real scan. `scripts/a11y-check.js` runs axe-core (WCAG 2.1 A/AA + best-practice rules) against a representative page set (home, a post, about, privacy, terms, 404) in both light and dark mode, using a real headless browser (color-contrast checks need actual computed styles, which a DOM-only tool can't give you).

**Run it after any change that touches shared templates, layouts, or `input.css` - and after adding a new post, since post content can introduce new headings or embedded HTML.** Fix violations before considering the work done; don't just report them.

```bash
npm run deploy                                    # build the site first
npm install --no-save axe-core playwright          # on-demand, not a committed dependency (see below)
node scripts/a11y-check.js
```

`playwright`/`axe-core` are deliberately **not** in `package.json` - adding them would make `npm ci` download a full Chromium browser on every `build-check.yml`/`deploy.yml` run for a check that isn't wired into CI. Install them on-demand per session instead.

## CI/CD (`.github/workflows/`)

- `build-check.yml`: PR gate against `main` - `npm ci` then `npm run deploy` must succeed
- `deploy.yml`: on push to `main` (+ daily cron + manual dispatch) - builds via `npm run build` + `npm run build:css`, deploys `_site` to GitHub Pages, then runs Lighthouse CI against the deployed URL per `.lighthouserc.json` (performance >=0.8 warn, accessibility >=0.9 error, best-practices/seo >=0.9 warn)
- `squad-*.yml`: separate issue-triage/assignment automation (Squad framework), not part of the build/deploy path

<!-- AI-SDLC:CLAUDE START -->
# Claude Code Instructions

This file provides Claude Code-specific configuration for the steve-kaschimer.github.io project.

**Please read and follow the guidance in [`AGENTS.md`](AGENTS.md)** for:
- Project overview and context
- Spec-Kit workflow commands
- Development workflow

## Claude-Specific Settings

- Spec Kit workflow skills are located in `.claude/skills/*/SKILL.md`
- Use the skill names directly as slash commands (e.g. `/specify`, `/plan`, `/tasks`) in Claude Code
- Framework version: 0.13.0

## Managed Context

<!-- SDD START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
once it has been generated.
<!-- SDD END -->
<!-- AI-SDLC:CLAUDE END -->
