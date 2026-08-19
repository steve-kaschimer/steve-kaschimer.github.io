---
author: Steve Kaschimer
date: 2028-10-01
image: /images/posts/2028-10-01-hero.webp
image_alt: "A horizontal gate line with several small openings, each passing a distinct small shape through to the other side, implying a boundary that coordinates multiple operations without owning their internal rules."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a horizontal amber gate line spanning the frame, with three small openings evenly spaced along it, each passing a distinct small teal shape through to the other side, implying a coordinating boundary rather than a place where rules themselves live. Mood is orchestrated and boundary-focused. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Service Layer defines an application's boundary and answers a specific architectural question: what can this application do? Covers keeping the service as coordination rather than a procedural dumping ground, and the useful default - application services orchestrate, domain objects decide."
tags: ["dotnet", "architecture", "design-patterns", "domain-logic"]
title: "Service Layer in Modern .NET"
---



Service Layer defines an application's boundary and exposes the operations the application supports. It answers a useful architectural question:
> **What can this application do?**

## The Problem

Applications may have HTTP endpoints, background jobs, message consumers, command-line tools, and scheduled processes. If each independently coordinates domain behavior, persistence, and integrations, application logic becomes coupled to delivery mechanisms.

## A Service Layer Operation

``` csharp
public sealed class SubmitOrderService(
    IOrderRepository orders,
    IEventPublisher events)
{
    public async Task ExecuteAsync(OrderId id, CancellationToken ct)
    {
        var order = await orders.GetByIdAsync(id, ct)
            ?? throw new OrderNotFoundException(id);

        order.Submit();
        await orders.SaveAsync(order, ct);
        await events.PublishAsync(new OrderSubmitted(order.Id), ct);
    }
}
```

The HTTP endpoint becomes an adapter:
``` csharp
app.MapPost("/orders/{id:int}/submit", async (
    int id, SubmitOrderService service, CancellationToken ct) =>
{
    await service.ExecuteAsync(new OrderId(id), ct);
    return Results.NoContent();
});
```

## Service Layer and Domain Model

A useful default is:
> **Application services orchestrate; domain objects decide.**

The service loads an order, invokes its behavior, persists the result, and coordinates external effects. The order owns the rules governing whether the operation is valid.

## Avoid the God Service

The pattern does not require one giant `OrderService` containing dozens of unrelated methods. One service or handler per use case is often clearer:
``` text
Orders/
    CreateOrder.cs
    SubmitOrder.cs
    CancelOrder.cs
    ShipOrder.cs
```

This still embodies Service Layer.

## Transactions

A service operation is often a natural transaction boundary because it corresponds to a business use case. EF Core's `SaveChangesAsync` may be enough for simple operations; more complicated workflows may require explicit transactions or an outbox.

## Dependency Injection

ASP.NET Core's container makes services easy to register:
``` csharp
builder.Services.AddScoped<SubmitOrderService>();
```

Dependency injection supports the pattern, but it does not create the pattern by itself.

## When to Use It

Service Layer is useful when multiple entry points invoke the same behavior, workflows coordinate domain and infrastructure components, transaction boundaries matter, or presentation technology should remain separate from application behavior.

## When Not to Use It

A tiny CRUD endpoint does not automatically need a service, repository, and mapper. Introduce the boundary when it solves a real problem.

## Service Layer vs. Transaction Script

A Service Layer operation can itself be implemented as a Transaction Script. Service Layer describes the **application boundary**; Transaction Script describes one way to **organize business logic**.

## Related Patterns

-   Transaction Script
-   Domain Model
-   Repository
-   Unit of Work
-   Data Transfer Object

## Summary

Service Layer is not synonymous with a `Services` folder. Its value is a clear application boundary: a coherent set of operations through which the outside world interacts with the system.
