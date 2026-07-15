# Context Gaps

## Current Gaps

- **Area**: `package.json` `engines.node` (`>=20`) vs. `.nvmrc`/CI (`24`)
  - **Why it matters**: A contributor on Node 20-23 would pass npm's engine check but potentially hit different behavior than CI, which pins exactly `24` in both `build-check.yml` and `deploy.yml`. `CLAUDE.md` states "Node 24 is required," which is accurate to what CI actually enforces but slightly stronger than what `package.json` itself declares.
  - **Evidence checked**: `.nvmrc` (`24`), `package.json#engines` (`>=20`), `.github/workflows/build-check.yml` and `deploy.yml` (`node-version: '24'`).
  - **Next best reviewer or source**: The maintainer - either tighten `engines.node` to `24` for consistency, or confirm `>=20` is intentional (broader local-dev compatibility) and note that explicitly somewhere.

- **Area**: The Squad automation framework's real operational status
  - **Why it matters**: `.squad/` and `.github/workflows/squad-*.yml` describe an active multi-agent editorial workflow with routing rules, session rituals, and issue labels - but the heartbeat cron is commented out in `squad-heartbeat.yml`, and `.squad/decisions.md` has exactly one session entry, dated 2026-03-11, with nothing recorded since. It's unclear whether this is dormant-but-still-intended, or fully superseded by direct Claude Code sessions (which is how all editorial work has actually happened in this session).
  - **Evidence checked**: `.squad/decisions.md`, `.squad/WORKFLOW.md`, `squad-heartbeat.yml`'s disabled cron trigger, absence of any Squad-persona commits in recent `git log`.
  - **Next best reviewer or source**: The maintainer. If dormant, consider whether `squad-*.yml` workflows should be disabled/removed to avoid confusing future contributors; if still intended, the decision log needs to actually be used.

- **Area**: Future-dated posts are publicly buildable, unlinked, and not `noindex`-gated
  - **Why it matters**: Eleventy builds a real HTML page for every file in `src/posts/*.md` regardless of front-matter `date`; only the homepage/RSS/sitemap listing is date-filtered. A crawler that discovers a future-dated post's URL by other means (e.g. browsing the GitHub repo) could index it before its listed publish date.
  - **Evidence checked**: `.eleventy.js` collection filter logic; confirmed the built output includes future-dated post pages (e.g. `2026-08-14-github-environments-deep-dive` was live in `_site/` weeks before its listed date during this session).
  - **Next best reviewer or source**: Already raised with the maintainer directly (2026-07-11) - explicitly declined a `noindex` fix at that time ("leave as-is"). Re-confirm if this decision should change; don't silently "fix" it without asking again, per that earlier conversation.

- **Area**: Prism.js syntax highlighting is loaded for only 6 of ~19 languages actually used in post code fences
  - **Why it matters**: `csharp`, `sql`, `hcl`, `graphql`, `typescript`/`ts`, `regex`, `ql`, `rego` code blocks across several existing posts render as plain unhighlighted text. `yaml`/`bash`/`javascript`/`json`/`python`/`markup` were added incrementally this session as each was directly needed for new content, not as a deliberate full audit.
  - **Evidence checked**: `grep -ohE '\`\`\`[a-z]+' src/posts/*.md | sort | uniq -c` (run 2026-07-12) showed the full language distribution; `src/_layouts/base.njk`'s Prism `<script>` tags show what's actually loaded.
  - **Next best reviewer or source**: Whoever next touches a post using one of the unhighlighted languages - cheap to fix incrementally (one CDN `<script>` line per language), same pattern as the `python`/`markup` additions.

- **Area**: No Twitter/X handle configured for `twitter:site`/`twitter:creator`
  - **Why it matters**: The site's Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) are complete, but `twitter:site`/`twitter:creator` were explicitly skipped during the SEO pass (2026-07-11) because no handle was available at the time.
  - **Evidence checked**: `src/_layouts/base.njk` Twitter meta block; conversation record from the SEO audit session.
  - **Next best reviewer or source**: The maintainer, if/when a handle exists.

## Notes

- Gaps here reflect the repo as of 2026-07-12 (end of the September-2026-editorial-batch + accessibility-remediation + docs-bootstrap work in this session). Several were surfaced by direct maintainer conversation, not just code inspection - re-check this file's "Next best reviewer" pointers before assuming a gap is still open.
