# Copilot Instructions - Tech Notes (steve-kaschimer.github.io)

Static blog built with **Eleventy (11ty) v3** + **Tailwind CSS v4**, deployed to GitHub Pages. No test suite, no lint script. Node >=20 required.

## Commands

- `npm run dev` - primary local loop: Eleventy dev server (http://localhost:8080, live reload) + Tailwind watcher in parallel
- `npm run start` - Eleventy dev server only (won't pick up CSS changes)
- `npm run watch:css` - Tailwind watcher only
- `npm run build` - Eleventy build only (`src` → `_site`), does **not** build CSS
- `npm run build:css` - one-shot minified Tailwind build (`src/styles/input.css` → `_site/styles/output.css`)
- `npm run deploy` - `build` + `build:css`; this is the full production build and what CI runs

Always run `npm run deploy` (not just `npm run build`) before validating a change end-to-end - templates and CSS are separate pipelines.

## Architecture

### Eleventy config (`.eleventy.js`)
- `input: src`, `output: _site`; template formats `md`, `njk`, `html`; `markdownTemplateEngine: false` (markdown renders as-is, then gets wrapped by the `njk` layout named in front matter)
- Passthrough copy: `src/images/**` and `src/js/**` go straight to `_site` unprocessed - no bundler
- `posts` collection: globs `src/posts/*.md`, **filters out posts whose front-matter `date` is in the future**, sorted newest-first. This only gates the homepage/RSS/sitemap listing - Eleventy still builds a real, public, unauthenticated HTML page for every post file regardless of date, so a future-dated post's URL is live (just unlinked) before its listed publish date. This is a known, intentional tradeoff.
- `tagListWithCounts` collection: aggregates tag counts across non-future posts, drives the homepage tag-filter sidebar
- `findByUrl` filter (`collection | findByUrl(url)`): finds a page in a collection by its output `url`; used by `sitemap.njk` for accurate `<lastmod>` per static page

### Content model (`src/posts/*.md`)
Front matter: `layout: post.njk`, `title`, `author`, `date` (YYYY-MM-DD - gates publish/visibility and sort order, independent of filename), `image` (path under `/images/posts/`, `.webp`; homepage card derives a responsive `srcset` by swapping in `-400w`/`-600w`/`-800w` filename suffixes), `image_prompt` (documents the AI image-gen prompt for the hero - not rendered, kept for provenance), `summary` (card excerpt, meta/OG description, RSS), `tags` (array - drives tag filter UI and RSS `<category>`), `site_title`.

Filenames follow `YYYY-MM-DD-slug.md`; that date is only for ordering files on disk - the front-matter `date` is authoritative for publish gating.

**Hero images:** this environment's outbound network policy blocks direct calls to `api.openai.com`, so image generation can't be automated from an agent session. When a post is drafted without a hero image, tell the user to generate one from the post's `image_prompt` using ChatGPT, then convert the result into the standard asset set: `<slug>-hero.png` source, full-size `.webp`, plus `-400w`/`-600w`/`-800w` responsive variants at quality 95, matching existing posts.

### Layouts (`src/_layouts/`)
- `base.njk`: full HTML shell - nav, theme toggle, footer, all `<head>` metadata (OG/Twitter cards fall back to `/images/og-default.png` if a post has no `image`), Clarity + GA4 analytics, loads `/styles/output.css`. Loads `theme.js` synchronously in `<head>` (avoids flash-of-wrong-theme) and `tag-filter-checkboxes.js` / `code-copy.js` at end of `<body>`, plus Prism.js + per-language components via CDN (currently yaml/bash/javascript/json/python/markup). Add another `<script src=".../prism-<lang>.min.js">` here if a post needs highlighting for a new language - several existing posts already use csharp/sql/hcl/graphql/typescript/rego fences that render unhighlighted since those components aren't loaded.
  - SEO: `og:type` is `article` (with `article:published_time`/`article:author`) on `/posts/*` URLs, `website` elsewhere, detected via `page.url.startsWith('/posts/')`. JSON-LD emitted in `<head>` (`BlogPosting` + `BreadcrumbList` `@graph` on posts, `WebSite` elsewhere) - built as a Nunjucks object literal and serialized with `| dump | safe` (never manual string interpolation, so quotes in titles/descriptions don't break the JSON). Any page can opt into `<meta name="robots">` via a `robots` front-matter value (used by `404.njk`).
- `post.njk`: extends `base.njk`. Renders a hero (full-bleed image with `<picture>`/webp source, or gradient fallback), then post content in `.prose`, then a "Back to all posts" link.

### Top-level pages (`src/*.njk`)
`index.njk` (homepage grid + tag-filter sidebar over `collections.posts` / `collections.tagListWithCounts`), `feed.njk` (Atom feed at `/feed/` via `@11ty/eleventy-plugin-rss`), `about.njk`, `privacy.njk`, `terms.njk`, `robots.njk`, `sitemap.njk` (uses `findByUrl` for per-page `<lastmod>`), `404.njk` (permalink `/404.html`, `robots: noindex`).

### Client-side JS (`src/js/`, passthrough-copied, no bundler)
- `theme.js`: light/dark mode via `localStorage['theme-preference']` + `.dark` class on `<html>`, toggled by `#theme-toggle`, synced across tabs via `storage` event
- `tag-filter-checkboxes.js`: client-side filter of `#posts-grid .post-card` against checked `.tag-checkbox` inputs - **OR logic** (post shows if it matches any checked tag), persists selection to URL hash (`#tags=...`). Also owns progressive rendering of the already server-rendered grid: shows first 10 matches, `#posts-load-more` reveals 10 more per click and auto-triggers via `IntersectionObserver`. Filter changes reset back to first 10.
- `code-copy.js`: adds copy-to-clipboard buttons to Prism code blocks. Also sets `tabindex="0"` + `aria-label` on every `<pre>` (WCAG 2.1.1 - wide blocks overflow and need keyboard-focusable scroll); deliberately no `role="region"`, which would trip axe's `landmark-unique` rule.

### Styling (`src/styles/input.css` → `_site/styles/output.css`)
Tailwind v4 with **CSS-native config** (`@theme`, `@utility`, `@variant`) - there is **no `tailwind.config.js`**. Notable pieces:
- `@variant dark (&:where(.dark, .dark *))` - dark mode keys off the `.dark` class set by `theme.js`, not `prefers-color-scheme`
- Custom `primary-*` color scale and font vars for Space Grotesk / DM Sans / DM Mono (loaded from Google Fonts in `base.njk`)
- Custom utilities for post/UI chrome: `callout-box`, `card`, `btn`/`btn-primary`, `code-block-wrapper`/`copy-code-button`, etc.
- GitHub-light/dark Prism token colors are defined **twice** (once under `.prose`, once as a standalone `@utility token` block) - keep both in sync when changing syntax-highlight colors

## Accessibility

Lighthouse CI's accessibility category (`.lighthouserc.json`, `>=0.9 error`) only catches a fraction of real WCAG issues - not a substitute for a real scan. `scripts/a11y-check.js` runs axe-core (WCAG 2.1 A/AA + best-practice rules) against a representative page set (home, a post, about, privacy, terms, 404) in both light and dark mode, using headless Playwright (color-contrast checks need real computed styles, which a DOM-only tool can't give).

**Run it after any change touching shared templates, layouts, or `input.css` - and after adding a new post**, since post content can introduce new headings or embedded HTML. Fix violations before considering the work done.

```bash
npm run deploy                                     # build the site first
npm install --no-save axe-core playwright          # on-demand, not a committed dependency
node scripts/a11y-check.js
```

`playwright`/`axe-core` are deliberately **not** in `package.json` - adding them would force `npm ci` to download a full Chromium browser on every `build-check.yml`/`deploy.yml` run for a check that isn't wired into CI. Install them on-demand per session instead.

## CI/CD (`.github/workflows/`)

- `build-check.yml`: PR gate against `main` - `npm ci` then `npm run deploy` must succeed
- `deploy.yml`: on push to `main` (+ daily cron + manual dispatch) - builds via `npm run build` + `npm run build:css`, deploys `_site` to GitHub Pages, then runs Lighthouse CI against the deployed URL per `.lighthouserc.json` (performance >=0.8 warn, accessibility >=0.9 error, best-practices/seo >=0.9 warn)

## Conventions when making changes

- Never hand-edit anything under `_site/` - it's the Eleventy build output, entirely regenerated by `npm run deploy`
- New posts go in `src/posts/YYYY-MM-DD-slug.md` with the front-matter fields listed above; verify the `date` value is what you intend before assuming it will appear on the homepage
- When editing shared layouts/templates/CSS, run the a11y check (above) before calling the work done
- Keep the two Prism token-color blocks in `input.css` in sync
- Update `editorial-plan.md` `Status`/`File` fields as posts move `idea` → `draft` → `published`
- Verify claims against the actual repo state (grep the code, check the workflow file, run the command) rather than assuming from memory - this repo has a history of stale docs describing behavior that no longer matches the code
