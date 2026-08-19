---
author: Steve Kaschimer
date: 2030-06-09
image: /images/posts/2030-06-09-hero.webp
image_alt: "A gauge glyph with a needle positioned just before a hard ceiling mark."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single amber gauge-meter glyph with a teal needle positioned just short of a bold off-white ceiling mark at the gauge's edge, implying deliberate admission control rather than unlimited throughput. Mood is measured and fair. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Rate limiting controls how much work a caller may introduce over time."
tags: ["dotnet", "architecture", "design-patterns", "resilience"]
title: "Rate Limiting: Protecting Capacity and Fairness at the Boundary"
---



Rate limiting controls how much work a caller may introduce over time. It protects capacity, fairness, cost, and downstream dependencies.

## Why It Exists

Without limits:
```text
one client
   |
100,000 requests/sec
   |
shared service
```

one noisy or malicious caller can consume capacity needed by everyone else.

## Partition by the Right Identity

Limits may be scoped by:
```text
tenant
API key
user
IP address
route
```

The partition should reflect the resource or fairness boundary. IP-only limiting can be problematic when many legitimate users share one address.

## Algorithms

Common strategies include:

### Fixed window

```text
100 requests per minute
```

Simple, but bursts can occur around window boundaries.

### Sliding window

Smooths the boundary by considering recent windows.

### Token bucket

Tokens accumulate at a configured rate and requests consume them. This allows controlled bursts.

### Concurrency limiter

Limits simultaneous work rather than requests per unit time. This is especially useful when duration is the scarce resource.

## ASP.NET Core

ASP.NET Core includes rate-limiting middleware that can apply policies to endpoints. Conceptually:
```csharp
builder.Services.AddRateLimiter(options =>
{
    // register named or partitioned policies
});

app.UseRateLimiter();
```

The architecture decision is more important than the API syntax: choose the right partition and resource model.

## Return Clear Rejection

HTTP APIs commonly use:
```text
429 Too Many Requests
```

and may provide retry guidance. Clients should distinguish throttling from arbitrary server failure.

## Rate Limit vs. Bulkhead

```text
Rate Limit
  controls arrival over time

Bulkhead
  controls concurrent resource consumption
```

Use both when both dimensions matter.

## Distributed Limits

In a multi-instance service, per-instance limits are not necessarily global limits. If a strict tenant-wide quota matters, coordinated state may be required. That coordination has latency and availability costs. Decide whether approximate or exact enforcement is needed.

## Fairness

A global limit can allow one tenant to consume all capacity. Partitioned limits preserve fairness. You may also reserve capacity for high-priority workloads.

## Observability

Measure:
```text
accepted requests
rejected requests
partition
route
queue time
concurrency
```

Rate-limit rejection should be visible as a capacity/product signal, not hidden as generic errors.

## When It Helps

Use rate limiting at public boundaries, expensive operations, multi-tenant services, and dependencies with finite quotas.

## When It Hurts

Bad limits reject healthy traffic, create confusing client behavior, or move bottlenecks without understanding them.

## Summary

Rate limiting is admission control. It should encode a deliberate capacity and fairness policy, not merely a number copied from a configuration example.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
