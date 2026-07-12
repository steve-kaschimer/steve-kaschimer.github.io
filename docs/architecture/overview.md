# Architecture Overview

## System Shape

A static site: Eleventy v2 compiles Markdown/Nunjucks under `src/` into plain HTML in `_site/`, Tailwind v4 compiles `src/styles/input.css` into `_site/styles/output.css` as a separate build step, and GitHub Pages serves the result. No server, no database, no runtime backend of any kind - `_site/` is disposable build output, never committed.

Primary execution entrypoints are npm scripts in `package.json` (`dev`, `build`, `build:css`, `deploy`) and two GitHub Actions workflows (`build-check.yml`, `deploy.yml`). There is no CLI or API surface beyond that.

## Key Modules and Responsibilities

- **`.eleventy.js`**: Eleventy config - input/output dirs, `templateFormats`, the `posts` and `tagListWithCounts` collections (both date-filtered, see `docs/product/overview.md`), the `readableDate` and `findByUrl` filters. `findByUrl` exists specifically so `sitemap.njk` can pull each static page's own git-derived `date` for an accurate `<lastmod>`.
- **`src/_layouts/base.njk`**: the entire HTML shell - nav, footer, all `<head>` metadata (SEO/OG/Twitter/JSON-LD), Prism.js + per-language CDN components, Clarity/GA4 analytics. Every page in the site extends this, directly or via `post.njk`.
- **`src/_layouts/post.njk`**: extends `base.njk`; renders the post hero (full-bleed image or gradient fallback) and wraps content in `.prose`.
- **`src/js/`** (passthrough-copied, no bundler): `theme.js` (dark mode), `tag-filter-checkboxes.js` (tag filtering + homepage progressive-loading pagination, both owned by the same file), `code-copy.js` (copy-to-clipboard buttons + keyboard-accessibility attributes on scrollable code blocks).
- **`scripts/a11y-check.js`**: the only automated verification in the repo. Spins up a static file server, drives headless Chromium via Playwright, runs axe-core against 6 representative pages in light + dark mode. Not wired into CI (see `docs/decisions/`).
- **`src/_data/site.json`**: global template data (site title, description, canonical URL, author contact info).

## Important Flows

**Local dev**: `npm run dev` runs `npm-run-all --parallel start watch:css` - Eleventy's dev server plus a Tailwind watcher, both writing into a live `_site/`.

**Production build**: `npm run deploy` = `npm run build && npm run build:css` - Eleventy build first, Tailwind CSS build second (Tailwind reads the already-built `_site/` structure for content scanning). This exact two-step order matters and is what both CI workflows run.

**PR flow**: `build-check.yml` runs `npm ci && npm run deploy` against every PR targeting `main`. No deployment, no accessibility check - it's a build-succeeds gate only.

**Deploy flow**: `deploy.yml` runs on push to `main`, on a daily cron, and via manual dispatch. Builds the same way as `build-check.yml`, uploads `_site/` as a Pages artifact, deploys via `actions/deploy-pages`, then runs Lighthouse CI against the live deployed URL per `.lighthouserc.json` (performance ≥0.8 warn, accessibility ≥0.9 error, best-practices/SEO ≥0.9 warn - accessibility is the only category that fails the build).

**Accessibility flow** (agent-driven, not CI-enforced): `npm run deploy && node scripts/a11y-check.js` - CLAUDE.md requires this after any change touching shared templates/layouts/`input.css`, or after adding a new post. Violations found this way get fixed in the same work session, not just reported (real example: this workflow found and fixed a site-wide `scrollable-region-focusable` violation in `code-copy.js`, and three separate `color-contrast` violations traced back to `primary-600`/`primary-500` failing WCAG AA's 4.5:1 minimum - see git history around 2026-07-11/12 for the fixes).

## Integrations and Platform Surfaces

- **GitHub Pages**: the only deployment target. `actions/deploy-pages`, not a `gh-pages` branch.
- **GitHub Actions**: `build-check.yml`, `deploy.yml` (both real, active); `squad-*.yml` (separate, likely-dormant automation - see `docs/product/overview.md`).
- **External CDNs loaded at runtime**: Google Fonts (`fonts.googleapis.com`), Prism.js + language components (`cdnjs.cloudflare.com`), Microsoft Clarity, Google Analytics (`gtag.js`). **Observed operational note**: in this Claude Code sandbox specifically, both `cdnjs.cloudflare.com` and `api.openai.com` have been hit with hard `403` proxy-policy denials during this session (confirmed via `curl` and via an attempted MCP image-generation server) - this is a sandbox network-policy characteristic, not a defect in the site. `scripts/a11y-check.js` works around exactly this by blocking all non-localhost requests during its scan.
- **Azure AI Foundry / Azure AI Search / GitHub Packages / GitHub Rulesets, etc.**: these are *subjects of blog posts*, not integrations this repo actually has - the code examples in `src/posts/*.md` are illustrative content, not executed by anything in this repository.

## Build, Test, and Delivery

- Install: `npm ci` (Node 24 - see `docs/context/gaps.md` for a version-pin inconsistency worth resolving).
- Build: `npm run deploy` (`build` + `build:css`, in that order).
- Test: none in the conventional sense. `scripts/a11y-check.js` is real but manual/agent-invoked, not part of `npm ci`'s dependency graph (deliberately - see `docs/decisions/`).
- Release: push to `main` → `deploy.yml` → GitHub Pages, fully automated, no manual deployment step.

## Observed Evidence

`.eleventy.js`, `package.json` scripts, `.github/workflows/build-check.yml`, `.github/workflows/deploy.yml`, `.lighthouserc.json`, `scripts/a11y-check.js`, `src/_layouts/base.njk`, `CLAUDE.md`.

## Assumptions and Open Questions

See `docs/context/gaps.md`.
