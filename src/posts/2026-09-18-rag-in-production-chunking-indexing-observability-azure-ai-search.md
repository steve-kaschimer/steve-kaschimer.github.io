---
author: Steve Kaschimer
date: 2026-09-18
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, electric teal, and amber accents. A source document on the left is shown being segmented into overlapping chunk blocks by a horizontal dotted cut-line, with a small semantic-similarity waveform beneath it showing where the cuts fall at natural dips rather than arbitrary intervals. The chunks feed into a search index cylinder icon. To the right, a query arrow enters the index and produces two parallel result streams - one labeled 'keyword (BM25)' and one labeled 'vector' - that merge into a single ranked list, which then passes through a second, narrower funnel labeled 'semantic re-rank' before reaching a final results panel with reranker scores. The mood is precise and pipeline-oriented - retrieval as an engineered system with visible stages, not a black box."
layout: post.njk
site_title: Tech Notes
summary: "A RAG prototype is a similarity search and a prompt template - production RAG is the accumulation of decisions made before generation ever runs: chunking strategy, index schema, hybrid search versus vector-only, and whether you re-rank. This post covers fixed-size versus sentence-boundary versus semantic chunking, building an Azure AI Search index with vector and semantic configurations, hybrid search with reciprocal rank fusion and the semantic ranker, a recall@k metric to evaluate retrieval independently of generation, and an Azure AI Foundry groundedness evaluation run scored against retrieved context."
tags: ["rag", "azure-ai-search", "azure-ai-foundry", "llm", "agentic-development"]
title: "RAG in Production: Chunking, Indexing, and Observability with Azure AI Search"
---

A RAG prototype takes an afternoon: split some documents into chunks, embed them, put them in a vector store, do a similarity search at query time, stuff the results into a prompt. It works, well enough to demo. Then it goes to production, and the same pipeline that answered demo questions correctly starts missing obvious answers, citing the wrong document, or retrieving three chunks that are all technically relevant and none of which actually contain the fact the user asked about.

The generation step - the part everyone evaluates first, because it's the part that produces visible output - is rarely the actual problem. If retrieval returns the wrong chunks, or the right chunk with the critical sentence split across a chunk boundary, no amount of prompt engineering on the generation side fixes it. The [memory and RAG post](/posts/2026-09-04-azure-ai-foundry-agents-memory-tool-calling-rag/) covered building a basic retrieval tool. This post covers the decisions that determine whether that tool actually works: how you chunk, how you index, how you search, and how you measure retrieval quality separately from generation quality - because conflating the two is how a retrieval bug spends three days being debugged as a prompt problem.

***

## Chunking Strategy: The Decision Everything Else Inherits

Chunking happens once, at indexing time, and every retrieval query for the life of the index inherits whatever mistakes were made there. Three approaches, in increasing order of how much they respect the source content's actual structure:

**Fixed-size chunking** splits every document into chunks of N tokens, period, with no awareness of sentence or paragraph boundaries. It's fast and requires no NLP tooling. It also routinely splits a sentence in half across two chunks, which means a query that should match that sentence might match neither chunk well - the sentence's meaning is distributed across a boundary that has nothing to do with meaning.

**Sentence-boundary chunking** accumulates whole sentences until adding the next one would exceed the target chunk size, then starts a new chunk. This fixes the mid-sentence split problem but still draws boundaries that can separate two sentences that are topically inseparable - a claim and its supporting evidence, split because the claim happened to land near the token limit.

**Semantic chunking** draws boundaries where the content's *meaning* actually shifts, not where a token counter runs out. Embed each sentence, compare consecutive sentences' similarity, and cut where similarity drops - that's where the topic is actually changing:

```python
import numpy as np
from azure.ai.inference import EmbeddingsClient
from azure.identity import DefaultAzureCredential

embeddings_client = EmbeddingsClient(
    endpoint="https://your-foundry-resource.services.ai.azure.com/models",
    credential=DefaultAzureCredential(),
)

def semantic_chunk(sentences: list[str], similarity_threshold: float = 0.6, max_tokens: int = 400) -> list[str]:
    """Group sentences into chunks, splitting where topical similarity drops."""
    embeddings = embeddings_client.embed(
        input=sentences, model="text-embedding-3-small"
    ).data
    vectors = [np.array(e.embedding) for e in embeddings]

    chunks, current_chunk, current_tokens = [], [sentences[0]], len(sentences[0].split())

    for i in range(1, len(sentences)):
        similarity = np.dot(vectors[i - 1], vectors[i]) / (
            np.linalg.norm(vectors[i - 1]) * np.linalg.norm(vectors[i])
        )
        sentence_tokens = len(sentences[i].split())

        if similarity < similarity_threshold or current_tokens + sentence_tokens > max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk, current_tokens = [sentences[i]], sentence_tokens
        else:
            current_chunk.append(sentences[i])
            current_tokens += sentence_tokens

    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks
```

Semantic chunking costs an embedding call per sentence at indexing time - a one-time cost, paid once per document, not per query. That trade is almost always worth it: a chunk boundary that respects the content's actual structure improves every future query against that document, for the life of the index.

**Chunk size and overlap**, regardless of strategy: 200-500 tokens is the practical range for most retrieval-then-generate pipelines. Smaller chunks lose surrounding context a retrieved sentence needs to be understood; larger chunks dilute the embedding's relevance signal - a 2,000-token chunk about five different subtopics has a mediocre similarity score against a query about any one of them. Add 10-20% overlap between adjacent chunks so information sitting near a boundary isn't only ever present in one chunk's context.

***

## Indexing: Schema, Vector Search, and Semantic Configuration

Building on the minimal schema from the memory and RAG post, here's a production index built through the SDK rather than the portal, with both vector search and semantic ranking configured:

```python
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex, SimpleField, SearchableField, SearchField, SearchFieldDataType,
    VectorSearch, HnswAlgorithmConfiguration, VectorSearchProfile,
    AzureOpenAIVectorizer, AzureOpenAIVectorizerParameters,
    SemanticConfiguration, SemanticPrioritizedFields, SemanticField, SemanticSearch,
)

index_client = SearchIndexClient(
    endpoint="https://your-search-service.search.windows.net",
    credential=DefaultAzureCredential(),
)

vector_search = VectorSearch(
    algorithms=[HnswAlgorithmConfiguration(name="hnsw-config")],
    profiles=[
        VectorSearchProfile(
            name="default-vector-profile",
            algorithm_configuration_name="hnsw-config",
            vectorizer_name="default-vectorizer",
        )
    ],
    vectorizers=[
        AzureOpenAIVectorizer(
            vectorizer_name="default-vectorizer",
            parameters=AzureOpenAIVectorizerParameters(
                resource_url="https://your-foundry-resource.openai.azure.com/",
                deployment_name="text-embedding-3-small",
                model_name="text-embedding-3-small",
            ),
        )
    ],
)

semantic_search = SemanticSearch(
    configurations=[
        SemanticConfiguration(
            name="default-semantic-config",
            prioritized_fields=SemanticPrioritizedFields(
                title_field=SemanticField(field_name="title"),
                content_fields=[SemanticField(field_name="content")],
            ),
        )
    ]
)

index = SearchIndex(
    name="product-docs",
    fields=[
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(name="title", type=SearchFieldDataType.String),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SimpleField(name="url", type=SearchFieldDataType.String, filterable=True),
        SearchField(
            name="content_vector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="default-vector-profile",
        ),
    ],
    vector_search=vector_search,
    semantic_search=semantic_search,
)

index_client.create_or_update_index(index)
```

The `AzureOpenAIVectorizer` is what enables integrated vectorization - the index generates embeddings for both indexed documents and incoming queries itself, using the deployment you specify, so application code never calls an embedding model directly. The `SemanticConfiguration` is separate from the vector configuration entirely; it's what the semantic ranker (next section) uses to know which fields are the title and which are the body when it re-scores results.

***

## Hybrid Search and the Semantic Ranker

Vector-only search misses exact matches that don't carry much semantic weight - a specific error code, a product SKU, a config key name. Keyword-only search misses paraphrases. Hybrid search runs both and merges the ranked lists with Reciprocal Rank Fusion, which rewards results that rank well in *either* list without requiring them to rank well in both:

```python
from azure.search.documents.models import VectorizableTextQuery

results = search_client.search(
    search_text=query,  # BM25 keyword search
    vector_queries=[VectorizableTextQuery(text=query, k_nearest_neighbors=20, fields="content_vector")],
    query_type="semantic",
    semantic_configuration_name="default-semantic-config",
    select=["id", "title", "content", "url"],
    top=5,
)

for r in results:
    print(r["title"], r["@search.reranker_score"])
```

`query_type="semantic"` adds a second stage after hybrid retrieval: Azure AI Search takes the top results from the RRF-merged list and re-scores them with a cross-encoder-style model that reads the query and each candidate together, rather than comparing pre-computed vectors. This catches relevance signal that similarity search misses - a chunk can have a high vector similarity to a query while not actually answering it, and the semantic ranker is meaningfully better at telling the two apart. `@search.reranker_score` (0-4 scale) reflects that second pass; sort and filter on it rather than the raw hybrid score when semantic ranking is enabled.

The cost is latency - semantic ranking adds a network round-trip and inference pass on top of hybrid retrieval. For most conversational agents, the latency is worth it; for high-throughput pipelines processing thousands of queries a second, benchmark it before assuming.

***

## Measuring Retrieval Quality Before Generation Quality

The [LLM evaluation post](/posts/2026-08-21-evaluating-llm-outputs-in-ci-cd/) covered `GroundednessEvaluator` and `RelevanceEvaluator` for scoring generated output. Running those first, on a RAG pipeline, tells you the *combined* quality of retrieval and generation - and if the score is bad, it doesn't tell you which stage broke. Measure retrieval in isolation first.

The simplest useful metric is **recall@k**: for a labeled set of test queries where you know which document should be retrieved, what fraction of the time does that document actually appear in the top K results?

```python
# retrieval_eval.py
import json

# Labeled test set: query paired with the doc_id that should be retrieved
test_cases = [
    {"query": "How do I rotate an API key?", "expected_doc_id": "docs-047"},
    {"query": "What's the rate limit on the export endpoint?", "expected_doc_id": "docs-112"},
    {"query": "Why did my webhook stop firing?", "expected_doc_id": "docs-089"},
]

def recall_at_k(test_cases: list[dict], k: int = 5) -> dict:
    hits = 0
    misses = []
    for case in test_cases:
        results = search_client.search(
            search_text=case["query"],
            vector_queries=[VectorizableTextQuery(text=case["query"], k_nearest_neighbors=k, fields="content_vector")],
            select=["id"],
            top=k,
        )
        retrieved_ids = [r["id"] for r in results]
        if case["expected_doc_id"] in retrieved_ids:
            hits += 1
        else:
            misses.append(case)

    return {
        "recall_at_k": hits / len(test_cases),
        "k": k,
        "misses": misses,
    }

result = recall_at_k(test_cases, k=5)
print(json.dumps(result, indent=2))
if result["recall_at_k"] < 0.9:
    raise SystemExit(f"Recall@5 is {result['recall_at_k']:.2f}, below 0.90 threshold")
```

This test set is worth the same investment as the evaluation dataset from the LLM evaluation post - a handful of real queries with known-correct documents, expanded whenever a production retrieval failure surfaces. If recall@k is low, the fix is in this post: chunking, index schema, hybrid weighting, semantic ranking. If recall@k is high and generation quality is still poor, the problem is downstream - prompt, model, or how retrieved context gets formatted into the prompt - and you've saved yourself from tuning the wrong stage.

***

## Grounding the Full Pipeline

Once recall@k confirms retrieval is finding the right content, run a full pipeline groundedness evaluation - same evaluators as the LLM evaluation post, but scored against what was *actually retrieved* for each query, not a fixed reference answer:

```python
from azure.ai.evaluation import evaluate, GroundednessEvaluator, RelevanceEvaluator

model_config = {
    "azure_endpoint": "https://your-foundry-resource.openai.azure.com/",
    "azure_deployment": "gpt-4o-mini",
    "api_version": "2024-08-01-preview",
}

def rag_target(query: str) -> dict:
    """Run the full pipeline: retrieve, then generate."""
    results = search_client.search(
        search_text=query,
        vector_queries=[VectorizableTextQuery(text=query, k_nearest_neighbors=5, fields="content_vector")],
        query_type="semantic",
        semantic_configuration_name="default-semantic-config",
        select=["content"],
        top=5,
    )
    context = "\n\n".join(r["content"] for r in results)
    response = generate_answer(query=query, context=context)  # your generation call
    return {"response": response, "context": context}

eval_results = evaluate(
    data="retrieval-test-queries.jsonl",
    target=rag_target,
    evaluators={
        "groundedness": GroundednessEvaluator(model_config=model_config),
        "relevance": RelevanceEvaluator(model_config=model_config),
    },
    evaluator_config={
        "groundedness": {"query": "${data.query}", "context": "${target.context}", "response": "${target.response}"},
        "relevance": {"query": "${data.query}", "response": "${target.response}"},
    },
    output_path="./rag-eval-results.json",
)
```

The key difference from the earlier evaluation post: `groundedness` is scored against `${target.context}` - the content the pipeline actually retrieved for that specific query, produced fresh by `rag_target` - not a static reference answer written in advance. A groundedness score that's high tells you the generated answer is faithful to what was retrieved. Combined with a high recall@k, that's the actual guarantee production RAG needs: the system found the right information, and it didn't make anything up on top of it.

***

## Closing

"The RAG isn't working" is rarely one problem. It's usually a chunk boundary that split the answer across two pieces of content, an index that only does vector search when the query needed an exact keyword match, or a retrieval stage nobody measured because all the evaluation effort went into scoring the generated text. Chunking, indexing, and hybrid retrieval aren't preprocessing steps you set once and forget - they're the part of the system that determines what the model even has a chance of answering correctly. Measure them separately from generation, and most "prompt problems" turn out not to be prompt problems at all.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
