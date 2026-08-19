---
author: Steve Kaschimer
date: 2029-10-21
image: /images/posts/2029-10-21-hero.webp
image_alt: "A hexagon core with several small port notches around its perimeter, each approached by a separate adapter shape."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single teal hexagon glyph with three small notch openings spaced around its perimeter, each approached from outside by a small distinct amber adapter shape not quite touching, implying a core reached only through deliberate ports. Mood is bounded and adaptable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Design a .NET application around use-case ports and replaceable adapters so HTTP, databases, brokers, and external APIs remain outside the application core."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Hexagonal Architecture and Ports & Adapters in Modern .NET"
---



Hexagonal Architecture gives us a powerful mental model:
> The application is the center. Everything that talks to it is an
> adapter.

The hexagon is not important. The boundary is.

## Stop Thinking in Top and Bottom

Layer diagrams encourage:
``` text
Presentation
Business
Data
```

Hexagonal Architecture encourages:
``` text
             HTTP Adapter
                  |
                  v
        +-------------------+
        |                   |
Queue ->|    Application    |-> Payment API
        |                   |
        +-------------------+
                  |
                  v
             Database
```

External technology surrounds the application rather than sitting "below" it.

## Ports

A port describes how the application can be used or what capability it requires. There are two useful directions.

### Driving ports

They expose application capabilities:
``` csharp
public interface IPlaceOrder
{
    Task<PlaceOrderResult> ExecuteAsync(
        PlaceOrderCommand command,
        CancellationToken cancellationToken);
}
```

An HTTP endpoint, CLI, test, or message consumer can drive that port.

### Driven ports

They describe capabilities the application needs:
``` csharp
public interface IPaymentAuthorizer
{
    Task<AuthorizationResult> AuthorizeAsync(
        Money amount,
        PaymentMethod method,
        CancellationToken cancellationToken);
}
```

Infrastructure provides an adapter.

## Adapters

An HTTP adapter translates HTTP into an application call:
``` csharp
app.MapPost(
    "/orders",
    async (
        PlaceOrderRequest request,
        IPlaceOrder useCase,
        CancellationToken ct) =>
    {
        var command = request.ToCommand();

        var result =
            await useCase.ExecuteAsync(command, ct);

        return result.ToHttpResult();
    });
```

A payment adapter translates the application's port into a vendor protocol:
``` csharp
public sealed class VendorPaymentAdapter(
    HttpClient client)
    : IPaymentAuthorizer
{
    public async Task<AuthorizationResult>
        AuthorizeAsync(
            Money amount,
            PaymentMethod method,
            CancellationToken cancellationToken)
    {
        // Translate and call vendor.
    }
}
```

## The Application Owns the Port

This is crucial. Do not define:
``` csharp
public interface IVendorPaymentClient
```

inside the application merely because the vendor has an API. Define what the application needs:
``` csharp
public interface IPaymentAuthorizer
```

The adapter translates between the two worlds. That protects the application's language.

## Database as an Adapter

Persistence is also outside the application core. A port might be:
``` csharp
public interface IOrderRepository
{
    Task<Order?> GetAsync(
        OrderId id,
        CancellationToken cancellationToken);

    void Add(Order order);
}
```

The EF Core adapter implements it.
``` text
Application -> IOrderRepository
                    ^
                    |
              EF Core Adapter
```

## Message Broker as an Adapter

The same architecture works asynchronously. Inbound:
``` text
Service Bus message
       |
Message Consumer Adapter
       |
Application Use Case
```

Outbound:
``` text
Application
   |
IIntegrationEventPublisher
   |
Service Bus Adapter
```

The core should not require Azure Service Bus concepts merely because one deployment uses it.

## Testing Through Ports

Ports create excellent testing seams. An application test can call:
``` csharp
await placeOrder.ExecuteAsync(
    command,
    cancellationToken);
```

with fake driven adapters. An adapter test can independently verify that HTTP or broker messages translate correctly.

## Hexagonal vs. Clean Architecture

They are close relatives. Both emphasize:
-   application/domain at the center;
-   dependency inversion;
-   infrastructure at the edge;
-   replaceable adapters.

Clean Architecture often emphasizes concentric policy layers. Hexagonal Architecture emphasizes ports and adapters around the application boundary. In practice, modern .NET systems often blend the two.

## Do Not Create a Port for Every Class

This is not:
``` text
Class
Interface
Class
Interface
Class
Interface
```

Ports exist at meaningful boundaries. An internal price calculator may simply be:
``` csharp
public sealed class PriceCalculator
{
}
```

No adapter is required if there is no external boundary.

## Adapter Granularity

One vendor integration may contain several internal classes:
``` text
Payment Adapter
  |- HttpClient
  |- DTOs
  |- Mapper
  |- Authentication handler
  |- Error translator
```

The application sees one meaningful port. Do not leak the adapter's internal structure into the core.

## Observability at the Adapter Boundary

Adapters are excellent places to measure:
-   external latency;
-   dependency errors;
-   message handling duration;
-   retry attempts;
-   serialization failures.

Trace context should cross adapter boundaries so a request can be followed through the system.

## When It Helps

Ports & Adapters is particularly useful when:
-   several technologies can drive the same use cases;
-   external systems change independently;
-   business language must remain isolated from vendors;
-   integration testing boundaries matter;
-   the application has a meaningful core.

## When It Hurts

It becomes ceremony when every trivial framework interaction gets wrapped behind a custom abstraction. You do not need:
``` text
ILoggerAdapter
IConfigurationAdapter
IJsonSerializerPort
```

simply because they are framework types. Protect meaningful volatility and architectural boundaries.

## How It Relates to Fowler

Hexagonal architecture heavily reuses Volume I concepts:
``` text
Separated Interface -> Port
Gateway             -> outbound adapter boundary
Mapper              -> translation
Service Layer       -> application-facing port
DTO                 -> boundary data
```

The architecture style organizes those patterns around an inside/outside model.

## Summary

Hexagonal Architecture says the application should not be shaped around HTTP, SQL, queues, or vendors. Those are adapters. The core exposes and consumes intentional ports expressed in application language. That simple inversion becomes extremely valuable as a system accumulates more ways to enter and leave the application.
