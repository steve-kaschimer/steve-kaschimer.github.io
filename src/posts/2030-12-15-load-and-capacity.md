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

A correct system can still fail because it accepts more work than its dependencies can process.

Northstar now treats capacity explicitly.

## Queue-Based Load Leveling

RabbitMQ is the buffer.

The producer and consumer no longer need identical instantaneous throughput.

That buys stability at the cost of queueing latency.

## Competing Consumers

Multiple worker instances can drain the same queue in parallel.

This increases throughput until another bottleneck becomes dominant.

That is why "add workers" is not an infinite scaling strategy.

## Bulkhead

Payment concurrency is bounded.

A slow Payment dependency can consume only its allocated permits and queue.

It cannot create unbounded in-flight work.

## Rate Limiting

The API rejects excess admission before the system accepts work it cannot responsibly handle.

The result is explicit backpressure:

```text
429
```

rather than hidden overload.

## The Combined Model

```text
Client
  |
Rate Limit
  |
Ordering
  |
Queue
  |
Competing Consumers
  |
Bulkhead
  |
Payment dependency
```

Each control acts at a different boundary.

## Lesson

Capacity is not just an infrastructure sizing problem.

It is part of application behavior.

A production architecture must decide:

```text
what work to admit
what work to buffer
what work to parallelize
what work to reject
```

Those decisions are architecture.
