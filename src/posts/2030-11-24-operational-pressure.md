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

Northstar can now survive duplicate delivery and broker interruptions without corrupting business state. Then Payment gets slow. Nothing is technically inconsistent - the data is fine - but the customer is still waiting, and operations still has a real problem on its hands.

## Correctness vs. Health

Distributed systems need both, and they're genuinely different questions. Correctness asks whether we lost or duplicated any business effects. Health asks how long the workflow is taking, whether it's making progress, whether dependencies are failing, and whether retries are quietly amplifying the load.

## A Saga Deadline

The Saga now records a `DeadlineAt`, and a monitor marks any workflow that runs past it as `TimedOut`. That gives operators a durable answer to a question they couldn't ask before: which workflows are actually stuck?

## Controlled Dependency Failure

The Payment worker can now simulate latency, an outage, or a decline on demand - three genuinely different conditions that shouldn't all be handled by the same resilience policy.

## Next

The next stage adds bounded Retry with jitter, a Circuit Breaker, timeout budgets, dead-letter topology, and OpenTelemetry traces and metrics. None of that is a "cloud feature" bolted on for its own sake - each one is a direct response to a failure mode we can now actually observe.
