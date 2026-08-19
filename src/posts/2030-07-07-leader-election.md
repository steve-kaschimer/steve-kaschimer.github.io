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



Most distributed systems run multiple instances for availability. But some tasks can't run in parallel. A periodic reconciliation shouldn't hit all instances at once. A singleton scheduler shouldn't emit duplicate tasks. A partition rebalancer shouldn't have multiple instances reassigning the same data.

Leader Election solves this. One instance coordinates. The rest stand by. When the leader crashes, another takes over automatically. Like appointing a captain. You need one to make the final call. When they're gone, someone else steps up.

```text
Instance A  <- leader
Instance B  <- backup
Instance C  <- backup
```

## How It Works: The Lease Model

The standard approach uses renewable leases. A process tries to acquire leadership for a fixed duration (say, 10 seconds). If successful, it becomes leader, does work, and renews the lease before expiry. If the leader crashes, the lease expires. Another instance notices and acquires it.

```text
try acquire lease
    ↓
success (now leader)
    ↓
do leader work
    ↓
renew lease before expiry
    ↓
repeat
```

Simple. No complex consensus algorithms. Just time-based expiry. That simplicity is also the problem.

## The Risk: Split Brain

Leadership is temporary. Any process can lose it at any moment. The worst failure is *split brain*. Two instances both think they're leader.

This happens when:
- A network partition isolates the leader from the lease system
- The leader pauses (garbage collection, scheduler hiccup) and misses a renewal
- Clock skew makes lease expiry disagree across servers

Both leaders run simultaneously. Both corrupt state. Money transfers twice. Records delete from multiple places. Partitions reassign by both leaders at once.

```csharp
while (leadership.IsHeld && !cancellationToken.IsCancellationRequested)
{
    await RunCoordinationCycleAsync(cancellationToken);
    
    if (!leadership.IsHeld)
        break;
}
```

For critical work, combine leader election with downstream idempotency or fencing to prevent stale leaders from making changes after losing the lease.

## When You Actually Need It

Don't use leader election just because you have multiple instances. If work can run in parallel, or if operations are idempotent, you don't need a leader. Scale horizontally.

Queues work differently. Push items into a queue, let instances claim work. No election needed.

Use leader election when:
- Exactly one instance must coordinate a responsibility
- Automatic failover matters
- The coordination cost is justified

## Prefer Platform Solutions

Before coding leader election, check what your platform provides. Managed schedulers have singleton jobs. Kubernetes has built-in election. Cloud databases have lease primitives. SQL Server Agent schedules on one instance. Azure Service Bus and SQS distribute work natively.

Platform solutions beat custom consensus algorithms in application code.

## Observability Matters

Track these if you implement leader election:

- Current leader and when they acquired it
- Leadership change frequency (churn = instability)
- Lease renewal failures
- Periods with no leader
- Duplicate coordinators detected

Frequent changes mean lease duration is too short, renewal is failing, or infrastructure is unstable.

## The Takeaway

Leader Election gives singleton execution over redundant processes. Leadership is always temporary. Design from the start to lose it instantly: clean exit on lease expiry, no shared state across transitions, prepare for split brain on a Friday at 6 PM. That's when you'll need it to work.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
