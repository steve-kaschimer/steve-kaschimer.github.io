---
author: Steve Kaschimer
date: 2028-08-20
image: /images/posts/2028-08-20-hero.webp
image_alt: "The same layered blueprint stack as the series opener, but with a single bold horizontal line cutting across all bands, implying a deliberate boundary drawn through the structure."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on the same four-band layered blueprint glyph used elsewhere in this series, but with one bold amber horizontal line drawn deliberately across all bands partway up, implying an intentional architectural boundary rather than an accidental folder split. Mood is deliberate and structural. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A web endpoint starts with a few lines of code, then someone adds validation, pricing, authorization, and notifications - and it quietly becomes a miniature application. A look at what a layer actually is, why dependency direction matters more than folder names, and the practical test for a good boundary: does it localize a kind of change?"
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Layers, Boundaries, and Separation of Concerns in Modern .NET"
---



One of the first architectural decisions we make in an application is deciding **where code belongs**. That sounds simple until an application grows. A web endpoint starts with a few lines of code. Then someone adds validation, pricing, authorization, inventory checks, payment processing, and notifications. Eventually the endpoint has become a miniature application. This is where architectural boundaries and layering become useful.

## What Is a Layer?

A layer is a way of grouping responsibilities. A common application might look like this:
``` text
┌─────────────────────────────┐
│ Presentation                │
│ HTTP / UI / API             │
├─────────────────────────────┤
│ Application                 │
│ Use cases / orchestration   │
├─────────────────────────────┤
│ Domain                      │
│ Business rules              │
├─────────────────────────────┤
│ Infrastructure              │
│ Database / external systems │
└─────────────────────────────┘
```

The exact terminology varies between architectural styles. The important idea is that **different kinds of responsibility have different boundaries**. A web endpoint shouldn't need to understand how a payment provider stores its credentials. A domain object shouldn't need to know what HTTP status code represents a validation error. A database adapter shouldn't decide whether a customer is eligible for a promotion. Layering gives us a place for those responsibilities to live.

## The Dependency Direction Matters

It's tempting to think of layers simply as folders:
``` text
Controllers/
Services/
Models/
Repositories/
```

But folders don't create architecture. Dependencies do. Suppose our domain code contains:
``` csharp
public sealed class Order
{
    public decimal CalculateTotal()
    {
        // business logic
    }
}
```

That's independent of ASP.NET Core. Good. Now suppose we add EF Core-specific persistence code to the domain. The boundary has collapsed. A useful architectural principle is:
> **Keep business rules independent from mechanisms that deliver or
> persist them when doing so provides meaningful value.**

This doesn't mean every application must have a perfectly isolated domain project. It means dependencies should be intentional.

## Presentation Is Not Business Logic

Consider an API endpoint:
``` csharp
app.MapPost("/orders", async (
    CreateOrderRequest request,
    OrderService service,
    CancellationToken cancellationToken) =>
{
    var order = await service.CreateAsync(
        request.CustomerId,
        request.Items,
        cancellationToken);

    return Results.Created(
        $"/orders/{order.Id}",
        order);
});
```

The endpoint has a small responsibility:
1.  receive HTTP input,
2.  invoke application behavior,
3.  translate the result into HTTP.

That's healthy. The business logic can live somewhere else:
``` csharp
public sealed class OrderService
{
    public async Task<Order> CreateAsync(
        CustomerId customerId,
        IReadOnlyCollection<OrderItemRequest> items,
        CancellationToken cancellationToken)
    {
        // business/application logic
    }
}
```

The separation means the same operation can potentially be invoked from:
-   an HTTP API,
-   a background worker,
-   a message consumer,
-   a scheduled job,
-   an integration test.

We aren't forced to reproduce the business process for every entry point.

## But Don't Create Layers Just Because You Can

There's an opposite failure mode. A trivial endpoint doesn't need a hierarchy of services, repositories, mappers, factories, and domain services. The architecture should reflect the complexity of the problem. Layering has costs:
-   more types,
-   more files,
-   more indirection,
-   more mapping,
-   more concepts for developers to understand.

The question isn't:
> "Can we put this in another layer?"

The question is:
> "Does this boundary make the system easier to change, test,
> understand, or protect?"

## The Domain Layer

The domain is where business concepts live. For an order-processing system, that might include:
``` csharp
public sealed class Order
{
    private readonly List<OrderLine> _lines = [];

    public OrderStatus Status { get; private set; }

    public IReadOnlyCollection<OrderLine> Lines => _lines;

    public void Submit()
    {
        if (_lines.Count == 0)
        {
            throw new InvalidOperationException(
                "An order must contain at least one item.");
        }

        if (Status != OrderStatus.Draft)
        {
            throw new InvalidOperationException(
                "Only draft orders can be submitted.");
        }

        Status = OrderStatus.Submitted;
    }
}
```

Notice what this class doesn't know. It doesn't know:
-   whether the application is an HTTP API,
-   which database is being used,
-   whether the application runs in Docker,
-   whether the order came from a message queue,
-   how JSON serialization works.

It represents a business concept. That's valuable because the rule:
> "Only draft orders can be submitted"

isn't fundamentally an HTTP rule or a SQL rule. It's a business rule.

## The Application Layer

The application layer coordinates use cases. For example:
``` csharp
public sealed class SubmitOrderHandler(
    AppDbContext db,
    IOrderRepository orders,
    IEventPublisher events)
{
    public async Task HandleAsync(
        OrderId orderId,
        CancellationToken cancellationToken)
    {
        var order = await orders.GetByIdAsync(
            orderId,
            cancellationToken)
            ?? throw new OrderNotFoundException(orderId);

        order.Submit();

        await db.SaveChangesAsync(cancellationToken);

        await events.PublishAsync(
            new OrderSubmitted(order.Id),
            cancellationToken);
    }
}
```

The application layer can coordinate several components without necessarily owning all of their business rules. This distinction becomes especially useful as applications grow.

## A Useful Rule: Ask "Who Owns This Rule?"

Suppose we have:
``` csharp
if (order.Total > 1000)
{
    discount = 50;
}
```

Where should it go? Don't begin with:
> "Should this be in the service layer?"

Instead ask:
> "What does this rule mean?"

If it means:
> Orders above \$1,000 receive a \$50 discount.

that's a business rule. It probably belongs close to the domain concept responsible for calculating the order price. If the condition means:
> This API only returns 50 orders per request.

that's an API concern. It belongs near the presentation/application boundary. This simple question---**who owns the rule?**---often provides a better answer than blindly following a layer diagram.

## Layers and Frameworks

Modern .NET makes it easy to create boundaries. ASP.NET Core provides the web application infrastructure. EF Core provides persistence infrastructure. Dependency injection lets implementations be supplied to components at runtime. But frameworks don't automatically create good architecture. A service that directly manipulates EF Core entities may be completely appropriate for a simple application. If the application contains significant domain behavior, however, you may want to distinguish:
``` csharp
order.Submit();

await db.SaveChangesAsync(cancellationToken);
```

The distinction matters because `SaveChangesAsync` is infrastructure while `Submit` represents business behavior.

## Layering Is About Change

A useful way to evaluate a boundary is to imagine a change. Suppose we replace PostgreSQL with SQL Server. How much application code should change? If the domain contains database-provider-specific code, the answer is "a lot." If database-specific code is confined to infrastructure, the change is much smaller. Now imagine replacing the HTTP API with a message-driven interface. If the business rules live in HTTP controllers, the change is expensive. If HTTP is just one adapter around application behavior, the change is easier. This gives us a practical definition of a useful boundary:
> **A good boundary localizes a kind of change.**

## Layers Aren't the Same as Projects

A four-project solution might look like:
``` text
MyApp.Api
MyApp.Application
MyApp.Domain
MyApp.Infrastructure
```

That's one possible implementation. Another application might use vertical slices:
``` text
Features/
    Orders/
        Create/
        Submit/
        Cancel/
    Customers/
        Register/
        Update/
```

The important architectural decisions aren't determined by the folder structure. The important question is whether responsibilities and dependencies are appropriately separated.

## The Most Important Boundary

In many applications, the most valuable boundary isn't:
``` text
Controllers -> Services -> Repositories
```

It's:
``` text
Business decisions
        ↓
Technical mechanisms
```

Business decisions include:
-   whether an order can be submitted,
-   whether a payment can be refunded,
-   whether a reservation can be cancelled,
-   how a price is calculated.

Technical mechanisms include:
-   HTTP,
-   SQL,
-   JSON,
-   Redis,
-   message brokers,
-   email,
-   cloud APIs.

The more valuable and complicated the business rules become, the more valuable it becomes to keep those two categories from becoming tightly coupled.
