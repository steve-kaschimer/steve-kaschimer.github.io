---
title: "Bulkhead: Preventing One Failure From Consuming Everything"
slug: "bulkhead"
description: "Partition concurrency and resources so overload or failure in one dependency or workload cannot exhaust the entire application."
series: "Modern Application Architecture Patterns in .NET"
volume: 2
category: "Resilience & Performance"
order: 35
dotnet: "10"
csharp: "14"
status: "draft"
---

# Bulkhead: Preventing One Failure From Consuming Everything

Ships are divided into watertight compartments.

If one compartment floods, the entire ship does not have to sink.

Software Bulkhead applies the same principle:

> Partition limited resources so one failing workload cannot consume all of them.

## The Failure Pattern

Suppose an API calls:

```text
Payments
Recommendations
Search
```

All outbound work shares the same unconstrained concurrency.

Recommendations slows dramatically.

Requests accumulate.

Eventually it consumes:

- sockets;
- tasks;
- memory;
- connection pool capacity.

Now Payments also fails even though Payment itself is healthy.

That is resource coupling.

## Concurrency Isolation

Give Recommendations a bounded concurrency budget:

```text
Recommendations
  max concurrent = 20
  queue = 50
```

When the boundary is full:

```text
reject/degrade
```

instead of consuming the rest of the application.

## Semaphore Shape

Conceptually:

```csharp
private readonly SemaphoreSlim _gate =
    new(initialCount: 20);

public async Task<T> ExecuteAsync<T>(
    Func<CancellationToken, Task<T>> action,
    CancellationToken cancellationToken)
{
    await _gate.WaitAsync(cancellationToken);

    try
    {
        return await action(cancellationToken);
    }
    finally
    {
        _gate.Release();
    }
}
```

Production resilience libraries provide richer concurrency limiting and queue behavior.

The architectural idea is resource isolation.

## Thread Pools Are Not the Boundary

Modern async .NET avoids tying every request to a dedicated thread.

But async systems can still exhaust:

- sockets;
- DB connections;
- memory;
- downstream capacity;
- queued work.

Bulkheads remain relevant.

## Connection Pools

Separate connection pools can act as bulkheads.

For example:

```text
critical transactional DB work
```

should not necessarily compete for every connection with:

```text
slow reporting queries
```

Sometimes separate databases or replicas provide an even stronger boundary.

## Workload Isolation

Bulkheads can separate:

```text
interactive traffic
background jobs
batch imports
```

A massive import should not make checkout unusable.

Different worker pools or queues can enforce that separation.

## Tenant Isolation

In multi-tenant systems, one noisy tenant can consume shared capacity.

Per-tenant limits can act as a bulkhead:

```text
Tenant A cannot consume 100% of worker concurrency.
```

Be careful with fairness and unused-capacity policies.

## Bulkhead + Circuit Breaker

They solve different problems.

```text
Circuit Breaker
  dependency is failing
  stop calls temporarily

Bulkhead
  dependency/workload may consume too much
  limit its resource share
```

They often work together.

## Bulkhead + Rate Limiting

Rate limiting controls arrival rate.

Bulkhead controls concurrent resource usage.

A service may need both.

```text
100 requests/sec
```

can still be dangerous if each request lasts 30 seconds.

Concurrency is the critical resource then.

## Queue Size

A bulkhead with an enormous waiting queue can simply move the outage into memory.

Bound the queue.

When full, reject quickly or degrade.

Backpressure is healthier than infinite waiting.

## Critical vs. Optional Dependencies

Give critical work protected capacity.

```text
Checkout
  payment capacity protected

Homepage
  recommendations capacity bounded
```

Optional functionality should not be allowed to starve core business operations.

## Observability

Track:

```text
active concurrency
queue depth
queue wait time
rejections
execution duration
dependency
tenant/workload
```

Bulkhead rejection is a capacity signal.

## Testing

Load-test isolation.

```text
saturate Recommendations
verify Checkout remains healthy
```

Unit tests alone cannot prove resource isolation under pressure.

## When It Helps

Use Bulkhead when:

- workloads share finite resources;
- one dependency can become slow;
- optional work must not starve critical work;
- multi-tenant fairness matters.

## When It Hurts

Too many tiny partitions can waste capacity and create configuration overhead.

Isolation should correspond to meaningful failure domains.

## Summary

Bulkhead limits the blast radius of overload.

Circuit Breaker isolates a failing dependency over time.

Bulkhead isolates resource consumption at the same time.

The goal is not to prevent every failure.

It is to prevent one failure from becoming everyone's failure.
