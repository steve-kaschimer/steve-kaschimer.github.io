# Squad Decisions

## Active Decisions

No decisions recorded yet.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction

---

**Session: 2026-03-11 — Squad Editorial Workflow Standup**

**What was accomplished:**
- Converted `editorial-plan.md` to a full editorial calendar (`This Period / Next Up / Backlog`) with status tracking and GitHub Issue links
- Created 19 GitHub Issue labels (squad routing, work type, priority, status)
- Created 17 GitHub Issues: 14 editorial posts (#95–#108) + 3 site improvements (#109–#111)
- Wrote `.squad/WORKFLOW.md` — session kickoff ritual, label taxonomy, agent quick reference
- Fixed P0 build blocker: `markdownTemplateEngine: false` in `.eleventy.js` (Nunjucks was processing `${{ }}` in GitHub Actions code examples inside posts, crashing the build)
- Fixed P1 CI gaps: PR build-check workflow, deploy.yml build order, `checkout@v4`, Node 20 pinning
- All changes committed: `136c8ba`

**Decisions made:**
- `markdownTemplateEngine: false` is the canonical setting — posts are pure Markdown and do not need Nunjucks processing. Layouts remain `.njk` and are unaffected.
- GitHub Issues + `squad:*` labels are the official work queue going forward.
- Editorial calendar lives at `editorial-plan.md`; periods are ~4 weeks.
- Canonical Node version: 20 (`.nvmrc` + `package.json engines`).

**Next session starting point:**
- Ask Ralph for status check
- March 2026 posts (#95, #96, #97) are priority:high — Trenton should pick one up
- Darlene: Lighthouse CI (#109) is queued for next sprint
