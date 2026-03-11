---
author: Steve Kaschimer
date: 2026-05-01
image: /images/posts/2026-05-01-hero.png
image_prompt: "A clean, architectural illustration in a technical editorial style — near-black background with slate blue, warm amber, and off-white accents. Central composition: a single Markdown file rendered as a softly glowing document card, its contents visible — a structured ADR with sections for Context, Decision, Alternatives, and Consequences, the text crisp and legible. Surrounding the card, a constellation of thin connecting lines links it to three faint icons: a git branch commit node, a pull request review thread, and a GitHub Discussions speech bubble. In the background, a ghosted calendar — months receding backward — implies the document persisting through time. Mood: institutional memory, the satisfaction of a question answered before it was asked, the quiet confidence of a codebase that explains itself. Avoid: generic filing cabinet metaphors, cartoon lightbulbs, circuit board textures, any reference to specific tool logos."
layout: post.njk
site_title: Tech Notes
summary: Architecture Decision Records are a single Markdown file per decision that eliminates the 'why did we build it this way?' archaeology session forever — here is the template, the storage convention, the GitHub workflow, and a real example from this blog's own stack.
tags: ["writing-for-engineers", "developer-productivity"]
title: "Architecture Decision Records: The 30-Minute Investment That Pays Off for Years"
---

Six months into a project, a new engineer asks why the codebase uses library X instead of the obvious choice Y. Nobody remembers. The original decision-maker has left. The Slack thread is gone. The PR description says "initial implementation." The team spends 45 minutes reconstructing a decision that took 20 minutes to make — and they still aren't sure they got it right.

This happens constantly. It is entirely avoidable.

An **Architecture Decision Record (ADR)** is a Markdown file that captures a decision, its context, the alternatives considered, and the reasoning. One file. Thirty minutes. Permanent record. A codebase with 20 ADRs is a codebase whose entire architectural history is readable in a `docs/` folder without needing to interrogate anyone, reconstruct anything, or trust that the person who made the call is still at the company.

---

## What an ADR Is (and Isn't)

An ADR records **a single architectural decision** at the moment it was made. It is not a design document, not a post-mortem, not a wiki page that gets updated as the system evolves. The distinction matters because it determines how you use the record.

The two properties that make ADRs useful are also the two that teams instinctively resist. First: **one decision per file**. Not "the architecture of the authentication system" — that's a design document. An ADR is "use JWTs instead of server-side sessions." Specific, bounded, answerable. Second: **immutable once accepted**. You do not edit an old ADR to reflect a change in direction. You write a new ADR that supersedes it, and the old one stays in the repo with its status updated. The history is the value.

The format was coined by Michael Nygard in a [2011 blog post](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) and later popularized by the `adr-tools` CLI project. The exact template has evolved, but the principle hasn't moved.

What counts as an architectural decision: anything that affects the structure of the system, is expensive to reverse, or that future maintainers will need to understand in order to make sensible choices. Template engine selection, database schema approach, authentication strategy, monorepo vs. polyrepo, API versioning policy. What doesn't warrant an ADR: bug fixes, routine implementation choices, minor refactors that don't change structural constraints.

> An ADR is a snapshot of a decision as it was understood at the time it was made. Its value isn't that it's always right — it's that it's honest about what was known, what was considered, and what was chosen, so future teams can evaluate whether those conditions still hold.

***

## The Template

The maximalist ADR templates floating around the internet have twelve sections and take longer to fill out than it took to make the decision. This is the version that covers what actually matters:

```markdown
# ADR-{number}: {Title}

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-{N}  
**Deciders:** {Names or roles of people involved in the decision}

## Context

What is the situation that requires a decision? What constraints or forces are at play?
Describe the problem, not the solution.

## Decision

What was decided? State it clearly in one or two sentences.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Option A | ... | ... |
| Option B | ... | ... |
| Option C | ... | ... |

## Consequences

What becomes easier or harder as a result of this decision?
What follow-up decisions does this enable or require?
What is the cost of reversing this decision if it proves wrong?

## References

- Link to relevant PRs, issues, discussions, external docs
```

Four substantive sections. **Context** describes the situation and its constraints — it is about the problem, not the solution. If you skip this section, the decision loses its meaning the moment the original conditions change. **Decision** is one or two sentences stating what was chosen. **Alternatives Considered** is the table most teams fill out in their heads and never write down — it is the section that prevents the same research from being done twice. **Consequences** is the section people skip most often and future maintainers value most. It answers the questions that actually come up during maintenance: Is this easy to reverse? What follow-up choices did this lock in? What got harder?

***

## A Real-World Example

This blog runs on Eleventy, and the template engine choice is exactly the kind of decision that looks arbitrary without context. Here is what ADR-001 for this project would look like:

```markdown
# ADR-001: Use Nunjucks as the Eleventy Template Engine

**Date:** 2025-10-15  
**Status:** Accepted  
**Deciders:** Steve Kaschimer

## Context

Eleventy supports multiple template languages: Nunjucks, Liquid, Handlebars,
EJS, and plain HTML. The project needs a template language that supports
layouts, includes, macros/partials, and conditional logic. The choice affects
every template file in the project and is expensive to reverse.

## Decision

Use Nunjucks (`.njk`) as the primary template language for all layouts and pages.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Nunjucks | Full-featured (macros, filters, inheritance), mature Eleventy support, familiar to Jinja2 users | Slightly more syntax to learn than Liquid |
| Liquid | Simpler syntax, default in Jekyll (familiar to many) | Fewer features, no macro support, less expressive for complex layouts |
| Handlebars | Familiar to JS developers | Limited built-in helpers, logic-less by design (a constraint here, not a feature) |
| EJS | Pure JavaScript in templates | Mixing logic and markup leads to unmaintainable templates at scale |

## Consequences

- All layout and page files use `.njk` extension
- Eleventy filters and shortcodes are written to work with Nunjucks syntax
- New contributors familiar with Liquid/Jekyll will need a brief orientation
- Migration cost if we switch: high — every template file would need rewriting
- Enables: complex layout inheritance, custom filters, macro-based component patterns

## References

- [Eleventy template language docs](https://www.11ty.dev/docs/languages/)
- PR #3: Initial project scaffold
```

Every new engineer who touches a template now gets this answer in under two minutes instead of in a 45-minute archaeology session. And when Eleventy ships a compelling new template format — say, WebC — the question "should we reconsider this?" is grounded in the documented reasons the original choice was made, not in whoever happens to be in the room.

***

## Where to Store ADRs

ADRs belong in the repository, not in Confluence, not in Notion, not in a separate wiki. When the ADR lives next to the code it governs, it's reviewable in pull requests, findable from the same search that surfaces source files, and it survives tool migrations. Documentation that drifts away from the code it documents becomes archaeology at a different URL.

The convention:

- **`docs/decisions/`** at the repository root
- Filenames: zero-padded number + kebab-case title — `001-use-nunjucks-as-template-engine.md`
- An index at **`docs/decisions/README.md`** with one-line summaries and status

The index format:

```markdown
# Architecture Decision Records

| # | Title | Status | Date |
|---|-------|--------|------|
| 001 | Use Nunjucks as the Eleventy template engine | Accepted | 2025-10-15 |
| 002 | Deploy to GitHub Pages via GitHub Actions | Accepted | 2025-10-20 |
| 003 | Use Tailwind CSS for styling | Accepted | 2025-10-20 |
```

The index is the entry point for any engineer who wants to understand why the system looks the way it does. It should be readable top-to-bottom in five minutes. Keep it current as part of the PR that adds or supersedes an ADR.

***

## The Deliberation Workflow with GitHub Discussions

The ADR template handles the *record*. The *deliberation* — the conversation before a decision is made — belongs somewhere else. Mixing the two in the same file produces ADRs that are half-deliberation, half-decision, and useful as neither. **GitHub Discussions** is the right tool for the deliberation phase.

The workflow:

1. Engineer opens a Discussion in an `Architecture` category (create it if it doesn't exist) with the draft ADR as the body
2. Team comments with concerns, alternative options, data, prior art
3. Engineer updates the draft as the conversation converges
4. Once consensus is reached, a PR is opened: `docs/decisions/005-adopt-jwt-auth.md`
5. PR description includes: `Closes discussion #42`
6. PR merges; Discussion closes; the decision is now permanent and co-located with code

This creates a two-layer record. The Discussion holds the deliberation — the messy, non-linear conversation where options were surfaced and rejected. The ADR holds the distilled outcome. Both are searchable in GitHub. Neither requires a separate tool. And critically: the Discussion captures the voices of people who raised concerns that were ultimately rejected, which is often the most valuable thing to know when you revisit the decision two years later.

***

## Linking ADRs from PRs and Commits

An ADR sitting in `docs/decisions/` and never referenced from the code it governs is a document that will be forgotten. The connections have to be explicit.

**PR descriptions**: when a PR implements a decision, reference the ADR directly. "Implements ADR-005. See `docs/decisions/005-adopt-jwt-auth.md`." This makes the PR self-contained — reviewers know where to find the rationale without asking.

**Commit message footers**: for commits that land architectural changes, add `Refs docs/decisions/005-adopt-jwt-auth.md` in the trailer block. This connects `git blame` output to the ADR. The combination is the complete picture: `git blame` tells you who changed the line; the ADR tells you why the approach was chosen in the first place.

**Code comments**: for non-obvious implementation choices, a single-line comment is enough. `// See ADR-003 — chosen over alternatives for reasons in docs/decisions/`. Not a comment that explains what the code does — the code does that. A comment that explains why the code is structured this way and where to find the full reasoning.

The goal is a web of references tight enough that any engineer starting from either the ADR or the code can reach the other within one click.

***

## How Decisions Evolve — Superseding ADRs

Architectural decisions change. The correct response is not to edit the original ADR. It is to write a new one that supersedes it and update the old one's status field.

The old ADR: status becomes `Superseded by ADR-007`. The new ADR: references the old one in its Context section, explaining what has changed since the original decision was made. Here is what that looks like:

```markdown
# ADR-007: Migrate from Nunjucks to WebC for Component-Based Templates

**Date:** 2026-06-01  
**Status:** Accepted  
**Supersedes:** ADR-001

## Context

ADR-001 chose Nunjucks for its maturity and layout inheritance support.
Since that decision, Eleventy introduced WebC — a single-file component
format that eliminates the need for macros and provides scoped CSS and JS
bundling. The project has grown to 15+ reusable components where Nunjucks
macros are showing maintenance friction. The original concern about reversal
cost still applies; this decision should not be made lightly.
```

This creates a decision changelog. You can trace how the team's thinking evolved over time, what changed in the environment, and what the cost of each reversal was judged to be. That history is only available because the earlier ADR was never edited — it captured what was true and what was known at the time it was written. The moment you start retroactively updating ADRs to reflect where you ended up, you lose the record of how you got there.

***

<div class="callout-box">

## ADR Quick-Start Checklist

To start using ADRs today:

- [ ] Create `docs/decisions/` in your repository root
- [ ] Add `docs/decisions/README.md` — even if the index starts empty
- [ ] Write your first ADR for the most recent significant decision you made — don't reconstruct the entire project history, start from now
- [ ] Add an ADR pull request template at `.github/PULL_REQUEST_TEMPLATE/adr.md` with the four-section structure
- [ ] Establish the norm: any PR that introduces or changes a foundational pattern either references an existing ADR or creates a new one
- [ ] Reference ADRs from PR descriptions and commit footers — the link from code to reasoning is what makes the record useful
- [ ] When a decision changes: update the old ADR's status field, write a new ADR that supersedes it — never edit the original

You don't need a tool to start. `adr-tools` (CLI) is useful at scale but not required. A folder and a template are enough.

</div>

## The Asymmetry

ADRs have almost no cost at the time of writing and asymmetric value over time. The 30 minutes you spend on ADR-001 pays back the first time a new engineer asks "why are we using Nunjucks?" and gets a two-minute answer instead of a 45-minute archaeology session. The payback compounds: a codebase with 20 ADRs is a codebase whose architectural history is readable, searchable, and honest about uncertainty. Not just "what did we decide" but "what did we consider," "what did we know at the time," and "what would it cost to change this."

That's not documentation for its own sake. That's a team that respects the time of every engineer who comes after them — including themselves, six months from now, staring at a decision they no longer remember making.

The first ADR is the hardest. Write it this week for the last significant decision your team made. Everything after that is just the habit.

***

Want to talk through documenting architectural decisions at your organization, or building a decision-record practice from scratch? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
