---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2030-12-15
image: /images/posts/2030-12-15-hero.webp
image_alt: "A wide funnel narrowing through a segmented gate into a single steady-width stream, implying admission, buffering, and parallel draining all acting at one boundary."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a wide amber funnel narrowing at the top into a segmented teal gate with several small openings, draining into one steady-width stream at the bottom, implying admission control, buffering, and parallel processing acting together at one capacity boundary. Mood is deliberate and load-bearing. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Queue-based load leveling, competing consumers, a bounded Payment bulkhead, and rate limiting turn capacity from an infrastructure sizing afterthought into an explicit part of Northstar's application behavior."
tags: ["dotnet", "architecture", "design-patterns", "resilience"]
title: "Lab 18: Load Is an Architectural Force"
---



A perfectly correct system can still fail simply because it accepts more work than its dependencies can process. Northstar now treats capacity as something to design for explicitly, not something to hope infrastructure sizing quietly handles.

## Queue-Based Load Leveling

RabbitMQ is the buffer here. The producer and consumer no longer need to match each other's instantaneous throughput - that mismatch just becomes queueing latency instead of a cascading failure, which is a trade worth making.

## Competing Consumers

Multiple worker instances can drain the same queue in parallel, which raises throughput right up until some other bottleneck takes over. That's why "just add more workers" isn't a scaling strategy on its own - it only works until it doesn't.

## Bulkhead

Payment concurrency is bounded now, so a slow Payment dependency can only consume its own allocated permits and queue. It can't spiral into unbounded in-flight work and drag everything else down with it.

## Rate Limiting

The API rejects excess admission before the system ever accepts work it can't responsibly handle. That turns overload into an explicit `429` instead of letting it hide inside growing latency until something breaks.

## The Combined Model

A request now moves from the client through rate limiting, into Ordering, onto a queue, out through competing consumers, and through a bulkhead before it ever touches the Payment dependency - each control doing its job at its own boundary rather than one mechanism trying to cover everything.

## Lesson

Capacity isn't just an infrastructure sizing problem you solve once and forget. It's part of application behavior, and a production architecture has to decide, deliberately, what work to admit, what to buffer, what to parallelize, and what to simply reject. Those are architectural decisions, not ops afterthoughts.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
