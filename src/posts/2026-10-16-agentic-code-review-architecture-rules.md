---
author: Steve Kaschimer
date: 2026-10-16
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, teal, and amber accents. On the left, a stack of small document icons labeled 'ADR-0012', 'ADR-0018', 'naming-conventions.yml' feeding into a single structured rules panel with a checkmark. A PR diff panel in the center shows added lines with a small dependency arrow crossing from a 'src/ui/' block into a 'src/data/' block, highlighted in amber. An agent node reads both the rules panel and the diff, then produces a structured comment card on the right: a bulleted list with a rule ID, a file/line reference, and a one-line explanation, styled like a real PR review comment. The mood is precise and procedural - a reviewer that actually reads the rules every time, not vibes-based commentary."
layout: post.njk
site_title: Tech Notes
summary: "Architecture rules that live in a document get violated because nobody re-reads the document while writing a PR. This post builds an agent that does: reads a structured, repo-committed rules file (dependency-direction constraints, naming patterns, ADR-derived decisions) plus the PR diff, and posts a grounded review comment that cites only the specific rules actually violated - not general code-quality opinions. Covers the Azure AI Foundry agent setup, wiring it into a GitHub Actions PR workflow with a structured comment via the REST API, keeping the rules file from going stale, and what this deliberately doesn't replace."
tags: ["ai-agents", "code-review", "azure-ai-foundry", "github-actions", "architecture"]
title: "Agentic Code Review: Using AI Agents to Enforce Architecture Rules on Every PR"
---

An architecture decision written down in an ADR is a fact about the codebase until the next PR that doesn't know it exists. "New Azure clients use `DefaultAzureCredential`, not connection strings" is easy to state once and easy to violate forever after, because the constraint lives in a document nobody re-reads while writing code. A human reviewer catching that drift requires the reviewer to have the rule memorized and to notice the violation in a diff, every time, for every rule the team has ever written down. That doesn't scale past a handful of rules or a team of more than a few people.

This is a narrower problem than [Copilot's general-purpose PR review](/posts/2026-06-05-github-copilot-in-ci/), which is worth being precise about. Copilot reviews for bugs, style, and general code quality - judgment calls with no single correct answer. This post is about enforcing a *specific, repo-defined rule set*: constraints your team already decided on and wrote down, that either hold or don't. That's a deterministic-enough problem that an agent grounded in the actual rules file - not general opinions about "good architecture" - can do it reliably.

***

## What "Architecture Rules" Means Here

Not "is this good code." Specifically: dependency-direction constraints (`src/ui/` must not import from `src/data/` directly), naming conventions (all Azure client wrappers end in `Client`, not `Service` or `Wrapper`), and decisions already captured in an ADR (this repo's own `docs/architecture/adr/` is exactly the kind of source this pattern reads from - a real decision, made once, that should hold for every PR after it, not just the one that made it).

The distinction matters because it's what keeps the agent's output trustworthy. A rule with a clear yes/no answer produces a review comment the author can't argue with. A rule that's really a judgment call ("this component feels too big") produces a review comment that reads like an opinion with extra confidence - the same credibility problem general-purpose AI review already has, just with worse authority since it's dressed up as "architecture enforcement."

***

## Storing Rules the Agent Can Actually Read

ADRs are prose, written for human narrative reasoning - not something an agent should parse for enforcement logic. Extract the *enforceable* part of each decision into a structured file, the same pattern [the secret-patterns post](/posts/2026-08-28-github-secret-scanning-custom-patterns/) used for scanning patterns: reviewed on PRs, validated, and the actual interface between a human decision and automated enforcement.

```yaml
# architecture-rules.yml
rules:
  - id: no-ui-to-data-direct-import
    description: "UI layer must not import directly from the data layer - route through src/services/."
    type: forbidden-import
    scope: "src/ui/**"
    forbidden_pattern: "from ['\"]\\.\\./data/"
    source_adr: "docs/architecture/adr/0012-layered-architecture.md"
    severity: blocking

  - id: azure-client-naming
    description: "Azure SDK client wrappers must be named *Client, not *Service or *Wrapper."
    type: naming-pattern
    scope: "src/integrations/azure/**"
    required_pattern: "class \\w+Client"
    forbidden_pattern: "class \\w+(Service|Wrapper)"
    source_adr: null
    severity: warning

  - id: no-connection-strings
    description: "New Azure clients must use DefaultAzureCredential, not a connection string."
    type: forbidden-pattern
    scope: "src/integrations/azure/**"
    forbidden_pattern: "connection_string\\s*="
    source_adr: "docs/architecture/adr/0018-managed-identity-only.md"
    severity: blocking
```

`severity` matters for what happens next - `blocking` rules trace back to an actual ADR (a real decision, not a preference), `warning` rules are conventions worth flagging without holding up a merge. `source_adr` gives the agent (and the human reading its comment) a link back to *why* the rule exists, not just that it does.

***

## Building the Review Agent

The agent's job is narrow on purpose: read the rules file, read the PR diff, report which specific rules were violated, where, and why - grounded in `architecture-rules.yml`, the same anti-hallucination discipline as [the memory and RAG post's semantic-memory grounding](/posts/2026-09-04-azure-ai-foundry-agents-memory-tool-calling-rag/): don't let it invent a violation, and don't let it invent a rule that isn't in the file.

```python
from azure.ai.agents.models import FunctionTool
import yaml

def load_architecture_rules() -> list[dict]:
    with open("architecture-rules.yml") as f:
        return yaml.safe_load(f)["rules"]

rules_tool = FunctionTool(
    name="load_architecture_rules",
    description="Load the repository's structured architecture rules. Always call this before reviewing a diff - never evaluate a PR against rules from memory or general knowledge.",
    parameters={"type": "object", "properties": {}, "required": []},
)

review_agent = await agents_client.create_agent(
    model="gpt-4o",
    name="architecture-review-agent",
    instructions=(
        "You review pull request diffs against this repository's architecture rules. "
        "Rules:\n"
        "1. Always call load_architecture_rules first. Only flag violations of rules "
        "that are actually in that file - never flag something because it seems like "
        "bad practice in general.\n"
        "2. For each violation, cite the exact rule id, the file and approximate line, "
        "and a one-sentence explanation grounded in the rule's description.\n"
        "3. If a rule has source_adr set, mention it - the author should be able to go "
        "read why the rule exists, not just that it was violated.\n"
        "4. If the diff violates no rules, say so explicitly. Do not invent minor "
        "stylistic suggestions to seem useful - this agent enforces specific rules, "
        "it does not perform general code review.\n"
        "5. Return your findings as a JSON list: "
        '[{"rule_id": "...", "file": "...", "line": "...", "severity": "...", "explanation": "..."}]'
    ),
    tools=[rules_tool],
)
```

Rule 4 is the one worth calling out specifically. An agent instructed to "review this PR" without a hard boundary will find *something* to say, because that's what a helpful-sounding review looks like - and a stream of invented minor suggestions from an "architecture enforcement" agent is exactly how a team stops trusting it. Explicitly permitting "no violations found" as a valid, complete answer is what keeps the signal-to-noise ratio worth reading.

***

## Wiring It Into a PR Workflow

```yaml
name: Architecture Review

on:
  pull_request:
    branches: [main]

permissions: {}

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR diff
        run: git diff origin/${{ github.base_ref }}...HEAD > pr.diff

      - name: Run architecture review agent
        run: python scripts/run_architecture_review.py
        env:
          AZURE_AI_PROJECT_ENDPOINT: ${{ secrets.AZURE_AI_PROJECT_ENDPOINT }}

      - name: Post review comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require("fs");
            const findings = JSON.parse(fs.readFileSync("findings.json", "utf8"));

            if (findings.length === 0) return;

            const body = [
              "### Architecture Review",
              "",
              ...findings.map(f =>
                `- **${f.rule_id}** (${f.severity}) - \`${f.file}:${f.line}\`\n  ${f.explanation}`
              ),
            ].join("\n");

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body,
            });
```

Same non-blocking-first judgment call as the Copilot post: this posts a comment, it doesn't fail the check by default. Promote specific `blocking`-severity rules to an actual required status check once you've seen a few weeks of output and trust the false-positive rate - the same "prove it before you enforce it" sequencing as a Ruleset's evaluation mode.

***

## Keeping Rules Up to Date as Architecture Evolves

A rules file that goes stale is worse than no rules file - it starts flagging violations of a constraint the team quietly stopped believing in, the author overrides it because it's obviously wrong, and the next real violation gets overridden with the same shrug. The discipline that prevents this: `architecture-rules.yml` changes go through the same PR review as code, and - the part teams actually skip - a new ADR that changes an enforceable constraint should update the rules file in the *same* PR, not as a followup that never happens.

A lightweight staleness signal helps here too, the same pattern [the Responsible AI post](/posts/2026-10-02-responsible-ai-governance-gates-github-actions/) used for model cards: if a `blocking` rule's `source_adr` hasn't been touched in a long time relative to how often the codebase it governs changes, that's worth a periodic review, not because old rules are wrong, but because nobody's checked whether they're still right.

***

## What This Doesn't Replace

The agent enforces rules that got written down. It has no opinion on whether the architecture itself is still correct, doesn't catch violations of conventions the team has never formalized, and doesn't replace an architect's judgment on the genuinely ambiguous cases that don't reduce to a yes/no rule - which is most architecture decisions, most of the time. What it replaces is a much smaller thing: the gap between "we decided this" and "every PR after that decision actually follows it," which used to depend entirely on a human reviewer's memory and is now something the repository checks for itself.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
