---
title: "Competing Consumers: Scaling Work Horizontally"
slug: "competing-consumers"
description: "Process queued work with multiple independent workers, while handling at-least-once delivery, ordering constraints, poison messages, concurrency, and partitioning in modern .NET."
series: "Modern Application Architecture Patterns in .NET"
volume: 2
category: "Messaging & Event-Driven Architecture"
order: 23
dotnet: "10"
csharp: "14"
status: "draft"
---

# Competing Consumers: Scaling Work Horizontally

Competing Consumers lets multiple workers read from the same queue, with each message handled by one available consumer.

```text
            Queue
      ┌──────┼──────┐
      v      v      v
   Worker  Worker  Worker
```

This is a fundamental scale-out pattern for asynchronous workloads.

## The Problem

One worker processes:

```text
100 messages/sec
```

but producers create:

```text
600 messages/sec
```

Backlog grows forever.

Adding consumers can increase throughput without changing the producer.

## One Message, One Consumer

Unlike Publish/Subscribe:

```text
event -> many subscriptions
```

Competing Consumers is:

```text
one queue -> many workers
one message -> one worker
```

The workers compete for available messages.

## Horizontal Scaling

If work is independent:

```text
1 worker  -> 100 msg/s
3 workers -> ~300 msg/s
6 workers -> ~600 msg/s
```

Real scaling is rarely perfectly linear, but the model is straightforward.

## At-Least-Once Delivery

A worker may process a message successfully and crash before acknowledging it.

The broker may deliver it again.

Therefore:

```text
same message
can arrive more than once
```

This is normal.

Idempotent Consumer becomes essential.

## Ordering Trade-Off

Parallelism conflicts with strict ordering.

If:

```text
Message A
Message B
Message C
```

must be processed in exactly that order, unrestricted competing consumers may violate the requirement.

Partition or session by business key:

```text
Order 42 -> partition X
Order 43 -> partition Y
```

Now different orders process concurrently while preserving per-order sequencing.

## Work Item Identity

Every message should carry stable identity:

```csharp
public sealed record ProcessShipment(
    Guid MessageId,
    Guid ShipmentId);
```

The identity supports deduplication, tracing, and diagnosis.

## Visibility / Lock Duration

Many brokers temporarily hide or lock a message while a consumer processes it.

If processing exceeds the lock duration:

```text
worker still processing
broker thinks lease expired
message delivered again
```

Long-running handlers must renew locks or redesign work into smaller units.

## Poison Messages

Some messages fail every time:

```text
invalid payload
unsupported version
missing required reference
permanent business rejection
```

Retrying forever wastes capacity.

After a bounded number of attempts, move them to a Dead Letter Queue.

## Concurrency Limits

More workers are not always better.

Downstream systems may have finite capacity.

```text
100 workers
   |
   v
database melts
```

Use bounded concurrency based on measured downstream capacity.

## Backpressure

A queue itself provides a form of backpressure.

Producers can continue briefly while consumers lag.

But queue depth is not infinite.

Monitor:

```text
depth
oldest-message age
ingress rate
egress rate
```

Queue-Based Load Leveling builds on this idea directly.

## Idempotent Handler

A handler should tolerate duplicate delivery.

```csharp
if (await inbox.HasProcessedAsync(
    message.MessageId,
    cancellationToken))
{
    return;
}
```

Then perform work and persist deduplication state atomically where possible.

We will cover Inbox / Idempotent Consumer in depth shortly.

## Worker Services in .NET

A modern .NET worker can run as a hosted service:

```csharp
public sealed class ShipmentWorker(
    IMessageReceiver receiver)
    : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        await foreach (var message in receiver.ReadAllAsync(
            stoppingToken))
        {
            await HandleAsync(message, stoppingToken);
        }
    }
}
```

The transport specifics depend on the broker.

The architectural pattern does not.

## Observability

Measure:

```text
queue depth
consumer count
processing latency
success/failure rate
retry rate
dead-letter rate
oldest-message age
```

Throughput without latency visibility is misleading.

## Autoscaling

Competing Consumers works naturally with queue-based autoscaling.

For example:

```text
if queue depth rises:
    add workers

if queue drains:
    remove workers
```

Scale carefully to avoid stampedes against downstream systems.

## Testing

Test:

```text
multiple workers do not double-commit one message
duplicate delivery is safe
poison messages dead-letter
ordering guarantees hold where required
shutdown does not abandon work incorrectly
```

## When It Helps

Use Competing Consumers when:

- queued work is independently processable;
- throughput needs horizontal scale;
- asynchronous latency is acceptable;
- one worker is a bottleneck.

## When It Hurts

It hurts when:

- strict global ordering is required;
- handlers are not idempotent;
- downstream systems cannot absorb parallelism;
- work items contend on the same shared resource.

## Summary

Competing Consumers turns one queue into a scalable pool of workers.

The gain is throughput and elasticity.

The cost is distributed concurrency: duplicate delivery, ordering boundaries, poison messages, lease behavior, and downstream pressure must all be designed deliberately.
