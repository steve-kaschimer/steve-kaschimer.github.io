---
author: Steve Kaschimer
date: 2026-12-25
image: /images/posts/2026-12-25-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, teal, and amber accents. A horizontal world-clock strip across the top showing four time zone dials at different hours, connected below to a shared timeline of small artifact icons: a well-formed commit message card, an ADR document icon, a PR with a long descriptive body, and a GitHub Discussions speech-bubble icon - all sitting on the timeline independent of any single clock. No meeting/video-call icon appears anywhere in the composition. The mood is calm and asynchronous - work products that stand on their own across time zones, not a real-time meeting rescheduled four times."
layout: post.njk
site_title: Tech Notes
summary: "Distributed teams that just move standup to Zoom are still a synchronous team that happens to work from different buildings. Async-first is a different discipline entirely - one where the code, the process, and the tooling are built so nobody has to be online at the same moment to move work forward. This lighter, holiday-week post covers the practices that actually separate async-capable teams from ones that only look distributed: commit message discipline, ADR-driven decisions, self-documenting PRs, GitHub Discussions for deliberation, and using GitHub Actions to automate the status updates a synchronous team would otherwise get from a Slack message."
tags: ["developer-productivity", "remote-work", "writing-for-engineers", "git", "async"]
title: "Async-First Development: Writing Code and Processes That Work Across Time Zones"
---

A team spread across four time zones that still runs a daily standup is a synchronous team with a scheduling problem, not an async team. The tell is what happens when someone's asleep during a decision that needed to get made: a genuinely async-first team already wrote down enough context that the decision doesn't need them in the room, and a team that only looks distributed waits until everyone's awake again, quietly synchronous the whole time behind a Zoom link.

The actual discipline isn't about tooling that lets people work at different hours - Slack and GitHub already do that. It's about producing work artifacts complete enough that someone eight time zones away can pick up where you left off without a meeting to fill in what didn't make it into the artifact.

***

## Commit Messages as the Unit of Context Transfer

A commit message that says `fix bug` transfers no context to the next person who runs `git blame` on that line - which, on an async team, might be someone in a time zone that never overlapped with the author's working hours, with no way to just ask. [The commit-message post](/posts/2026-04-24-writing-commit-messages-that-make-code-review-faster/) covers this in depth; the async-specific stake is higher than it looks for a co-located team, because a co-located team can always fall back to walking over and asking. An async team's fallback is nothing - the commit message, or the absence of one, is the only context that will ever exist for that change unless someone explicitly writes more later.

***

## ADRs as Decisions That Don't Require the Room

[Architecture Decision Records](/posts/2026-05-01-architecture-decision-records/) matter more on an async team than a co-located one for the same reason - a decision made in a synchronous meeting and never written down is fine for the people who were in the meeting and a mystery for everyone else, forever, on a team where "everyone else" might be most of the team depending on the hour a decision got made. An ADR is the artifact that makes a decision durable across the exact gap - someone awake when it happened, someone not - that async teams are built around.

***

## Self-Documenting PRs

A PR description that says "see ticket" forces the reviewer into a context-switch to a different tool, at a different time, possibly hours after the PR was opened - a real cost for a synchronous team and a much larger one for an async reviewer who won't get a live answer to a clarifying question for another twelve hours. A self-documenting PR states the *why* directly in the description: what problem this solves, what alternative was considered and rejected, what the reviewer should specifically look at. It's the same instinct as a good commit message, applied to the unit of work a reviewer actually engages with first.

The failure mode worth naming: a PR description that's just a copy of the commit messages restates *what* changed, which the diff already shows. The value a description adds is *why*, and *why* is exactly the part that doesn't survive being deferred to "we can discuss it in review" on a team where review might happen a full day later.

***

## GitHub Discussions for Deliberation That Isn't Urgent

Slack is built for a completely different pace than the kind of deliberation that benefits from someone thinking about it overnight and replying with a considered response instead of a reflexive one. GitHub Discussions - threaded, persistent, tied to the repo rather than scattered across DMs and channels - is a better home for "should we adopt this pattern org-wide" than a Slack thread that scrolls out of relevance within a day and is nearly unsearchable six months later. The practical rule: if a question benefits from someone in a different time zone getting to weigh in with a full night's distance from the original framing, it belongs in a Discussion, not a message that expects a same-day reply.

***

## Automating the Status Update a Standup Would Have Given

A synchronous team's daily standup does real work - not the ceremony, but the actual information it transfers: what shipped, what's blocked, what's coming next. An async team needs that same information transferred without a meeting, and a lot of it is mechanically derivable from GitHub's own activity rather than something someone has to narrate live:

```yaml
name: Weekly Async Status Digest

on:
  schedule:
    - cron: '0 14 * * 5'

permissions:
  contents: read
  pull-requests: read
  issues: read

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - name: Compile weekly activity
        run: python scripts/compile_weekly_digest.py
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Post digest
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"$(cat weekly-digest.md)\"}"
```

`compile_weekly_digest.py` pulls merged PRs, newly opened issues, and anything sitting in `blocked` status across the week and produces a written summary - not a replacement for the judgment a human standup update carries, but the mechanical part (what shipped, what's open) that doesn't need a live voice to convey, freeing whatever synchronous time the team does have for the parts that actually benefit from real-time back-and-forth.

***

## Closing

None of this is about avoiding meetings out of some ideological preference for async over sync - a genuinely hard design discussion is still often faster live, and pretending otherwise doesn't make a team more async, just slower. The actual discipline is narrower and more specific: default to writing artifacts complete enough that they don't *require* a meeting to be understood, and reserve real-time coordination for the cases that actually benefit from it rather than the cases where nobody got around to writing the context down. A team that does that consistently is async-first regardless of how many time zones it spans. A team that doesn't is synchronous with extra latency, no matter how distributed its org chart looks.

***

Questions or corrections? Reach out. And happy holidays.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
