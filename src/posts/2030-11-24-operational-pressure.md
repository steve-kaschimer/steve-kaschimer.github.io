---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2030-11-24
image: /images/posts/2030-11-24-hero.webp
image_alt: "A checkmark glyph sitting calmly beside a slowly draining hourglass, implying a system that is provably correct while quietly running out of time."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a solid teal checkmark glyph positioned beside a small amber hourglass with sand visibly low, implying a system that is provably correct while quietly running out of operational time. Mood is calm on the surface, urgent underneath. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Northstar can now survive duplicate delivery and broker interruptions without corrupting state - and then Payment gets slow, proving that correctness and health are not the same question."
tags: ["dotnet", "architecture", "design-patterns", "observability"]
title: "Lab 15: Correct but Unhealthy"
---

Northstar can now survive duplicate delivery and broker interruptions without corrupting business state.

Then Payment becomes slow.

Nothing is technically inconsistent.

The customer still waits.

Operations still have a problem.

## Correctness vs. Health

Distributed systems need both.

```text
Correctness:
Did we lose or duplicate business effects?

Health:
How long is the workflow taking?
Is progress being made?
Are dependencies failing?
Are retries amplifying load?
```

## A Saga Deadline

The Saga now records:

```text
DeadlineAt
```

A monitor marks workflows that exceed it as:

```text
TimedOut
```

That gives operators a durable answer to:

> Which workflows are stuck?

## Controlled Dependency Failure

The Payment worker can now simulate:

```text
latency
outage
decline
```

Those are three different conditions.

They should not all receive the same resilience policy.

## Next

v17 adds:

- bounded Retry with jitter;
- Circuit Breaker;
- timeout budgets;
- dead-letter topology;
- OpenTelemetry traces and metrics.

The key lesson is that these are not "cloud features."

They are responses to observable failure modes.
