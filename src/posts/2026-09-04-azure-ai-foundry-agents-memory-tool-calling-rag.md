---
author: Steve Kaschimer
date: 2026-09-04
image: /images/posts/2026-09-04-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, electric teal, and violet accents. Three labeled panels arranged left to right: 'Conversation Memory' showing a thread icon with a stack of chat bubbles, 'Semantic Memory' showing a document corpus icon feeding into a vector-search magnifying glass with small citation tags ('doc_412', 'doc_98') attached to retrieved results, and 'Episodic Memory' showing a small user-profile icon connected to a structured record card listing key-value facts. Below the three panels, a thin connecting line shows all three feeding into a single central agent node. The mood is systematic and architectural - three distinct memory subsystems, clearly delineated, feeding one coherent agent."
layout: post.njk
site_title: Tech Notes
summary: "Memory is what separates a useful agent from a stateless chatbot, but 'give the agent memory' is not one problem - it's three. This post covers the Azure AI Foundry primitives for conversation memory (thread state), semantic memory (vector search grounded with real citations, not the model's imagination), and episodic memory (structured facts about a specific user that persist across threads), including a custom retrieval tool that returns citation metadata instead of raw text and a remember_fact tool the agent can call to persist what it learns about a user."
tags: ["azure-ai-foundry", "ai-agents", "rag", "azure-ai-search", "agentic-development"]
title: "Azure AI Foundry Agents: Memory, Tool Calling, and Retrieval-Augmented Generation"
---

Ask an agent the same question in two different threads and it answers as if meeting you for the first time both times. That is not a bug in Azure AI Foundry's thread model. It is exactly what threads are for - isolated, stateless-by-default conversation containers. The bug, if there is one, is in treating "the agent has a thread" as equivalent to "the agent has memory."

Those are different claims. A thread remembers what was said in *this* conversation. It says nothing about facts that are true regardless of who's asking - your product's refund policy, the contents of your documentation, last quarter's incident postmortems. And it says nothing about facts that are true about *this specific user* across every conversation they'll ever have with the agent - their subscription tier, the fact they already tried the obvious fix, their stated preference for terse answers. Three different problems. Three different Foundry primitives. Conflating them is why teams ship an agent with "memory" that still asks a returning customer to explain their issue from scratch.

This post covers all three: conversation memory (what threads already give you, and where that runs out), semantic memory (grounding responses in a real document corpus with actual citations, not the model's best guess at a source), and episodic memory (structured facts about a user that persist across every thread they start). The semantic memory section builds a custom retrieval tool rather than relying solely on the built-in search tool, because a custom tool is what gives you control over citations - and citations you can verify are the difference between RAG and an expensive way to make hallucination sound confident.

If you haven't set up a Foundry project yet, start with the [first-look post](/posts/2026-06-19-azure-ai-foundry-first-look-agentic-ai-workflows/). This post assumes that setup and Python 3.11+.

***

## Three Kinds of Memory

**Conversation memory** lives in a thread. Every message sent and received in that thread is available to the model on the next turn, automatically, with no extra code. It ends where the thread ends. Start a new thread and it's gone.

**Semantic memory** is factual knowledge that's true independent of who's asking or which conversation they're in - your documentation, your policies, your knowledge base. It's not tied to a thread or a user. You retrieve it by *meaning*: a query about "how do I get a refund" should surface your refund policy even if the policy document never uses the word "refund" in that exact phrasing.

**Episodic memory** is facts about a specific user or session that should be available in *every* thread that user starts, not just the one they said it in. "This customer is on the Enterprise plan." "This user already tried restarting the service." You retrieve it by identity - lookup by user ID, not similarity search.

The failure mode this post is aimed at: teams build conversation memory (trivial, Foundry gives it to you), skip semantic memory (the agent doesn't actually know anything beyond training data and hallucinates policy details), and skip episodic memory (every conversation starts from zero, no matter how many times this user has talked to the agent before). The agent *looks* stateful because the thread works. It isn't, in any sense that matters to the user repeating themselves for the fifth time.

***

## Conversation Memory: What You Already Have

This part requires no new code beyond what the [multi-agent patterns post](/posts/2026-07-24-multi-agent-patterns-azure-ai-foundry-orchestration-handoff-shared-state/) already covered - create a thread, post messages to it, run the agent against it. The thread's message history is the conversation memory.

The one thing worth adding here: threads grow, and unbounded growth has a cost. Every message in a thread's history gets sent to the model on every run, which means token cost and latency both climb linearly with conversation length. For a thread that's going to run long - a multi-hour support session, an extended research task - periodically summarize:

```python
from azure.ai.agents.models import MessageRole

async def summarize_and_trim_thread(agents_client, thread_id: str, keep_last: int = 6) -> None:
    """Replace older messages in a long thread with a compact summary."""
    messages = await agents_client.list_messages(thread_id=thread_id)
    all_messages = list(reversed(messages.data))  # oldest first

    if len(all_messages) <= keep_last:
        return  # nothing to trim yet

    older = all_messages[:-keep_last]
    transcript = "\n".join(
        f"{m.role}: {m.content[0].text.value}" for m in older if m.content
    )

    summarizer = await agents_client.create_agent(
        model="gpt-4o-mini",
        name="thread-summarizer",
        instructions="Summarize this conversation transcript in 3-5 factual sentences. Preserve names, decisions, and any commitments made.",
    )
    try:
        summary_thread = await agents_client.create_thread()
        await agents_client.create_message(
            thread_id=summary_thread.id, role=MessageRole.USER, content=transcript
        )
        await agents_client.create_and_process_run(
            thread_id=summary_thread.id, agent_id=summarizer.id
        )
        summary = await _get_last_message(agents_client, summary_thread.id)
    finally:
        await agents_client.delete_agent(summarizer.id)

    # New thread: summary as context, plus the messages we kept verbatim
    new_thread = await agents_client.create_thread()
    await agents_client.create_message(
        thread_id=new_thread.id,
        role=MessageRole.USER,
        content=f"[Earlier conversation summary]\n{summary}",
    )
    for m in all_messages[-keep_last:]:
        await agents_client.create_message(
            thread_id=new_thread.id, role=m.role, content=m.content[0].text.value
        )
    return new_thread.id
```

This is a judgment call, not a fixed rule - trim when a thread's token count is materially affecting latency or cost, not on a fixed message count. For most conversational agents, this never fires. For long-running research or support threads, it's the difference between stable performance and a thread that gets slower and more expensive with every turn.

***

## Semantic Memory: Grounding, Not Guessing

The multi-agent post showed the built-in `AzureAISearchTool` - point it at an index, attach it to an agent, done. That's the right choice when you want retrieval fast and don't need fine control over what comes back. It has a real limitation for production use: you don't control what gets extracted from the results, which makes it hard to guarantee the citations in the agent's response actually correspond to documents that were retrieved.

A custom `FunctionTool` gives you that control, at the cost of writing the retrieval code yourself.

**The index.** Assume an Azure AI Search index named `product-docs` with integrated vectorization configured (the index handles embedding generation itself - no separate embedding API call needed in application code):

```python
# Minimal index schema (created once via the Azure AI Search SDK or portal)
{
    "name": "product-docs",
    "fields": [
        {"name": "id", "type": "Edm.String", "key": True},
        {"name": "title", "type": "Edm.String", "searchable": True},
        {"name": "content", "type": "Edm.String", "searchable": True},
        {"name": "url", "type": "Edm.String", "filterable": True},
        {
            "name": "content_vector",
            "type": "Collection(Edm.Single)",
            "searchable": True,
            "vectorSearchDimensions": 1536,
            "vectorSearchProfile": "default-vector-profile",
        },
    ],
}
```

**The retrieval function.** This is the part the built-in tool hides from you - and the part that matters for grounding. It returns structured results with the fields needed to cite a source, not a blob of concatenated text:

```python
import os
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizableTextQuery
from azure.identity import DefaultAzureCredential

search_client = SearchClient(
    endpoint=os.environ["AZURE_SEARCH_ENDPOINT"],
    index_name="product-docs",
    credential=DefaultAzureCredential(),
)

def search_product_docs(query: str, top: int = 5) -> list[dict]:
    """Retrieve the most relevant product documentation chunks for a query."""
    vector_query = VectorizableTextQuery(
        text=query, k_nearest_neighbors=top, fields="content_vector"
    )
    results = search_client.search(
        search_text=query,  # hybrid: keyword + vector
        vector_queries=[vector_query],
        select=["id", "title", "content", "url"],
        top=top,
    )
    return [
        {
            "doc_id": r["id"],
            "title": r["title"],
            "content": r["content"],
            "url": r["url"],
            "score": r["@search.score"],
        }
        for r in results
    ]
```

**The tool definition and instructions.** This is where hallucinated citations get prevented - not by asking the model nicely, but by giving it structured data it can't easily fabricate a plausible-looking substitute for, and telling it explicitly what "no answer" looks like:

```python
from azure.ai.agents.models import FunctionTool

retrieval_tool = FunctionTool(
    name="search_product_docs",
    description=(
        "Search the product documentation for content relevant to a query. "
        "Returns the top matching chunks with title, content, and source URL. "
        "Always call this before answering any question about product features, "
        "configuration, or behavior - never answer from general knowledge."
    ),
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "The search query."},
        },
        "required": ["query"],
    },
)

rag_agent = await agents_client.create_agent(
    model="gpt-4o",
    name="docs-assistant",
    instructions=(
        "You answer questions about the product using only the search_product_docs tool. "
        "Rules:\n"
        "1. Always call search_product_docs before answering a factual question.\n"
        "2. Only cite documents that appear in the tool's results. Never reference a "
        "source, URL, or fact that wasn't in the retrieved content.\n"
        "3. If the retrieved results don't contain an answer, say so explicitly - do "
        "not fill the gap with general knowledge.\n"
        "4. End every answer with a 'Sources:' section listing the title and URL of "
        "every document you actually used."
    ),
    tools=[retrieval_tool],
)
```

The tool-call dispatch loop is the same `requires_action` pattern from the multi-agent post - when the run pauses on `requires_action`, call `search_product_docs`, hand the structured result list back as the tool output, and let the model continue. The load-bearing part isn't the dispatch loop; it's that the model only ever sees documents with `doc_id`/`title`/`url` attached, and the instructions make citing anything else an explicit rule violation rather than an easy default. A model asked to "answer this and cite your sources" with no retrieved context will produce plausible-looking citations from its training data. A model told "you may only cite what's in this list" and handed an empty list when nothing matches has a much narrower path to fabrication.

***

## Episodic Memory: Facts About This User

Semantic memory answers "what's true about the product." Episodic memory answers "what's true about this person." Different retrieval key - by user ID, not by similarity - and a different storage shape: structured facts, not searchable documents.

Azure Cosmos DB works well here: cheap to query by key, flexible schema for facts that don't fit a fixed table, and fast enough for a lookup at the start of every thread.

**Recall happens in application code, before the thread starts** - it's not something the agent decides to do, because you always want it available, not conditionally retrieved based on the model's judgment:

```python
import os
from azure.cosmos import CosmosClient

cosmos_client = CosmosClient(
    url=os.environ["COSMOS_ENDPOINT"], credential=DefaultAzureCredential()
)
memory_container = cosmos_client.get_database_client("agent-memory").get_container_client("user-facts")

def recall_user_facts(user_id: str) -> list[str]:
    """Fetch everything the agent has previously learned about this user."""
    try:
        record = memory_container.read_item(item=user_id, partition_key=user_id)
        return record.get("facts", [])
    except Exception:
        return []  # no memory yet for this user - not an error

async def start_user_thread(agents_client, user_id: str, agent_id: str):
    facts = recall_user_facts(user_id)
    thread = await agents_client.create_thread()
    if facts:
        context = "\n".join(f"- {f}" for f in facts)
        await agents_client.create_message(
            thread_id=thread.id,
            role=MessageRole.USER,
            content=f"[Known context about this user, from previous conversations]\n{context}",
        )
    return thread
```

**Remembering is a tool the agent calls explicitly**, because deciding *what's worth remembering* is a judgment call the model is better positioned to make than a fixed rule in application code:

```python
def remember_fact(user_id: str, fact: str) -> str:
    """Persist a new fact about the user for future conversations."""
    try:
        record = memory_container.read_item(item=user_id, partition_key=user_id)
    except Exception:
        record = {"id": user_id, "facts": []}

    if fact not in record["facts"]:
        record["facts"].append(fact)
        memory_container.upsert_item(record)
    return "Remembered."

remember_tool = FunctionTool(
    name="remember_fact",
    description=(
        "Persist a fact about the current user that should be available in future "
        "conversations - preferences, plan tier, prior issues, stated context. Do not "
        "use this for facts specific to only the current conversation."
    ),
    parameters={
        "type": "object",
        "properties": {
            "fact": {
                "type": "string",
                "description": "A single, self-contained factual statement about the user.",
            },
        },
        "required": ["fact"],
    },
)
```

The `"Do not use this for facts specific to only the current conversation"` line in the description matters more than it looks - without it, agents tend to over-remember, persisting one-off details ("user is asking about order #4471") that pollute every future conversation's context with noise. Instruct for durability, not just relevance.

***

## Choosing the Right Memory

| Memory type | Retrieved by | Scope | Foundry primitive |
|---|---|---|---|
| Conversation | Sequential, automatic | This thread only | Thread message history |
| Semantic | Similarity search | Global, true for anyone | `AzureAISearchTool` or a custom retrieval `FunctionTool` |
| Episodic | User/session ID lookup | This user, every thread | External store (Cosmos DB) + `remember_fact`/recall-at-startup |

They compose. A support agent typically needs all three: the thread carries the current exchange, semantic memory answers "what does the documentation say," episodic memory answers "what do we already know about this customer." Building only the first one is the most common reason an agent that technically has a thread still feels like it's meeting the user for the first time, every time.

***

## Closing

"Give the agent memory" sounds like one feature request. It's three, and they don't substitute for each other. A thread with a long history isn't semantic memory - the agent still doesn't know your documentation unless you retrieve it. A great retrieval tool isn't episodic memory - it'll cite your refund policy accurately and still ask a returning customer what plan they're on. Building all three, and being deliberate about which one a given fact belongs in, is what makes an agent feel like it's actually paying attention across time rather than performing a very convincing impression of it once per thread.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
