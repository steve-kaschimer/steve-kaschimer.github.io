---
author: Steve Kaschimer
date: 2028-12-24
image: /images/posts/2028-12-24-hero.webp
image_alt: "A small shape nested fully inside the boundary of a larger shape, with no part of the smaller shape extending past the larger one's edge, implying a child that has no existence outside its owner."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single large teal outlined shape with one small solid amber shape nested completely inside its boundary, no part of the smaller shape crossing the outer edge, implying a child object with no meaningful existence outside its owner. Mood is contained and owned. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Dependent Mapping lets the mapper for a parent object also handle persistence for child objects that have no independent lifecycle - Fowler's classic example is an album and its tracks. Covers EF Core owned types, and recognizing the aggregate-boundary warning sign of giving a truly dependent child its own standalone repository."
tags: ["dotnet", "architecture", "design-patterns", "orm"]
title: "Dependent Mapping in Modern .NET"
---

Dependent Mapping lets the mapper for a parent object also handle
persistence for child objects that do not have an independent
persistence lifecycle.

Fowler's classic example is an album and its tracks: if tracks only make
sense as part of the album, the album's mapper can load and save them
together.

## The Core Idea

Consider an order and its lines:

``` csharp
public sealed class Order
{
    private readonly List<OrderLine> _lines = [];

    public OrderId Id { get; private set; }
    public IReadOnlyCollection<OrderLine> Lines => _lines;

    public void AddLine(ProductId productId, int quantity, Money price)
    {
        _lines.Add(new OrderLine(productId, quantity, price));
    }
}
```

An `OrderLine` may have no useful independent lifecycle. It exists
because the order exists.

That makes it a candidate for dependent mapping.

## Mapping the Child With EF Core

``` csharp
builder.HasMany(x => x.Lines)
    .WithOne()
    .HasForeignKey("OrderId")
    .OnDelete(DeleteBehavior.Cascade);
```

The persistence layer treats the line as dependent on its order.

Loading the aggregate can load the dependent collection:

``` csharp
var order = await db.Orders
    .Include(x => x.Lines)
    .SingleAsync(x => x.Id == orderId, cancellationToken);
```

Saving the Unit of Work persists changes to both.

## Owned Types

EF Core owned entity types can express an even stronger ownership
relationship:

``` csharp
builder.OwnsMany(x => x.Lines, line =>
{
    line.WithOwner().HasForeignKey("OrderId");
    line.Property<int>("Id");
    line.HasKey("OrderId", "Id");
});
```

Ownership is useful when the child belongs conceptually and persistently
to its owner.

## Why This Is More Than Cascade Delete

Dependent Mapping is about responsibility for mapping and lifecycle.

The child is normally:

-   loaded through its parent,
-   saved through its parent,
-   deleted with its parent,
-   not referenced independently by unrelated objects.

Cascade delete may support that lifecycle, but cascade behavior alone
does not define the pattern.

## Aggregate Boundaries

This pattern maps naturally to aggregate thinking.

If an `OrderLine` cannot meaningfully exist outside an `Order`, giving
it a standalone repository can create a misleading API:

``` csharp
IOrderLineRepository
```

Instead, modify lines through the order:

``` csharp
order.ChangeQuantity(lineId, 3);
await orders.SaveAsync(order, cancellationToken);
```

The persistence model follows the domain ownership model.

## When the Child Stops Being Dependent

Suppose another part of the system begins referencing order lines
directly, or a line develops an independent lifecycle.

At that point, treating it as purely dependent may become restrictive.

Patterns are descriptions of useful structures, not permanent
classifications. When the domain changes, the mapping can change too.

## Testing

Test dependent mappings with the actual provider when possible.
Important cases include adding children, updating them, removing them,
deleting the parent, and round-tripping the complete aggregate.

## When to Use It

Dependent Mapping fits when a child object has no independent
persistence meaning and is naturally loaded and saved with its owner.

## Related Patterns

-   Data Mapper
-   Foreign Key Mapping
-   Embedded Value
-   Unit of Work

## Summary

Dependent Mapping simplifies persistence by recognizing ownership. When
a child only makes sense as part of its parent, the parent's mapping can
own the child's persistence as well.
