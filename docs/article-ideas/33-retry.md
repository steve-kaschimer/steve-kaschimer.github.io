---
title: "Retry: Recovering From Transient Failure Without Making Things Worse"
slug: "retry"
description: "Use bounded retries for genuinely transient failures, with backoff, jitter, idempotency, retry budgets, cancellation, and careful placement in modern .NET applications."
series: "Modern Application Architecture Patterns in .NET"
volume: 2
category: "Resilience & Performance"
order: 33
dotnet: "10"
csharp: "14"
status: "draft"
---

# Retry: Recovering From Transient Failure Without Making Things Worse

Networks fail.

Services restart.

Connections reset.

A dependency may reject a request for two seconds and work perfectly on the next attempt.

Retry exists for these **transient failures**.

The dangerous misconception is:

> If something fails, try it again.

That is not a resilience strategy.

## Classify the Failure First

Potentially transient:

```text
connection reset
temporary service unavailable
rate limit with retry guidance
brief lock/contention failure
```

Usually not transient:

```text
400 Bad Request
authentication failure
validation failure
card declined
resource does not exist
```

Retrying permanent failure simply repeats failure while adding load.

## Bounded Retry

Never retry forever.

```text
attempt 1
wait
attempt 2
wait longer
attempt 3
give up
```

A bounded policy protects both caller and dependency.

## Backoff

Immediate retry can create a hot loop:

```text
fail -> retry -> fail -> retry
```

Use delay.

Exponential backoff increases that delay between attempts.

```text
100 ms
200 ms
400 ms
```

The exact numbers should come from dependency behavior and latency objectives, not folklore.

## Jitter

If 10,000 clients fail at the same moment and all retry after exactly one second:

```text
dependency recovers
10,000 retries arrive
dependency fails again
```

Add randomness—jitter—to spread retries over time.

## Modern .NET Resilience

Modern .NET applications can compose resilience policies around outbound calls rather than hand-writing loops in every service.

Conceptually:

```csharp
await resiliencePipeline.ExecuteAsync(
    async cancellationToken =>
    {
        await dependency.CallAsync(
            cancellationToken);
    },
    cancellationToken);
```

The important architecture is the policy:

```text
which failures?
how many attempts?
what delay?
what timeout?
is the operation safe to repeat?
```

## Idempotency Comes First

Retrying:

```text
GET /products/42
```

is usually less dangerous than retrying:

```text
POST /payments
```

If the first request succeeded but the response was lost, retrying a non-idempotent command can duplicate the effect.

Before enabling retries on writes, establish operation identity or another idempotency guarantee.

## Respect Server Guidance

If a dependency returns retry guidance such as a `Retry-After` value, respect it where appropriate.

The dependency often knows its recovery or throttling window better than your arbitrary delay.

## Retry Budgets

Retries multiply traffic.

If every request gets three retries:

```text
1,000 failing calls
can become
4,000 total attempts
```

during an outage.

A retry budget limits how much additional traffic the resilience system is allowed to create.

## Retry Placement

Avoid retrying the same failure at every layer:

```text
API retries 3x
service retries 3x
SDK retries 3x
```

One logical operation can explode into dozens of attempts.

Choose the layer that has enough semantic knowledge to retry safely.

## Timeout + Retry

Each attempt needs a timeout.

The entire operation also needs a time budget.

```text
overall budget: 3 seconds

attempt 1: 700 ms
backoff
attempt 2: 700 ms
backoff
attempt 3: remaining budget
```

Do not let retry quietly violate the caller's latency objective.

## Cancellation

Respect `CancellationToken`.

If the caller disconnects or the operation deadline expires, continuing retries may waste resources.

## Database Retry

Some database failures are transient.

But replaying a transaction safely requires care.

If the operation performed an external side effect inside the transaction flow, automatic retry can duplicate that effect.

Keep external calls out of database retry scopes where possible.

## Messaging Retry

Message consumers often retry transient handler failures.

But repeated immediate delivery of a poison message can monopolize a consumer.

Use:

```text
bounded retry
then dead-letter
```

and keep handlers idempotent.

## Observability

Record:

```text
initial attempts
retry attempts
retry success
retry exhaustion
delay
failure classification
dependency
```

A service that "looks healthy" only because 40% of requests succeed on their third attempt is not healthy.

## Testing

Test:

```text
transient failure then success
permanent failure is not retried
retry exhaustion
cancellation
non-idempotent operation is protected
retry-after behavior
```

## When It Helps

Use Retry when:

- failures are genuinely transient;
- another attempt has a reasonable chance of success;
- the operation is safe to repeat;
- added latency is acceptable.

## When It Hurts

Retry hurts when:

- failure is permanent;
- the dependency is overloaded;
- the operation is not idempotent;
- retries exist at several layers;
- retry delays exceed the caller's time budget.

## Summary

Retry is not "try harder."

It is a controlled response to transient failure.

Classify errors, bound attempts, back off with jitter, respect time budgets, and prove that repeating the operation is safe.

When a dependency is persistently unhealthy, stop retrying it.

That is where Circuit Breaker begins.
