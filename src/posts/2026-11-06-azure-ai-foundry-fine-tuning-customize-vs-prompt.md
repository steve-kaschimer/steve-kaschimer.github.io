---
author: Steve Kaschimer
date: 2026-11-06
image: /images/posts/2026-11-06-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, amber, and teal accents. A decision-tree diagram: a diamond node labeled 'Model gets format wrong?' branches left to a box labeled 'Prompt Engineering' and right down through two more diamonds - 'Missing domain knowledge?' branching to a box labeled 'RAG', and 'Inconsistent despite good examples?' branching to a box labeled 'Fine-Tune'. The fine-tune box connects down to a small training-data icon (stacked document pages) feeding into a gauge/dial labeled 'Base vs. Fine-Tuned' with two comparison bars, then to a final node showing a traffic-split icon '50/50' between two model boxes. The mood is analytical and decision-focused - a flowchart for avoiding an expensive default, not a fine-tuning tutorial."
layout: post.njk
site_title: Tech Notes
summary: "Fine-tuning gets reached for as a default upgrade path when prompting starts to feel unreliable, but it's the most expensive, least flexible option of the three - and often the wrong one. This post lays out a concrete decision framework for choosing between better prompting, RAG, and fine-tuning based on what's actually failing, then walks through preparing a training dataset, running a supervised fine-tune job in Azure AI Foundry, evaluating the result against the base model, and deploying both behind an A/B traffic split instead of a one-way door."
tags: ["azure-ai-foundry", "fine-tuning", "llm", "agentic-development", "azure"]
title: "Azure AI Foundry Fine-Tuning: When to Customize a Model vs. When to Prompt Better"
---

Fine-tuning has a gravitational pull that's out of proportion to how often it's the right call. It sounds like the "serious" option - training your own model, not just writing a better prompt - so it gets reached for whenever prompting starts to feel unreliable, before anyone's actually diagnosed *why* it's unreliable. That diagnosis matters because fine-tuning is the most expensive and least flexible of the three real options, and two of the three failure modes it gets blamed for aren't fixed by it at all.

***

## The Decision Framework: What's Actually Failing

Three distinct problems get lumped together as "the model isn't working well enough," and each has a different fix:

**The model doesn't know the domain-specific facts.** It's confidently wrong about your product's pricing tiers, your internal terminology, or last week's incident postmortem - because that information was never in its training data and isn't in the prompt either. This is a retrieval problem. [The RAG-in-production post](/posts/2026-09-18-rag-in-production-chunking-indexing-observability-azure-ai-search/) is the fix: ground the model in the actual source documents at query time. Fine-tuning doesn't teach a model new facts reliably - it teaches it patterns, and a fact baked into fine-tuning weights is exactly as stale six months from now as a fact baked into a prompt.

**The model has the knowledge but gets the format, tone, or structure inconsistent.** Given the right context, it produces a correct answer sometimes formatted as prose, sometimes as a bulleted list, sometimes with the wrong level of formality - and few-shot examples in the prompt narrow this down but don't fully close it. [The prompt engineering post](/posts/2026-08-07-prompt-engineering-for-developers/) covers the first line of defense here, and it resolves most cases. When it doesn't - when you've iterated on the prompt and few-shot examples and the format is still inconsistent across a large enough sample to matter - that residual inconsistency is what fine-tuning is actually good at collapsing.

**The model needs to reliably do something narrow, high-volume, and repetitive**, where the cost of a large prompt with extensive few-shot examples on every single call adds up - both in latency and in token cost at scale. Fine-tuning bakes the pattern into the weights once, so production calls run with a short prompt instead of a long one carrying five or six examples every time.

The framework, as a single test before starting any fine-tuning work: **have you actually tried better prompting and RAG first, and does the failure survive both?** If the answer is no, you haven't earned the cost of fine-tuning yet - you've just found a prompt that needs another iteration or a retrieval gap that needs closing.

***

## Preparing a Training Dataset

Azure AI Foundry's supervised fine-tuning expects the same chat-completion message format your application already sends the model, as JSONL - one training example per line:

```jsonl
{"messages": [{"role": "system", "content": "You triage support tickets into a priority and category."}, {"role": "user", "content": "Customer says checkout is throwing a 500 error on the payment step, happening to multiple users since this morning."}, {"role": "assistant", "content": "{\"priority\": \"P1\", \"category\": \"payments\", \"reasoning\": \"Multi-user impact on a revenue-critical path, recent onset suggests a regression.\"}"}]}
{"messages": [{"role": "system", "content": "You triage support tickets into a priority and category."}, {"role": "user", "content": "User asking how to change their display name in account settings."}, {"role": "assistant", "content": "{\"priority\": \"P4\", \"category\": \"account-settings\", \"reasoning\": \"Self-service question, no functional impact, documentation would resolve it.\"}"}]}
```

The quality bar that actually matters here: every example should be one you'd be comfortable citing as "the correct answer" if a teammate asked why the model behaved a certain way - inconsistent or borderline-correct examples in the training set don't average out into a better model, they teach it the same inconsistency the fine-tune is supposed to remove. A few hundred carefully reviewed examples that agree with each other beats a few thousand scraped from unreviewed production logs.

***

## Running the Fine-Tune Job

```python
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project_client = AIProjectClient(
    endpoint="https://your-foundry-resource.services.ai.azure.com/api/projects/your-project",
    credential=DefaultAzureCredential(),
)

fine_tune_job = project_client.fine_tuning.jobs.create(
    training_file="ticket-triage-train.jsonl",
    validation_file="ticket-triage-validation.jsonl",
    model="gpt-4o-mini-2024-07-18",
    hyperparameters={
        "n_epochs": 3,
    },
    suffix="ticket-triage-v1",
)

print(f"Job ID: {fine_tune_job.id}, status: {fine_tune_job.status}")
```

The validation file matters more than it looks like it should: it's what catches overfitting - a model that's memorized the training examples rather than generalized the pattern - before you find out in production. `n_epochs` is the main lever for that tradeoff; too few and the model hasn't learned the pattern, too many and it starts reproducing training examples' quirks rather than the underlying rule they were meant to teach.

***

## Evaluating the Fine-Tuned Model Against the Base

The same discipline [the LLM evaluation post](/posts/2026-08-21-evaluating-llm-outputs-in-ci-cd/) established - score against a held-out test set, not a vibe check - applies directly here, with one addition: run the base model and the fine-tuned model against the identical test set and compare, since "the fine-tuned model scores 0.89" means nothing without knowing what the base model scored on the same questions.

```python
from azure.ai.evaluation import evaluate

def target_base(ticket_text: str) -> dict:
    response = base_model_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": TRIAGE_SYSTEM_PROMPT}, {"role": "user", "content": ticket_text}],
    )
    return {"response": response.choices[0].message.content}

def target_fine_tuned(ticket_text: str) -> dict:
    response = base_model_client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18.ft-ticket-triage-v1",
        messages=[{"role": "system", "content": "You triage support tickets into a priority and category."}, {"role": "user", "content": ticket_text}],
    )
    return {"response": response.choices[0].message.content}

for name, target in [("base", target_base), ("fine-tuned", target_fine_tuned)]:
    results = evaluate(
        data="ticket-triage-eval-set.jsonl",
        target=target,
        evaluators={"correctness": TriageCorrectnessEvaluator()},
        output_path=f"eval-results-{name}.json",
    )
    print(f"{name}: {results.metrics}")
```

If the fine-tuned model doesn't clear the base model by a margin that justifies the added deployment complexity and per-model hosting cost, the honest conclusion is that the underlying problem was solvable with a better prompt, and fine-tuning added cost without adding accuracy - a real, not-uncommon outcome, not a failed experiment.

***

## Deploying Behind an A/B Traffic Split

Given a fine-tuned model does test out ahead of the base, deploy it as an addition, not a swap - the same gradual-rollout discipline [the LLMOps prompt-versioning post](/posts/2026-10-30-llmops-versioning-testing-deploying-prompts/) applied to prompt versions applies to model versions:

```python
import hashlib

def select_model(request_id: str, fine_tuned_percentage: int) -> str:
    bucket = int(hashlib.sha256(request_id.encode()).hexdigest(), 16) % 100
    return "gpt-4o-mini-2024-07-18.ft-ticket-triage-v1" if bucket < fine_tuned_percentage else "gpt-4o-mini"
```

Running both models side by side against live traffic - not just the held-out eval set - surfaces the gap between "scores well on curated examples" and "holds up on the actual messy distribution of real tickets," and a fine-tuned model that regresses in production is a config change back to 0%, not a redeploy.

***

## Closing

The decision framework is worth internalizing precisely because fine-tuning's appeal is emotional as much as technical - it feels like the sophisticated option, so it gets tried first instead of last. It should be tried last: after a genuinely iterated prompt, after a retrieval gap has been ruled out, for the specific residual problem those two don't fix - narrow, high-volume, format-consistency work where the cost of a large per-call prompt is real and a smaller, more consistent model earns back that cost. Reached for in that order, fine-tuning is a precise tool. Reached for first, it's an expensive way to discover the problem was somewhere else.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
