---
category: Distribution Patterns
csharp: 14
description: Design stable, coarse-grained DTOs for ASP.NET Core APIs
  and distributed .NET systems without leaking domain or persistence
  models.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/dataTransferObject.html"
order: 37
pattern: Data Transfer Object
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: data-transfer-object
status: draft
title: Data Transfer Object in Modern .NET
---

# Data Transfer Object in Modern .NET

Data Transfer Object packages data for transfer between processes.

That sounds almost too simple to deserve a pattern, but process
boundaries change the economics of object interaction.

Inside one process, many small property and method accesses are cheap.
Across HTTP, gRPC, queues, or another remote boundary, every exchange
has serialization, latency, compatibility, and failure costs.

## The Core Idea

Instead of remotely traversing a domain model:

``` text
GetOrder()
GetCustomer()
GetAddress()
GetLines()
GetProductForLine()
```

return the data needed by the use case in one transfer:

``` csharp
public sealed record OrderDetailsDto(
    Guid Id,
    string OrderNumber,
    CustomerDto Customer,
    IReadOnlyList<OrderLineDto> Lines,
    decimal Total,
    string Currency);
```

The DTO is shaped for transfer rather than domain behavior.

## DTOs Carry Data, Not Domain Behavior

A domain object may protect invariants:

``` csharp
public sealed class Order
{
    public void Submit()
    {
        // Enforce business rules.
    }
}
```

A DTO normally does not:

``` csharp
public sealed record OrderDto(
    Guid Id,
    string Status,
    decimal Total);
```

Its responsibility is representation and transport.

## Request DTOs

DTOs work in both directions.

``` csharp
public sealed record SubmitOrderRequest(
    ShippingAddressDto ShippingAddress,
    string? PromotionCode,
    string DeliveryMethod);
```

An endpoint translates that external representation into an application
command:

``` csharp
var command = new SubmitOrderCommand(
    new OrderId(id),
    request.ShippingAddress.ToValueObject(),
    request.PromotionCode,
    DeliveryMethod.Parse(request.DeliveryMethod));
```

That translation creates a useful boundary between the remote contract
and internal model.

## Response DTOs

Do not expose EF Core entities merely because JSON serialization can
serialize them.

Instead:

``` csharp
public sealed record OrderSummaryResponse(
    Guid Id,
    string Number,
    string Status,
    MoneyResponse Total);
```

Then project directly:

``` csharp
var result = await db.Orders
    .Where(x => x.Id == orderId)
    .Select(x => new OrderSummaryResponse(
        x.Id.Value,
        x.Number,
        x.Status.ToString(),
        new MoneyResponse(
            x.Total.Amount,
            x.Total.Currency)))
    .SingleOrDefaultAsync(cancellationToken);
```

This can avoid loading a full aggregate for a read-only API response.

## DTOs Protect the Domain

Suppose the domain adds:

``` csharp
internal decimal FraudScore { get; private set; }
```

If the API serializes domain entities directly, internal data may
accidentally become externally visible.

Explicit DTOs make the public contract deliberate.

## DTOs Protect the Client Too

The boundary works both ways.

If internal domain structure changes, a stable DTO can keep the external
API unchanged.

That reduces coupling between:

``` text
Public contract
```

and:

``` text
Internal implementation
```

This becomes increasingly important when clients are independently
deployed.

## DTOs and Remote Facade

These two patterns are natural partners.

Remote Facade determines the granularity of remote operations.

Data Transfer Object carries the information those operations require.

``` text
POST /orders/{id}/submit
          |
SubmitOrderRequest
          |
Remote Facade
          |
Application / Domain
```

## DTOs Are Not Automatically Anemic Design

A DTO is supposed to be data-oriented.

The mistake is not having data-only DTOs. The mistake is making the
entire domain a collection of data-only objects because DTOs and domain
objects were treated as the same thing.

Keep their responsibilities distinct.

## Records Are a Natural Fit

Modern C# records work particularly well:

``` csharp
public sealed record CustomerDto(
    Guid Id,
    string DisplayName,
    string Email);
```

They provide concise immutable data carriers with useful value
semantics.

That does not mean every DTO must be a record, but records often express
the intent clearly.

## Mapping

Small mappings are often clearest as explicit code:

``` csharp
public static OrderDto ToDto(Order order)
{
    return new OrderDto(
        order.Id.Value,
        order.Number,
        order.Status.ToString(),
        order.Total.Amount);
}
```

For large applications, mapping libraries can reduce repetitive work.

Use automation for mechanical mapping, but keep important contract
decisions visible.

## Versioning

DTOs become contracts once remote clients depend on them.

Prefer additive changes when possible:

``` json
{
  "id": "...",
  "status": "submitted",
  "estimatedDelivery": "2026-08-20"
}
```

Adding an optional field is often easier to evolve than renaming or
changing the meaning of an existing one.

## Serialization Is Part of the Contract

The C# type is not the entire DTO contract.

Also consider:

-   JSON property names,
-   nullability,
-   enum representation,
-   date/time format,
-   numeric precision,
-   case conventions,
-   omitted values.

For example:

``` csharp
[JsonPropertyName("order_id")]
public Guid OrderId { get; init; }
```

may be part of a public contract even if the internal C# naming changes.

## Security

DTOs should expose the minimum data required by the remote use case.

Do not send fields merely because they already exist on the entity.

This is especially important for:

-   internal notes,
-   security state,
-   secrets,
-   personally sensitive data,
-   operational metadata.

## Validation

Request DTO validation protects the application boundary:

``` csharp
public sealed record CreateCustomerRequest(
    string Name,
    string Email);
```

Syntactic validation can happen before domain creation.

Business invariants should still be enforced by application/domain
behavior rather than relying solely on transport validation.

## Testing

Contract tests can verify:

-   serialized property names,
-   required and optional fields,
-   backward compatibility,
-   enum and date formats,
-   request validation,
-   mapping to and from application models.

Snapshot-style JSON tests can be useful for important public contracts,
provided they are reviewed intentionally.

## When to Use It

DTOs are especially valuable across process boundaries:

-   HTTP APIs,
-   gRPC,
-   queues,
-   external integrations,
-   independently deployed services.

They can also be useful between internal architectural layers when a
purpose-built representation reduces coupling.

## When Not to Multiply Them

Do not create five nearly identical types for every operation by reflex.

Every mapping layer has a maintenance cost.

Create DTO boundaries where independence, security, performance, or
contract stability justify them.

## Related Patterns

-   Remote Facade
-   Mapper
-   Service Layer
-   Transform View

## Summary

Data Transfer Object packages data for efficient and stable transfer
across boundaries.

In modern .NET, records, ASP.NET Core serialization, and LINQ
projections make DTOs easy to build.

Their real value is not boilerplate reduction. It is giving remote
contracts a shape and lifecycle independent of the application's
internal object model.
