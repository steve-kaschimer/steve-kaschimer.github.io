---
author: Steve Kaschimer
date: 2028-09-03
image: /images/posts/2028-09-03-hero.webp
image_alt: "A circular glyph and a grid glyph overlapping at their edges with a faint seam between them, implying two related but structurally different representations meeting at a boundary."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a teal circular glyph and an amber grid glyph overlapping at their edges, with a faint off-white seam line visible where they meet, implying two structurally different representations of the same information meeting at a boundary rather than merging cleanly. Mood is analytical and foundational. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Objects and relational tables represent information differently, and that gap - the object-relational impedance mismatch - is what an entire family of Fowler patterns exists to bridge. An introduction to that gap, and to how much of it Entity Framework Core already closes without most developers noticing."
tags: ["dotnet", "architecture", "design-patterns", "data-access"]
title: "Data Access Patterns and the Object-Relational Impedance Mismatch"
---



Most business applications have two very different representations of information. Inside the application, we want concepts such as:
``` csharp
public sealed class Order
{
    public Customer Customer { get; private set; }

    public IReadOnlyCollection<OrderLine> Lines { get; }

    public Money Total { get; }
}
```

In a relational database, we might have:
``` text
Orders
--------------------------------
Id
CustomerId
Status
CreatedAt

Customers
--------------------------------
Id
Name
Email

OrderLines
--------------------------------
Id
OrderId
ProductId
Quantity
UnitPrice
```

These representations are related, but they aren't identical. This difference is often called the **object-relational impedance mismatch**. Fowler's catalog contains a large group of patterns concerned with bridging this gap, including Table Data Gateway, Row Data Gateway, Active Record, Data Mapper, Unit of Work, Identity Map, Lazy Load, Repository, and several structural mapping patterns. Modern .NET developers encounter many of these ideas through Entity Framework Core. Understanding the patterns helps us understand what EF Core is doing - and decide when its abstractions are appropriate.

## Why Objects and Tables Don't Line Up Perfectly

An object might contain behavior:
``` csharp
public void Cancel()
{
    if (Status == OrderStatus.Completed)
        throw new InvalidOperationException();

    Status = OrderStatus.Cancelled;
}
```

A relational table doesn't. A table contains rows and columns. The object model might also contain:
``` text
Order
 ├── Customer
 ├── Lines
 │    ├── Product
 │    └── Money
 └── ShippingAddress
```

while the database might spread this information across several tables. This creates mapping decisions. For example:
``` text
Object                  Database

Order.Id             -> Orders.Id
Order.Customer       -> Orders.CustomerId
Order.Lines          -> OrderLines.OrderId
Order.Total          -> calculated
Money.Amount         -> OrderLines.UnitPrice
Money.Currency       -> OrderLines.Currency
```

There isn't always a single obvious mapping.

## Table Data Gateway

Fowler describes Table Data Gateway as an object acting as a gateway to a database table, with one instance handling all rows in the table. A simplified implementation might be:
``` csharp
public sealed class CustomerGateway(
    DbConnection connection)
{
    public async Task<CustomerRecord?> FindAsync(
        int id,
        CancellationToken cancellationToken)
    {
        // Execute SELECT against Customers.
    }

    public async Task InsertAsync(
        CustomerRecord customer,
        CancellationToken cancellationToken)
    {
        // Execute INSERT.
    }
}
```

The gateway is concerned with the database table. This can be useful when the application primarily works with relational data and doesn't require a rich domain model.

## Row Data Gateway

Row Data Gateway moves the abstraction in the other direction. Fowler describes it as an object acting as a gateway to a single record, with one instance per row. Conceptually:
``` csharp
public sealed class CustomerRow
{
    public int Id { get; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";

    public Task SaveAsync()
    {
        // UPDATE Customers ...
    }
}
```

The object represents a row. This is a useful historical pattern to understand because it explains some older data-access architectures.

## Active Record

Active Record combines data representation with database access and domain behavior. Fowler describes Active Record as an object that wraps a database row or view, encapsulates database access, and adds domain logic over that data. A conceptual example:
``` csharp
public sealed class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";

    public Task SaveAsync()
    {
        // Persist this customer.
    }

    public void ChangeEmail(string email)
    {
        // Business logic.
    }
}
```

The object knows both:
``` text
What am I?
```

and:
``` text
How do I save myself?
```

Active Record can be productive for applications whose domain closely resembles their database structure.

## Data Mapper

Data Mapper takes the opposite approach. Fowler describes Data Mapper as a layer that moves data between objects and a database while keeping the objects and database independent of one another. Conceptually:
``` text
Domain Object
     ↑
     │
Data Mapper
     │
     ↓
Database
```

The domain object doesn't need to know how it is persisted. This is much closer to the architecture many developers build with EF Core. For example:
``` csharp
public sealed class Order
{
    public OrderId Id { get; private set; }

    public void Submit()
    {
        // Business rules.
    }
}
```

And configuration can define how it maps:
``` csharp
public sealed class OrderConfiguration
    : IEntityTypeConfiguration<Order>
{
    public void Configure(
        EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
            .HasConversion<string>();
    }
}
```

The domain model doesn't need to contain SQL.

## Entity Framework Core and These Patterns

EF Core is particularly interesting because it provides functionality associated with several established patterns simultaneously. A `DbContext` tracks entities and their changes. That resembles the behavior described by **Unit of Work**, which Fowler defines as maintaining a list of objects affected by a business transaction and coordinating their persistence. Consider:
``` csharp
var order = await db.Orders
    .SingleAsync(
        x => x.Id == orderId,
        cancellationToken);

order.Submit();

await db.SaveChangesAsync(cancellationToken);
```

The application doesn't explicitly say:
``` csharp
unitOfWork.RegisterChanged(order);
```

The ORM tracks the change. Then:
``` csharp
await db.SaveChangesAsync();
```

coordinates persistence. Understanding this is important because developers sometimes create abstractions that duplicate functionality their ORM already provides.

## The Repository Question

Fowler's Repository provides a collection-like interface over domain objects and mediates between the domain and data-mapping layers. A repository might look like:
``` csharp
public interface IOrderRepository
{
    Task<Order?> FindAsync(
        OrderId id,
        CancellationToken cancellationToken);

    Task AddAsync(
        Order order,
        CancellationToken cancellationToken);
}
```

And an EF Core implementation:
``` csharp
public sealed class OrderRepository(
    AppDbContext db) : IOrderRepository
{
    public Task<Order?> FindAsync(
        OrderId id,
        CancellationToken cancellationToken)
        => db.Orders
            .SingleOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

    public async Task AddAsync(
        Order order,
        CancellationToken cancellationToken)
    {
        await db.Orders.AddAsync(
            order,
            cancellationToken);
    }
}
```

This can be useful. But it isn't automatically necessary.

## When a Repository Adds Value

A repository can provide a valuable domain-facing abstraction when:
-   the domain shouldn't know about EF Core,
-   persistence queries are complex,
-   aggregate boundaries need protection,
-   the repository expresses meaningful domain operations,
-   multiple persistence implementations genuinely matter,
-   or the repository provides a useful seam for testing.

For example:
``` csharp
public interface OrderRepository
{
    Task<Order?> FindPendingOrderForCustomerAsync(
        CustomerId customerId,
        CancellationToken cancellationToken);
}
```

This communicates something meaningful. Compare it with:
``` csharp
Task<Order?> GetByIdAsync(...);
Task AddAsync(...);
Task UpdateAsync(...);
Task DeleteAsync(...);
```

If the latter simply exposes `DbSet<Order>`, the abstraction may not be buying much.

## Identity Map

Another pattern lurking inside ORMs is **Identity Map**. Fowler describes Identity Map as ensuring that each object is loaded only once by keeping loaded objects in a map and looking them up there when needed. The conceptual problem is this:
``` csharp
var customer1 = LoadCustomer(42);
var customer2 = LoadCustomer(42);
```

Should these be:
``` csharp
ReferenceEquals(customer1, customer2)
```

or two separate objects representing the same database row? An ORM's tracking system can maintain identity within its context. That becomes particularly important when several parts of a business operation manipulate the same entity.

## Lazy Load

Fowler defines Lazy Load as an object that doesn't contain all of the required data but knows how to retrieve it when needed. The attraction is obvious:
``` csharp
var order = await repository.GetAsync(id);

foreach (var line in order.Lines)
{
    // Data gets loaded when accessed.
}
```

But lazy loading can also hide database queries. Code that appears innocent:
``` csharp
foreach (var order in orders)
{
    Console.WriteLine(order.Customer.Name);
}
```

could potentially cause:
``` text
1 query for orders
N queries for customers
```

This is the classic N+1 query problem. Modern applications often prefer explicit loading or projections:
``` csharp
var orders = await db.Orders
    .Select(order => new OrderSummary(
        order.Id,
        order.Customer.Name,
        order.Total))
    .ToListAsync(cancellationToken);
```

Now the data requirement is visible in the query.

## Mapping Isn't Always One-to-One

One of the most important lessons from object-relational mapping is that the domain model and database schema can evolve independently. Suppose the domain has:
``` csharp
public sealed record Address(
    string Street,
    string City,
    string PostalCode);
```

The database might store:
``` text
Customer
--------------------------------
Street
City
PostalCode
```

This is Fowler's **Embedded Value** pattern: an object is mapped into several fields of another object's table. Modern EF Core can support this kind of mapping directly. The important concept is that:
``` text
Address
```

is a domain concept while:
``` text
Street + City + PostalCode
```

is a persistence representation. They don't have to have the same shape.

## Query Objects

Fowler's **Query Object** represents a database query as an object. In modern C#, we might express something similar using specifications or query objects:
``` csharp
public sealed record OrdersForCustomer(
    CustomerId CustomerId,
    OrderStatus? Status)
{
    public IQueryable<Order> Apply(
        IQueryable<Order> query)
    {
        query = query.Where(
            x => x.CustomerId == CustomerId);

        if (Status is not null)
        {
            query = query.Where(
                x => x.Status == Status);
        }

        return query;
    }
}
```

Then:
``` csharp
var query = new OrdersForCustomer(
    customerId,
    OrderStatus.Submitted);

var orders = await query
    .Apply(db.Orders)
    .ToListAsync(cancellationToken);
```

Whether this abstraction is useful depends on the application's query complexity. Again, the pattern isn't the objective.

## Don't Fight the ORM

One of the most important practical lessons is that modern ORMs already implement many established patterns. If EF Core solves the problem adequately, don't recreate it simply because a book describes the pattern. Instead ask:
> What additional problem does my abstraction solve?

For example:
``` text
EF Core
 ├── change tracking
 ├── identity management
 ├── mapping
 ├── transactions
 └── querying
```

A custom infrastructure layer that simply forwards all of these operations may make the application harder to understand. But a domain-specific repository:
``` csharp
FindOpenOrdersEligibleForShipment(...)
```

might provide meaningful value. The difference is **abstraction for a reason versus abstraction for ceremony**.

## The Practical Mental Model

When working with persistence in modern .NET, it helps to think in terms of responsibilities:
``` text
Domain
  ↓
Business concepts and rules

Application
  ↓
Use-case coordination

Persistence abstraction
  ↓
Domain-oriented data access where valuable

EF Core
  ↓
Mapping + change tracking + querying

Database
  ↓
Durable relational state
```

Not every application needs every box. A small CRUD application may reasonably be:
``` text
ASP.NET Core
      ↓
EF Core
      ↓
Database
```

A complex business system may benefit from:
``` text
API
 ↓
Application
 ↓
Domain
 ↓
Repository
 ↓
EF Core
 ↓
Database
```

The correct architecture depends on the complexity and constraints of the system.

## The Big Lesson

Data access patterns are ultimately about managing a boundary between two worlds. The application wants:
-   objects,
-   behavior,
-   invariants,
-   domain concepts.

The database wants:
-   tables,
-   rows,
-   columns,
-   keys,
-   joins,
-   transactions.

Patterns provide different strategies for bridging those worlds. Modern .NET has made many of those strategies easier to implement - and in some cases has made implementing them manually unnecessary. The goal isn't to recreate Fowler's architecture exactly. It's to understand the ideas well enough to recognize what your framework is already doing, identify the problems it doesn't solve, and introduce additional abstractions only where they provide real architectural value. That distinction will become increasingly important as we move through the individual patterns in the series.
