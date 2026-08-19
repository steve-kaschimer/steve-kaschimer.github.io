---
author: Steve Kaschimer
date: 2030-06-30
image: /images/posts/2030-06-30-hero.webp
image_alt: "A padlock glyph with a small clock ring around it, implying an expiring, renewable hold rather than permanent ownership."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single amber padlock glyph encircled by a thin teal clock-ring with one small tick mark, implying temporary, renewable exclusive ownership rather than a permanent lock. Mood is temporary and accountable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Sometimes multiple processes must coordinate so that only one performs a piece of work at a time."
tags: ["dotnet", "architecture", "design-patterns", "concurrency"]
title: "Distributed Lock and Lease: Coordinating Exclusive Work Across Processes"
---



Sometimes multiple processes must coordinate so that only one performs a piece of work at a time. A distributed lock sounds like the obvious solution. It is also one of the easiest primitives to misuse.

## Why Local Locks Fail

```csharp
lock (_gate)
{
}
```

coordinates threads inside one process. With five service instances, there are five different locks. Distributed coordination requires shared state.

## Prefer Avoiding the Lock

Before creating a distributed lock, ask whether the problem can be solved with:
- unique constraints;
- optimistic concurrency;
- idempotency;
- queue partitioning;
- atomic database operations.

Those mechanisms often provide stronger, simpler correctness.

## Lease Instead of Eternal Lock

Distributed systems cannot reliably know whether a process is dead or merely unreachable. A **lease** expires.
```text
Owner A
Lease until 12:00:30
```

A healthy owner renews it. If it disappears, another owner can eventually acquire the lease.

## The Paused Owner Problem

Owner A acquires a lease. A pauses for 60 seconds. The lease expires. Owner B acquires it. A wakes up and continues believing it owns the resource. Now two owners can act. Expiration alone does not guarantee safety.

## Fencing Tokens

Each successful acquisition receives a monotonically increasing token:
```text
A -> token 41
B -> token 42
```

The protected resource rejects operations using an older token.
```text
42 accepted
41 rejected
```

Fencing protects against stale owners continuing after lease loss.

## Database Example

For some workloads, a database row can store:
```text
Resource
Owner
LeaseUntil
FencingToken
```

Acquisition must be atomic. The exact SQL depends on the database.

## Do Not Hold Leases Across Human Time

A distributed lease is a poor fit for:
```text
user opens edit page
goes to lunch
returns
```

Use optimistic concurrency for human editing.

## Failure Semantics

Define:
```text
How long is the lease?
How often renew?
What if renewal fails?
Can work stop safely?
Does protected resource honor fencing?
```

Without answers, the "lock" may be wishful thinking.

## When It Helps

Use leases for rare workloads that truly require temporary exclusive ownership across processes.

## When It Hurts

It hurts when used as a universal substitute for transaction design or idempotency. Distributed locks add a failure-prone coordination dependency.

## Summary

Prefer designs that do not require distributed locks. When exclusivity is genuinely necessary, use leases with explicit expiration and consider fencing tokens so a stale owner cannot keep acting after ownership has moved on.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
