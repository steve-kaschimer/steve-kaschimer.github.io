---
author: Steve Kaschimer
date: 2026-10-30
image: /images/posts/2026-10-30-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, electric teal, and amber accents. A file icon labeled 'summarize-ticket.prompty v4' sits at the top, feeding down through a small evaluation gate showing two side-by-side score bars, 'v3 (current)' and 'v4 (candidate)', with v4 slightly taller and a green checkmark. Below the gate, a rollout dial shows a percentage split '10% -> 50% -> 100%' with a small pointer, and a thin dashed line loops back from the dial to a 'v3' file icon labeled 'rollback', implying a fast reversible path. The mood is procedural and calm - prompt changes treated with the same rigor and reversibility as a code deployment, not a live edit made and hoped for."
layout: post.njk
site_title: Tech Notes
summary: "A prompt embedded as a string literal in application code is a change nobody's watching for regression - someone tweaks it during a hotfix, and quality drifts silently until a user complains. This post treats prompts as first-class, versioned artifacts: stored as .prompty files, tested in CI against the same evaluation dataset on every change, gated on regression against the currently-deployed version rather than just a fixed threshold, rolled back the way you'd roll back a code deployment, and rolled out gradually with a feature-flag-style percentage split and an instant kill switch."
tags: ["llmops", "azure-ai-foundry", "prompt-engineering", "ci-cd", "agentic-development"]
title: "LLMOps: Versioning, Testing, and Deploying Prompts as First-Class Artifacts"
---

A prompt buried as a string literal inside application code changes the same way a magic number would - someone edits it inline to fix an immediate problem, ships it in the same PR as an unrelated bug fix, and nothing about that change is versioned, tested, or reviewable as its own unit. Three weeks later, response quality has quietly degraded and nobody can point to when, because the prompt that caused it was never a thing with a history - it was just text sitting inside a function.

Prompts are code. Not metaphorically - they determine program behavior as directly as any conditional, and they deserve the same three things code gets by default: a version history, a test suite that runs before a change ships, and a deployment process that can be rolled back. This post covers all three, plus the one property that makes prompt changes specifically risky in a way most code changes aren't - the same prompt, evaluated as "fine" in isolation, can still be a regression relative to the version it's replacing, which is why the deployment gate here compares against a baseline, not just a fixed bar.

***

## Prompts as Versioned Files, Not String Literals

The first move is mechanical: get the prompt out of application code and into a file the repo actually tracks as its own artifact. [Prompty](https://github.com/microsoft/prompty) is the open format for this - a `.prompty` file pairs YAML front matter (model configuration, parameters, sample inputs) with the template body, versioned and diffable like any other file:

```yaml
---
name: summarize-ticket
description: Summarizes a support ticket thread into a one-paragraph handoff note
model:
  api: chat
  configuration:
    azure_deployment: gpt-4o-mini
  parameters:
    temperature: 0.2
    max_tokens: 200
inputs:
  ticket_thread:
    type: string
sample:
  ticket_thread: "Customer reports login failures since the 2.4 release..."
---
system:
You summarize support ticket threads for handoff between shifts. Produce one paragraph, factual, no speculation about root cause unless the customer or agent explicitly stated one.

user:
{{ticket_thread}}
```

This alone changes what a prompt edit looks like in practice: it's a diff on a tracked file, reviewed on a PR like any other change, with `git blame` able to answer "when did this line change and why" - not an inline edit inside a Python function that a code reviewer skims past because it's just a string.

***

## Testing Prompts in CI Against a Fixed Evaluation Set

Every prompt change runs against the same evaluation dataset, using the same `azure.ai.evaluation` conventions from [the LLM evaluation post](/posts/2026-08-21-evaluating-llm-outputs-in-ci-cd/) - the discipline that changes here is *when* it runs: on every prompt file change, not just once at feature launch.

```python
# evaluate_prompt.py
import json
from azure.ai.evaluation import evaluate, GroundednessEvaluator, CoherenceEvaluator
from promptflow.client import load_flow

model_config = {
    "azure_endpoint": "https://your-foundry-resource.openai.azure.com/",
    "azure_deployment": "gpt-4o-mini",
    "api_version": "2024-08-01-preview",
}

def target(ticket_thread: str) -> dict:
    prompty = load_flow(source="prompts/summarize-ticket.prompty")
    response = prompty(ticket_thread=ticket_thread)
    return {"response": response}

results = evaluate(
    data="eval-datasets/ticket-summaries.jsonl",
    target=target,
    evaluators={
        "groundedness": GroundednessEvaluator(model_config=model_config),
        "coherence": CoherenceEvaluator(model_config=model_config),
    },
    evaluator_config={
        "groundedness": {"query": "${data.ticket_thread}", "response": "${target.response}"},
        "coherence": {"response": "${target.response}"},
    },
    output_path="./eval-results-candidate.json",
)
```

`load_flow` runs the `.prompty` file directly - the file under test is the exact artifact that will deploy, not a copy of its logic reimplemented in the eval script. Any drift between "what we tested" and "what we shipped" is eliminated by construction.

***

## Gating Deployment on Regression, Not Just a Fixed Threshold

The evaluation post's gate asked "is this score above 4.0?" - a fixed, absolute bar. Prompt deployments need a second, different question: "is this version at least as good as the one it's replacing?" A candidate can clear every absolute threshold and still be a real regression if the previous version was scoring meaningfully higher - the fixed bar doesn't catch a slow decline one adequate-but-worse prompt version at a time.

```python
# gate_prompt_deploy.py
import json
import sys

candidate = json.load(open("eval-results-candidate.json"))["metrics"]
baseline = json.load(open("eval-results-baseline.json"))["metrics"]  # last deployed version's results, stored alongside it

REGRESSION_TOLERANCE = 0.15  # allow small noise, not a real decline

failures = {}
for metric in ["groundedness.mean", "coherence.mean"]:
    if candidate[metric] < baseline[metric] - REGRESSION_TOLERANCE:
        failures[metric] = {"candidate": candidate[metric], "baseline": baseline[metric]}

if failures:
    print("REGRESSION DETECTED relative to currently-deployed version:")
    for metric, scores in failures.items():
        print(f"  {metric}: {scores['candidate']:.2f} vs. baseline {scores['baseline']:.2f}")
    sys.exit(1)

print("No regression relative to baseline - candidate is safe to deploy.")
sys.exit(0)
```

Storing `eval-results-baseline.json` alongside the currently-deployed prompt version (not regenerating it fresh each time) matters - the comparison needs to be against what's actually live, not against whatever the candidate happens to be evaluated alongside that day.

***

## Rolling Back a Prompt Version Like a Code Deployment

Because the prompt is a versioned file, rollback is the same operation as rolling back a code deployment - revert to the previous commit, redeploy. A simple version-pointer file makes "what's currently live" explicit rather than implicit in whatever the latest commit happens to be:

```json
// prompts/summarize-ticket/CURRENT.json
{
  "active_version": "v3",
  "deployed_at": "2026-10-24T09:00:00Z",
  "eval_results": "eval-results-baseline.json"
}
```

A regression discovered in production - not just in the CI eval set, which is necessarily incomplete - is a one-line change to `active_version` and a redeploy, not an emergency prompt rewrite under pressure. The old version is still sitting in git history, already tested, already known-good.

***

## Gradual Rollout: Prompts as Feature Flags

Treat a new prompt version the way you'd treat a risky code path - behind a flag, ramped gradually, with production metrics watched before it reaches everyone:

```python
import hashlib

def select_prompt_version(user_id: str, rollout_percentage: int) -> str:
    """Consistently route a user to the candidate or baseline prompt version."""
    bucket = int(hashlib.sha256(user_id.encode()).hexdigest(), 16) % 100
    return "v4-candidate" if bucket < rollout_percentage else "v3-baseline"
```

Hashing the user ID rather than randomizing per-request keeps a given user on the same version across their session - nobody gets a summarization tone that changes mid-conversation because the dice landed differently the second time. Ramp `rollout_percentage` from 10 to 50 to 100 over days, watching the same evaluation metrics (now measurable against live traffic, not just the eval set) at each step, and the kill switch is the same one-line `CURRENT.json` change as a rollback - drop `rollout_percentage` back to zero without waiting for a deploy pipeline to run.

***

## Closing

None of this is exotic once you see prompts for what they are: the part of an AI feature's behavior that changes most often and gets tested least. A `.prompty` file gets a prompt a diff and a review. The evaluation gate, run on every change against the same dataset, gets it a regression check most teams only run once at launch. Comparing against the currently-deployed baseline, not just a fixed score, catches the decline a series of individually-fine prompt edits would otherwise produce. And treating a new version as a gradual, reversible rollout rather than a live edit means the worst case for a bad prompt change is a one-line revert, not an incident.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
