---
author: Steve Kaschimer
date: 2027-03-30
image: /images/posts/2027-03-30-hero.webp
image_alt: "Five columns of abstract API-style glyphs positioned along a horizontal axis running from request-response simplicity on the left to real-time push on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: a minimal single-arrow request-response glyph, a layered rectangle stack representing structured routing, a solid amber lightning-bolt glyph inside a narrow channel implying binary speed, a flexible bracket shape with several thin branches fanning out to represent selectable fields, and a pulsing broadcast-wave glyph radiating from a small central dot. Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'request-response' on the left to 'real-time push' on the right, with a small glowing teal dot positioned at a different point under each column. Mood is comparative, engineering-first, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, robot faces, or generic gear clip art used as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Minimal APIs, Controllers, gRPC, GraphQL, and SignalR all answer a different question about how a client should talk to your backend. A practical breakdown of what each optimizes for and when the default isn't the right call."
tags: ["dotnet", "api-design", "architecture", "performance", "developer-productivity"]
title: "The Top 5 .NET API Styles Compared: Which One Should You Choose?"
---

Every .NET API decision eventually collapses into the same question: what does the client actually need from this endpoint - a simple request-response, structured conventions at scale, raw speed between services, exactly the fields it asks for, or a live push the moment something changes? That's the axis these five styles sit on. Minimal APIs and Controllers both answer "request-response," just with different amounts of built-in structure. gRPC trades flexibility for speed between services that don't need a browser. GraphQL lets the client shape the response instead of the server dictating it. SignalR isn't really a REST alternative at all - it's for real-time push, a different problem entirely.

This guide compares the five API styles .NET developers reach for most often, what each one actually optimizes for, and which project profile fits best. None of these are mutually exclusive within a single application - a typical production system might expose Minimal API or Controller endpoints for its public REST surface, gRPC between internal services, and SignalR for one specific real-time feature, all in the same solution. This series continues with dedicated getting-started walkthroughs for each style.

## Quick Comparison

| | Minimal APIs | Controllers (MVC) | gRPC | GraphQL (Hot Chocolate) | SignalR |
| --- | --- | --- | --- | --- | --- |
| **Category** | Lightweight REST | Conventions-based REST | RPC over HTTP/2 | Query language over HTTP | Real-time push |
| **Transport** | HTTP/1.1 or HTTP/2, JSON | HTTP/1.1 or HTTP/2, JSON | HTTP/2, Protobuf | HTTP/1.1 or HTTP/2, JSON | WebSockets (with fallbacks) |
| **Client flexibility** | Server dictates response shape | Server dictates response shape | Server dictates message shape | Client selects exactly the fields it wants | N/A - push-based, not request-driven |
| **Performance** | Good, low ceremony | Good, more middleware overhead than Minimal APIs | Fastest - binary serialization, HTTP/2 multiplexing | Good, but resolver-per-field cost adds up without care | Efficient for its purpose; needs a backplane past one instance |
| **Browser support** | Full | Full | None without gRPC-Web + a proxy | Full | Full |
| **Best for** | New REST APIs, especially smaller or greenfield services | Large REST APIs benefiting from established conventions | Internal service-to-service calls, latency-sensitive paths | Client-driven data needs, avoiding over/under-fetching | Live updates, notifications, chat, dashboards |

## Minimal APIs

Minimal APIs are Microsoft's current recommended default for new ASP.NET Core REST APIs - a lightweight, low-ceremony way to define HTTP endpoints without the conventions and infrastructure a full MVC controller pipeline brings along.

**Strengths:**

- Low ceremony - a working endpoint is a few lines, with no controller class, action method, or attribute routing boilerplate required
- Route groups and per-feature extension methods (`MapOrderEndpoints`) keep a growing API organized without falling back to MVC's conventions
- First-class OpenAPI support via `Microsoft.AspNetCore.OpenApi`, and validation wires in cleanly through custom endpoint filters
- Fast to start with, and the template Microsoft ships by default for new Web API projects

**Weaknesses:**

- Less built-in structure than Controllers - model binding, validation, and filtering conventions are things you assemble yourself rather than inherit for free
- Fewer years of established community patterns to lean on compared to MVC's long history, though this gap is closing fast
- A very large API with many endpoints can end up needing the same kind of organizational discipline Controllers give you by default, just self-imposed instead of framework-enforced

**Choose this when:** you're starting a new REST API and don't have a large existing MVC codebase or team convention pulling you toward Controllers - it's the more modern default in 2026, not just the newer option.

## Controllers (MVC)

Controllers are the original ASP.NET Core web API pattern, and remain the right choice for large APIs that benefit from `[ApiController]`'s built-in conventions - automatic model validation, binding source inference, and consistent problem-details error responses - without having to reconstruct them by hand.

**Strengths:**

- `[ApiController]` gives you automatic model validation, binding source inference, and standardized error responses out of the box
- Filters (`IActionFilter` and friends) provide a mature, well-understood cross-cutting concerns mechanism distinct from middleware
- Deep, long-established community knowledge and tooling, since this has been the default ASP.NET Core API pattern since the framework's earliest versions
- Conventions scale well to large teams and large APIs, where consistent structure across many endpoints matters more than minimizing per-endpoint ceremony

**Weaknesses:**

- More ceremony per endpoint than Minimal APIs - a controller class and action method for what might be a five-line Minimal API handler
- New ASP.NET Core project templates default to Minimal APIs now, so scaffolding Controllers requires an explicit flag (`dotnet new webapi --use-controllers`) rather than being the default path
- The conventions that pay off at scale can feel like unnecessary structure on a small service with a handful of endpoints

**Choose this when:** you have a large REST API, an existing MVC codebase, or a team that values `[ApiController]`'s established conventions over Minimal APIs' lighter footprint.

## gRPC

gRPC is a binary RPC framework built on HTTP/2 and Protocol Buffers, designed for fast, strongly-typed communication between services - not for talking to a browser directly.

**Strengths:**

- Fastest option here by a clear margin - binary Protobuf serialization plus HTTP/2 multiplexing beats JSON-over-HTTP/1.1 for both payload size and connection efficiency
- Strongly-typed contracts via `.proto` files, shared across client and server through a common project reference, which keeps them from drifting apart
- Native support for streaming RPCs (client, server, and bidirectional), a capability none of the request-response styles here have built in
- `RpcException`/`StatusCode` gives you a structured, consistent error-handling model across every RPC

**Weaknesses:**

- No browser support without gRPC-Web plus a compatible proxy - genuinely not an option for a public API a frontend calls directly
- Requires HTTP/2 and TLS even for local development, since Kestrel needs both to negotiate the protocol on a dual-purpose endpoint
- Protobuf's binary format isn't human-readable on the wire, which makes ad hoc debugging less convenient than inspecting a JSON payload

**Choose this when:** you're building internal service-to-service communication where every service is under your control and browsers aren't in the picture - it's the wrong tool for a public-facing API a frontend calls directly.

## GraphQL (Hot Chocolate)

GraphQL, via the Hot Chocolate library, lets the client specify exactly which fields it wants in a single request, instead of the server dictating a fixed response shape the way REST and gRPC both do.

**Strengths:**

- Clients request exactly the fields they need, eliminating both over-fetching (getting fields you don't use) and under-fetching (needing a second request for related data)
- A single `/graphql` endpoint replaces a proliferation of REST endpoints tailored to specific client views
- `[UseProjection]`/`[UseFiltering]`/`[UseSorting]` push those concerns down to the database query itself rather than requiring hand-written variants per use case
- Banana Cake Pop, Hot Chocolate's built-in IDE, gives you interactive schema exploration without needing a separate API client

**Weaknesses:**

- The N+1 query problem is a real, common pitfall - resolving a list of parent entities and then a related field per item can silently issue one query per item unless you use a `DataLoader` to batch them
- Needs deliberate cost and depth limiting (`AddMaxExecutionDepthRule`, paging options) or a client can construct a query that's expensive to resolve
- A steeper conceptual learning curve than REST for teams unfamiliar with resolvers, the N+1 problem, and schema-first thinking

**Choose this when:** your clients have genuinely varied data needs - different views need different shapes of the same underlying data - and you're willing to take on resolver design and query-cost limiting as an ongoing concern, not a one-time setup step.

## SignalR

SignalR is ASP.NET Core's real-time communication library, built on WebSockets (with automatic fallback transports) for pushing updates to connected clients the moment something happens - not a REST, GraphQL, or gRPC replacement, but a different category of problem.

**Strengths:**

- Purpose-built for real-time push - live dashboards, notifications, chat, collaborative features - where polling would be wasteful or too slow
- `IHubContext<T>` lets any part of your application push updates to connected clients, not just code running inside a Hub method itself
- Client libraries (JavaScript, .NET, and others) include automatic reconnection handling out of the box
- Falls back gracefully to other transports when WebSockets aren't available, without changing your application code

**Weaknesses:**

- Requires a Redis backplane (`Microsoft.AspNetCore.SignalR.StackExchangeRedis`) the moment you run more than one server instance - and forgetting it fails silently, with some clients simply missing updates rather than throwing an error
- Solves a fundamentally different problem than REST/GraphQL/gRPC, so it's additive to an API surface, not a replacement for it
- Persistent connections carry real infrastructure cost at scale - connection count and server affinity become operational concerns REST endpoints don't have

**Choose this when:** you have a genuine real-time push requirement - clients need to know about a change the moment it happens, not on their next poll - and you're prepared to add a backplane before scaling past one instance.

## How to Decide

A few heuristics that cover most real-world decisions:

**Starting a new REST API with no strong reason to deviate?** Minimal APIs are the modern default - lower ceremony, first-class OpenAPI support, and what the project templates scaffold now.

**Have a large existing MVC codebase, or a team that values `[ApiController]`'s conventions?** Stick with Controllers - the structure pays for itself at scale, and there's no compelling reason to migrate a working large API just to reduce per-endpoint ceremony.

**Building service-to-service communication with no browser in the picture?** gRPC's performance and strongly-typed contracts are worth the setup cost, provided every caller is a service you control, not a public frontend.

**Clients need meaningfully different shapes of the same data?** GraphQL earns its complexity when over- and under-fetching are real, recurring problems - not just theoretically possible ones.

**Need to push updates to clients the moment something changes?** SignalR is the tool, but budget for a Redis backplane before your first horizontal scale-out, not after clients start silently missing messages.

None of these are exclusive choices within a single application - REST (Minimal APIs or Controllers) for your public surface, gRPC between internal services, and SignalR for one specific real-time feature can all coexist in the same solution without conflict.

## Frequently Asked Questions

### Should new ASP.NET Core projects use Minimal APIs or Controllers?

Minimal APIs are Microsoft's current recommended default for new REST APIs, and what the project templates scaffold unless you pass `--use-controllers`. Controllers remain the right call for large APIs or teams that specifically want `[ApiController]`'s built-in conventions - it's not that Controllers are deprecated, just that Minimal APIs are the newer, lighter-weight starting point.

### Can gRPC be called directly from a browser?

Not without gRPC-Web plus a compatible proxy to translate between what browsers can actually send and gRPC's native HTTP/2 framing. For a public API a frontend calls directly, REST or GraphQL are the practical choices; reserve gRPC for service-to-service calls where every caller is under your control.

### What's the N+1 problem in GraphQL, and how do I fix it?

It happens when resolving a list of parent entities, then a related field on each one, issues one database query per item instead of a single batched query. Hot Chocolate's `DataLoader` fixes this by batching those per-item lookups into a single query within the same request, and it's a pattern you'll need on essentially any non-trivial GraphQL schema, not an edge case.

### Why did my SignalR app silently stop delivering messages to some clients?

Almost always a missing Redis backplane after scaling to more than one server instance. Without it, a message sent from one instance only reaches clients connected to that same instance - there's no error, just some clients quietly missing updates. Adding `AddStackExchangeRedis(...)` is the fix, and it's worth doing before your first scale-out, not after you notice the symptom.

### Do I need HTTPS for gRPC even during local development?

Yes - Kestrel requires HTTP/2 and TLS to negotiate a gRPC connection on a dual-purpose endpoint, since there's no clear-text protocol negotiation path available. This trips people up in local development more than production, where TLS is already a given.

### Is SignalR a replacement for GraphQL subscriptions?

Not a general-purpose replacement, but they overlap for real-time use cases. SignalR is a dedicated real-time library with broader adoption and a simpler mental model for pure push scenarios; GraphQL subscriptions integrate real-time updates into an existing GraphQL schema, which is more natural if you're already using GraphQL for the rest of your API and want events to flow through the same client.
