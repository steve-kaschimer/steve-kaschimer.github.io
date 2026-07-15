---
author: Steve Kaschimer
date: 2026-11-27
image: /images/posts/2026-11-27-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, teal, and amber accents. On the left, a single function-code icon labeled 'calculate_discount()' feeds into an agent node with a small magnifying-glass mark. From the agent, three branching arrows fan out to test-case cards labeled 'happy path', 'boundary: qty=0', and 'edge: negative price' - the last one highlighted in amber with a small bug icon, implying a caught edge case. Below, a smaller panel shows a human silhouette reviewing the generated tests with a checkmark and an X, one approved and one rejected, captioned 'augmentation, not replacement'. The mood is exploratory and honest about limits - a capable assistant surfacing edge cases, still supervised, not an autonomous QA replacement."
layout: post.njk
site_title: Tech Notes
summary: "AI agents that can read a codebase are starting to generate meaningful regression tests and surface edge cases a human tester would take much longer to find - but the tooling is early and the failure modes are real: flaky agents, hallucinated assertions, and coverage numbers that look good without actually testing anything meaningful. This post surveys the current landscape (Copilot test generation, Azure AI Foundry-based test agents, open-source options), builds a simple agent that reads a function and generates a parameterized test suite for it, and is explicit about where the pattern breaks down - framing it as augmentation, not replacement, for a human tester's judgment."
tags: ["ai-agents", "testing", "agentic-development", "azure-ai-foundry", "developer-productivity"]
title: "Agentic QA: How AI Agents Are Reshaping Test Generation and Exploratory Testing"
---

Writing tests is the part of software development most consistently deferred, not because it's hard but because it's tedious relative to writing the feature itself - and tedious work is exactly what agents are good at accelerating, as long as someone stays honest about what "good at" means here. An agent that reads a function and produces a plausible-looking test suite in ten seconds is a genuinely different experience from writing that suite by hand. Whether the suite is actually testing the right things is a separate question the speed doesn't answer, and conflating the two is how a team ends up with high coverage numbers and a production incident the tests should have caught.

***

## The Current Landscape

**GitHub Copilot's test generation** (in the IDE and via `/tests` in Copilot Chat) is the most widely used entry point - it reads the function in context, infers likely inputs, and drafts a test file in the project's existing test framework. It's genuinely fast for the common case: a pure function with an obvious happy path, it produces a reasonable first draft that's usually a good starting point, occasionally a complete one.

**Azure AI Foundry-based test agents** go further by design - not just generating a test file from a single function in isolation, but an agent with tool access to the actual codebase (via `FunctionTool`, the same conventions as [the memory and RAG post](/posts/2026-09-04-azure-ai-foundry-agents-memory-tool-calling-rag/)), able to read related files, existing test patterns in the repo, and the function's actual call sites to infer realistic inputs rather than guessing from the function signature alone.

**Open-source options** (various LLM-backed test generation CLIs and CI actions) trade the deeper codebase context of a custom agent for lower setup cost - useful for teams that want the acceleration without standing up an agent runtime, at the cost of the same shallower-context limitations as Copilot's per-function generation.

The meaningful axis across all three isn't "AI-generated vs. hand-written" - it's how much real context about the codebase the generation step actually has, because that's what determines whether the generated edge cases are realistic or just plausible-sounding boilerplate.

***

## Building a Simple Test-Generation Agent

A narrow version of the Azure AI Foundry approach: an agent with one tool - read a function's source and its existing call sites - and instructions to generate a parameterized test suite grounded in what it actually finds, not generic assumptions:

```python
from azure.ai.agents.models import FunctionTool
import ast

def find_function_and_call_sites(function_name: str, source_dir: str) -> dict:
    """Locate a function's source and every place it's called in the given directory."""
    definition = None
    call_sites = []
    for path in Path(source_dir).rglob("*.py"):
        tree = ast.parse(path.read_text())
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and node.name == function_name:
                definition = ast.get_source_segment(path.read_text(), node)
            if isinstance(node, ast.Call) and getattr(node.func, "id", None) == function_name:
                call_sites.append({"file": str(path), "line": node.lineno})
    return {"definition": definition, "call_sites": call_sites}

inspect_tool = FunctionTool(
    name="find_function_and_call_sites",
    description="Read a function's source code and find every place it's actually called in the codebase, to ground test inputs in real usage rather than guesses.",
    parameters={
        "type": "object",
        "properties": {
            "function_name": {"type": "string"},
            "source_dir": {"type": "string"},
        },
        "required": ["function_name", "source_dir"],
    },
)

test_gen_agent = await agents_client.create_agent(
    model="gpt-4o",
    name="test-generation-agent",
    instructions=(
        "You generate pytest test suites for Python functions. Rules:\n"
        "1. Always call find_function_and_call_sites first - never write tests from "
        "the function signature alone.\n"
        "2. Use the actual call sites to infer realistic input types and ranges, not "
        "just the type hints.\n"
        "3. Generate cases for: the happy path, boundary values (zero, empty, "
        "maximum), and at least one case the function's own logic suggests it might "
        "not handle (e.g. a branch with no corresponding input in any call site).\n"
        "4. Do not assert on behavior you cannot verify from the source - if you're "
        "unsure what a function returns for an edge case, write the test with a "
        "comment flagging it for human review instead of guessing the assertion."
    ),
    tools=[inspect_tool],
)
```

Rule 4 is the one that matters most in practice. An agent under no constraint will confidently assert a specific return value for an edge case it has no actual basis for - which produces a test that looks complete and is actively wrong, worse than no test at all because it creates false confidence until someone finally reads the assertion closely enough to notice it's fabricated.

***

## Wiring It Into a PR Workflow

```yaml
name: Generate Tests for New Functions

on:
  pull_request:
    paths: ['src/**/*.py']

permissions:
  contents: read
  pull-requests: write

jobs:
  suggest-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Find new functions without tests
        id: find
        run: python scripts/find_untested_functions.py --diff origin/${{ github.base_ref }}...HEAD

      - name: Generate test suggestions
        if: steps.find.outputs.has_untested == 'true'
        run: python scripts/generate_test_suggestions.py
        env:
          AZURE_AI_PROJECT_ENDPOINT: ${{ secrets.AZURE_AI_PROJECT_ENDPOINT }}

      - name: Post as PR comment
        if: steps.find.outputs.has_untested == 'true'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require("fs");
            const body = fs.readFileSync("test-suggestions.md", "utf8");
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body,
            });
```

This posts suggested tests as a PR comment for a human to review and commit deliberately - it does not auto-commit generated tests into the PR. That's not a missing feature; it's the actual boundary this pattern needs, covered next.

***

## Where This Breaks Down

**Flaky agents.** The same generation prompt against the same function can produce a meaningfully different test suite on two separate runs - different edge cases considered, different level of thoroughness. Treating agent-generated tests as a deterministic, repeatable process the way hand-written tests are is a mistake; they're a suggestion generated fresh each time, not a stable artifact to diff against a previous version.

**Hallucinated assertions.** Rule 4 above mitigates this but doesn't eliminate it - an agent can still assert something false with total confidence, and unlike a human test author who wrote the assertion because they traced through the logic, the agent's confidence carries no information about whether it's actually correct. Every generated assertion needs the same scrutiny a reviewer would give a test written by an unfamiliar contributor, not less scrutiny because it came from a tool.

**Coverage theater.** A generated test suite can drive coverage numbers up substantially while testing almost nothing meaningful - calling a function with a few inputs and asserting only that it doesn't throw, without checking the actual output is correct. Coverage percentage was already a weak proxy for test quality before agentic generation; agents that optimize implicitly for "produce tests that pass and touch a lot of lines" make that gap wider, not smaller, if nobody's checking what the assertions actually verify.

***

## Augmentation, Not Replacement

The honest framing: agentic test generation is a fast first draft, not a finished test suite, and the fastest way to get real value from it is to point it at the tedious 80% (boilerplate happy-path cases, obvious boundary values) and keep human attention on the 20% that actually requires judgment - the edge case that's ambiguous because the spec itself is ambiguous, the assertion that depends on business context no codebase-reading agent has access to. An agent that surfaces "here's an input combination your own code's branches suggest might not be handled" and lets a human decide what the correct behavior should be is doing real, valuable work. An agent trusted to decide that on its own, unreviewed, is where the coverage-theater failure mode stops being theoretical.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
