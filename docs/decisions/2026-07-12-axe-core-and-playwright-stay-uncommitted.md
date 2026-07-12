# axe-core and Playwright stay out of package.json, installed on-demand instead

## Date
2026-07-12

## Context
An accessibility scan (`scripts/a11y-check.js`) needed a real browser to check color-contrast and other computed-style-dependent WCAG rules - axe-core alone, without a real rendering engine, can't do this accurately. Playwright + axe-core were the obvious choice, already available in this sandbox with a pre-installed Chromium.

The question: commit `playwright`/`axe-core` as `devDependencies` so `npm ci` always has them, or install on-demand per session?

## Decision
`scripts/a11y-check.js` is committed to the repo and fully functional, but `playwright`/`axe-core` are **not** added to `package.json`. They're installed on-demand (`npm install --no-save axe-core playwright`) whenever the script actually needs to run.

## Rationale
`build-check.yml` and `deploy.yml` both run `npm ci` on every PR and every push to `main`. Adding Playwright as a `devDependency` means `npm ci` would also trigger a full Chromium browser download in CI - meaningful time added to *every* build, for a check that isn't (and, as of this decision, isn't planned to be) wired into either CI workflow. The accessibility scan is agent/maintainer-invoked, not CI-enforced.

## Consequences
- Every session that needs to run the a11y scan pays a one-time `npm install --no-save` cost first - documented as an explicit step in `CLAUDE.md`, not assumed.
- `npm ci` and both CI workflows stay exactly as fast as before this script existed.
- If accessibility checks are ever promoted to a CI gate, this decision should be revisited - at that point the CI-time cost becomes deliberate rather than incidental, and committing the dependency would make sense.
- Playwright's Chromium binary resolution needed a small accommodation in the script itself: this sandbox pre-installs Chromium outside Playwright's default cache path (`/opt/pw-browsers/chromium`), so `scripts/a11y-check.js` checks for that path and uses it directly when present, falling back to Playwright's default resolution otherwise (portable to a contributor's own machine, where `npx playwright install` would be the normal path).

## Related
- `CLAUDE.md` Accessibility section
- `scripts/a11y-check.js`
