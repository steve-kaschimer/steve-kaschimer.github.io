---
author: Steve Kaschimer
date: 2029-05-06
image: /images/posts/2029-05-06-hero.webp
image_alt: "A single solid closed padlock glyph with no gaps or openings, implying exclusive ownership deliberately established before any work is allowed to begin."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single solid amber padlock glyph rendered fully closed with no visible gap, positioned centrally against the dark background, implying exclusive ownership deliberately established and held before any protected work is allowed to begin. Mood is exclusive and deliberate. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Pessimistic Offline Lock prevents conflicting business transactions by requiring a logical lock before work begins - not a database row lock held for milliseconds, but an application-level lease that can survive across multiple requests and fifteen minutes of a user reviewing documents. Covers atomic acquisition, lease expiration, and the distributed-systems problems - the ABA problem included - that come with it."
tags: ["dotnet", "architecture", "design-patterns", "concurrency"]
title: "Pessimistic Offline Lock in Modern .NET"
---



Pessimistic Offline Lock prevents conflicting business transactions by requiring a transaction to acquire a logical lock before it begins working with shared data. The assumption is pessimistic:
> Conflicts are likely or expensive enough that we should prevent
> competing work rather than discover the conflict at the end.

This is different from simply holding a database row lock for a few milliseconds. The "offline" part matters.

## Why Database Transactions Are Not Enough

Imagine a user starts editing a complex insurance claim. The workflow may take fifteen minutes:
``` text
GET claim
User reviews documents
User edits values
User checks supporting records
User submits
```

Holding a database transaction and row lock for fifteen minutes is usually a terrible idea. Connections, locks, and transactions are designed for short system transactions - not human think time. Pessimistic Offline Lock therefore uses a logical application lock that can survive across multiple requests.

## A Lock Record

One approach is a dedicated table:
``` text
OfflineLocks
-----------------------------------------
ResourceType
ResourceId
OwnerId
AcquiredAt
ExpiresAt
```

A lock might mean:
``` text
ResourceType = "Claim"
ResourceId   = "7f..."
OwnerId      = "user-123"
ExpiresAt    = "2026-08-14T23:15:00Z"
```

Before editing, the application attempts to acquire that lock.

## A Lock Service

``` csharp
public interface IOfflineLockManager
{
    Task<LockLease?> TryAcquireAsync(
        string resourceType,
        string resourceId,
        string ownerId,
        TimeSpan duration,
        CancellationToken cancellationToken);

    Task ReleaseAsync(
        LockLease lease,
        CancellationToken cancellationToken);
}
```

The API is deliberately about application-level resources rather than database rows.

## Atomic Acquisition

The crucial requirement is that acquisition itself be race-safe. This is not sufficient:
``` text
SELECT lock
if none:
    INSERT lock
```

Two callers can both observe "none" before either inserts. Use a database constraint and an atomic insert/update strategy so only one owner can successfully acquire the lock. For example, a unique key can protect:
``` text
(ResourceType, ResourceId)
```

and the acquisition code can handle the loser as "lock unavailable."

## Lease Expiration

Locks can be abandoned. A browser closes. A process crashes. A network connection disappears. Therefore logical locks often need an expiration:
``` csharp
public sealed record LockLease(
    string ResourceType,
    string ResourceId,
    string OwnerId,
    DateTimeOffset ExpiresAt);
```

An expired lease can eventually be reclaimed. Without expiration or administrative recovery, stale locks can block work indefinitely.

## Renewing a Lease

Long workflows may renew the lock periodically. Conceptually:
``` text
Acquire for 5 minutes
Work continues
Renew for another 5 minutes
Work continues
Release
```

Renewal must verify ownership so one client cannot extend another client's lease.

## Ownership Tokens

An owner ID alone may not be enough. A random lease token can make ownership stronger:
``` csharp
public sealed record LockLease(
    Guid LeaseToken,
    string ResourceType,
    string ResourceId,
    DateTimeOffset ExpiresAt);
```

Release and renewal operations require the token. This reduces accidental unlocks by unrelated sessions belonging to the same user.

## The ABA Problem

Consider:
``` text
Client A gets lock
Client A pauses
Lock expires
Client B gets lock
Client A wakes up and writes
```

Client A still believes it owns the resource. A robust design should validate the lease or use a fencing token before committing protected work. A monotonically increasing fencing value can let the storage layer reject writes from an older lease. This is especially important in distributed systems.

## Pessimistic Offline Lock vs. Database Lock

A short database transaction can use locking isolation:
``` csharp
await using var transaction =
    await db.Database.BeginTransactionAsync(
        IsolationLevel.Serializable,
        cancellationToken);
```

Depending on the database and isolation level, locks may prevent concurrent modifications while the transaction is active. That is appropriate for short, immediate work. It should not be confused with keeping a logical lock across a multi-request user workflow.

## EF Core Support

EF Core has first-class optimistic concurrency support through concurrency tokens. It does not provide a provider-independent high-level API for Pessimistic Offline Lock. Database-specific row-lock syntax may require raw SQL or provider-specific techniques. Application-level offline locks are normally modeled explicitly.

## A Claim Editing Endpoint

``` csharp
app.MapPost(
    "/claims/{id:guid}/edit-session",
    async (
        Guid id,
        ClaimsPrincipal user,
        IOfflineLockManager locks,
        CancellationToken ct) =>
    {
        var ownerId =
            user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException();

        var lease = await locks.TryAcquireAsync(
            "Claim",
            id.ToString(),
            ownerId,
            TimeSpan.FromMinutes(5),
            ct);

        return lease is null
            ? Results.Conflict()
            : Results.Ok(lease);
    });
```

The user begins editing only after acquiring the logical lock.

## User Experience

Pessimistic locking should communicate clearly:
``` text
This claim is currently being edited by another user.
```

Depending on the domain, you might also show:
-   who owns the lock,
-   when it expires,
-   whether read-only viewing is allowed,
-   whether an administrator can override it.

Locking is partly a UX concern because it changes what users are allowed to do.

## Deadlocks at the Application Level

If a workflow needs several locks, ordering matters. Imagine:
``` text
Transaction A locks Customer, then Order
Transaction B locks Order, then Customer
```

Each can wait for the other. A consistent lock acquisition order can reduce deadlock risk:
``` text
Always Customer -> Order
```

Keep the lock scope as small and coherent as the business requirement permits.

## Lock Granularity

Locking an entire customer may be too broad. Locking every individual field may be absurdly narrow. Possible resources include:
``` text
Customer
Order
Claim
Account
Document
```

The next pattern, Coarse-Grained Lock, addresses the idea of protecting a group of related objects with one lock.

## Failure Handling

Lock acquisition is not the only failure mode. Also plan for:
-   lease expiration during work,
-   release failure,
-   process crashes,
-   clock assumptions,
-   duplicate requests,
-   network partitions,
-   administrative overrides.

Distributed locks are deceptively subtle. If the business can tolerate optimistic conflict detection, it is often simpler.

## Testing

Test at least:
``` text
A acquires
B cannot acquire

A releases
B can acquire

A expires
B can acquire

A cannot renew B's lease

stale lease cannot overwrite newer ownership
```

Concurrency tests should run against the real coordination store rather than relying only on mocks.

## When to Use It

Pessimistic Offline Lock is appropriate when:
-   conflicts are common,
-   conflicting work is expensive,
-   users should know before investing time,
-   exclusive editing is a real business concept,
-   optimistic retries are unacceptable.

## When to Prefer Optimistic Locking

Prefer Optimistic Offline Lock when conflicts are rare and users can reasonably reload, merge, or retry. Pessimistic locking adds coordination, failure modes, cleanup, and availability concerns.

## Related Patterns

-   Optimistic Offline Lock
-   Coarse-Grained Lock
-   Implicit Lock
-   Unit of Work

## Summary

Pessimistic Offline Lock reserves a logical business resource before a long-running transaction begins. In modern .NET, that usually means explicitly modeling lock ownership and leases rather than holding a database transaction open across requests. It can prevent expensive conflicts, but it introduces its own distributed-systems problems. Use it when the cost of conflicting work justifies the coordination.
