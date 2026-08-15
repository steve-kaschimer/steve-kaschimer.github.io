---
author: Steve Kaschimer
date: 2028-12-10
image: /images/posts/2028-12-10-hero.webp
image_alt: "Two distinct shapes connected by a single directional line with an arrowhead pointing from one to the other, implying one object referencing another by identity."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two distinct teal shapes positioned apart, connected by a single bold amber line with a clear arrowhead pointing from one shape to the other, implying one object referencing another by identity rather than by direct containment. Mood is directional and clear. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Objects express relationships with references - order.Customer - while relational databases express them with keys - Orders.CustomerId. Foreign Key Mapping bridges those two representations, and this covers the real design decisions: required vs. optional relationships, whether both a navigation and an explicit ID should exist, and respecting aggregate boundaries."
tags: ["dotnet", "architecture", "design-patterns", "orm"]
title: "Foreign Key Mapping in Modern .NET"
---

Objects express relationships with references:

``` csharp
order.Customer
```

Relational databases express them with keys:

``` text
Orders.CustomerId -> Customers.Id
```

Foreign Key Mapping bridges those two representations.

## The Object Model

An object-oriented model can express a relationship naturally:

``` csharp
public sealed class Order
{
    public OrderId Id { get; private set; }

    public Customer Customer { get; private set; } = null!;
}
```

The database cannot persist the CLR reference stored in `Customer`.

Instead, the `Orders` row stores the identity of the related customer.

``` text
Orders
--------------------------------
Id        CustomerId     Status
1001      42             Draft
```

That is the essence of Foreign Key Mapping.

## Explicit Foreign Key Properties

A practical EF Core model often exposes both the navigation and the
foreign key:

``` csharp
public sealed class Order
{
    public OrderId Id { get; private set; }

    public CustomerId CustomerId { get; private set; }

    public Customer Customer { get; private set; } = null!;
}
```

The two properties represent different views of the same relationship.

`Customer` is convenient for object-oriented behavior.

`CustomerId` is convenient when only the related identity is required.

## EF Core Configuration

A one-to-many relationship can be configured explicitly:

``` csharp
builder
    .HasOne(x => x.Customer)
    .WithMany(x => x.Orders)
    .HasForeignKey(x => x.CustomerId);
```

Conceptually:

``` text
Customer.Id
     ↑
Order.CustomerId
```

and:

``` text
Order.Customer -> Customer object
```

are two representations of one relationship.

## Required Relationships

If every order must have a customer, the relationship is required.

With nullable reference types, the model can communicate that intent:

``` csharp
public Customer Customer { get; private set; } = null!;

public CustomerId CustomerId { get; private set; }
```

The database foreign key should also be non-nullable.

Keeping C# nullability, EF Core configuration, and database constraints
aligned prevents several categories of ambiguity.

## Optional Relationships

Suppose an order may optionally be assigned to a sales representative:

``` csharp
public EmployeeId? SalesRepresentativeId { get; private set; }

public Employee? SalesRepresentative { get; private set; }
```

The nullable foreign key communicates that the relationship may not
exist.

This typically maps to a nullable database column.

## One-to-Many Collections

The principal object can expose the inverse relationship:

``` csharp
public sealed class Customer
{
    private readonly List<Order> _orders = [];

    public IReadOnlyCollection<Order> Orders => _orders;
}
```

The relational database still stores the relationship on the dependent
side:

``` text
Orders.CustomerId
```

A collection in the object model does not require storing a collection
of IDs in the customer row.

The mapper reconstructs that collection from rows sharing the foreign
key.

## Do You Need Both Navigation and Foreign Key?

Not always.

You might expose only the navigation:

``` csharp
public Customer Customer { get; private set; } = null!;
```

and let EF Core maintain a shadow foreign key.

Or expose only the ID in a model that deliberately avoids navigation
properties.

Both are valid.

Explicit foreign keys are often useful because application code can
reason about identity without loading the related object:

``` csharp
if (order.CustomerId == currentCustomerId)
{
    // No Customer load required.
}
```

## Strongly Typed Foreign Keys

Strongly typed IDs work well here:

``` csharp
public readonly record struct CustomerId(long Value);
```

Then:

``` csharp
public CustomerId CustomerId { get; private set; }
```

EF Core can use a value conversion to map the identifier to the
database's numeric column.

This prevents an `OrderId` from accidentally being supplied where a
`CustomerId` is required.

## Aggregate Boundaries

Not every foreign key should become an object navigation.

Consider a domain model where `Order` references another aggregate by
identity:

``` csharp
public CustomerId CustomerId { get; private set; }
```

but does not expose:

``` csharp
public Customer Customer { get; private set; }
```

That can be intentional.

If the order's business rules do not require the entire customer object,
an ID may preserve a cleaner aggregate boundary and avoid accidental
graph loading.

Object-relational mapping should serve the domain model rather than
force every database relationship into an object navigation.

## Cascading Deletes

Relational foreign keys also define referential-integrity behavior.

A relationship may cascade deletion, restrict it, or set the foreign key
to null depending on schema and configuration.

That is more than a mapping detail.

Deleting a principal entity can have significant business consequences,
so cascade behavior should be selected intentionally.

## Loading Relationships

Foreign Key Mapping says how a relationship is represented. It does not
require one particular loading strategy.

Related data can be:

-   eager-loaded,
-   explicitly loaded,
-   lazy-loaded,
-   projected directly into a read model.

For example:

``` csharp
var order = await db.Orders
    .Include(x => x.Customer)
    .SingleAsync(
        x => x.Id == orderId,
        cancellationToken);
```

or:

``` csharp
var result = await db.Orders
    .Where(x => x.Id == orderId)
    .Select(x => new OrderSummary(
        x.Id,
        x.Customer.Name))
    .SingleAsync(cancellationToken);
```

The mapping and loading strategy are related concerns, but they are not
the same concern.

## Concurrency and Relationship Changes

Changing an object reference may result in changing a foreign key:

``` csharp
order.AssignSalesRepresentative(employee);
```

EF Core's change tracker can detect the relationship change and update
the appropriate foreign-key value when the Unit of Work commits.

This illustrates how Foreign Key Mapping works with Data Mapper and Unit
of Work.

## Testing

Relationship mapping deserves integration tests when it is important or
nontrivial.

Useful cases include:

-   required relationships,
-   optional relationships,
-   cascade behavior,
-   alternate keys,
-   composite foreign keys,
-   strongly typed ID conversions.

A model that compiles is not proof that the database relationship
behaves as intended.

## When to Use It

Foreign Key Mapping is the standard solution for one-to-one and
one-to-many relationships in relational persistence.

The meaningful design decisions concern:

-   which side owns the foreign key,
-   whether the relationship is required,
-   whether navigation properties should exist,
-   loading behavior,
-   deletion behavior,
-   aggregate boundaries.

## Related Patterns

-   Identity Field
-   Association Table Mapping
-   Data Mapper
-   Lazy Load
-   Identity Map

## Summary

Foreign Key Mapping translates between two different relationship
models:

``` text
Objects:    order.Customer

Database:   Orders.CustomerId -> Customers.Id
```

EF Core handles much of the mechanics, but understanding the pattern
helps you design navigations, foreign keys, nullability, loading
strategies, and aggregate boundaries deliberately.
