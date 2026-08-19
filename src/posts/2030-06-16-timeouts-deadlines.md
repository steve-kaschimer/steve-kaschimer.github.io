---
author: Steve Kaschimer
date: 2030-06-16
image: /images/posts/2030-06-16-hero.webp
image_alt: "An hourglass glyph positioned along a chain of connected nodes, implying a shared time budget passed along a call chain."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small amber hourglass glyph positioned at the first node of a horizontal chain of four teal nodes connected by a line, with the hourglass motif faintly echoed and shrinking at each subsequent node, implying one time budget consumed as it passes through a distributed call chain. Mood is finite and propagating. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Every remote call can wait forever unless something decides otherwise."
tags: ["dotnet", "architecture", "design-patterns", "resilience"]
title: "Timeouts and Deadline Propagation: Giving Distributed Work a Time Budget"
---



Every remote call can wait forever unless something decides otherwise. A timeout says:
> This operation is no longer worth waiting for.

A deadline makes that decision propagate through a distributed call chain.

## The Latency Amplification Problem

```text
Client -> API -> Service A -> Service B -> Database
```

If every layer independently allows 30 seconds, the original request's latency objective is meaningless. The caller needs one overall time budget.

## Timeout vs. Deadline

Timeout:
```text
wait at most 2 seconds from now
```

Deadline:
```text
this entire operation must finish by 14:03:17.250
```

Deadlines compose better across services because each hop can calculate remaining time.

## Cancellation in .NET

Propagate `CancellationToken`:
```csharp
app.MapGet("/orders/{id}", async (
    Guid id,
    IOrderQueries queries,
    CancellationToken cancellationToken) =>
{
    return await queries.GetAsync(
        id,
        cancellationToken);
});
```

Pass it through database and HTTP calls. Ignoring cancellation keeps doing work nobody is waiting for.

## Child Budgets

A service should reserve enough time to return a response. If 800 ms remains:
```text
downstream timeout = 750 ms
```

may leave almost no response budget. Budget downstream work intentionally.

## Timeout + Retry

Three 2-second attempts do not fit inside a 3-second request budget. Retry must consume the same overall deadline.
```text
overall deadline
  |
attempt
backoff
attempt
```

Stop when insufficient time remains.

## Queue Boundaries

A synchronous deadline does not automatically make sense for asynchronous work. A queued command may instead carry:
```text
ExpiresAt
```

or business SLA metadata. Consumers can reject work that is no longer useful.

## Timeouts Are Not Cancellation Guarantees

Your caller may stop waiting while the remote service continues executing. That is why a timed-out write can have an ambiguous outcome. Idempotency remains necessary.

## Observability

Record:
```text
configured timeout
remaining deadline
timeout source
dependency
operation duration
```

Distinguish caller cancellation from dependency timeout where possible.

## When It Helps

Every distributed call needs a bounded wait. Deadline propagation is especially valuable in multi-hop synchronous systems.

## When It Hurts

Timeouts become harmful when arbitrarily short values cause self-inflicted failure or when each layer resets the clock and ignores the original budget.

## Summary

Latency is a finite resource. Propagate a time budget through the call chain, cancel work that has lost its caller, and make Retry, Circuit Breaker, and downstream calls respect the same deadline.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
