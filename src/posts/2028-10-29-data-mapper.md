---
author: Steve Kaschimer
date: 2028-10-29
image: /images/posts/2028-10-29-hero.webp
image_alt: "A circular glyph and a grid glyph positioned apart with visible space between them, connected only by a single thin mapping line, implying two models kept deliberately independent."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a teal circular glyph and an amber grid glyph positioned with clear open space between them, connected only by one thin off-white line, implying two models deliberately kept independent and translated between rather than merged. Mood is deliberate and boundary-respecting. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Data Mapper separates the in-memory object model from the database entirely - domain objects don't need to know which tables contain their data or when an INSERT happens. One of the most important patterns in the whole catalog for modern .NET, because EF Core implements so much of it directly."
tags: ["dotnet", "architecture", "design-patterns", "data-access"]
title: "Data Mapper in Modern .NET"
---



Data Mapper separates the in-memory object model from the database. Domain objects do not need to know which database stores them, which tables contain their data, how SQL is generated, or when an `INSERT` or `UPDATE` occurs. For modern .NET developers, this is one of the most important patterns in Fowler's catalog because Entity Framework Core implements many of its ideas.

## The Problem

An object that saves itself can work well when one object maps directly to one table. But a rich order might contain lines, addresses, money values, discounts, and domain events spread across several relational structures. Forcing the domain to understand those storage decisions mixes business knowledge with persistence knowledge.

## A Persistence-Ignorant Domain Object

``` csharp
public sealed class Order
{
    private readonly List<OrderLine> _lines = [];

    public OrderId Id { get; private set; }
    public OrderStatus Status { get; private set; }
    public IReadOnlyCollection<OrderLine> Lines => _lines;

    public void Submit()
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException(
                "Only draft orders can be submitted.");

        if (_lines.Count == 0)
            throw new InvalidOperationException(
                "An order must contain at least one line.");

        Status = OrderStatus.Submitted;
    }
}
```

Nothing here mentions SQL or EF Core.

## Mapping With EF Core

Persistence configuration can live elsewhere:
``` csharp
public sealed class OrderConfiguration
    : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
            .HasConversion<string>();

        builder.HasMany(x => x.Lines)
            .WithOne()
            .HasForeignKey("OrderId");
    }
}
```

The domain and relational representation can evolve with less direct coupling.

## EF Core as Data Mapper

A `DbContext` combines behavior associated with several patterns, including Data Mapper, Unit of Work, Identity Map, and change tracking.
``` csharp
var order = await db.Orders
    .Include(x => x.Lines)
    .SingleAsync(x => x.Id == orderId, cancellationToken);

order.Submit();

await db.SaveChangesAsync(cancellationToken);
```

The object changes itself. EF Core determines how to persist that change.

## Data Mapper vs. Active Record

Active Record:
``` csharp
order.Submit();
await order.SaveAsync(cancellationToken);
```

Data Mapper:
``` csharp
order.Submit();
await db.SaveChangesAsync(cancellationToken);
```

The difference is small syntactically but significant architecturally: persistence is no longer the responsibility of `Order`.

## Data Mapper and Repository

A Repository may provide a domain-oriented interface over mapped objects:
``` csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(
        OrderId id,
        CancellationToken cancellationToken);
}
```

Repository and Data Mapper solve different problems. Data Mapper handles object-relational persistence; Repository provides a domain-oriented collection abstraction. You do not automatically need both.

## Value Objects and Mapping

A domain can use a type such as:
``` csharp
public readonly record struct Money(
    decimal Amount,
    string Currency);
```

while the database stores amount and currency in separate columns. Mapping lets each representation use the shape best suited to its job.

## Persistence Ignorance Has Limits

An ORM still imposes constraints around keys, constructors, navigation properties, change tracking, and query translation. The goal is useful separation - not pretending persistence has zero influence on design.

## Read Models

A rich write model does not have to be reconstructed for every query. EF Core can project directly into a read model:
``` csharp
var summaries = await db.Orders
    .Where(x => x.Status == OrderStatus.Submitted)
    .Select(x => new OrderSummary(
        x.Id,
        x.Customer.Name,
        x.Lines.Count))
    .ToListAsync(cancellationToken);
```

This avoids loading a full aggregate simply to display a summary.

## Testing

Domain behavior can be unit-tested without a database. Mapping should be integration-tested by persisting and reloading important object graphs against the actual database technology.

## When to Use It

Data Mapper is a strong choice when the object model differs from the relational model, business behavior is complex, aggregates span tables, or an ORM already provides mature mapping infrastructure.

## When Not to Use It

For simple CRUD, Active Record or explicit SQL with gateways may provide a smaller and clearer architecture.

## Trade-offs

Data Mapper buys persistence independence at the cost of mapping configuration, ORM behavior, tracking concerns, loading strategies, and query-translation complexity. It moves complexity rather than eliminating it.

## Related Patterns

-   Domain Model
-   Unit of Work
-   Identity Map
-   Lazy Load
-   Repository
-   Metadata Mapping

## Summary

Data Mapper lets the domain describe the business without making domain objects responsible for storage. In modern .NET, EF Core makes this style so accessible that developers often use Data Mapper ideas without naming them. Understanding the pattern sets us up for Unit of Work, Identity Map, Lazy Load, and Repository.
