# Bootstrap Report

## Repo Classification

`existing-project` - active blog with 38+ published/drafted posts, working CI/CD, and a maintained (non-Squad) editorial process, as of this pass.

## Evidence Sources Used

- `.eleventy.js`, `package.json`, `.nvmrc`, `.lighthouserc.json`
- `.github/workflows/build-check.yml`, `deploy.yml`, `squad-*.yml`
- `src/_layouts/base.njk`, `post.njk`; `src/js/*.js`; `src/styles/input.css`
- `src/_data/site.json`
- `scripts/a11y-check.js`
- `editorial-plan.md`, `CLAUDE.md`, `README.md`
- `.squad/decisions.md`, `.squad/WORKFLOW.md`
- `src/posts/*.md` (grepped for code-fence languages, Prism component coverage, and cross-post SDK/convention consistency)
- Direct conversation history from this session: the SEO audit (2026-07-11), accessibility remediation (2026-07-11/12), the September editorial batch (#126-129, 2026-07-12), and two explicit maintainer decisions (future-dated posts stay `noindex`-free; image generation via ChatGPT, not an MCP/API integration)

## Durable Docs Reviewed

`CLAUDE.md` (primary - kept current every session, treated as more authoritative than anything below it), `README.md`, `editorial-plan.md`. This `docs/` tree was entirely scaffold-only before this pass - nothing here to reconcile against yet.

## Created or Updated

All previously-scaffold files, populated with real repo content:

- `docs/product/overview.md`
- `docs/architecture/overview.md`
- `docs/product/glossary.md`
- `docs/context/repo-map.md`
- `docs/context/gaps.md`
- `docs/context/index.yaml`
- `docs/context/bootstrap-report.md` (this file)
- `docs/patterns/blog-post-authoring.md` (new)
- `docs/decisions/2026-07-12-hero-images-are-a-manual-handoff.md` (new)
- `docs/decisions/2026-07-12-axe-core-and-playwright-stay-uncommitted.md` (new)

Left untouched, deliberately: `docs/architecture/adr/` (sample scaffold - no decision in this repo rises to ADR scale; no database exists), `docs/architecture/database-schema-example.md` (sample scaffold - no database).

## Support Files Refreshed

Both `docs/context/index.yaml` and `docs/context/gaps.md` were fully rewritten from scaffold to real content in this pass (see above).

## Assumptions and Risks

- **The Squad framework's operational status is inferred, not confirmed.** Evidence (disabled heartbeat cron, one stale decision-log entry) points to dormant, but this wasn't asked of the maintainer directly during this session - flagged in `docs/context/gaps.md` rather than stated as settled fact.
- **`package.json` engines/`.nvmrc` mismatch** is real and observed, but whether it's intentional (loose floor for local dev) or an oversight is unconfirmed.
- Glossary and pattern docs draw on this session's work (September posts, a11y fixes, SEO pass) as the primary evidence base, since it's the most recent and best-documented slice of the repo's history available in this conversation. Older posts (pre-2026-06) were spot-checked for consistency but not exhaustively re-read.

## Missing, Stale, or Conflicting Context

See `docs/context/gaps.md` for the full list. Highest-signal items: the Node version pin mismatch, the Squad framework's unclear status, and incomplete Prism.js language coverage (6 of ~19 languages actually used in post code fences are highlighted).

## Follow-up Questions

1. Is the Squad framework meant to be reactivated, or should `squad-*.yml` / `.squad/` be formally retired?
2. Should `package.json#engines` be tightened to `24` to match `.nvmrc` and CI exactly?
3. Is there a plan to close the remaining Prism.js syntax-highlighting gap (csharp/sql/hcl/graphql/typescript/etc.) in one pass, or continue fixing it incrementally as each language comes up in new content (the pattern followed so far)?
