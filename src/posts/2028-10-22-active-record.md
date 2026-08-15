---
author: Steve Kaschimer
date: 2028-10-22
image: /images/posts/2028-10-22-hero.webp
image_alt: "A single fused glyph combining a small grid segment and a circular shape merged seamlessly into one continuous outline, implying data and behavior deliberately combined in one object."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single fused glyph where a small amber grid segment and a teal circular shape merge seamlessly into one continuous outline with no visible seam, implying data storage and behavior deliberately combined into one object. Mood is unified and pragmatic. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Active Record combines a data record, persistence operations, and domain behavior in the same object - `customer.ChangeEmail(...)` then `customer.SaveAsync()` - reducing indirection for domains that closely match their relational schema. Covers why typical EF Core code is conceptually closer to Data Mapper than true Active Record, and when the combined responsibility becomes awkward as a domain grows."
tags: ["dotnet", "architecture", "design-patterns", "data-access"]
title: "Active Record in Modern .NET"
---

Active Record combines a data record, persistence operations, and domain
behavior in the same object.

The resulting programming model is appealing:

``` csharp
var customer = await Customer.FindAsync(id, cancellationToken);
customer.ChangeEmail(newEmail);
await customer.SaveAsync(cancellationToken);
```

## The Pattern

``` csharp
public sealed class Subscription
{
    public int Id { get; private set; }
    public SubscriptionStatus Status { get; private set; }

    public void Cancel()
    {
        if (Status == SubscriptionStatus.Expired)
            throw new InvalidOperationException(
                "An expired subscription cannot be cancelled.");

        Status = SubscriptionStatus.Cancelled;
    }

    public Task SaveAsync(CancellationToken cancellationToken)
    {
        // Persist this record.
    }
}
```

The object understands both the business operation and its own
persistence.

## Why Active Record Is Attractive

For domains that closely match their relational schema, Active Record
reduces indirection. Developers do not have to jump between an entity,
mapper, repository, and unit of work for a simple operation.

That simplicity can be a major productivity advantage.

## Active Record vs. Row Data Gateway

Row Data Gateway emphasizes persistence operations. Active Record adds
meaningful domain behavior.

``` csharp
// Row Data Gateway
await row.UpdateStatusAsync("Cancelled", ct);

// Active Record
subscription.Cancel();
await subscription.SaveAsync(ct);
```

## Active Record vs. Domain Model

Active Record works best when objects map fairly directly to records.
Rich Domain Models may contain aggregates, value objects, object graphs,
and concepts that do not map one-to-one to tables.

As that gap grows, having domain objects own persistence becomes
awkward. Data Mapper addresses that problem.

## Is EF Core Active Record?

Usually, no.

Typical EF Core code looks like:

``` csharp
var order = await db.Orders.FindAsync([id], cancellationToken);
order!.Submit();
await db.SaveChangesAsync(cancellationToken);
```

The entity does not save itself. Persistence is coordinated externally,
which is conceptually closer to Data Mapper.

## Testing

Business behavior can remain easy to unit test when state-changing
methods do not automatically write to the database:

``` csharp
[Fact]
public void Cancelling_changes_status()
{
    var subscription = SubscriptionFixture.Active();

    subscription.Cancel();

    Assert.Equal(
        SubscriptionStatus.Cancelled,
        subscription.Status);
}
```

Persistence behavior still deserves integration tests.

## When to Use It

Active Record fits well when:

-   the domain is simple,
-   objects closely resemble database rows,
-   CRUD is common,
-   business rules are modest,
-   reducing architectural ceremony is valuable.

## When Not to Use It

Consider Data Mapper when domain objects differ significantly from
tables, aggregates span multiple structures, persistence complicates
domain behavior, or the model needs to remain independent of a database.

## Trade-offs

Active Record's strength and weakness are the same: it combines
responsibilities. That makes simple applications simpler, but can make
complex domains harder to evolve.

## Related Patterns

-   Row Data Gateway
-   Data Mapper
-   Transaction Script
-   Domain Model

## Summary

Active Record is a legitimate architectural choice. When domain concepts
and database records align closely, combining behavior and persistence
can produce remarkably clear code. The question is whether that
alignment remains an advantage as the system grows.
