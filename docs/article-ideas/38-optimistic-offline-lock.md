---
category: Offline Concurrency Patterns
csharp: 14
description: Prevent lost updates across long-running business
  transactions with EF Core concurrency tokens, SQL Server rowversion,
  conflict handling, and retry strategies.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html"
order: 38
pattern: Optimistic Offline Lock
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: optimistic-offline-lock
status: draft
title: Optimistic Offline Lock in Modern .NET and EF Core
---

# Optimistic Offline Lock in Modern .NET and EF Core

Optimistic Offline Lock allows multiple business transactions to work
with the same data and detects a conflict when one attempts to commit
stale changes.

The assumption is optimistic:

> Conflicts are uncommon enough that allowing concurrent work is better
> than locking data in advance.

This maps extremely well to web applications, where a user may load an
edit page, think for several minutes, and then submit changes.

## The Lost Update Problem

Imagine two users load the same order:

``` text
Database version: 7

Alice loads version 7
Bob loads version 7
```

Alice changes the shipping address and saves:

``` text
Database version: 8
```

Bob then submits a change based on version 7.

Without concurrency protection, Bob's update may overwrite Alice's work.

Optimistic Offline Lock detects that Bob's copy is stale.

## EF Core Concurrency Tokens

EF Core supports optimistic concurrency directly.

On SQL Server, a `rowversion` column is a common choice:

``` csharp
public sealed class Order
{
    public OrderId Id { get; private set; }

    public string PurchaseOrderNumber { get; private set; } = "";

    public byte[] Version { get; private set; } = [];
}
```

Configure it:

``` csharp
builder.Property(x => x.Version)
    .IsRowVersion();
```

EF Core tracks the version originally read from the database.

## What Happens on Update?

Conceptually, EF Core generates an update like:

``` sql
UPDATE Orders
SET PurchaseOrderNumber = @newValue
WHERE Id = @id
  AND Version = @originalVersion;
```

If another transaction changed the row, the original version no longer
matches.

Zero rows are updated.

EF Core interprets that as a concurrency conflict and throws:

``` csharp
DbUpdateConcurrencyException
```

## Handling the Conflict

``` csharp
try
{
    await db.SaveChangesAsync(cancellationToken);
}
catch (DbUpdateConcurrencyException)
{
    throw new OrderConcurrencyException(
        "The order changed while you were editing it.");
}
```

The important architectural decision is what happens next.

Options include:

-   reject and ask the user to reload,
-   reload and retry,
-   merge changes,
-   let the user choose between versions.

There is no universally correct conflict policy.

## Disconnected Web Requests

The interesting case is when the read and write occur in different HTTP
requests.

The client must carry the concurrency token:

``` csharp
public sealed record EditOrderDto(
    Guid Id,
    string PurchaseOrderNumber,
    string Version);
```

For a byte-array row version, the API might represent it as Base64.

When the update returns, the server restores the original concurrency
value before saving.

The exact EF Core mechanics depend on whether the entity is queried
again or attached in a disconnected update workflow.

## Application-Managed Tokens

Not every database has SQL Server-style `rowversion`.

You can use an application-managed token:

``` csharp
public Guid Version { get; private set; }
```

Configure:

``` csharp
builder.Property(x => x.Version)
    .IsConcurrencyToken();
```

Then generate a new value when relevant state changes.

This also gives you control over which changes should cause a conflict.

## Conflict Granularity

A single row-level token means any protected update to the row can
conflict.

That is often desirable because the row represents one consistency
boundary.

But consider two unrelated fields:

``` text
MarketingDescription
InternalReviewNote
```

If independent edits should not conflict, you may need finer-grained
concurrency design or separate persistence boundaries.

Concurrency design should follow business consistency requirements.

## Merge Strategies

When a conflict occurs, three versions can matter:

``` text
Original values
Current proposed values
Database values
```

A merge policy can compare them.

For example, if Alice changed the address while Bob changed a note, both
changes might be preserved.

If both changed the address, the application may require explicit user
resolution.

Automatic merging is a business decision, not merely a persistence
trick.

## Retrying

Automatic retries are appropriate only when repeating the operation is
safe and the business rule can be re-evaluated against fresh data.

A safe retry often means:

``` text
Reload current state
Re-run business decision
Attempt commit again
```

not simply calling `SaveChangesAsync` repeatedly with stale state.

## ExecuteUpdate

Set-based `ExecuteUpdateAsync` does not use EF Core's change tracker, so
automatic concurrency-token handling does not happen in the same way.

You can make the token explicit:

``` csharp
var affected = await db.Orders
    .Where(x =>
        x.Id == id &&
        x.Version == expectedVersion)
    .ExecuteUpdateAsync(
        setters => setters
            .SetProperty(
                x => x.Status,
                OrderStatus.Cancelled),
        cancellationToken);

if (affected == 0)
{
    throw new OrderConcurrencyException();
}
```

The affected-row count becomes the conflict signal.

## HTTP and ETags

HTTP has its own optimistic concurrency vocabulary.

A resource can return an `ETag`:

``` text
ETag: "v8"
```

and require an update to include:

``` text
If-Match: "v8"
```

If the resource changed, the server can reject the request rather than
silently overwriting newer data.

That is Optimistic Offline Lock expressed at the HTTP boundary.

## Transactions Still Matter

Conflict validation and the resulting update need transactional
consistency.

EF Core wraps a normal `SaveChanges` operation in a transaction when the
provider supports transactions.

Long-running user interaction should not be kept inside a database
transaction merely to preserve an edit lock.

That is precisely why offline concurrency patterns exist.

## Testing

Concurrency needs real integration tests.

A useful test uses two contexts:

``` text
Context A loads order
Context B loads order

Context A modifies and saves
Context B modifies and saves

Context B should receive a conflict
```

This verifies the actual database and provider behavior.

## When to Use It

Optimistic Offline Lock is a strong default when:

-   users edit data across multiple requests,
-   conflicts are relatively uncommon,
-   long database locks are undesirable,
-   detecting stale writes is important.

## When It May Be Painful

If contention is frequent and business transactions are expensive,
repeatedly discovering conflicts only at commit time may frustrate
users.

That is where Pessimistic Offline Lock becomes worth considering.

## Related Patterns

-   Pessimistic Offline Lock
-   Coarse-Grained Lock
-   Unit of Work
-   Data Mapper

## Summary

Optimistic Offline Lock allows concurrent work and detects stale writes
at commit time.

EF Core's concurrency tokens make the mechanics straightforward, but the
important design work remains yours: deciding what constitutes a
conflict, how the token crosses disconnected boundaries, and how the
application resolves competing changes.
