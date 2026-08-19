---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2030-12-01
image: /images/posts/2030-12-01-hero.webp
image_alt: "A looping retry arrow feeding into a switch glyph shown mid-open, with a thin trace line running underneath connecting both to a small monitoring dot."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a curved teal retry-loop arrow feeding into an amber switch glyph shown mid-open with a visible gap, with a thin off-white trace line running beneath both and terminating in a small monitoring dot, implying resilience policy made observable rather than assumed. Mood is instrumented and deliberate. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Bounded retry with jitter, timeouts, a circuit breaker, and OpenTelemetry traces turn Northstar's resilience from folklore into an observable, testable policy - stop Payment, watch the circuit open, then watch it recover."
tags: ["dotnet", "architecture", "design-patterns", "resilience"]
title: "Lab 16: Resilience Is Observable Policy"
---



Northstar is transactionally reliable now. The next question is whether it stays useful when a dependency turns slow or simply disappears.

## Retry

The Payment worker runs a bounded resilience pipeline: attempt, back off with jitter, attempt again, back off again, attempt once more, then give up. That retry only applies to the simulated transient dependency failure - a Payment decline is a business result, not a glitch, and it's never retried.

## Timeout

Every dependency attempt has a bounded wait, so a slow dependency can't hold workflow progress hostage indefinitely. The Saga carries its own broader deadline on top of that, and the two boundaries stay deliberately different sizes - each attempt's timeout is smaller than the Saga's overall deadline, not the other way around.

## Circuit Breaker

Enough repeated failures eventually open the circuit, and once it's open, Payment stops calling the unhealthy dependency and fails fast instead. That protects both the worker and the struggling dependency from turning into a retry storm.

## Dead Letter

RabbitMQ supports dead-letter exchanges for messages that get rejected, expire, or otherwise can't be processed. In production, poison commands should land in a DLQ after a bounded number of attempts rather than being requeued forever - though the teaching consumer here still requeues on handler failure, on purpose, so you can watch redelivery happen. Attaching a real retry/dead-letter topology and an operational replay workflow is the next hardening step.

## OpenTelemetry

The messaging library now creates a Producer Activity, a Consumer Activity, and published/consumed/failed counters, and OpenTelemetry collects all of that through standard .NET `ActivitySource` and `Meter` signals. That's what makes a single workflow visible as it bounces from Ordering through RabbitMQ to Inventory, back to Ordering, out through RabbitMQ to Payments, and back to Ordering one more time.

## Why Observability Comes Now

Tracing was useful even earlier in the lab, but it becomes essential the moment an asynchronous workflow spans several processes. Without it, a stuck Saga is just a pile of unrelated log entries scattered across services. With trace, message, and Saga identity tying them together, an operator can actually reconstruct what happened.

## Break It

Set `NORTHSTAR_PAYMENT_DELAY_MS=10000` and watch the attempt timeouts fire, followed eventually by the Saga deadline. Set `NORTHSTAR_PAYMENT_FAIL=true` instead and watch retry, retry, retry, then the circuit open. Remove the flag, wait out the break interval, and watch the circuit let probe traffic through again until it closes.

## The Lesson

Resilience patterns aren't decorations wrapped around `HttpClient`. They encode real policy: how long we'll wait, what counts as transient, how many extra attempts we can afford, when we should stop calling altogether, what happens to work that never succeeds, and how an operator sees any of it happening. If that policy isn't observable, it can't be operated safely - full stop.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
