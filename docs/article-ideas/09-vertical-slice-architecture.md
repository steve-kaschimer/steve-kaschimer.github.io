---
category: Application Structure
csharp: 14
description: Organize modern .NET applications around features and use
  cases instead of technical layers, while keeping shared domain and
  infrastructure boundaries deliberate.
dotnet: 10
order: 9
series: Modern Application Architecture Patterns in .NET
slug: vertical-slice-architecture
status: draft
title: Vertical Slice Architecture in Modern .NET
volume: 2
---

# Vertical Slice Architecture in Modern .NET

Many .NET applications begin with folders like:

``` text
Controllers/
Services/
Repositories/
Models/
```

That organization looks tidy.

But implementing one feature often means editing every folder.

Vertical Slice Architecture changes the primary unit of organization
from **technical type** to **business capability or use case**.

## Horizontal Organization

Consider creating an order:

``` text
Controllers/
  OrdersController.cs

Services/
  OrderService.cs

Repositories/
  OrderRepository.cs

Dtos/
  CreateOrderRequest.cs
```

The feature is physically scattered.

As the application grows, each technical folder becomes a catalog of
unrelated business concepts.

## Vertical Organization

Instead:

``` text
Features/
  Orders/
    Create/
      Endpoint.cs
      Command.cs
      Handler.cs
      Validator.cs
      Response.cs

    Cancel/
      Endpoint.cs
      Command.cs
      Handler.cs
```

Everything primarily relevant to one use case lives together.

## The Slice

A slice often spans the whole application path:

``` text
HTTP
 |
CreateOrder Endpoint
 |
CreateOrder Handler
 |
Domain / EF Core
 |
Database
```

The slice owns the implementation necessary to satisfy the use case.

That does not mean every slice must reinvent every shared concern.

## A Minimal Slice

``` csharp
public static class CreateOrderEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost(
            "/",
            async (
                CreateOrderRequest request,
                CreateOrderHandler handler,
                CancellationToken ct) =>
            {
                var result =
                    await handler.HandleAsync(
                        request,
                        ct);

                return Results.Created(
                    $"/orders/{result.Id}",
                    result);
            });
    }
}
```

Handler:

``` csharp
public sealed class CreateOrderHandler(
    OrdersDbContext db)
{
    public async Task<CreateOrderResponse>
        HandleAsync(
            CreateOrderRequest request,
            CancellationToken cancellationToken)
    {
        // Use-case implementation.
    }
}
```

This may be enough.

No repository is mandatory.

No mediator is mandatory.

No separate application project is mandatory.

## Vertical Slices and CQRS

The two fit naturally because commands and queries are use cases.

``` text
Orders/
  Create/       Command
  Cancel/       Command
  GetDetails/   Query
  Search/       Query
```

A query can use a direct projection while a command uses a Domain Model.

That freedom is one of the strongest benefits.

## Different Slices Can Use Different Patterns

Imagine:

``` text
GetOrderList
    -> direct EF projection

PlaceOrder
    -> aggregate + repository

ExportOrders
    -> streaming query

ImportOrders
    -> batch pipeline
```

A traditional architecture often pressures every operation through the
same generic service/repository structure.

Vertical slices let the implementation match the problem.

## Shared Domain Model

Vertical Slice does not mean duplicating domain rules.

If several order commands must preserve the same invariant, that
behavior belongs in the Order aggregate or another shared domain
concept.

``` text
Slices
  |
  +--> Order Aggregate
  +--> Money
  +--> Pricing Policy
```

Organize use cases vertically while sharing genuine domain concepts
horizontally where appropriate.

## Shared Infrastructure

Likewise:

``` text
Database configuration
Telemetry
Authentication
Messaging
```

remain cross-cutting infrastructure.

Do not duplicate them per feature merely to preserve a folder aesthetic.

## Feature Coupling

The danger is replacing layered coupling with feature-to-feature
coupling:

``` text
CreateOrderHandler
   calls
UpdateCustomerHandler
   calls
SendEmailHandler
```

Now slices form an implicit service graph.

Prefer explicit domain/application capabilities or events when one
feature must trigger another responsibility.

## Vertical Slice vs. Clean Architecture

They answer different questions.

Clean Architecture asks:

> Which direction may dependencies point?

Vertical Slice asks:

> What should be the primary unit of code organization?

You can combine them:

``` text
Application/
  Orders/
    Create/
    Cancel/
  Customers/
    Register/

Domain/
Infrastructure/
Api/
```

Or use slices in a simpler single-project architecture.

## Vertical Slice vs. Layered Architecture

Layering groups code by technical responsibility.

Slices group code by change affinity.

If `CreateOrder` changes, we want most related code close together.

That can reduce the "shotgun surgery" of modifying five technical layers
for one feature.

## Testing

Slice-oriented tests can focus on behavior at the use-case boundary.

For example:

``` text
Given inventory exists
When CreateOrder executes
Then order is persisted
And response contains order id
```

Some teams test slices through the HTTP endpoint using an in-memory test
host.

Others test handlers directly.

Choose the level that proves the behavior without excessive coupling to
implementation.

## When It Helps

Vertical Slice Architecture works well when:

-   the application has many independent use cases;
-   feature teams own capabilities;
-   reads and writes need different implementations;
-   horizontal service classes are becoming large;
-   changes routinely cross many technical folders.

## When It Hurts

It can hurt when:

-   slices duplicate domain rules;
-   every endpoint invents its own conventions;
-   cross-cutting concerns are copied everywhere;
-   feature isolation becomes an excuse for no shared model;
-   tiny applications gain dozens of files per endpoint.

A vertical slice can be three files.

It does not need to be thirteen.

## How It Relates to Fowler

A slice may contain several Fowler patterns:

``` text
Endpoint
  -> Page/Front Controller ideas

Handler
  -> Transaction Script or Service Layer

Aggregate
  -> Domain Model

DbContext
  -> Data Mapper / Unit of Work

Response
  -> DTO
```

Vertical Slice changes how those pieces are grouped.

It does not erase them.

## Summary

Vertical Slice Architecture organizes software around the things users
and the business actually ask the system to do.

It gives each use case freedom to use the simplest appropriate
implementation while keeping related code close together.

The key is vertical **cohesion**, not maximum file count.
