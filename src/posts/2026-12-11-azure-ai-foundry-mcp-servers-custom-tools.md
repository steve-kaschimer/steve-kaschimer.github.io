---
author: Steve Kaschimer
date: 2026-12-11
image: /images/posts/2026-12-11-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, electric teal, and amber accents. In the center, a hexagonal node labeled 'MCP Server' with two small tool icons plugged into it: a GitHub-mark icon labeled 'github_search' and a database icon labeled 'kb_query'. A dashed connection line runs from the MCP Server node to an agent-brain icon on the right labeled 'Foundry Agent', with a small padlock icon on the connection line labeled 'auth token'. Below, a container icon labeled 'Azure Container App' encloses the MCP Server node, with a small scale-icon suggesting it runs alongside the agent. The mood is modular and interoperable - a standard plug-in interface for agent tools, not a bespoke integration per capability."
layout: post.njk
site_title: Tech Notes
summary: "Giving an agent a new capability usually means writing a bespoke FunctionTool and redeploying the agent runtime - the Model Context Protocol (MCP) offers a standard interface instead, letting agents call external tools over a well-defined schema without the tool's implementation living inside the agent's own code. This post builds an MCP server exposing two tools (a GitHub API wrapper and an internal knowledge-base query), registers it with an Azure AI Foundry agent, and covers the MCP schema, authentication between agent and server, and deploying the server as an Azure Container App alongside the agent."
tags: ["azure-ai-foundry", "mcp", "ai-agents", "agentic-development", "azure"]
title: "Azure AI Foundry MCP Servers: Building and Registering Custom Tools for Your Agents"
---

Every agent post on this blog so far has reached for `FunctionTool` - a Python function, decorated and registered directly with the agent, living in the same codebase and deployed as part of the same runtime. That pattern works well for capabilities specific to one agent. It breaks down the moment two different agents - or two different teams - need the same capability: a GitHub API wrapper, an internal knowledge-base query, gets copy-pasted and reimplemented per agent, drifting slightly each time someone tweaks one copy and not the others.

The Model Context Protocol (MCP) is Anthropic's open standard for exactly this seam: a tool is implemented once, as its own server, exposing a standard schema over a standard transport - and any MCP-compatible agent runtime, Azure AI Foundry included, can register it and call it without the tool's implementation living inside the agent's own code at all.

***

## Why a Standard Protocol Instead of More `FunctionTool`s

The tradeoff is genuinely a tradeoff, not a strict upgrade - a `FunctionTool` is simpler to reach for when a capability is truly one agent's alone, since it skips the extra deployment surface an MCP server introduces. MCP earns its complexity when a tool is meant to be shared: the GitHub API wrapper this post builds is useful to any agent that needs repository data, not just one specific agent's use case, and implementing it as an MCP server means every agent that needs it registers the same tested, versioned server rather than each maintaining its own copy.

***

## The MCP Schema

An MCP server exposes tools as JSON-RPC methods with a declared schema - the same shape as `FunctionTool`'s parameter schema, but served over a protocol any compliant client can discover and call, not defined inline in agent code:

```python
# mcp_server.py
from mcp.server import Server
from mcp.types import Tool, TextContent
import httpx

server = Server("internal-tools")

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="github_search",
            description="Search code, issues, or PRs across the org's GitHub repositories.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "search_type": {"type": "string", "enum": ["code", "issues", "pull_requests"]},
                },
                "required": ["query", "search_type"],
            },
        ),
        Tool(
            name="kb_query",
            description="Query the internal knowledge base for documentation relevant to a question.",
            inputSchema={
                "type": "object",
                "properties": {"question": {"type": "string"}},
                "required": ["question"],
            },
        ),
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "github_search":
        results = await search_github(arguments["query"], arguments["search_type"])
        return [TextContent(type="text", text=results)]
    if name == "kb_query":
        results = await query_knowledge_base(arguments["question"])
        return [TextContent(type="text", text=results)]
    raise ValueError(f"Unknown tool: {name}")
```

`list_tools` is what makes this discoverable rather than hardcoded - any client that connects to the server can enumerate what it offers without prior knowledge of its capabilities, the same way a REST API's OpenAPI spec lets a client discover endpoints it wasn't written against in advance.

***

## Registering the MCP Server with a Foundry Agent

```python
from azure.ai.agents.models import McpTool

mcp_tool = McpTool(
    server_label="internal-tools",
    server_url="https://internal-tools-mcp.your-org.azurecontainerapps.io/mcp",
    allowed_tools=["github_search", "kb_query"],
)

agent = await agents_client.create_agent(
    model="gpt-4o",
    name="platform-support-agent",
    instructions=(
        "You help engineers find information across GitHub and internal documentation. "
        "Use github_search for questions about code, issues, or PRs. Use kb_query for "
        "questions about internal processes or documentation. Always cite which tool "
        "produced an answer."
    ),
    tools=[mcp_tool],
)
```

`allowed_tools` is worth being deliberate about even when the server exposes more than two tools eventually - an agent should register only the specific tools its task requires, not every capability the server happens to offer, for the same least-privilege reason [the permissions-block post](/posts/2026-03-25-github-actions-permissions-block/) applied to workflow tokens. A support agent that only ever needs read access to GitHub search and the knowledge base shouldn't be handed a hypothetical future `github_write` tool just because it lives on the same server.

***

## Authentication Between Agent and Server

The MCP server is a separate deployable with its own network exposure, which means the agent-to-server call needs its own auth layer, distinct from whatever credentials the server itself uses to reach GitHub or the knowledge base:

```python
mcp_tool = McpTool(
    server_label="internal-tools",
    server_url="https://internal-tools-mcp.your-org.azurecontainerapps.io/mcp",
    allowed_tools=["github_search", "kb_query"],
    headers={"Authorization": f"Bearer {mcp_server_access_token}"},
)
```

On the server side, validate that token before executing any tool call - an MCP server reachable without authentication is a network-exposed capability to search your org's GitHub repos and internal docs, available to anyone who finds the URL, not just the agents meant to use it:

```python
from mcp.server import Server
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.middleware("http")
async def verify_token(request: Request, call_next):
    token = request.headers.get("Authorization", "").removeprefix("Bearer ")
    if not await is_valid_agent_token(token):
        raise HTTPException(status_code=401, detail="Invalid or missing agent token")
    return await call_next(request)
```

***

## Deploying the MCP Server as an Azure Container App

```bash
az containerapp create \
  --name internal-tools-mcp \
  --resource-group rg-ai-platform \
  --environment ai-agents-env \
  --image ghcr.io/your-org/internal-tools-mcp:latest \
  --target-port 8080 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 5 \
  --secrets "github-token=keyvaultref:https://your-vault.vault.azure.net/secrets/github-pat,identityref:system" \
  --env-vars "GITHUB_TOKEN=secretref:github-token"
```

`--ingress internal` matters here - the MCP server only needs to be reachable from other resources inside the same Container Apps environment (the Foundry agent's runtime), not from the public internet. Scoping ingress this way removes an entire class of "found the URL, no auth required" exposure before the token-validation middleware above is even relevant, the same defense-in-depth instinct as network egress controls on a self-hosted runner.

***

## Closing

MCP's value isn't that it makes any single tool call work differently than a `FunctionTool` would - from the agent's perspective, calling `github_search` looks similar either way. It's that the tool now exists as its own versioned, independently deployable, independently authenticated service that any compliant agent can register, instead of logic copy-pasted into every agent that needs it. For a genuinely single-agent capability, a `FunctionTool` is still the simpler, correct choice. For a capability more than one agent or team needs - which is most of the useful ones, over enough time - an MCP server is the version that doesn't drift into three subtly different implementations six months later.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
