---
author: Steve Kaschimer
date: 2026-04-24
image: /images/posts/2026-04-24-hero.png
image_prompt: "A dark-mode terminal aesthetic on a near-black background with deep indigo and amber accent tones. Split composition: on the left, a blurred, visually chaotic git log output showing commit messages like 'fix', 'wip', 'more fixes', 'update', 'actually fix', 'pr feedback' — rendered in faded, desaturated red-orange, each message bleeding together into noise. On the right, a sharp, crisp git log showing well-structured Conventional Commits messages with type prefixes, scope indicators, and clean subject lines — rendered in bright amber and cool white, clearly readable and ordered. A thin vertical dividing line separates the two halves, glowing faintly. Below both panels, a faint horizontal timeline suggests git history stretching back into the past. Mood: the satisfaction of order over entropy, the feeling of a codebase you can actually navigate. Avoid: cartoon characters, GitHub Octocat, generic keyboard imagery, abstract circuit board textures."
layout: post.njk
site_title: Tech Notes
summary: Most commit messages are a form of passive negligence — this post teaches the exact format, body-writing discipline, hook setup, and CI enforcement that turns git log into a searchable record of every decision your team has ever made.
tags: ["writing-for-engineers", "developer-productivity", "devops"]
title: "Writing Commit Messages That Make Code Review Faster"
---

You open a PR for review. It has twelve commits. The messages read: "fix", "wip", "update", "more fixes", "actually fix", "pr feedback". There is no narrative, no context, no explanation of what was tried and discarded. To understand why any particular line changed, you have to reverse-engineer intent from the diff alone — which is exactly what the commit messages were supposed to make unnecessary. This is a communication failure, and it compounds: bad commit messages make code review slower, make `git bisect` a guessing game, make `git blame` useless for anything except finding who to ask, and make onboarding new teammates onto a codebase a puzzle instead of a story.

The fix takes about 60 seconds per commit. Most developers just haven't been taught the format.

---

## The Anatomy of a Good Commit Message

Start with a concrete example of the finished product, then take it apart:

```text
feat(auth): replace session tokens with JWTs

Cookie-based sessions were hitting a scaling wall — the session store
was becoming a bottleneck at ~5k concurrent users. JWTs eliminate the
server-side session lookup entirely.

Considered Redis cluster as an alternative but rejected it: adds
infrastructure complexity and the session store problem recurs at
higher scale. JWTs shift the complexity to token validation, which
is stateless and horizontally scalable.

Breaking change: clients must handle 401 responses by re-authenticating.
Existing sessions are invalidated on deploy.

Closes #412
Co-authored-by: Jamie Lee <jamie@example.com>
```

Five distinct structural elements. Each one is doing specific work.

### The subject line

- 50 characters or fewer — hard limit is 72. If your editor shows a ruler, put it there.
- **Imperative mood**: "add", "fix", "remove" — not "added", "fixed", "removes". The convention is to complete the sentence "If applied, this commit will..." — the rest of that sentence is your subject line.
- **Type prefix + scope**: `feat(auth):`, `fix(api):`, `chore(deps):` — this is **Conventional Commits**, covered in full below.
- No period at the end. The subject line is a title, not a sentence.
- If you can't write it in 50 characters, the commit is probably doing too much. That's information worth acting on.

### The blank line

Required. Without it, many git tools — `git log --oneline`, `git shortlog`, GitHub's PR commit list — treat the entire message as a single subject. The blank line is not optional punctuation. It is structural.

### The body

This is the part most developers skip and the part that pays the most dividends over time. The body explains **why**, not what — the diff already shows what changed. Three questions the body should answer:

1. Why was this change necessary?
2. What alternatives were considered and why were they rejected?
3. What constraints or tradeoffs shaped the approach?

Wrap at 72 characters. `git log` outputs body text at full width in a terminal — unwrapped lines that run past 80 characters make the output unreadable without horizontal scrolling.

### The footer

- **Issue references**: `Closes #412`, `Fixes #88`, `Resolves #200`, `Refs #101`
- **Co-authors**: `Co-authored-by: Name <email>` — GitHub parses this trailer and credits the contributor in the commit view and contribution graph
- **Breaking changes**: `BREAKING CHANGE:` — the Conventional Commits spec; triggers a major version bump in `semantic-release` and `release-please`

The footer is where metadata lives. Putting `Closes #412` in the body instead of the footer works syntactically, but it survives squash-merge and PR description edits more reliably as a footer trailer.

***

## Conventional Commits — The Spec Worth Adopting

> **Conventional Commits** is a specification for commit message format that makes history machine-parseable: `<type>(<scope>): <subject>`.

The common types, and what they mean:

| Type | Use it for |
|---|---|
| `feat` | New capability or behavior |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace — no logic change |
| `refactor` | Code restructuring, no behavior change |
| `test` | Adding or updating tests |
| `chore` | Maintenance, config, tooling |
| `ci` | CI/CD pipeline changes |
| `perf` | Performance improvement |
| `revert` | Reverting a previous commit |

The scope in parentheses is optional but useful: `feat(auth)`, `fix(api)`, `chore(deps)`. It narrows where the change lives and makes filtered log queries (`git log --grep="^feat(auth)"`) actually useful.

Why this matters beyond aesthetics: Conventional Commits is machine-parseable. Tools like `semantic-release`, `conventional-changelog`, and `release-please` read your commit history to determine version bumps and generate changelogs automatically. A `feat` commit triggers a minor version bump. A `fix` triggers a patch. A commit with `BREAKING CHANGE:` in the footer triggers a major. That automation is only possible because the commit messages follow a predictable structure.

**Before:**
```text
fix stuff
update deps
more work on auth
fix tests
```

**After:**
```text
feat(auth): add JWT refresh token rotation
fix(api): handle null user on profile endpoint
chore(deps): bump axios from 1.6.0 to 1.7.2
test(auth): add coverage for token expiry edge case
```

From the "after" log, `conventional-changelog` generates:

```text
## [2.1.0] - 2026-04-24

### Features
- **auth:** add JWT refresh token rotation

### Bug Fixes
- **api:** handle null user on profile endpoint
```

Zero manual changelog writing. The history is the changelog, because the commit messages are structured well enough to read programmatically.

***

## Writing the Body — The Why, Not the What

The body is where most developers have the most room to improve and the most to gain. Here is the pattern to avoid:

```text
# Bad — describes what the diff already shows
refactor(db): extract query builder

Moved query building logic from UserRepository into a new
QueryBuilder class. Added methods for filtering and sorting.
```

That body is worse than no body. It repeats what the diff shows, adds no context, and will tell a future reader nothing they couldn't have learned from running `git diff`. Compare:

```text
# Good — explains why and what was considered
refactor(db): extract query builder

UserRepository had grown to 400 lines, 60% of which was
query construction logic unrelated to repository concerns.
Extracting QueryBuilder makes each class testable in isolation
and unblocks the planned migration to a read replica (tracked
in #388).

Considered an ORM (Prisma) but deferred: migration cost is
high and the current query patterns don't justify the
abstraction. Revisit if the read replica migration expands
the query surface significantly.
```

The test for whether a body is done: could someone who wasn't in the room understand why this change was made, six months from now, with only this message and the diff? If not, the body isn't done.

That test is particularly important for decisions that look arbitrary without context. The rejected Redis cluster alternative in the opening example isn't there to show off the author's research — it's there because the next engineer to touch that code will have the same idea, and they deserve to know it was already considered and why it was rejected. Without that note, the investigation happens again. Bad commit messages bill future engineers for decisions that were already paid for.

***

## Linking Issues and PRs Correctly

GitHub parses specific **closing keywords** in commit messages (and PR descriptions) and acts on them when code lands on the default branch:

- `Closes #123` — closes the issue on merge
- `Fixes #123` — closes the issue (alias for Closes)
- `Resolves #123` — closes the issue (alias for Closes)
- `Refs #123` — links without closing, for partial work or related issues

The recommendation: put these in the commit message footer, not the PR description. Here's why.

If you use a squash-merge strategy, GitHub uses the PR description as the squash commit message by default. But PR descriptions get edited — the final state of the description may not match what was in the original. Issue references in individual commit messages survive this, and they're visible in the git history independent of GitHub's UI.

For `Refs` specifically: use it when a commit is related to an issue but doesn't fully resolve it. A multi-PR epic might have three commits that each `Refs #88` and one final commit that `Closes #88`. That gives a clean audit trail of every commit that touched the work.

***

## Enforcing Format with a Commit-Msg Hook

A commit message standard that lives only in a team wiki is not a standard. Enforcement needs to be automatic.

The first layer is a **commit-msg hook** that runs locally before the commit is accepted:

```bash
#!/bin/bash
# .git/hooks/commit-msg
# Enforce Conventional Commits format

commit_regex='^(feat|fix|docs|style|refactor|test|chore|ci|perf|revert)(\(.+\))?: .{1,72}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "ERROR: Commit message does not follow Conventional Commits format."
  echo "Expected: <type>(<scope>): <subject>"
  echo "Example:  feat(auth): add JWT refresh token rotation"
  exit 1
fi
```

Install it:

```bash
chmod +x .git/hooks/commit-msg
```

The problem with a raw `.git/hooks/` file: it isn't committed to the repository and doesn't automatically apply for new clones. The team-scale solution is **commitlint** with Husky:

```bash
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional
npx husky init
```

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

```js
// commitlint.config.js (ESM — requires "type": "module" in package.json)
export default {
  extends: ['@commitlint/config-conventional']
};

// CommonJS alternative: rename to commitlint.config.cjs and use:
// module.exports = { extends: ['@commitlint/config-conventional'] };
```

The `prepare` script runs on `npm install`, so every developer who clones the repository and installs dependencies gets the hook automatically.

### CI Enforcement

The local hook can be bypassed with `git commit --no-verify`. For teams where that matters — or for open-source projects where contributors control their own environments — add a CI check that runs on pull requests:

```yaml
name: Lint Commits
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --verbose
```

The `fetch-depth: 0` is required — without it, the shallow clone won't have the base commit in history, and commitlint can't compute the range. This catches any commit that bypassed the local hook, and it gives contributors clear feedback in CI before the PR goes to review.

***

## `git notes` — Post-Merge Context Without Rewriting History

Sometimes you learn something after a commit merges — a production incident reveals the real cause, a follow-up investigation changes your understanding of a decision. **`git notes`** lets you attach context to an existing commit without amending or rewriting history:

```bash
# Add a note to the most recent commit
git notes add -m "This introduced a subtle race condition under high load. See incident-2024-11-14 in the runbook."

# Add a note to a specific commit
git notes add -m "Root cause confirmed in #512. The fix is in abc9876." abc1234

# View notes in git log
git log --show-notes
```

The limitation worth knowing upfront: `git notes` don't sync automatically. You have to push and fetch them explicitly:

```bash
# Push notes to the remote
git push origin refs/notes/commits

# Fetch notes from the remote
git fetch origin refs/notes/commits
```

That friction makes `git notes` most useful for team-internal context in repositories where the note-fetching step can be scripted into onboarding. For open-source projects where contributors won't have the notes configured, a linked issue comment is a more reliable place for post-merge context. Use `git notes` where you control the team's git workflow; use issue/PR references everywhere else.

***

<div class="callout-box">

## Commit Message Checklist

Before every commit:

- [ ] Subject line is **≤ 50 characters** (hard limit: 72), imperative mood, no trailing period
- [ ] Type prefix matches what changed — `feat` for new capability, `fix` for bug, `chore` for maintenance
- [ ] Body explains **why**, not what the diff already shows
- [ ] Tradeoffs and rejected alternatives are documented if the decision wasn't obvious
- [ ] Issue reference is in the footer (`Closes #N`, `Refs #N`) — not buried in the body
- [ ] If it's a breaking change: `BREAKING CHANGE:` is in the footer
- [ ] If you couldn't fit the change in one subject line, consider whether the commit should be split

</div>

## The Asymmetry of the Investment

Writing a good commit message costs 60 seconds. Reading a bad one during code review, a `git bisect` session, or an incident postmortem costs multiples of that — multiplied by every person who reads it, every time the codebase is touched for as long as it exists. A codebase with good commit messages is a codebase with a searchable, human-readable record of every decision ever made: why the architecture looks the way it does, what was tried and rejected, what constraints shaped each choice.

That's useful for reviewers. It's useful for the new engineer trying to understand a module they've never touched. It's especially useful for the person who wrote the commits six months from now, staring at a line they no longer remember writing, asking themselves why they made a choice they can't explain.

The format is learnable in an afternoon. The discipline is a habit built commit by commit. Start with the subject line — type prefix, imperative mood, under 72 characters. Add a body the next time you make a decision that future-you will need to understand. The rest follows.

***

Working on developer tooling or engineering practices at your organization? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
