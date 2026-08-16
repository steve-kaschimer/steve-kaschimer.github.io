---
author: Steve Kaschimer
date: 2030-07-07
image: /images/posts/2030-07-07-hero.webp
image_alt: "A small beacon mark positioned above one node among several otherwise identical nodes."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on four small identical teal nodes arranged in a loose group, with one small amber beacon mark positioned directly above a single one of them, implying one coordinator chosen among equals rather than a permanently distinct role. Mood is provisional and coordinated. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Some workloads need many application instances for availability but exactly one active coordinator for a particular responsibility."
tags: ["dotnet", "architecture", "design-patterns", "distributed-systems"]
title: "Leader Election: Choosing One Active Coordinator"
---

Some workloads need many application instances for availability but exactly one active coordinator for a particular responsibility.

Leader Election chooses that coordinator.

```text
Instance A  <- leader
Instance B
Instance C
```

If A disappears, another instance takes over.

## Example Workloads

```text
periodic reconciliation
singleton scheduler
partition assignment
coordination loop
```

Do not use leader election for ordinary horizontally scalable request handling.

## Lease-Based Election

A common model uses a renewable lease.

```text
try acquire leadership
   |
success
   |
perform leader work
   |
renew lease
```

Followers periodically attempt acquisition.

## Leadership Is Temporary

A process must assume leadership can be lost at any time.

```csharp
while (leadership.IsHeld &&
       !cancellationToken.IsCancellationRequested)
{
    await RunCoordinationCycleAsync(
        cancellationToken);
}
```

Long-running work should react promptly to loss.

## Split Brain

The dangerous state is:

```text
A thinks it is leader
B thinks it is leader
```

Lease expiry, network partitions, or paused processes can cause stale leadership.

For work with destructive side effects, combine leadership with fencing or downstream idempotency.

## Do You Need a Leader?

If every scheduled job can safely run multiple times, idempotency may eliminate the need for election.

That is often simpler.

Likewise, a queue can distribute work without a global leader.

## Platform Capabilities

Managed schedulers, orchestrators, and databases may already provide singleton execution or lease primitives.

Prefer a proven platform mechanism over inventing a consensus algorithm in application code.

## Observability

Track:

```text
current leader
leadership changes
lease renewal failures
time without leader
duplicate coordinator detection
```

Frequent churn may indicate infrastructure instability.

## When It Helps

Use Leader Election when one active coordinator is genuinely required and automatic failover matters.

## When It Hurts

It adds coordination and split-brain risk to work that may have been safely parallelizable or idempotent.

## Summary

Leader Election provides singleton behavior over a redundant set of processes.

The leader is never permanent.

Design every leader to lose leadership safely.
