---
author: Steve Kaschimer
date: 2026-12-04
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, amber, and teal accents. A vertical rollout sequence of three stages, each a labeled panel with a small progress bar filling left to right: 'Secret Scanning' (fully filled, green), 'Code Scanning / CodeQL' (partially filled, teal), 'Dependabot Alerts' (just starting, amber). To the right, a grid of small repository icons - most showing a green checkmark, a handful showing a grey question mark, implying partial org-wide coverage. Below, a small dashboard panel with a bar chart labeled 'Weekly Coverage Report' and a single summary line 'furniture co: 87% of repos covered'. The mood is systematic and gradual - a phased rollout across a large surface area, not a single switch flipped everywhere at once."
layout: post.njk
site_title: Tech Notes
summary: "Turning on GitHub Advanced Security for one repository is a five-minute settings change. Doing it consistently across a hundred-plus repos without burying developers in alert fatigue on day one is a rollout strategy, not a toggle. This post covers the sequencing that actually works - secret scanning first, then code scanning, then Dependabot alerts with auto-dismiss rules - auditing enablement across an org with the REST API and gh CLI, setting org-level default CodeQL setup, and building a lightweight GitHub Actions dashboard that reports coverage weekly."
tags: ["github-advanced-security", "devsecops", "platform-engineering", "codeql", "secret-scanning"]
title: "GitHub Advanced Security at the Org Level: Rolling Out GHAS Across 100+ Repos"
---

Enabling GitHub Advanced Security (GHAS) on a single repository is a checkbox in repo settings. Rolling it out across an org with a hundred-plus repos, most with different languages, different maintenance levels, and different teams' tolerance for new noise in their PR checks, is an entirely different problem - and the version of this rollout that fails is the one where every feature gets flipped on everywhere simultaneously, developers wake up to hundreds of new alerts across repos nobody's actively triaging, and GHAS gets tagged internally as "the thing that broke everyone's Monday."

The rollout that works is sequenced, not simultaneous - each layer proven out and tuned before the next one goes on, so alert volume grows at a rate teams can actually absorb.

***

## The Rollout Sequence, and Why This Order

**Secret scanning first.** It's the highest-signal, lowest-noise GHAS feature - a detected secret is close to unambiguously something to act on, unlike a code-scanning finding that might be a false positive or an accepted risk. [The custom-patterns post](/posts/2026-08-28-github-secret-scanning-custom-patterns/) covers extending detection beyond the built-in partner patterns; at the org level, start with just the built-in patterns everywhere, prove out the response process (who gets paged, how a real secret gets rotated), and layer custom patterns in per-repo once that process is solid.

**Code scanning (CodeQL) second.** This is the layer most likely to generate a rollout-day flood if enabled everywhere at once - a repo with years of accumulated code and no prior static analysis can produce dozens or hundreds of findings the first time CodeQL runs against it. Enabling it repo-by-repo, or in waves grouped by language and team capacity, keeps that flood from hitting everyone simultaneously.

**Dependabot alerts (with auto-dismiss rules) third.** Dependency vulnerability alerts are the noisiest layer by volume - a single repo can accumulate dozens of transitive-dependency alerts, many for versions never actually reachable in the runtime path. Auto-dismiss rules (covered below) are what make this layer survivable at scale; without them, this is the feature most likely to get muted org-wide out of alert fatigue within the first month.

***

## Auditing Current Enablement Across the Org

Before rolling anything out further, know what's actually enabled today - GHAS adoption in most orgs is uneven, with some repos fully covered from an earlier push and others never touched:

```bash
#!/usr/bin/env bash
# audit-ghas-enablement.sh
gh api "orgs/your-org/repos" --paginate --jq '.[].name' | while read -r repo; do
  secret_scanning=$(gh api "repos/your-org/$repo" --jq '.security_and_analysis.secret_scanning.status // "disabled"')
  code_scanning=$(gh api "repos/your-org/$repo/code-scanning/alerts" --silent 2>/dev/null && echo "enabled" || echo "disabled")
  dependabot=$(gh api "repos/your-org/$repo" --jq '.security_and_analysis.dependabot_security_updates.status // "disabled"')
  echo "$repo,$secret_scanning,$code_scanning,$dependabot"
done > ghas-enablement-audit.csv
```

Running this before touching anything turns "let's roll out GHAS" from a vague initiative into a concrete list: which repos are already fully covered, which have partial coverage worth completing, and which have never been touched and need the full sequence from scratch.

***

## Org-Level Default Setup for CodeQL

Rather than configuring CodeQL per-repo, GitHub's **default setup** at the org level (**Settings → Code security → Configure code scanning → Default setup**) applies a sensible baseline configuration automatically to every repo matching a language filter, without a workflow file to maintain in each one:

```bash
gh api --method PATCH "orgs/your-org/code-security-configurations/default" \
  -f code_scanning_default_setup='enabled' \
  -f code_scanning_default_setup_languages[]='javascript-typescript' \
  -f code_scanning_default_setup_languages[]='python'
```

Default setup is deliberately less configurable than a hand-written CodeQL workflow - it doesn't support custom query suites or unusual build steps for compiled languages. That's the correct tradeoff for the bulk of an org's repos; reserve a custom `.github/workflows/codeql.yml` for the specific repos that actually need it (custom queries, a non-standard build process), rather than hand-configuring all hundred-plus.

***

## Dependabot Auto-Dismiss Rules

The single highest-leverage tuning for surviving Dependabot alert volume at scale: auto-dismiss rules that close alerts for a vulnerability class the org has already decided isn't actionable in context (a `low`-severity alert in a `devDependencies`-only package, for instance, never reaches production):

```yaml
# .github/dependabot-auto-dismiss.yml (consumed by a scheduled workflow, not a native Dependabot config key)
rules:
  - severity: low
    dependency_scope: development
    action: dismiss
    reason: "tolerable_risk"
  - ecosystem: npm
    ghsa_id_pattern: "GHSA-*-test-only-*"
    action: dismiss
    reason: "not_used"
```

```yaml
name: Auto-Dismiss Low-Risk Dependabot Alerts

on:
  schedule:
    - cron: '0 6 * * 1'

permissions:
  contents: read
  security-events: write

jobs:
  dismiss:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Apply dismiss rules
        run: python scripts/dependabot_auto_dismiss.py --config .github/dependabot-auto-dismiss.yml
        env:
          GITHUB_TOKEN: ${{ secrets.ORG_ADMIN_TOKEN }}
```

This is a deliberate, reviewable policy - the rules file goes through the same PR review as any other config change - not a blanket suppression. The goal is removing noise the org has already decided isn't worth a human's attention, so the alerts that remain are the ones people actually look at instead of triaging through a wall of low-severity dev-dependency notices.

***

## A Weekly Coverage Dashboard

Rollout doesn't end when every repo has GHAS features turned on - coverage drifts as new repos get created without them, so a lightweight recurring check keeps the rollout from quietly regressing:

```yaml
name: GHAS Coverage Report

on:
  schedule:
    - cron: '0 9 * * 1'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - name: Audit enablement
        run: ./scripts/audit-ghas-enablement.sh

      - name: Generate coverage summary
        run: python scripts/summarize_ghas_coverage.py ghas-enablement-audit.csv > coverage-summary.md

      - name: Post to Slack
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"$(cat coverage-summary.md)\"}"
```

A weekly "87% of repos have secret scanning, 62% have code scanning, 3 new repos created this week without either" summary is what keeps GHAS rollout from being a one-time project that quietly decays - new repos are the leak in any org-wide security baseline, and this is the check that catches them before they've been unmonitored for months.

***

## Closing

The rollout sequence here isn't about being cautious for its own sake - it's about matching the pace of new alert volume to the org's actual capacity to triage it, which is exactly the constraint that determines whether GHAS becomes a trusted signal or a wall of noise everyone learns to ignore. Secret scanning first because it's unambiguous and builds trust in the process. Code scanning next, in waves sized to what a team can actually work through. Dependabot last, with auto-dismiss rules doing the noise reduction that makes the remaining alerts worth reading. And a standing coverage check after all of it, because a rollout that isn't actively maintained against new repos is a rollout that's already started decaying the day it finished.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
