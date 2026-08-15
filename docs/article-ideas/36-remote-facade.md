---
category: Distribution Patterns
csharp: 14
description: Design coarse-grained ASP.NET Core APIs over fine-grained
  domain models to reduce network chatter and keep distribution concerns
  out of domain objects.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/remoteFacade.html"
order: 36
pattern: Remote Facade
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: remote-facade
status: draft
title: Remote Facade in Modern .NET
---

# Remote Facade in Modern .NET

Remote Facade provides a coarse-grained interface over fine-grained
application or domain objects for use across a network boundary.

The reason is simple:

A method call inside one process is cheap.

A network call is not.

## The Problem

Imagine a rich domain model:

``` csharp
order.ChangeShippingAddress(address);
order.ApplyPromotion(code);
order.SelectDeliveryMethod(method);
order.Submit();
```

Inside one process, these fine-grained operations can be excellent.

Turning every one into a separate remote call is a different story:

``` text
POST /orders/42/address
POST /orders/42/promotion
POST /orders/42/delivery
POST /orders/42/submit
```

Each request adds:

-   network latency,
-   serialization,
-   authentication,
-   retries,
-   partial-failure possibilities,
-   versioning concerns.

A Remote Facade creates operations sized appropriately for the network.

## A Coarse-Grained API

Instead of exposing every domain method, an API can accept one request:

``` csharp
public sealed record SubmitOrderRequest(
    ShippingAddressDto ShippingAddress,
    string? PromotionCode,
    DeliveryMethodDto DeliveryMethod);
```

Then:

``` csharp
app.MapPost(
    "/api/orders/{id:guid}/submit",
    async (
        Guid id,
        SubmitOrderRequest request,
        SubmitOrder service,
        CancellationToken ct) =>
    {
        await service.ExecuteAsync(
            new SubmitOrderCommand(
                new OrderId(id),
                request.ShippingAddress,
                request.PromotionCode,
                request.DeliveryMethod),
            ct);

        return Results.NoContent();
    });
```

One remote call represents one meaningful application operation.

## Do Not Expose the Domain Model Remotely

A tempting RPC-style interface is:

``` text
Order.GetLines()
Order.GetCustomer()
Order.GetShippingAddress()
Order.CalculateTotal()
Order.Submit()
```

That interface mirrors local object interactions.

Across a network, it creates chatty behavior and tightly couples clients
to the internal domain model.

The Remote Facade should expose application-oriented operations instead.

## Service Layer Is a Natural Partner

A Service Layer already defines the application's available operations.

That often makes it a good foundation for a Remote Facade.

Conceptually:

``` text
Client
   |
Remote Facade
   |
Service Layer
   |
Domain Model
```

The Remote Facade deals with distribution concerns.

The Service Layer coordinates application behavior.

## HTTP APIs

In modern .NET, an ASP.NET Core API frequently plays the Remote Facade
role.

For example:

``` csharp
[ApiController]
[Route("api/orders")]
public sealed class OrdersController(
    SubmitOrder submitOrder)
    : ControllerBase
{
    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(
        Guid id,
        SubmitOrderRequest request,
        CancellationToken cancellationToken)
    {
        await submitOrder.ExecuteAsync(
            request.ToCommand(new OrderId(id)),
            cancellationToken);

        return NoContent();
    }
}
```

The controller is not merely an HTTP adapter. Its public contract also
defines the granularity of remote interaction.

## Minimal APIs

The pattern does not require MVC controllers.

A Minimal API endpoint can serve the same role:

``` csharp
app.MapPost(
    "/api/orders/{id:guid}/submit",
    SubmitOrderEndpoint.HandleAsync);
```

The architectural responsibility matters more than the framework style.

## Remote Facade and DTO

Remote Facade and Data Transfer Object are closely related.

The facade defines coarse-grained operations.

DTOs carry the data required by those operations.

``` text
Remote Facade:
SubmitOrder(request)

DTO:
SubmitOrderRequest
```

We will cover Data Transfer Object next.

## Avoid CRUD-by-Reflex

A generic REST interface such as:

``` text
GET    /orders/{id}
PUT    /orders/{id}
DELETE /orders/{id}
```

can be appropriate for simple resources.

But a rich domain often benefits from operation-oriented endpoints:

``` text
POST /orders/{id}/submit
POST /orders/{id}/cancel
POST /orders/{id}/refund
```

These operations can map more naturally to business capabilities and
coarse-grained transactions.

The point is not "REST vs. RPC." The point is choosing remote
granularity intentionally.

## Batch Operations

Remote Facade can also reduce network chatter through batching.

Instead of:

``` text
POST /inventory/reserve/1
POST /inventory/reserve/2
POST /inventory/reserve/3
```

provide:

``` csharp
public sealed record ReserveInventoryRequest(
    IReadOnlyList<ReservationItemDto> Items);
```

One request can coordinate the whole operation.

## Failure Semantics

Coarse-grained operations should define failure clearly.

If `SubmitOrder` includes validation, inventory reservation, and local
persistence, the facade needs a stable contract for outcomes such as:

-   validation failure,
-   concurrency conflict,
-   missing resource,
-   business-rule rejection.

Do not expose internal exception types directly as a remote contract.

## Versioning

Remote interfaces live longer than many internal classes.

Changing a private method signature may be easy.

Changing a public API used by mobile apps, partners, or other services
can be expensive.

Remote Facade therefore creates an intentional stability boundary around
the application.

## Security

A coarse-grained facade is also an authorization boundary.

Authorize the business operation:

``` text
Can this caller submit this order?
```

rather than assuming permission to call several low-level methods
implies permission to perform the combined workflow.

## Performance

The goal is not to make every API call enormous.

Very large payloads and operations create their own problems.

Choose granularity around meaningful use cases and network economics.

A good facade minimizes unnecessary round trips without creating giant
"do everything" endpoints.

## Testing

Test the facade at the contract boundary.

Useful tests include:

-   request validation,
-   authorization,
-   serialization,
-   HTTP status mapping,
-   concurrency responses,
-   backward compatibility,
-   end-to-end execution of important operations.

Domain rules should still have faster tests below the remote layer.

## When to Use It

Remote Facade is useful whenever clients cross a process or network
boundary to interact with a fine-grained application model.

That includes:

-   HTTP APIs,
-   gRPC services,
-   service-to-service interfaces,
-   public SDK backends,
-   mobile backends.

## Related Patterns

-   Data Transfer Object
-   Service Layer
-   Gateway
-   Mapper

## Summary

Remote Facade protects clients from the fine-grained shape of the
application's internal model.

In modern .NET, ASP.NET Core APIs often fill this role.

The central design principle is timeless: design remote operations for
the cost and failure characteristics of a network, not as if clients
were calling local objects.
