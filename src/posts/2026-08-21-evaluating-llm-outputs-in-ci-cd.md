---
author: Steve Kaschimer
date: 2026-08-21
image: /images/posts/2026-08-21-evaluating-llm-outputs-in-ci-cd.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, electric teal, amber, and off-white accents. The central composition is a GitHub Actions workflow panel showing three sequential jobs: 'unit-tests' (green checkmark), 'llm-eval' (amber clock, then green), and 'deploy' (locked until llm-eval passes). The llm-eval job expands into three stacked metric rows: a ruler icon labeled 'Format valid: 100%' in teal, a waveform icon labeled 'Semantic similarity: 0.87' in cobalt, and a gavel icon labeled 'Coherence: 4.2 / 5' in violet - each with a threshold annotation in amber ('≥ 0.80', '≥ 4.0'). To the right, a compact JSONL dataset card shows three rows of test input/expected output pairs feeding into an Azure AI Foundry evaluator node. The mood is systematic, quality-minded, and CI-native - the feeling of evaluation as infrastructure, not an afterthought."
layout: post.njk
site_title: Tech Notes
summary: "AI features that can't be regression-tested are a deployment liability. This post covers how to evaluate LLM outputs in CI as a first-class quality gate: deterministic checks for format and latency, semantic similarity scoring for non-deterministic outputs, LLM-as-judge for subjective quality, and a GitHub Actions workflow that fails the build when evaluation scores drop below threshold using the Azure AI Foundry evaluation SDK."
tags: ["llm", "testing", "ai-agents", "azure-ai-foundry", "ci-cd"]
title: "Evaluating LLM Outputs in CI/CD: Testing Your AI Features Like Production Code"
---

The hardest part of shipping an AI feature is not the first deployment. It is the tenth. The one after you upgraded the underlying model, or tweaked the system prompt, or added a new tool to the agent. The first deployment had a human reviewing every output. The tenth has whatever process you put in place after the first one.

Most teams put nothing in place. They test the happy path manually, deploy, and treat regressions as support tickets. For traditional application code, that is a bad practice. For LLM features, it is a specific kind of bad practice — the kind where you do not find out something broke until a user tells you, because the outputs look plausible even when they are wrong.

LLM evaluation in CI is the answer, and it is more tractable than it sounds. You do not need to solve the general problem of evaluating whether an LLM is "good." You need to define what "good enough to ship" means for your specific feature, build a test dataset that exercises the cases you care about, and run it on every relevant change. That is the same thing you do for application code. The mechanics are different; the discipline is the same.

This post covers three tiers of evaluation and how to wire them into a GitHub Actions workflow using the Azure AI Foundry evaluation SDK.

***

## Three Tiers of LLM Evaluation

Different properties of LLM output require different testing approaches. Trying to use one method for all three typically means you either miss things that are measurable deterministically or you try to quantify things that cannot be quantified with a simple rule.

### Tier 1: Deterministic Tests

Some properties of LLM output are deterministic — they either hold or they do not, and you can check them with code. These are the cheapest tests to run, the fastest to fail a build, and the first ones you should add.

**Output format.** If your feature parses the model's response as JSON, validate the schema before anything else. A model that produces valid prose but invalid JSON has broken your application regardless of how coherent the prose is.

**Null and completeness checks.** Required fields present, no truncated outputs, no empty strings where a value is expected. If your feature guarantees that a summary will be between 50 and 200 words, test that.

**Latency SLA.** If your feature has a response time budget — common for anything user-facing — test that the model call completes within it. A model upgrade that improves quality while blowing the latency SLA has not improved the feature.

```python
# deterministic_checks.py
import json
import time
from typing import Any

def check_format(response: str, schema: dict) -> dict:
    """Validate response parses as JSON and matches the expected schema."""
    try:
        parsed = json.loads(response)
    except json.JSONDecodeError as e:
        return {"format_valid": 0, "error": str(e)}

    missing = [k for k in schema["required"] if k not in parsed]
    return {
        "format_valid": int(not missing),
        "missing_fields": missing,
    }

def check_latency(response_time_ms: float, sla_ms: float) -> dict:
    return {
        "latency_ok": int(response_time_ms <= sla_ms),
        "response_time_ms": response_time_ms,
        "sla_ms": sla_ms,
    }
```

These are not interesting tests. They are important tests. They catch the most disruptive class of regression — the one where the model's output stops being parseable — and they do it at zero cost.

### Tier 2: Semantic Similarity

For non-deterministic outputs, deterministic equality fails immediately. Ask the same question twice and you get two valid but differently-worded answers. A test that checks for an exact match will produce false failures on every run.

Semantic similarity measures whether two pieces of text mean the same thing rather than whether they use the same words. The Azure AI Foundry evaluation SDK includes a `SimilarityEvaluator` that scores similarity on a 1–5 scale using a model as the comparator. For test cases where you have a reference answer — a known-good output from a previous model version, or a human-written gold standard — this gives you a quantitative signal that is sensitive to meaning-level regressions.

```python
from azure.ai.evaluation import SimilarityEvaluator

model_config = {
    "azure_endpoint": "https://your-foundry-resource.openai.azure.com/",
    "azure_deployment": "gpt-4o-mini",
    "api_version": "2024-08-01-preview",
}

similarity_eval = SimilarityEvaluator(model_config=model_config)

result = similarity_eval(
    query="What is the retention policy for audit logs?",
    response="Audit logs are retained for 90 days by default, configurable up to 365 days.",
    ground_truth="By default, audit logs are kept for 90 days. You can extend retention to up to one year.",
)
# {"similarity": 4.0}
```

The score reflects semantic agreement, not surface similarity. "Kept for 90 days" and "retained for 90 days" score high. "Retained for 30 days" scores low. Set your threshold based on what a regression looks like for your feature — for factual Q&A, a similarity drop from 4.5 to 3.5 is a meaningful signal; for creative generation, the threshold would be lower.

Similarity scoring requires a reference answer, which limits it to cases where you know what correct looks like. That covers a large fraction of practical AI features — summarization with a known reference, extraction where the expected output is the original structured data, and Q&A over a fixed knowledge base.

### Tier 3: LLM-as-Judge

The third tier covers what deterministic checks and similarity scoring cannot: subjective quality properties like coherence, groundedness, and relevance. These are the properties that matter for agent responses, customer-facing summaries, and any output where "correct" is not a single string but a quality bar.

LLM-as-judge uses a separate model call to evaluate the output against a rubric. It is more expensive than the other two tiers and less precise — model judgments have variance — but it is the only practical approach to evaluating properties that require understanding.

The Azure AI Foundry evaluation SDK ships built-in evaluators for the most common quality dimensions:

```python
from azure.ai.evaluation import (
    CoherenceEvaluator,
    GroundednessEvaluator,
    RelevanceEvaluator,
)

coherence_eval = CoherenceEvaluator(model_config=model_config)
groundedness_eval = GroundednessEvaluator(model_config=model_config)
relevance_eval = RelevanceEvaluator(model_config=model_config)

# Coherence: does the response read as internally consistent and well-structured?
coherence_result = coherence_eval(
    response="The deployment failed. Also it succeeded. Try rerunning.",
)
# {"coherence": 1.0}

# Groundedness: is the response supported by the provided context?
groundedness_result = groundedness_eval(
    response="The deployment completed in 4 minutes.",
    context="Pipeline run #482 completed successfully at 14:32 UTC. Duration: 4m 12s.",
)
# {"groundedness": 5.0}
```

Scores are 1–5. What matters for CI purposes is not the absolute value but the trend — a groundedness score that was averaging 4.6 and drops to 3.1 after a prompt change is a clear regression signal, even if 3.1 is not inherently alarming.

Use LLM-as-judge evaluators sparingly in CI — they add latency and cost per run. Target them at the quality dimensions that are genuinely important for your feature and that the cheaper tiers cannot catch.

***

## Running Batch Evaluations with the Foundry SDK

The `evaluate()` function in the Azure AI Foundry SDK runs all three tiers against a dataset in a single call, producing a structured results object you can query and export.

The test dataset is a JSONL file. Each row is one test case:

```jsonl
{"query": "What is the retention policy for audit logs?", "ground_truth": "Audit logs are retained for 90 days by default, configurable up to 365 days.", "context": "Audit log retention defaults to 90 days. Maximum configurable retention is 365 days."}
{"query": "How do I trigger a manual deployment?", "ground_truth": "Navigate to Actions, select the workflow, and click Run workflow.", "context": "Manual deployments are triggered from the Actions tab using the workflow_dispatch event."}
{"query": "What regions is the service available in?", "ground_truth": "East US, West Europe, and Southeast Asia.", "context": "Available regions: East US 2, West Europe, Southeast Asia, Australia East."}
```

The evaluation run:

```python
# run_eval.py
import json
import sys
from azure.ai.evaluation import (
    evaluate,
    SimilarityEvaluator,
    CoherenceEvaluator,
    GroundednessEvaluator,
)

model_config = {
    "azure_endpoint": "https://your-foundry-resource.openai.azure.com/",
    "azure_deployment": "gpt-4o-mini",
    "api_version": "2024-08-01-preview",
}

THRESHOLDS = {
    "similarity": 3.5,
    "coherence": 3.5,
    "groundedness": 4.0,
}

def target(query: str, context: str) -> dict:
    """Call your AI feature. Replace with your actual implementation."""
    from your_feature import generate_response
    return {"response": generate_response(query=query, context=context)}

results = evaluate(
    data="test-dataset.jsonl",
    target=target,
    evaluators={
        "similarity": SimilarityEvaluator(model_config=model_config),
        "coherence": CoherenceEvaluator(model_config=model_config),
        "groundedness": GroundednessEvaluator(model_config=model_config),
    },
    evaluator_config={
        "similarity": {"query": "${data.query}", "ground_truth": "${data.ground_truth}"},
        "coherence": {"query": "${data.query}"},
        "groundedness": {"context": "${data.context}"},
    },
    output_path="./eval-results.json",
)

metrics = results["metrics"]
print(json.dumps(metrics, indent=2))

failures = {
    name: {"score": metrics[f"{name}.mean"], "threshold": threshold}
    for name, threshold in THRESHOLDS.items()
    if metrics.get(f"{name}.mean", 0) < threshold
}

if failures:
    print("\nEVALUATION FAILED - scores below threshold:")
    for name, detail in failures.items():
        print(f"  {name}: {detail['score']:.2f} < {detail['threshold']}")
    sys.exit(1)

print("\nAll evaluation scores meet thresholds.")
sys.exit(0)
```

The script exits with code 1 if any mean score is below its threshold and 0 if all pass. That exit code is what the GitHub Actions workflow checks.

***

## The GitHub Actions Gate

The workflow runs evaluation as a blocking job between the test suite and deployment. If evaluation fails, the deployment job is skipped.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest tests/unit/ -q

  llm-eval:
    name: LLM Evaluation
    runs-on: ubuntu-latest
    needs: test
    env:
      AZURE_OPENAI_ENDPOINT: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
      AZURE_OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install azure-ai-evaluation -r requirements.txt

      - name: Run evaluation
        run: python run_eval.py

      - name: Upload evaluation results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: eval-results
          path: eval-results.json

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: [test, llm-eval]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/deploy.sh
```

The `upload-artifact` step runs with `if: always()` so the results are available even when the evaluation fails — you want to be able to inspect the scores that caused the failure, not just see a red build. The `deploy` job's `needs: [test, llm-eval]` means both must pass; a failing evaluation blocks deployment automatically, with no additional conditional logic required.

For pull requests, the evaluation runs against the PR branch's version of the feature and the results appear in the check summary. A PR that degrades evaluation scores below threshold cannot be merged without either fixing the regression or explicitly updating the thresholds — which is a deliberate, reviewed decision rather than an accidental omission.

***

## What Belongs in the Test Dataset

The dataset is the specification. Its quality determines whether evaluation is meaningful.

Cover the cases that have historically caused problems — the edge inputs, the ambiguous queries, the requests the model handles poorly near the capability boundary. Cover representative happy-path cases so you detect regressions on the core functionality. Cover adversarial inputs if your feature is user-facing: inputs designed to elicit refusals, inputs that are underspecified, inputs in unexpected formats.

Start small. Ten well-chosen test cases that exercise real failure modes are worth more than a hundred examples that all test the same happy path with slight rewording. Expand the dataset when you encounter a production regression — add the failing case, fix the model or prompt, confirm the case now passes, and leave it in as a permanent regression test.

The dataset is a file in your repository. It is reviewed on pull requests just like code. If someone proposes a prompt change, the accompanying dataset update — or the justification for why no update is needed — is part of the review.

***

## Closing

LLM features ship faster than the evaluation infrastructure to test them. That gap is where deployment risk accumulates — every model update, prompt tweak, and dependency upgrade is a change with unknown quality impact until someone checks. The teams that close the gap early treat evaluation as infrastructure: a dataset in the repository, a CI job in the workflow, thresholds that reflect what the feature actually needs to do.

The mechanics are straightforward. Deterministic checks for what can be checked deterministically. Similarity scoring for outputs with a reference. LLM-as-judge for quality properties that require understanding. The Azure AI Foundry evaluation SDK handles the batch execution. The exit code gates the deployment. None of it is exotic — it is the same quality discipline applied to a different kind of component.

AI features that cannot be regression-tested are a liability. The cost of adding evaluation to CI is measured in hours. The cost of not having it is measured in incidents.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
