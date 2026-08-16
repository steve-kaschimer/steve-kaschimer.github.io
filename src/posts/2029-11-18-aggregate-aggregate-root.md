---
author: Steve Kaschimer
date: 2029-11-18
image: /images/posts/2029-11-18-hero.webp
image_alt: "One bold outer boundary circle enclosing several smaller shapes, with a single distinct root shape at the center controlling them."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one bold teal boundary circle enclosing three small amber shapes clustered inside it, with one distinct off-white root shape positioned at the exact center connected to each of the others, implying a single controlled entry point into a protected consistency boundary. Mood is guarded and singular. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Design DDD aggregates around transactional consistency and business invariants instead of object graphs or database relationships."
tags: ["dotnet", "architecture", "design-patterns", "domain-driven-design"]
title: "Aggregate and Aggregate Root: The Consistency Boundary"
---

Aggregate is one of the most important - and most frequently
misunderstood - patterns in Domain-Driven Design.

An aggregate is not:

> a parent object with some child collections.

The useful definition is:

> **A boundary around state that must remain consistent together.**

The Aggregate Root controls that boundary.

## Start With the Invariant

Suppose an order has a maximum of 100 units.

``` text
Order
  |
  +-- OrderItem
  +-- OrderItem
```

If callers can independently change each item:

``` csharp
item.Quantity = 500;
```

the Order cannot guarantee its invariant.

Instead:

``` csharp
order.ChangeQuantity(
    productId,
    quantity);
```

The root controls the mutation.

## A Modern C# Aggregate

``` csharp
public sealed class Order
{
    private readonly List<OrderItem> _items = [];

    public OrderId Id { get; private set; }

    public OrderStatus Status { get; private set; }

    public IReadOnlyCollection<OrderItem> Items
        => _items.AsReadOnly();

    private Order()
    {
    }

    public static Order Create(OrderId id)
        => new()
        {
            Id = id,
            Status = OrderStatus.Draft
        };

    public void AddItem(
        ProductId productId,
        Money unitPrice,
        int quantity)
    {
        if (Status != OrderStatus.Draft)
            throw new DomainException(
                "Items can only be changed while draft.");

        if (quantity <= 0)
            throw new DomainException(
                "Quantity must be positive.");

        var totalQuantity =
            _items.Sum(x => x.Quantity) + quantity;

        if (totalQuantity > 100)
            throw new DomainException(
                "An order cannot exceed 100 units.");

        _items.Add(
            new OrderItem(
                productId,
                unitPrice,
                quantity));
    }
}
```

The collection is not directly mutable from outside.

The root is the consistency guardian.

## Aggregate Root

Every aggregate has one root entity.

External code references the aggregate through that root.

Conceptually:

``` text
Application
    |
    v
  Order        <- Aggregate Root
  /   \
Item  Item     <- internal entities
```

Do not expose repositories for `OrderItem` if `OrderItem` belongs inside
the Order aggregate.

Doing so lets callers bypass the root.

## Aggregate Is a Transaction Boundary

This is the most useful heuristic.

Ask:

> Which state must be immediately consistent when this business
> operation commits?

That state is a candidate aggregate boundary.

If an operation changes one aggregate:

``` text
Load Order
Change Order
Save Order
COMMIT
```

we have a clear transaction.

## Do Not Build Giant Aggregates

Suppose Order contains:

``` text
Order
 Customer
 CustomerAddresses
 PaymentMethods
 Product
 Inventory
 Shipment
```

because those objects are "related."

Now loading an Order may pull half the business into memory.

Worse, unrelated operations contend on the same consistency boundary.

Relationship does not imply aggregate membership.

## Reference Other Aggregates by Identity

If Customer is a separate aggregate:

``` csharp
public CustomerId CustomerId { get; private set; }
```

is often preferable to:

``` csharp
public Customer Customer { get; private set; }
```

inside the domain model.

This makes the boundary visible.

``` text
Order Aggregate ---- CustomerId ----> Customer Aggregate
```

## One Transaction, One Aggregate?

It is a strong design heuristic, not a law of physics.

If a business invariant genuinely requires atomic consistency across two
objects on every operation, ask whether they belong in one aggregate.

But occasionally application transactions touch multiple aggregates.

The important thing is to make the consistency requirement intentional
rather than accidentally relying on a giant object graph.

## Cross-Aggregate Behavior

Suppose placing an order should update loyalty status.

``` text
Order Aggregate
      |
OrderPlaced
      |
      v
Customer Aggregate
```

A Domain Event can coordinate that reaction.

Whether the reaction occurs in the same transaction or eventually
depends on the business consistency requirement.

That is exactly why aggregate boundaries matter.

## Concurrency

Aggregates are also natural optimistic-concurrency boundaries.

``` csharp
public byte[] Version { get; private set; } = [];
```

EF Core can use a concurrency token.

Two requests:

``` text
Request A loads Order v7
Request B loads Order v7

A commits -> v8
B commits -> conflict
```

The application can decide whether to retry, merge, or reject.

## Repositories

A repository usually exists per aggregate root, not per database table.

Good:

``` csharp
public interface IOrderRepository
{
    Task<Order?> GetAsync(
        OrderId id,
        CancellationToken cancellationToken);

    void Add(Order order);
}
```

Suspicious:

``` text
OrderRepository
OrderItemRepository
ShippingAddressRepository
```

if all three objects are one aggregate.

## Persistence Mapping Is Secondary

Do not derive aggregate boundaries from EF Core navigation properties.

The domain says:

``` text
What must remain consistent?
```

Persistence asks:

``` text
How do we store that?
```

The second question should not answer the first.

## Aggregate Size

Smaller aggregates usually improve:

-   concurrency;
-   load size;
-   transaction duration;
-   ownership clarity.

But making them too small pushes invariants across boundaries and may
require excessive coordination.

The correct size is determined by consistency rules.

## A Design Exercise

Suppose an e-commerce system contains:

``` text
Customer
Order
Inventory
Payment
Shipment
```

Ask of every relationship:

> Must these objects be atomically consistent for the business to remain
> valid?

If no, they probably do not belong in the same aggregate.

This question is more useful than drawing class diagrams first.

## Aggregate Factories

Complex creation may belong in a named factory method:

``` csharp
var order = Order.Place(
    customerId,
    items,
    pricingPolicy);
```

The aggregate should never begin life in an invalid state.

## Domain Events

An aggregate can record facts that occurred:

``` csharp
AddDomainEvent(
    new OrderPlaced(
        Id,
        CustomerId,
        Total));
```

Recording the event is domain behavior.

Dispatching it is normally an application/infrastructure concern.

We will cover that distinction deeply in the Domain Event article.

## Testing Aggregates

Aggregate tests should be rich in business language.

``` text
Given a submitted order
When an item is added
Then the operation is rejected
```

Test invariants at the root.

If a child entity can violate the aggregate without going through the
root, the boundary is porous.

## When It Helps

Aggregates become valuable when:

-   multiple state changes form one invariant;
-   concurrency matters;
-   business transitions need protection;
-   a domain model has meaningful transactional boundaries.

## When It Hurts

Aggregate modeling hurts when teams:

-   wrap every entity in an `AggregateRoot` base class;
-   make aggregates enormous;
-   mirror database foreign keys mechanically;
-   load entire graphs for simple queries;
-   require all reads to go through aggregates.

Aggregates are primarily write-side consistency models.

Queries can use projections.

## How It Relates to Fowler

Aggregate builds on Fowler's Domain Model, Repository, Unit of Work,
Identity Field, and Optimistic Offline Lock.

It adds an explicit answer to:

> What is the unit of consistency?

## Summary

An Aggregate is a consistency boundary.

The Aggregate Root is the only entry point for changes inside that
boundary.

Do not discover aggregates by looking at database relationships.

Discover them by asking which invariants must survive a transaction.

That single idea will shape almost everything that follows in Volume II.
