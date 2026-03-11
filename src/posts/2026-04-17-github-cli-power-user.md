---
author: Steve Kaschimer
date: 2026-04-17
image: /images/posts/2026-04-17-hero.png
image_prompt: "A dark-mode developer workstation aesthetic on a deep charcoal background with cool blue and electric green accent tones. Centered: a crisp terminal window displaying a sequence of 'gh' CLI commands — 'gh pr checkout 342', 'gh run watch --exit-status', 'gh issue develop 88 --checkout' — rendered in sharp monospaced white text with syntax-highlighted flags in electric green. Flanking the terminal: a stylized ghost-outline of a web browser window with a red X through it, representing eliminated browser context-switches. Behind the terminal, faint ghost-text layers show GitHub pull request status badges, workflow run logs, and secret key icons dissolving into the terminal frame — the web collapsing into the command line. Mood: focused, productive, the feeling of flow state when you stop reaching for the mouse. Avoid: cartoon robots, abstract circuit textures, GitHub Octocat mascot imagery, generic keyboard close-ups."
layout: post.njk
site_title: Tech Notes
summary: The gh CLI covers PR reviews, workflow monitoring, secret management, and issue branching entirely from the terminal — here are the 10 commands that eliminate the browser tabs most developers still have open.
tags: ["github-cli", "developer-productivity", "tooling", "terminal"]
title: "GitHub CLI Power User: 10 `gh` Commands That Replace Browser Tabs"
---

Most developers have GitHub open in a browser tab permanently. They switch to it to check a PR status, review a diff, watch a failing run, paste in a secret, or find the branch name for an issue. Each of those trips is 30 seconds of context-switching that breaks whatever thread of thought was running in the background. The **`gh` CLI** eliminates most of them — not because it's clever, but because it puts GitHub's full API surface in the terminal, where you already are.

The problem isn't that people don't know `gh` exists. Most developers have it installed. The problem is that they used `gh pr create` once, found it fine, and never went deeper. This post covers the commands that actually change how you work: the ones that replace complete browser workflows rather than just wrapping a single API call.

---

## The 10 Commands

### 1. `gh pr checkout`

**Replaces:** Copying a branch name off the PR page, running `git fetch`, running `git checkout`.

```bash
# Check out by PR number
gh pr checkout 342

# Check out by URL — works from any directory
gh pr checkout https://github.com/org/repo/pull/342
```

The underrated behavior: `gh pr checkout` sets up remote tracking automatically. `git push` works immediately after without a `--set-upstream`. It also handles PRs from forks — no manual remote setup, no fetching from the contributor's fork URL. If you've ever spent three minutes getting a forked PR's branch onto your machine, this is the command that eliminates that entirely.

### 2. `gh pr review`

**Replaces:** Opening the PR in a browser, navigating to the Files tab, writing a review.

```bash
# Approve with a note
gh pr review 342 --approve --body "LGTM, tested locally"

# Request changes
gh pr review 342 --request-changes --body "See inline comments"

# Leave a comment without a decision
gh pr review 342 --comment --body "One question before I approve"
```

Approve, request-changes, and comment on the whole PR are fully terminal-native. The one thing that still requires the browser: inline comments on specific file lines. For anything else — including the daily "LGTM" on a PR you've reviewed locally — this is faster than a browser tab.

### 3. `gh run watch`

**Replaces:** Refreshing the Actions tab to monitor a workflow run in progress.

```bash
# Watch the most recent run interactively
gh run watch

# Watch a specific run by ID
gh run watch 1234567890

# Exit with the run's exit code (the flag most people miss)
gh run watch --exit-status
```

The `--exit-status` flag is the one worth knowing: it returns a non-zero exit code when the run fails. That makes `gh run watch` composable in scripts:

```bash
gh workflow run deploy.yml && gh run watch --exit-status && echo "deployed successfully"
```

Without `--exit-status`, the command exits 0 regardless of whether the run passed or failed — which makes it useless in automation. With it, you get a blocking, scriptable workflow monitor.

### 4. `gh run rerun`

**Replaces:** Opening a failed run in the browser and clicking "Re-run failed jobs".

```bash
# Rerun only the failed jobs — not the entire workflow
gh run rerun 1234567890 --failed

# Rerun with step debug logging enabled
gh run rerun 1234567890 --debug
```

The `--debug` flag is the behavior most people don't know exists. It enables step-level debug logging for the rerun — equivalent to setting `ACTIONS_STEP_DEBUG=true` as a repository secret, but without touching your repo settings and without affecting other runs. When a job fails intermittently and you need visibility into exactly what happened, `--debug` is the first thing to reach for.

### 5. `gh issue develop`

**Replaces:** Manually creating a branch, remembering to include the issue number in the name, hoping you remember it later for the PR description.

```bash
# Create a branch linked to issue 88 and check it out immediately
gh issue develop 88 --checkout
```

The branch name is generated from the issue title and number: `88-fix-the-thing-described-in-issue-88`. The branch is automatically linked to the issue in the GitHub UI, and when you open a PR from it, the issue is referenced and closed automatically on merge. Use `--base` to target a non-default branch. This eliminates an entire class of "I forgot to link the issue" PR comments.

### 6. `gh secret set`

**Replaces:** Opening Repository Settings → Secrets and variables → Actions → New repository secret, pasting a value into a browser form field.

```bash
# Set from a file — value never touches shell history
gh secret set MY_API_KEY < secret.txt

# Pipe directly from a secret manager
aws secretsmanager get-secret-value --secret-id prod/api-key \
  --query SecretString --output text | gh secret set PROD_API_KEY

# Set an environment-scoped secret (not repo-level)
gh secret set DEPLOY_TOKEN --env production

# Set an org-level secret visible to all repos
gh secret set SHARED_TOKEN --org my-org --visibility all
```

> Never pass the secret value directly as a flag: `gh secret set MY_KEY --body "actual-value"` writes the plaintext value into your shell history. The stdin approach (`< secret.txt` or a pipe) keeps the value out of history entirely. This is the default you should build muscle memory around.

***

### 7. `gh repo create --template`

**Replaces:** Navigating to a template repository, clicking "Use this template", waiting for the GitHub UI to create the repository, then cloning it.

```bash
# Create a private repo from a template and clone it locally in one step
gh repo create my-new-service \
  --template org/service-template \
  --private \
  --clone
```

Combine with a wrapper script in `~/scripts/new-service.sh` that pre-fills the standard options for your organization — private visibility, team access, your naming convention. No more clicking through four browser screens for every new repository.

### 8. `gh api` with `--jq`

**Replaces:** Looking up the GitHub API endpoint, constructing a `curl` command, piping to a separate JSON parser.

```bash
# List open PRs with review status
gh api /repos/{owner}/{repo}/pulls \
  --jq '.[] | {number, title, user: .user.login, draft: .draft}'

# List org repos sorted by last push, handling pagination automatically
gh api /orgs/my-org/repos \
  --paginate \
  --jq 'sort_by(.pushed_at) | reverse | .[] | {name, pushed_at}'
```

Two things worth knowing: the `{owner}` and `{repo}` placeholders are filled automatically from the current directory's git remote — no hardcoding needed. And `--paginate` handles multi-page responses transparently, fetching all pages and concatenating the results before piping to `--jq`. Any GitHub REST endpoint is reachable this way, which means `gh api` is the escape hatch for anything the purpose-built commands don't cover.

### 9. `gh search`

**Replaces:** GitHub's web search interface, which requires a browser and returns results buried in a UI.

```bash
# Your open issues across all repos
gh search issues --assignee @me --state open --json number,title,repository

# Open Dependabot PRs in a specific repo
gh search prs "dependabot" --repo org/repo --state open

# Find hardcoded tokens in YAML files
gh search code "GITHUB_TOKEN" --language yaml --repo org/repo
```

The `--json` flag outputs machine-readable results composable with `jq`. The `@me` shorthand resolves to your authenticated GitHub user automatically. For cross-repo issue triage or security audits across an organization, `gh search` is considerably faster than assembling a GraphQL query by hand.

### 10. The Standup Script

**Replaces:** Mentally reconstructing what you worked on yesterday before a standup.

Save this as `~/scripts/standup.sh`:

```bash
#!/bin/bash
# standup.sh — what did I do yesterday?
YESTERDAY=$(date -d "yesterday" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
  || date -v-1d +%Y-%m-%dT%H:%M:%SZ)

echo "=== PRs you reviewed ==="
gh search prs --reviewed-by @me --updated "$YESTERDAY..*" \
  --json number,title,repository \
  --jq '.[] | "  #\(.number) \(.title) [\(.repository.name)]"'

echo ""
echo "=== PRs you opened or updated ==="
gh search prs --author @me --updated "$YESTERDAY..*" \
  --json number,title,state,repository \
  --jq '.[] | "  #\(.number) [\(.state)] \(.title) [\(.repository.name)]"'

echo ""
echo "=== Issues you were involved in ==="
gh search issues --involves @me --updated "$YESTERDAY..*" \
  --json number,title,repository \
  --jq '.[] | "  #\(.number) \(.title) [\(.repository.name)]"'
```

The `date` syntax differs between GNU date (Linux) and BSD date (macOS) — the `2>/dev/null || ` fallback handles both. Run this every morning before standup: it pulls the previous day's PR reviews, authored PRs, and issue activity across all your repos without touching a browser.

***

## Shell Aliases Worth Adding

A small set of aliases for `.bashrc` or `.zshrc` that make the most common workflows single-keystrokes:

```bash
# Check out a PR by number
alias prco='gh pr checkout'

# Watch the latest run on the current branch
alias runwatch='gh run watch $(gh run list \
  --branch $(git branch --show-current) \
  --limit 1 --json databaseId \
  --jq ".[0].databaseId")'

# Open the current repo in the browser (for the things that do need the browser)
alias ghopen='gh repo view --web'

# Create a PR for the current branch, pre-filled from commit messages
alias ghpr='gh pr create --fill --web'
```

The `runwatch` alias is the most useful: it resolves the latest run ID for the current branch automatically, so you can push a commit and immediately run `runwatch` without knowing or caring about run IDs.

***

<div class="callout-box">

## Getting Started: Install and Auth

**Install:**
- macOS: `brew install gh`
- Windows: `winget install GitHub.cli`
- Debian/Ubuntu: `sudo apt install gh`

**Authenticate:**
```bash
gh auth login          # browser flow or token
gh auth switch         # switch between accounts or GitHub Enterprise hosts
gh auth status         # check who you're authenticated as
```

**One rule that matters:** all `gh` commands resolve context from the current directory's git remote. Run them from inside the repository you want to act on. If you run `gh pr list` in the wrong directory, you'll get the wrong repo's PRs — and wonder why until you check `gh repo view`.

</div>

## Closing

The payoff isn't any single command. It's the accumulated effect of eliminating ten context-switches a day — ten times you didn't reach for the browser, ten times you stayed in the terminal and kept the thread of thought intact. Over a workday that compounds into real, measurable concentration time. The standup script alone saves five minutes of mental reconstruction every morning before you've had coffee.

Start with `gh pr checkout` and `gh run watch`. Those two commands cover the majority of daily GitHub back-and-forth for most developers. The rest follows naturally once you've built the reflex to reach for `gh` before reaching for the browser.

***

Working on developer tooling at your organization, or want to talk through GitHub CLI adoption with your team? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
