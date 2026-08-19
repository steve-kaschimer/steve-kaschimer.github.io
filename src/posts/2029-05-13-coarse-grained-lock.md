---
author: Steve Kaschimer
date: 2029-05-13
image: /images/posts/2029-05-13-hero.webp
image_alt: "One large padlock glyph encompassing several small distinct shapes together inside its outline, implying a single lock protecting an entire related group at once."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one large amber padlock outline drawn around three small teal shapes clustered together inside it, implying a single lock protecting an entire related group of objects at once rather than each one separately. Mood is grouped and protective. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Coarse-Grained Lock protects a set of related objects with one lock, rather than independently locking every object that participates in a consistency boundary - a customer and its several addresses, locked as one. Covers aggregate versioning as the natural implementation, and the real trade-off: simpler consistency in exchange for less fine-grained concurrency."
tags: ["dotnet", "architecture", "design-patterns", "concurrency"]
title: "Coarse-Grained Lock in Modern .NET"
---



Coarse-Grained Lock protects a set of related objects with one lock. Instead of independently locking every object that participates in a consistency boundary, the application chooses one root object or lock record to represent the entire group.

## The Problem

Consider a customer and several addresses:
``` text
Customer
  |- Billing Address
  |- Shipping Address
  |- Contact Address
```

If those objects are normally edited as one logical unit, locking each row independently creates complexity. Which rows must be locked? What if another related object is added later? What if one transaction locks the customer first and another locks an address first? A single coarse-grained lock can represent the whole consistency boundary.

## Aggregate Versioning

In a domain model, an aggregate root is a natural place for a coarse-grained optimistic lock.
``` csharp
public sealed class Customer
{
    private readonly List<Address> _addresses = [];

    public CustomerId Id { get; private set; }

    public IReadOnlyCollection<Address> Addresses =>
        _addresses;

    public byte[] Version { get; private set; } = [];
}
```

Configure the root version:
``` csharp
builder.Property(x => x.Version)
    .IsRowVersion();
```

A change anywhere in the aggregate can be made to participate in the root's concurrency boundary.

## Why One Lock?

The goal is not merely fewer locks. It is to make the lock match the business consistency boundary. If customer and addresses must be changed consistently, then:
``` text
Customer 42
```

can be the thing we lock rather than:
``` text
Customer 42
Address 100
Address 101
Address 102
```

The application no longer needs to discover every member before it can reason about concurrency.

## Pessimistic Coarse-Grained Lock

The same idea works with Pessimistic Offline Lock. A logical lock record might be:
``` text
ResourceType = "CustomerAggregate"
ResourceId   = "42"
Owner        = "user-123"
ExpiresAt    = ...
```

Editing any address requires ownership of the customer aggregate lock. One lock protects many objects.

## Lock Roots

A useful concept is the **lock root**.
``` csharp
public readonly record struct LockResource(
    string Type,
    string Id);
```

Then child objects resolve to the same resource:
``` csharp
LockResource For(Address address)
    => new(
        "Customer",
        address.CustomerId.Value.ToString());
```

The lock manager does not need a separate lock per child.

## Coarse-Grained Lock and Aggregates

The pattern aligns naturally with Domain-Driven Design aggregates. An aggregate already defines a transactional consistency boundary. Using the aggregate root as the concurrency boundary often gives the persistence model the same semantics. But do not assume every object graph should become one giant lock. The lock boundary should follow actual consistency requirements.

## The Cost of Coarseness

Suppose two users edit unrelated addresses for the same customer. With one customer-level lock:
``` text
Alice edits Shipping Address
Bob edits Contact Address
```

Bob may be blocked or receive a conflict even though the edits do not overlap. That is the central trade-off:
``` text
Coarser lock
= simpler consistency
+ fewer lock objects
- less concurrency
```

## Choosing Granularity

Possible boundaries might be:
``` text
Entire Account
Customer
Order
Order Shipment
Individual Line
```

Too fine:
-   more lock management,
-   more deadlock opportunities,
-   harder completeness guarantees.

Too coarse:
-   unnecessary conflicts,
-   lower throughput,
-   frustrated users.

Choose the smallest boundary that accurately represents the business consistency requirement.

## EF Core Considerations

EF Core concurrency tokens operate on mapped rows. If several tables form one aggregate, you may need to deliberately update the root's version whenever a child changes so the root token represents the entire aggregate. That might mean touching a root property:
``` csharp
customer.MarkChanged(timeProvider.GetUtcNow());
```

or using an application-managed version token. The exact strategy depends on the schema and provider.

## Application-Managed Version

A GUID can act as the aggregate version:
``` csharp
public Guid Version { get; private set; }

private void Touch()
{
    Version = Guid.CreateVersion7();
}
```

Every aggregate mutation calls `Touch()`. Then:
``` csharp
builder.Property(x => x.Version)
    .IsConcurrencyToken();
```

Now child changes can advance the same logical concurrency token.

## Locking a Large Graph

Coarse-Grained Lock does not mean loading the entire graph merely to lock it. That would defeat part of the pattern's purpose. The lock root or version should let the system protect the group without first materializing every member.

## Testing

Concurrency tests should verify changes to different members of the same group. For optimistic locking:
``` text
Context A loads Customer 42
Context B loads Customer 42

A changes Address 100
A commits

B changes Address 101
B commits

B should conflict if both belong to one lock boundary
```

That test proves the intended granularity.

## When to Use It

Use Coarse-Grained Lock when:
-   related objects form one consistency boundary,
-   individually locking every object is cumbersome,
-   an aggregate root naturally represents the group,
-   simpler lock management is worth reduced concurrency.

## When to Reconsider

A lock may be too coarse if unrelated operations frequently block each other. In that case, revisit the domain boundary rather than simply adding more infrastructure.

## Related Patterns

-   Optimistic Offline Lock
-   Pessimistic Offline Lock
-   Implicit Lock
-   Unit of Work

## Summary

Coarse-Grained Lock protects a group of related objects through one concurrency boundary. In modern .NET, an aggregate root and its version token are often a natural implementation. The pattern deliberately trades some concurrency for simpler and more reliable consistency management.
