# 🛠 Squad Workflow Guide

> **Elliot, Squad Lead** — This document is the canonical reference for how the `steve-kaschimer.github.io` squad operates. Read it once, keep it handy, refer to it at the start of every session.

---

## 🗺 Overview

The squad runs on a simple loop: the **editorial calendar** (`editorial-plan.md`) defines what matters this period, **GitHub Issues** are the live work queue, and every working session starts with a **kickoff ritual** to orient the team before anyone writes a line of code or content. Work is routed by type to the specialist agent best suited for it — Trenton owns content, Mr. Robot owns the build, Darlene owns CI, Romero owns deployment, and Elliot holds architecture and triage. Ralph monitors state and surfaces blockers at the start of each session. Scribe closes the loop by logging decisions automatically after significant sessions.

---

## 🚀 Session Kickoff Ritual

Follow these steps at the start of **every** working session, no exceptions.

**Step 1 — Ask Ralph for a status check:**
```
Ralph, status check
```
or, to address the whole team:
```
Team, what's up?
```

**Step 2 — Ralph queries and reports:**
- In-progress todos and their current state
- Blocked items and why they're blocked
- What's next on the editorial calendar
- Any stalled GitHub Issues (open, labeled, no recent activity)

**Step 3 — Coordinator routes based on Ralph's report:**

| Ralph surfaces… | Route to… |
|---|---|
| Content tasks, drafts, editing | **Trenton** |
| Build errors, template work, Tailwind | **Mr. Robot** |
| CI failures, workflow files, deps | **Darlene** |
| Deployment issues, Pages config, releases | **Romero** |
| Architecture questions, security, unknowns | **Elliot** |

**Step 4 — Fan-out for multi-agent sessions:**

When multiple workstreams can run in parallel, say:
```
Team, let's tackle [X]
```
This spawns parallel agents for concurrent work. Name specific agents when the task is clearly scoped:
```
Trenton, draft the intro for #42. Mr. Robot, wire up the new tag filter template.
```

---

## 📅 Editorial Calendar Workflow

The calendar lives at **`editorial-plan.md`** in the repo root. It is the single source of truth for what content is planned, in-flight, or queued.

### Structure

```
## 🗓 This Period
- [ ] Post title (#123)

## 📋 Next Up
- [ ] Post title (#124)

## 📦 Backlog
- [ ] Post idea (#125)
```

- Each period is **~4 weeks**.
- At the start of a new period, rotate **Next Up** → **This Period** and pull from **Backlog** → **Next Up** as capacity allows.
- Every entry **must link to its GitHub Issue** (`#123`). No issue = not real work yet.

### Adding a new post idea

1. Add a line to the **Backlog** section of `editorial-plan.md`:
   ```
   - [ ] Post idea title (#TBD)
   ```
2. Create a GitHub Issue titled `[Blog Post] Your Title Here` with labels:
   ```
   content, squad:trenton, priority:low
   ```
3. Update the calendar entry with the real issue number.

### Promoting a post to "This Period"

1. Move the entry from **Next Up** to **This Period** in `editorial-plan.md`.
2. Update the issue label from `priority:low` → `priority:high`.
3. Assign `status:in-progress` once Trenton picks it up.

---

## ➕ Adding Work to the Queue

Every piece of work gets a GitHub Issue with the right labels so routing is automatic. Use this as your cheat sheet:

| Work type | Required labels |
|---|---|
| Blog post / content | `content` + `squad:trenton` + priority |
| Site improvements, templates, build | `site-improvement` + `squad:mr.robot` + priority |
| CI/CD, GitHub Actions, deps | `ci-cd` + `squad:darlene` + priority |
| Deployment, Pages, releases | `deployment` + `squad:romero` + priority |
| Architecture, security, audits | `security` + `squad:elliot` + priority |
| Not sure / needs triage | `squad` only — Elliot will route it |

**Always set a priority label** (`priority:high`, `priority:medium`, `priority:low`). Unlabeled issues sit at the bottom of Ralph's report.

---

## 🏷 Label Taxonomy Quick Reference

### Squad Routing (7)

| Label | Purpose |
|---|---|
| `squad` | Unrouted / needs triage |
| `squad:elliot` | Architecture, security, decisions |
| `squad:trenton` | Content creation and editing |
| `squad:mr.robot` | Build, templates, Tailwind |
| `squad:darlene` | CI/CD, GitHub Actions |
| `squad:romero` | Deployment, GitHub Pages |
| `squad:copilot` | Automated / Copilot-driven tasks |

### Work Type (6)

| Label | Purpose |
|---|---|
| `content` | Blog posts, copy, editorial work |
| `site-improvement` | UX, templates, design, functionality |
| `ci-cd` | Pipelines, workflows, automation |
| `security` | Security audits, dependency checks |
| `deployment` | Releases, Pages config, DNS |
| `documentation` | README, guides, internal docs |

### Priority (3)

| Label | Purpose |
|---|---|
| `priority:high` | This period — do it now |
| `priority:medium` | Next up — plan for it |
| `priority:low` | Backlog — not urgent |

### Status (3)

| Label | Purpose |
|---|---|
| `status:in-progress` | Actively being worked |
| `status:blocked` | Waiting on something external |
| `status:review` | Work done, needs review before close |

---

## 🤖 Agent Quick Reference

Invoke agents by name when their domain is clearly in play.

| Agent | Domain | Invoke when… |
|---|---|---|
| **Elliot** | Architecture, security, triage | You need a decision, a design choice, or something doesn't fit anywhere else |
| **Trenton** | Blog posts, editing, content strategy | Drafting, editing, or planning any written content |
| **Mr. Robot** | Eleventy config, Nunjucks templates, Tailwind, build pipeline | Anything touching the site's structure, templates, or build output |
| **Darlene** | GitHub Actions, CI/CD, secrets, dependency auditing | Workflows are broken, a dep needs auditing, or you're wiring up new automation |
| **Romero** | GitHub Pages deployment, releases, CNAME | The site isn't deploying, a release needs cutting, or DNS is involved |
| **Ralph** | Session kickoff, backlog monitoring | Start of every session — Ralph always goes first |
| **Scribe** | Decision logging | Runs automatically — only invoke manually to force a log |

---

## 📝 Scribe Post-Session

**Scribe runs automatically** after significant working sessions. You don't need to do anything.

What Scribe does:
1. Reads any new files dropped in `.squad/decisions/inbox/`
2. Merges them into `.squad/decisions.md`
3. Commits the update with a timestamped entry

**You only need to manually invoke Scribe if you want to force an immediate log:**
```
Scribe, log this session
```

Otherwise, let it run. The `decisions.md` file is the long-term memory of the squad — Scribe keeps it current so the team always has context on why things were built the way they were.

---

*Guide maintained by Elliot. Raise changes as a PR labeled `documentation, squad:elliot`.*
