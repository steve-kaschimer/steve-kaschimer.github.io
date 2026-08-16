---
author: Steve Kaschimer
date: 2030-07-14
image: /images/posts/2030-07-14-hero.webp
image_alt: "A single connecting thread passing consistently through several distinct nodes across a process boundary."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one continuous amber thread passing through four small distinct teal nodes positioned across a faint vertical boundary line, implying one causal story followed consistently across separate processes. Mood is continuous and traceable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A distributed operation may cross:"
tags: ["dotnet", "architecture", "design-patterns", "observability"]
title: "Observability Context Propagation: Following One Operation Across the System"
---

A distributed operation may cross:

```text
HTTP
service
database
message broker
worker
another service
```

Without shared context, every component produces isolated telemetry.

Context propagation connects those observations into one causal story.

## Trace Context

Modern distributed tracing associates operations with a trace and spans.

```text
Trace
  |
  +-- HTTP request
  +-- SQL query
  +-- broker publish
  +-- consumer processing
```

W3C Trace Context provides interoperable propagation across process boundaries.

## .NET Activity

.NET's tracing model centers on `Activity`.

```csharp
using var activity =
    activitySource.StartActivity(
        "CalculateQuote");
```

Instrumentation libraries and OpenTelemetry can create and export spans without business code manually building tracing infrastructure everywhere.

## Correlation ID Is Not Everything

A correlation ID is useful for grouping related work.

Trace context additionally models parent/child relationships and sampling.

Idempotency keys and message IDs solve different problems.

```text
Trace ID       -> observability
Correlation ID -> workflow grouping
Message ID     -> delivery identity
Idempotency Key-> logical operation identity
```

Do not collapse all four into one magic GUID.

## Messaging

HTTP libraries commonly propagate trace headers automatically.

Messaging requires context in message metadata.

```text
publish span
   |
message headers
   |
consumer span
```

Do not require the domain event payload itself to carry tracing infrastructure.

## Baggage

Baggage can propagate small contextual values through a trace.

Use it sparingly.

Never treat baggage as a safe place for secrets, tokens, or large business payloads.

## Logs

Structured logs can include trace/span identifiers so operators can move from a log entry to the distributed trace.

```text
OrderId=42
TraceId=...
MessageId=...
```

Business identifiers are often useful alongside technical trace context.

## Metrics

Metrics answer aggregate questions:

```text
How often?
How slow?
How many failures?
```

Traces answer:

```text
What happened to this operation?
```

Logs provide detailed events.

Good observability uses all three intentionally.

## Sampling

At high volume, retaining every trace may be expensive.

Sampling reduces volume.

But aggressive sampling can hide rare failures.

Use strategies appropriate to traffic and incident needs.

## OpenTelemetry

OpenTelemetry provides vendor-neutral APIs, SDKs, semantic conventions, and exporters for traces, metrics, and logs.

That reduces coupling between application instrumentation and a specific observability backend.

## Cardinality

Do not put unbounded values such as `OrderId` into metric dimensions.

High-cardinality metrics can become expensive or unusable.

Those identifiers belong more naturally in traces and logs.

## When It Helps

Context propagation is essential once a request or workflow crosses process boundaries.

## When It Hurts

It becomes noise when teams collect enormous telemetry without defining operational questions, retention, sampling, or privacy rules.

## Summary

Observability context turns distributed telemetry from isolated breadcrumbs into a causal story.

Propagate standard trace context automatically, keep business and delivery identities distinct, and use OpenTelemetry to avoid binding instrumentation to one backend.
