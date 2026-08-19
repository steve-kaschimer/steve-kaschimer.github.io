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

Microsoft's current default for new REST APIs. A working endpoint is five lines, no controller class, no routing attributes, just a handler and a route definition.

You reach for Minimal APIs when you want to move fast on a new service. Route groups keep the code organized as it grows. OpenAPI support is built in, and validation plugs in through endpoint filters. The template scaffolds correctly from day one.

The tradeoff: you assemble conventions yourself. A large REST API that would benefit from Controllers' `[ApiController]` model binding and automatic validation defaults won't get those automatically. You'll rebuild them by hand. That's fine for a small service; it's friction at scale.

## Controllers (MVC)

The original ASP.NET Core pattern and still the right choice for large APIs. `[ApiController]` gives you model validation, binding source inference, and error responses without writing them yourself. `IActionFilter` is a mature cross-cutting-concerns tool that's been battle-tested for years.

Use Controllers when you have a large API and want consistent structure across many endpoints, or when your team already knows MVC conventions well. A small service with a handful of endpoints doesn't need this overhead.

## gRPC

The fastest option by a clear margin. Binary Protobuf plus HTTP/2 multiplexing beats JSON-over-HTTP for both payload size and connection efficiency. You get strongly-typed contracts in `.proto` files, shared between client and server, so contracts can't drift. Streaming RPCs (unary, server-push, client-push, bidirectional) are native.

The catch: no browser support. gRPC-Web plus a proxy exists, but it's a shim. Use gRPC for internal service-to-service calls where you control both ends. Not for public APIs.

## GraphQL (Hot Chocolate)

The client requests exactly the fields it needs, no over-fetching junk, no "I need one more field, time for another round trip" under-fetching. One `/graphql` endpoint instead of a sprawl of REST endpoints tailored to specific views.

Watch for N+1 queries. A list of parent entities plus a related field per item will hammer your database unless you batch with `DataLoader`. Cost and depth limiting aren't optional, a client can write a query that's genuinely expensive to run. The learning curve is steeper than REST if your team hasn't done resolvers before.

Use GraphQL when clients have genuinely different data shapes, a web view needs columns A, B, C and a mobile view needs B, C, D. One schema, many views. If every client asks for the same fields, REST is simpler.

## SignalR

Real-time push for live dashboards, notifications, chat, collaborative editing. Not a REST alternative, orthogonal to it. You'll probably use it alongside your REST API, not instead of it.

Built on WebSockets with automatic fallback if they're unavailable. `IHubContext<T>` lets any part of your app push to connected clients. Reconnection is automatic.

One gotcha: scale past one server and you need a Redis backplane (`Microsoft.AspNetCore.SignalR.StackExchangeRedis`). Forget it and you don't get an error, some clients just silently miss updates. Infrastructure costs are real at scale: connection count and server affinity are now operational concerns.

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


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
