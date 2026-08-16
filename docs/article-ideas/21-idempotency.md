---
title: "Idempotency: Making Retries Safe"
slug: "idempotency"
description: "Design HTTP commands and distributed operations so repeated delivery of the same logical request does not repeat harmful effects, using stable operation identity, atomic persistence, replayed responses, and careful expiration."
series: "Modern Application Architecture Patterns in .NET"
volume: 2
category: "Commands, Queries & Data"
order: 21
dotnet: "10"
csharp: "14"
status: "draft"
---

# Idempotency: Making Retries Safe

Distributed systems force us to confront an uncomfortable ambiguity:

> A timeout does not tell us whether the operation failed.

Consider:

```text
Client
  |
POST /payments
  |
Server charges card
  |
response lost
  |
TIMEOUT
```

What should the client do?

Retrying may charge the card twice.

Not retrying may leave the customer uncertain whether payment succeeded.

Idempotency solves the duplicate-effect problem.

## What Idempotent Means

An operation is idempotent when performing the same logical operation multiple times has the same intended effect as performing it once.

```text
Attempt 1 -> create Order 123
Attempt 2 -> return Order 123
Attempt 3 -> return Order 123
```

not:

```text
Attempt 1 -> Order 123
Attempt 2 -> Order 124
Attempt 3 -> Order 125
```

## Natural Idempotency

Some operations are naturally idempotent.

```text
Set shipping preference = Express
```

Repeated execution produces the same state.

Others are not:

```text
Increment balance by $10
Create order
Charge card
Send gift card
```

Those need additional design.

## Idempotency Key

The caller assigns identity to the logical operation:

```text
Idempotency-Key:
01JXYZ...
```

The same retry uses the same key.

A different business operation gets a different key.

The server records the key and outcome.

## Basic Flow

```text
Request + Key
     |
     v
Key already known?
   /          \
 yes           no
  |             |
return prior   execute
result          |
                v
            save result
```

This sounds easy.

Concurrency makes it interesting.

## The Race

Two copies arrive simultaneously:

```text
Request A -> key not found
Request B -> key not found

A charges card
B charges card
```

A simple "check then insert" is not enough.

The idempotency record needs an atomic uniqueness guarantee.

## Persistence Model

For example:

```text
IdempotencyRecords
------------------
Key             UNIQUE
Operation
RequestHash
Status
ResponseCode
ResponseBody
CreatedAt
ExpiresAt
```

The unique key lets the database arbitrate concurrent attempts.

## Scope the Key

An idempotency key should be scoped appropriately.

For example:

```text
tenant + operation + key
```

rather than assuming one globally meaningful string forever.

The exact scope is part of the API contract.

## Bind the Key to the Request

What if a caller accidentally reuses the same key for a different payload?

Store a request fingerprint.

```csharp
public sealed record IdempotencyRecord(
    string Key,
    string RequestHash,
    int ResponseStatus,
    string ResponseBody);
```

If the key exists but the hash differs:

```text
409 Conflict
```

or another explicit contract response may be appropriate.

Do not silently return a result for a different operation.

## Atomicity

Suppose:

```text
Charge card ✓
Save idempotency record ✗
```

A retry can still charge twice.

The strongest design places the protected side effect and idempotency state inside one atomic boundary where possible.

For database-local operations:

```text
BEGIN TRANSACTION
  insert idempotency record
  create order
COMMIT
```

For an external payment provider, use the provider's own idempotency mechanism if available so the remote side effect has stable operation identity too.

## Pending Operations

An idempotency record may need states:

```text
Processing
Succeeded
Failed
```

If another request sees `Processing`, it can:

- wait briefly;
- return a processing response;
- reject concurrent execution.

The correct behavior depends on the API.

## What Response Should Be Replayed?

Often the server stores enough information to reproduce the original logical response:

```text
status code
resource identifier
response body
selected headers
```

A retry then receives the same result instead of executing again.

Be cautious about replaying time-sensitive or sensitive headers blindly.

## Expiration

Keeping every key forever is rarely practical.

Choose a retention window based on:

- client retry behavior;
- business risk;
- operation lifetime;
- storage cost.

Document the guarantee.

If keys expire after 24 hours, a retry after 25 hours may be treated as a new operation.

That is part of the semantics.

## HTTP Methods Do Not Solve This Alone

HTTP defines some methods such as PUT and DELETE with idempotent semantics.

But application implementation still matters.

And many important task-based APIs use POST:

```text
POST /orders
POST /payments/{id}/capture
```

An idempotency key can make those logical operations safe to retry.

## Idempotency vs. Correlation ID

They are different.

```text
Correlation ID
    -> trace related work

Idempotency Key
    -> identify one logical operation
       so effects are not duplicated
```

A system may carry both.

Current Azure architecture guidance explicitly discusses using correlation IDs for tracing and idempotency keys for safe retries across services.

## Commands

Command identity is a natural fit:

```csharp
public sealed record CommandEnvelope<T>(
    Guid OperationId,
    T Command);
```

The receiver records processed operation IDs.

Microsoft's .NET architecture guidance similarly demonstrates wrapping commands with an identity so duplicate delivery can be detected.

## Messaging

Idempotency becomes even more important with message brokers because **at-least-once delivery means duplicates are normal**.

```text
Broker
 |
Message #42
 |
Consumer processes
 |
ack lost
 |
Message #42 delivered again
```

The consumer must safely recognize or tolerate the duplicate.

That becomes the Inbox / Idempotent Consumer pattern later in Volume II.

## Idempotent State Transitions

Sometimes the domain can help.

Instead of:

```text
Add $100 payment
```

model:

```text
Apply PaymentId 784
```

The aggregate can remember processed payment identities or enforce a unique payment relationship.

Business identity can be stronger than generic technical deduplication.

## Observability

Measure:

- duplicate request count;
- key conflicts;
- in-progress collisions;
- replay count;
- expired-key retries;
- idempotency-store failures.

A rising duplicate rate may indicate client timeout or network problems elsewhere.

## Security

Do not let attackers use predictable keys to retrieve another user's prior response.

Scope keys to authenticated principals/tenants and authorize every retry exactly as you would the original request.

Do not treat possession of the key as authorization.

## Testing

Important tests include:

```text
same key + same request -> one effect

same key + different request -> conflict

two concurrent requests -> one effect

retry after response loss -> same result

expired key -> documented behavior
```

Concurrency testing matters.

A sequential unit test does not prove atomic deduplication.

## When It Helps

Idempotency is essential when:

- clients retry commands;
- operations have expensive or dangerous duplicate effects;
- networks introduce ambiguous outcomes;
- brokers provide at-least-once delivery;
- workflows cross service boundaries.

## When It Hurts

Do not add a persistent idempotency subsystem to every trivial operation.

It introduces:

- storage;
- retention;
- concurrency;
- response replay;
- security;
- cleanup.

Use it where duplicate execution has meaningful consequences.

## How It Relates to What Comes Next

Idempotency is the hinge between application architecture and distributed architecture.

Soon we will have:

```text
Transactional Outbox
      |
at-least-once publication
      |
duplicate message possible
      |
Idempotent Consumer / Inbox
```

That is not an implementation accident.

It is how reliable distributed systems are built when "exactly once" cannot simply be assumed.

## Summary

Retries are unavoidable.

Duplicate effects are not.

Give important operations stable identity, enforce that identity atomically, replay prior outcomes when appropriate, and make the idempotency guarantee part of the contract.

Once the application crosses a network boundary, idempotency stops being an optimization and becomes a core correctness tool.
