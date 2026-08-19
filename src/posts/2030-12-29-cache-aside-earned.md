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



The previous stage proved the dashboard query was being recomputed far more often than the underlying information actually changed. This stage answers that with Cache-Aside.

## The Flow

The algorithm itself is simple: look in the cache, return on a hit, and on a miss query the database, populate the cache, and return. The algorithm was never the hard part - the trade underneath it is where the real architecture lives.

## Staleness

The dashboard uses a five-second TTL, which means the application is explicitly accepting up to about five seconds of stale data. That would be completely unacceptable for a question like "can this payment be captured?" - but it's perfectly fine for an operations screen. Caching, in other words, is a business and UX decision about consistency, not just a performance knob.

## Stampede Protection

If a hundred callers show up the instant a key expires, all one hundred could hit a cache miss at once and independently recompute the same expensive query. The lab guards against that with a small per-key gate: the first caller refreshes the value, everyone else waits, and they all reuse the freshly computed result once it lands. That's request coalescing.

## Invalidation

The lab exposes `POST /operations/dashboard/invalidate` so you can see explicit invalidation happen. The harder question - which writes should invalidate this dashboard - gets messier in production, since a complex dashboard can depend on a lot of different events. That's exactly why TTL still earns its keep even alongside explicit invalidation: it bounds how stale things can get whenever an invalidation gets missed.

## Cache Failure

This stage uses an in-memory cache, so failure stays local and simple. A distributed cache would add network latency, serialization, cache outages, shared eviction, and deployment compatibility concerns on top of that - real costs we're not going to pay by reaching for Redis before shared cache behavior is actually required.

## Source of Truth

The database stays authoritative. The cache can vanish at any moment, and the system still has to know how to reconstruct the read model from scratch when that happens - which is exactly the rule that keeps a cache from quietly turning into a second database.

## Re-run the Pressure Test

Run `./scripts/hammer-dashboard.ps1 -Count 200` again, and this time most requests should reuse the same cached result inside the TTL window instead of hitting the database each time.

## The Lesson

Cache-Aside isn't really about making things faster. It's about accepting bounded staleness in exchange for lower source load and lower latency - and if you can't state the acceptable stale window out loud, you don't have a cache design yet, no matter how fast the code runs.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
