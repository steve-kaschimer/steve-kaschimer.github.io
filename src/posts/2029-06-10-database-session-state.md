---
author: Steve Kaschimer
date: 2029-06-10
image: /images/posts/2029-06-10-hero.webp
image_alt: "A token glyph anchored inside a cylindrical database shape, implying session state given durable storage rather than living only in application memory."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small amber token glyph anchored inside a teal cylinder shape representing a database, with a faint off-white expiration-clock accent near the cylinder's base, implying session state given durable, shared storage rather than living only in application memory. Mood is durable and shared. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Database Session State stores conversational session data in a database - a specialized form of server-side session that makes it available to every application instance without sticky routing. Covers EF Core persistence for typed session records, cleanup jobs for expired rows, and the important boundary: session state supports a conversation, it shouldn't quietly become the system of record."
tags: ["dotnet", "architecture", "design-patterns", "data-access"]
title: "Database Session State in Modern .NET"
---

Database Session State stores conversational session data in a database.

It is a specialized form of server-side session state where the database
becomes the shared persistence mechanism.

## Why Put Session State in a Database?

A database can make session state available to every application
instance:

``` text
Browser
   |
Load Balancer
   |
App A ----\
App B ----- Database Session Store
App C ----/
```

No sticky routing is required.

The state can also survive application-process restarts.

## A Simple Schema

Conceptually:

``` text
Sessions
--------------------------------
SessionId
Payload
CreatedAt
LastAccessedAt
ExpiresAt
```

The payload may be serialized JSON or a more structured relational
representation.

## A Typed Session Record

For an application-specific workflow:

``` csharp
public sealed class CheckoutSession
{
    public Guid Id { get; private set; }

    public CustomerId? CustomerId { get; private set; }

    public CartId CartId { get; private set; }

    public CheckoutStep CurrentStep { get; private set; }

    public DateTimeOffset ExpiresAt { get; private set; }
}
```

Unlike a generic key/value session bag, this makes the stored
conversation explicit.

## EF Core Persistence

``` csharp
public sealed class CheckoutSessionConfiguration
    : IEntityTypeConfiguration<CheckoutSession>
{
    public void Configure(
        EntityTypeBuilder<CheckoutSession> builder)
    {
        builder.ToTable("CheckoutSessions");
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.ExpiresAt);
    }
}
```

The expiration index supports cleanup jobs.

## Generic Payload Storage

A generic store may serialize state:

``` csharp
public sealed record SessionEnvelope(
    string SessionId,
    string Payload,
    DateTimeOffset ExpiresAt);
```

JSON keeps the schema flexible, but internal fields become harder to
constrain and query.

The same Embedded Value vs. Serialized LOB trade-offs appear here.

## Durability Is Not Domain Persistence

Because session state is in a database, it can look authoritative.

That is dangerous.

A checkout session might remember:

``` text
selected shipping option
current wizard step
temporary form state
```

but the actual order, payment, inventory reservation, and customer
records still belong in their proper domain tables.

Database Session State supports a conversation. It should not quietly
become the system of record.

## Cleanup

Expired sessions accumulate unless they are removed.

A background process can periodically delete:

``` sql
DELETE FROM Sessions
WHERE ExpiresAt < @now;
```

Production systems should consider batching, indexes, and database load
rather than issuing enormous cleanup transactions.

## Concurrency

Multiple requests can update the same session row.

A concurrency token can prevent lost updates:

``` csharp
builder.Property(x => x.Version)
    .IsRowVersion();
```

The same Optimistic Offline Lock concepts apply.

## Database vs. Distributed Cache

A database may provide:

-   durability,
-   transactional behavior,
-   familiar operational tooling,
-   queryability.

A distributed cache may provide:

-   lower latency,
-   automatic expiration,
-   reduced load on the primary relational database.

The correct choice depends on how valuable the session state is and how
frequently it is accessed.

## ASP.NET Core Integration

ASP.NET Core session storage is built around `IDistributedCache`.

A database-backed distributed-cache provider can therefore be used
underneath the framework's session feature.

Alternatively, application-specific session records can be modeled
directly with EF Core when the state has meaningful structure and
lifecycle.

## Avoid Hot Rows

If every request updates `LastAccessedAt`, high-volume systems can
create unnecessary write pressure.

Consider whether every read truly needs to become a write.

Session infrastructure should be designed for the expected request
volume.

## Security

Database session records may contain user-specific information.

Apply normal controls:

-   least-privilege database access,
-   retention limits,
-   encryption where appropriate,
-   careful logging,
-   protection of session identifiers.

## Testing

Test:

-   expiration,
-   cleanup,
-   concurrent updates,
-   application restarts,
-   multiple application instances,
-   malformed serialized payloads,
-   database unavailability.

## When to Use It

Database Session State fits when session information must be shared
across servers and database durability or transactional behavior is
useful.

## When to Use Something Else

For tiny, disposable, high-volume session data, a distributed cache may
be a better operational fit.

For durable business state, model the business concept directly rather
than calling it session.

## Related Patterns

-   Server Session State
-   Client Session State
-   Optimistic Offline Lock
-   Serialized LOB

## Summary

Database Session State puts conversational state in a shared durable
store.

It can simplify scale-out and recovery, but it also adds database
writes, cleanup, concurrency, and retention concerns.

The most important boundary remains conceptual: session state supports a
conversation; it is not automatically business truth.
