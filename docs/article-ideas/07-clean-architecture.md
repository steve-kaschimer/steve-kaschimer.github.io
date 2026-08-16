---
category: Application Structure
csharp: 14
description: Apply Clean Architecture's dependency rule in .NET without
  blindly copying layers, interfaces, repositories, and project
  templates that the application does not need.
dotnet: 10
order: 7
series: Modern Application Architecture Patterns in .NET
slug: clean-architecture
status: draft
title: Clean Architecture in Modern .NET Without the Ceremony
volume: 2
---

# Clean Architecture in Modern .NET Without the Ceremony

Clean Architecture is one of the most recognizable architecture styles
in modern .NET.

It is also one of the easiest to imitate superficially.

A solution with projects named:

``` text
Domain
Application
Infrastructure
Web
```

is not automatically clean.

The important idea is the **direction of dependency**.

## The Dependency Rule

Business policy should not depend on infrastructure details.

Conceptually:

``` text
       Infrastructure
             |
             v
Application / Domain
             ^
             |
          Web Host
```

The database adapter can know about the application's repository
contract.

The application should not know that SQL Server or EF Core satisfies it.

## Traditional Layering

A traditional dependency chain often looks like:

``` text
UI
 |
 v
Business
 |
 v
Data Access
 |
 v
Database
```

The business layer depends downward on persistence abstractions or
implementations.

Clean Architecture turns important dependencies inward.

## A Practical .NET Solution

A reasonable structure might be:

``` text
Store.Domain
Store.Application
Store.Infrastructure
Store.Api
```

### Domain

Contains concepts such as:

``` text
Order
OrderItem
Money
Business rules
Domain events
```

### Application

Contains use cases:

``` text
PlaceOrder
CancelOrder
GetOrderDetails
```

and contracts required by those use cases:

``` text
IOrderRepository
IPaymentAuthorizer
IUnitOfWork
```

### Infrastructure

Implements outer-world details:

``` text
EF Core
SQL
HTTP gateways
message brokers
file storage
```

### API

Hosts the application:

``` text
ASP.NET Core
authentication
HTTP endpoints
composition root
```

## Project References Matter

The architecture becomes enforceable through project references.

For example:

``` text
Application -> Domain
Infrastructure -> Application
Infrastructure -> Domain
Api -> Application
Api -> Infrastructure
```

Domain does not reference Infrastructure.

Application does not reference the API.

That is more meaningful than folder names.

## A Use Case

Application:

``` csharp
public sealed class PlaceOrder(
    IOrderRepository orders,
    IUnitOfWork unitOfWork)
{
    public async Task<OrderId> ExecuteAsync(
        PlaceOrderCommand command,
        CancellationToken cancellationToken)
    {
        var order = Order.Place(
            command.CustomerId,
            command.Items);

        orders.Add(order);

        await unitOfWork.SaveChangesAsync(
            cancellationToken);

        return order.Id;
    }
}
```

Infrastructure:

``` csharp
public sealed class EfOrderRepository(
    OrdersDbContext db)
    : IOrderRepository
{
    public void Add(Order order)
        => db.Orders.Add(order);
}
```

The use case knows what persistence capability it needs without knowing
how it is implemented.

## But Do We Need `IUnitOfWork`?

Maybe not.

If the application is intentionally coupled to EF Core as its
persistence abstraction, injecting `OrdersDbContext` directly may be
simpler.

Clean Architecture does not require hiding every framework.

The architectural question is:

> Is this dependency a detail we need the core to remain independent
> from?

For some systems, the answer for EF Core is yes.

For others, the abstraction buys little.

## The Repository Debate

A common Clean Architecture template includes:

``` text
IRepository<T>
Repository<T>
IUnitOfWork
UnitOfWork
```

before the application has a single use case.

That can become architecture by template.

A generic repository may hide useful EF Core capabilities while adding
almost no domain language.

A domain-specific repository:

``` csharp
public interface IOrderRepository
{
    Task<Order?> GetForUpdateAsync(
        OrderId id,
        CancellationToken cancellationToken);

    void Add(Order order);
}
```

can be valuable when it expresses the aggregate's persistence boundary.

Use abstractions for a reason.

## Clean Architecture Is Not Four Projects

A small application can enforce the dependency rule in one project using
namespaces and discipline.

A large system may need more assemblies to make boundaries
compiler-enforced.

Project count is a mechanism.

It is not the architecture.

## Dependency Injection at the Edge

Infrastructure is wired to inward-facing contracts at startup:

``` csharp
builder.Services.AddScoped<
    IOrderRepository,
    EfOrderRepository>();

builder.Services.AddScoped<
    IPaymentAuthorizer,
    StripePaymentAuthorizer>();
```

The composition root is allowed to know concrete implementation types.

That is its job.

## Where DTOs Belong

Do not assume one DTO should flow through every layer.

An HTTP request:

``` csharp
public sealed record PlaceOrderRequest(...);
```

belongs to the transport contract.

The application command:

``` csharp
public sealed record PlaceOrderCommand(...);
```

belongs to the use case.

Sometimes those shapes are identical.

Whether to separate them depends on whether their reasons to change
differ.

## Clean Architecture and DDD

They are not the same thing.

You can have:

``` text
Clean Architecture + CRUD
Clean Architecture + Transaction Scripts
Clean Architecture + DDD
```

DDD addresses domain complexity.

Clean Architecture primarily addresses dependency direction and
separation of policy from detail.

## Clean Architecture and Vertical Slices

They can coexist.

One option:

``` text
Application/
  Orders/
    Place/
      Command.cs
      Handler.cs
    Cancel/
      Command.cs
      Handler.cs
```

The outer dependency rule remains intact while the application is
organized by feature rather than technical type.

## Testing

A core benefit is that application behavior can often be tested without
starting the web host or real infrastructure.

But avoid creating fake abstractions for every implementation detail
merely to achieve isolated tests.

Architecture exists for production change, not just mocking convenience.

## When It Helps

Clean Architecture is valuable when:

-   business rules matter;
-   infrastructure changes independently;
-   several delivery mechanisms use the same application;
-   compiler-enforced boundaries improve team ownership;
-   the system is expected to evolve for years.

## When It Hurts

It hurts when a simple CRUD application becomes:

``` text
Controller
 -> IRequest
 -> Handler
 -> IService
 -> Repository
 -> UnitOfWork
 -> DbContext
```

with every layer simply forwarding the same data.

Indirection is not architecture by itself.

## How It Relates to Fowler

Clean Architecture composes many Volume I ideas:

-   Separated Interface;
-   Gateway;
-   Mapper;
-   Service Layer;
-   Repository;
-   Domain Model.

Fowler gave us many of the pieces.

Clean Architecture emphasizes how dependencies among those pieces should
point.

## Summary

Clean Architecture is not a folder template.

It is a dependency rule:

**business policy should not be forced to depend on replaceable
technical details.**

Use projects, interfaces, DI, and adapters only to the degree needed to
make that rule valuable and enforceable.
