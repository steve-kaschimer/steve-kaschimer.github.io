---
author: Steve Kaschimer
date: 2030-07-14
image: /images/posts/2030-07-14-hero.webp
image_alt: "A single connecting thread passing consistently through several distinct nodes across a process boundary."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one continuous amber thread passing through four small distinct teal nodes positioned across a faint vertical boundary line, implying one causal story followed consistently across separate processes. Mood is continuous and traceable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A distributed operation may cross process boundaries, but observability context keeps it traceable."
tags: ["dotnet", "architecture", "design-patterns", "observability"]
title: "Observability Context Propagation: Following One Operation Across the System"
---

A single customer request in a distributed system travels through multiple services, databases, message brokers, and background workers. An HTTP endpoint calls another service. That service queries a database and publishes a message. A consumer picks up that message and triggers more work. From the system's perspective, each component logs independently. The database logs a query. The message broker logs a delivery. The HTTP framework logs a response. Without context linking all of it together, these logs are just isolated noise.

Context propagation solves this. It gives every component in the chain a common identifier: a thread ID that says "all of this work is part of the same operation." When something fails, you can follow that thread and see the entire story: what the HTTP endpoint did, what the service decided, what the database returned, when the message was published, how the consumer processed it. You're not hunting through ten different log files anymore. You're following one continuous thread through the system.

## Traces and Spans

Modern distributed tracing models this as a tree. The whole operation is a trace. Each piece of work (the HTTP request, the SQL query, the message publish, the consumer processing) is a span within that trace. Parent and child relationships show which operation triggered which.

```text
Trace (overall operation)
  |
  +-- HTTP request span
       |
       +-- SQL query span
       +-- Service call span
            |
            +-- Message publish span
                 |
                 +-- Consumer process span
```

The W3C Trace Context standard defines how to propagate these identifiers across process boundaries so every system understands them the same way.

## .NET Activity

.NET models tracing with the `Activity` class. When you start an activity, you're creating a span for whatever operation you're about to perform.

```csharp
using var activity = activitySource.StartActivity("CalculateQuote");
```

The beauty of this is you don't have to instrument every line of code manually. Instrumentation libraries (the HTTP client, the database driver, the message publisher) all automatically create activities and propagate context. OpenTelemetry exporters then send that trace information to your observability backend. Your business code stays clean. The infrastructure handles the observability.

## Not Everything Is a Trace ID

People often collapse multiple concerns into one identifier. They use a single GUID for everything and call it "context." Stop. Each identifier serves a different purpose.

A trace ID is for observability. It links every log, metric, and span from one end-to-end operation. A correlation ID groups related work across your business domain (it might span multiple operations or workflows). A message ID identifies a specific message for delivery guarantees. An idempotency key identifies a logical operation so you can safely retry without duplication.

They're related but not the same. A message might get retried as part of the same trace but with a different message ID. A workflow might start new traces but use the same correlation ID. Trying to shoehorn all of this into one GUID creates confusion and loses information.

## Messaging Is Different From HTTP

HTTP libraries handle trace context propagation automatically. When you make an HTTP call, the client library puts the trace headers into the request. The server library reads them and continues the trace. No code needed.

Messaging is different. The trace context needs to live in message headers or metadata, not in the message body itself. Your domain event is a business concept (order placed, shipment updated, payment confirmed). It shouldn't know anything about trace infrastructure. The messaging framework should inject trace context as metadata alongside the payload.

```csharp
// Message body: clean, business-focused
public record OrderPlaced(OrderId Id, CustomerId Customer);

// Trace context: in the envelope, not the payload
headers: { "traceparent": "00-...", "tracestate": "..." }
```

## Baggage: Context for Small Values

Trace context is a unique ID. Baggage is a way to propagate small contextual values through that trace (things like the user ID, the tenant, the feature flag state). Use it sparingly. Never put secrets, tokens, or large payloads into baggage. It flows everywhere and can be logged. Keep it to small, safe, operational values.

## Logs Need Trace Context

A structured log entry is most useful when it includes the trace ID. That way when an operator sees a log line, they can look up the trace ID and see the full picture of what happened.

```json
{
  "timestamp": "2024-01-15T...",
  "level": "error",
  "message": "Order calculation failed",
  "orderId": 42,
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "customerId": 99
}
```

Business identifiers like orderId are often just as important as trace IDs for debugging. Include both.

## Traces, Metrics, and Logs Work Together

These are three different tools answering different questions. Metrics answer aggregate questions across many operations: How often does this function run? How slow is it on average? What percentage fail? Traces answer the specific question: What happened to this one operation? Logs provide detailed events as they occur. Good observability uses all three.

A metric tells you "orders are taking twice as long lately." A trace shows you "this specific order took 8 seconds because of a slow database query." The log line shows you the exact timestamps and what each component did. They're complementary.

## Sampling at Scale

When you have thousands of requests per second, keeping every single trace might be prohibitively expensive. Sampling reduces the volume. But if you're too aggressive, you'll miss the rare failures you're trying to debug. The right strategy depends on your traffic volume, your retention budget, and how quickly you need to investigate incidents. Common approaches are keeping 100% of traces for errors and traces slower than a threshold, while sampling 1% of successful fast operations.

## Use OpenTelemetry

OpenTelemetry provides a vendor-neutral standard for instrumentation. You write to the OpenTelemetry APIs, and you can export to whatever backend you want (Jaeger, DataDog, Honeycomb, New Relic, whatever). If you ever need to switch, your code doesn't change. The exporter does. That decoupling is worth a lot.

## Watch Your Metric Cardinality

Never put unbounded values into metric dimensions. A metric like "request_duration" with a dimension for "user_id" explodes cardinality if you have millions of users. Each new user creates a new metric series. Instead, put the user ID into the trace and the logs where cardinality doesn't matter. Keep metrics aggregate across many operations.

## The Payoff

Once a request or workflow crosses process boundaries, context propagation becomes essential. Without it, debugging is guesswork. With it, observability becomes a concrete tool. You can follow one operation from entry to exit, see where it spent time, where it failed, what each component decided. That's the difference between "the system seems slow" and "this operation is slow because the database query against the orders table is being called in a loop."
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
