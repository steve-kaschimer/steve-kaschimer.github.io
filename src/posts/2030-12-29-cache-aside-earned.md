---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2030-12-29
image: /images/posts/2030-12-29-hero.webp
image_alt: "A layered disc glyph positioned in front of a database cylinder, with a small clock accent marking a bounded window rather than an indefinite one."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small amber layered-disc glyph positioned in front of a teal database-cylinder shape, with a small off-white clock accent marking a visibly bounded time window between them, implying a deliberate, time-limited staleness trade rather than an indefinite promise. Mood is bounded and honest. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A five-second TTL, request-coalescing against cache-stampede, and an explicit invalidation endpoint make Northstar's Cache-Aside an honest, bounded staleness trade rather than a vague promise of speed."
tags: ["dotnet", "architecture", "design-patterns", "caching"]
title: "Lab 20: Cache-Aside Is a Consistency Trade"
---

v20 proved that the dashboard query was being recomputed far more often than the underlying information changed.

v21 introduces Cache-Aside.

## The Flow

```text
request
  |
cache lookup
  |
hit -> return
  |
miss
  |
query database
  |
populate cache
  |
return
```

The algorithm is easy.

The trade is the architecture.

## Staleness

The dashboard uses a five-second TTL.

That means the application explicitly accepts:

```text
up to ~5 seconds of stale dashboard data
```

That would be unacceptable for:

```text
Can this payment be captured?
```

It is acceptable for this operations screen.

Caching is therefore a business/UX consistency decision.

## Stampede Protection

If 100 callers arrive immediately after expiration:

```text
100 cache misses
```

without coordination they could all recompute the same expensive query.

The lab uses a small per-key gate:

```text
first caller refreshes
others wait
then reuse refreshed value
```

This is request coalescing.

## Invalidation

The lab exposes:

```text
POST /operations/dashboard/invalidate
```

so you can see explicit invalidation.

The production question is harder:

> Which writes should invalidate this dashboard?

A complex dashboard may depend on many events.

That is why TTL is often valuable even when explicit invalidation also exists: it bounds stale time when invalidation is missed.

## Cache Failure

This stage uses in-memory cache, so failure is local and simple.

A distributed cache would add:

```text
network latency
serialization
cache outage
shared eviction
deployment compatibility
```

We will not introduce Redis until shared cache behavior is actually required.

## Source of Truth

The database remains authoritative.

The cache may disappear at any moment.

The system must still know how to reconstruct the read model.

That rule prevents the cache from quietly becoming a second database.

## Re-run the Pressure Test

Run:

```powershell
./scripts/hammer-dashboard.ps1 -Count 200
```

Now most requests should reuse the same cached result inside the TTL window.

## The Lesson

Cache-Aside is not:

```text
make things faster
```

It is:

```text
accept bounded staleness
in exchange for
lower source load and latency
```

If you cannot state the acceptable stale window, you do not yet have a cache design.
