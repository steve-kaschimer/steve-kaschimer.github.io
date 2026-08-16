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

Northstar is transactionally reliable.

Now it must remain useful when dependencies are slow or unavailable.

## Retry

The Payment worker uses a bounded resilience pipeline:

```text
attempt
backoff + jitter
attempt
backoff + jitter
attempt
give up
```

Retry is only for the simulated transient dependency failure.

A Payment decline is still a business result and is **not retried**.

## Timeout

Each dependency attempt has a bounded wait.

This prevents a slow dependency from holding workflow progress indefinitely.

The Saga has its own broader deadline.

Those are different time boundaries:

```text
attempt timeout
<
Saga deadline
```

## Circuit Breaker

Repeated failures eventually open the circuit.

Then Payment stops calling the unhealthy dependency temporarily and fails fast.

This protects both the worker and the dependency from a retry storm.

## Dead Letter

RabbitMQ supports dead-letter exchanges for rejected, expired, or otherwise dead-lettered messages.

In a production deployment, poison commands should be routed to a DLQ after bounded attempts instead of being requeued forever.

The teaching consumer currently requeues on handler failure so you can observe redelivery.

The next hardening step is to attach a retry/dead-letter topology and operational replay workflow.

## OpenTelemetry

The messaging library now creates:

```text
Producer Activity
Consumer Activity
published counter
consumed counter
failed counter
```

OpenTelemetry collects those standard .NET `ActivitySource` and `Meter` signals.

This makes a workflow visible across:

```text
Ordering
RabbitMQ
Inventory
Ordering
RabbitMQ
Payments
Ordering
```

## Why Observability Comes Now

Tracing was useful earlier.

It becomes essential once asynchronous workflows span several processes.

Without it, a stuck Saga is a pile of unrelated log entries.

With trace/message/Saga identity, operators can reconstruct the causal path.

## Break It

### Slow Payment

```text
NORTHSTAR_PAYMENT_DELAY_MS=10000
```

Watch attempt timeouts and the Saga deadline.

### Failing Payment

```text
NORTHSTAR_PAYMENT_FAIL=true
```

Watch:

```text
retry
retry
retry
circuit opens
```

### Recover Payment

Remove the failure flag.

After the break interval, the circuit permits probe traffic and can close.

## The Lesson

Resilience patterns are not decorations around `HttpClient`.

They encode explicit policy:

```text
How long will we wait?
What is transient?
How many extra attempts can we afford?
When should we stop calling?
What happens to work that never succeeds?
How will an operator see any of this?
```

The policy must be observable or it cannot be operated safely.
