# Context Gaps

## Current Gaps

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
