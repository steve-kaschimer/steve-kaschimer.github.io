---
author: Steve Kaschimer
date: 2030-04-21
image: /images/posts/2030-04-21-hero.webp
image_alt: "A switch glyph shown mid-open with a visible gap in the connecting line, implying calls deliberately interrupted."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single amber switch glyph shown mid-open with a clear gap breaking its connecting line, a faint teal dependency shape visible but unreachable on the far side of the gap, implying calls deliberately stopped rather than continuing to fail. Mood is protective and decisive. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Fail fast when a dependency is persistently unhealthy, allowing recovery while preventing cascading latency, retry storms, and resource exhaustion."
tags: ["dotnet", "architecture", "design-patterns", "resilience"]
title: "Circuit Breaker: Stop Calling a Dependency That Is Already Failing"
---



Retry assumes another attempt may succeed. What if the dependency is down for ten minutes? Continuing to call it creates:
```text
timeouts
blocked resources
retry storms
higher latency
cascading failure
```

Circuit Breaker temporarily stops calls to a dependency that appears unhealthy.

## The Electrical Analogy

A circuit breaker protects a system by opening the circuit when failure exceeds a threshold. Software follows the same state model:
```text
Closed
  |
failures exceed threshold
  |
  v
Open
  |
cool-down
  |
  v
Half-Open
  |
probe succeeds
  |
  v
Closed
```

## Closed

Calls flow normally. The breaker observes failures.

## Open

Calls fail immediately without contacting the dependency.
```text
dependency call
     X
fail fast
```

This protects:
- threads/tasks;
- sockets;
- connection pools;
- latency budgets;
- the failing dependency itself.

## Half-Open

After a recovery interval, allow limited probe traffic. If probes succeed:
```text
close circuit
```

If they fail:
```text
open again
```

Do not unleash full production traffic on the first sign of recovery.

## What Counts as Failure?

Not every unsuccessful business result should trip the circuit. Examples:
```text
HTTP 503 -> probably dependency failure
timeout  -> probably dependency failure
HTTP 400 -> caller problem
card declined -> business outcome
```

Failure classification matters.

## Circuit Breaker + Retry

A common composition:
```text
Request
  |
Retry
  |
Circuit Breaker
  |
Dependency
```

But ordering and implementation details matter. The goal is:
- retry brief transient failures;
- stop hammering sustained failures.

Do not let retries bypass the breaker.

## Fallback

When the circuit is open, the caller needs a policy. Possible outcomes:
```text
return cached data
degrade optional feature
queue work
return unavailable
```

Fallback must be semantically valid. Never return stale or fabricated data merely to make dashboards green.

## Example: Recommendations

If Recommendations is unavailable:
```text
Product page
  |
recommendations circuit open
  |
show page without recommendations
```

Excellent graceful degradation.

## Example: Payment

If Payment is unavailable:
```text
pretend payment succeeded
```

is obviously unacceptable. Return a clear unavailable/pending state or queue only if the business supports it.

## Per-Dependency Isolation

Do not use one global circuit:
```text
one vendor fails
everything opens
```

Circuit state should align with the dependency/failure boundary. Sometimes even separate operations on one dependency deserve different breakers.

## Distributed Instances

Each application instance may maintain its own circuit state. That is usually fine. A shared global breaker adds coordination complexity and may create its own failure mode.

## Health Checks Are Different

Health checks answer:
```text
is dependency healthy right now?
```

Circuit breakers answer:
```text
should this caller currently attempt requests?
```

Do not poll health endpoints on every request as a substitute for a breaker.

## Observability

Track:
```text
state transitions
open duration
rejected calls
probe success/failure
underlying failure rate
dependency latency
```

An open circuit should be operationally visible.

## Testing

Test:
```text
threshold opens circuit
open circuit fails fast
half-open allows limited probes
success closes
failure reopens
business rejection does not trip breaker
```

Time abstraction such as `TimeProvider` can make timing behavior easier to test.

## When It Helps

Use Circuit Breaker when:
- a remote dependency can fail for meaningful periods;
- repeated calls consume scarce resources;
- callers can fail fast or degrade;
- cascading failure is a concern.

## When It Hurts

It adds state and tuning. For a local in-memory method call, it is nonsense. For a dependency whose every request is independent and cheap, it may add little.

## Summary

Circuit Breaker protects the caller and the dependency from sustained failure. Retry says:
> try again carefully.

Circuit Breaker says:
> stop trying for now.

Together, they let the system distinguish a brief glitch from an outage.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
