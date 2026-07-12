# Repo Map

## Read Order

1. `CLAUDE.md` - the canonical, actively-maintained project brief. Read this before anything else; it's kept current every session.
2. `editorial-plan.md` - what's published, drafted, or queued. Check before writing a new post so you don't duplicate work.
3. `.eleventy.js` + `src/_layouts/base.njk` - the whole site's runtime shape lives in these two files.
4. `scripts/a11y-check.js` - the only automated check; run it, don't just read it.
5. This `docs/` tree, for anything CLAUDE.md doesn't cover in enough depth.

## Key Entry Points

| Path | Why it matters |
|---|---|
| `.eleventy.js` | Collections (`posts`, `tagListWithCounts`), filters (`readableDate`, `findByUrl`), build config. The date-filtering logic here is why future-dated posts don't appear on the homepage but still build a real page. |
| `src/_layouts/base.njk` | Every page's HTML shell. All SEO (JSON-LD, OG/Twitter), all CDN script tags (Prism, fonts, analytics), nav/footer. Most site-wide changes touch this file. |
| `src/_layouts/post.njk` | Post-specific rendering: hero image/gradient fallback, `.prose` wrapper. |
| `src/js/tag-filter-checkboxes.js` | Owns both tag filtering *and* homepage progressive loading/pagination - not two separate concerns despite the filename. |
| `src/js/code-copy.js` | Copy buttons *and* the keyboard-accessibility fix for scrollable code blocks (`tabindex`/`aria-label`) - same file, two responsibilities. |
| `scripts/a11y-check.js` | The repo's only automated verification. Not a committed dependency (`playwright`/`axe-core` install on-demand) - see `docs/decisions/`. |
| `package.json` | Build scripts (`dev`, `build`, `build:css`, `deploy`). No test script. `engines.node` says `>=20` but CI/`.nvmrc` pin `24` - see `docs/context/gaps.md`. |
| `.github/workflows/build-check.yml` | PR gate: `npm ci && npm run deploy` must succeed. No accessibility or deploy step. |
| `.github/workflows/deploy.yml` | The real deploy path: build → `actions/deploy-pages` → Lighthouse CI against the live URL. Runs on push to `main`, daily cron, and manual dispatch. |
| `.lighthouserc.json` | Lighthouse CI thresholds. Accessibility is the only category set to `error` (≥0.9); performance/best-practices/SEO are `warn`. |
| `editorial-plan.md` | Editorial source of truth - per-post `Status`/`Scheduled`/`Issue`/`File`, organized into monthly batches plus a rolling `## Pipeline` section covering June-December 2026. |
| `CLAUDE.md` | The living project brief - architecture, conventions, and explicit workflow rules (hero image handoff, accessibility-check requirement). Updated every session; treat as more current than this `docs/` tree if they ever disagree. |

## Supporting Paths

| Path | Why it matters |
|---|---|
| `src/_data/site.json` | Global template data - site title/description/URL/author contact. |
| `src/styles/input.css` | Tailwind v4 CSS-native config (`@theme`, `@utility`, `@variant`) - there is no `tailwind.config.js`. |
| `src/images/posts/` | Hero image asset convention: `<slug>-hero.png` source + `.webp` + `-400w`/`-600w`/`-800w` variants at quality 95. |
| `.squad/` | Dormant multi-agent automation framework - see `docs/product/overview.md` before assuming it's active. |
| `docs/architecture/adr/`, `docs/architecture/database-schema-example.md` | Untouched sample scaffolds. This repo has no database and no decision yet at ADR scale - leave these as marked samples, don't treat as real content. |

## Notes

- This repo has no `tests/` directory and no test framework. Don't go looking for one.
- Last verified against the repo as of 2026-07-12 (through PR #155 and the accessibility/September-content work in this session).
