---
author: Steve Kaschimer
date: 2030-03-31
image: /images/posts/2030-03-31-hero.webp
image_alt: "Several distinct client-shaped glyphs, each with its own dedicated funnel, converging toward shared core services."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on three small distinct client-shaped teal glyphs at the top, each feeding into its own small amber funnel, all three funnels converging toward one shared off-white core-services shape at the bottom, implying tailored boundaries in front of common capability. Mood is tailored and converging. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Give materially different client experiences their own backend boundary for aggregation, orchestration, security, and client-specific contracts without duplicating core business logic."
tags: ["dotnet", "architecture", "design-patterns", "api-design"]
title: "Backend for Frontend: APIs Shaped Around Client Needs"
---

A mobile app, browser application, partner integration, and smart display may all consume the same business capabilities.

They rarely need the same API shape.

Backend for Frontend—BFF—creates a backend boundary tailored to a specific frontend or client class.

```text
Web App    -> Web BFF
Mobile App -> Mobile BFF
                   |
                   v
             Core Services
```

## The Problem

A universal API often accumulates endpoints like:

```text
/orders?includeCustomer=true
       &includeShipment=true
       &mobile=true
       &compact=true
       &version=7
```

Every client negotiates with the same generic contract.

BFF says:

> Let the client-facing backend speak the client's language.

## Aggregation

A mobile order screen may need data from:

```text
Orders
Customers
Shipping
Recommendations
```

Without a BFF, the phone makes four network calls.

With a BFF:

```text
Mobile
  |
GET /home
  |
Mobile BFF
  +--> Orders
  +--> Customers
  +--> Shipping
  +--> Recommendations
```

The BFF returns one client-oriented model.

## Client-Specific DTOs

```csharp
public sealed record MobileOrderCard(
    string OrderNumber,
    string StatusText,
    string PrimaryAction,
    DateTimeOffset? ExpectedDelivery);
```

This DTO does not need to become a universal enterprise contract.

It exists for the mobile experience.

## Minimal API Example

```csharp
app.MapGet(
    "/orders/{id:guid}",
    async (
        Guid id,
        IOrdersClient orders,
        IShippingClient shipping,
        CancellationToken ct) =>
    {
        var orderTask =
            orders.GetAsync(id, ct);

        var shippingTask =
            shipping.GetForOrderAsync(id, ct);

        await Task.WhenAll(
            orderTask,
            shippingTask);

        return Results.Ok(
            MobileOrderDetails.From(
                await orderTask,
                await shippingTask));
    });
```

The BFF aggregates downstream capabilities.

## What Belongs in a BFF?

Good responsibilities:

- client-specific aggregation;
- response shaping;
- authentication/session adaptation;
- protocol adaptation;
- coarse orchestration;
- caching of client-facing reads.

Dangerous responsibilities:

- core pricing rules;
- inventory invariants;
- payment policy;
- domain ownership.

Business logic should remain in the owning domain/service.

## One BFF Per Client?

Not mechanically.

Create separate BFFs when clients have materially different needs.

```text
Web + tablet
```

may share one.

```text
Public partner API
```

may deserve another.

Do not create five services because there are five screen sizes.

## BFF and API Gateway

They are related but different.

```text
API Gateway
  -> cross-cutting edge concerns
     routing
     authentication
     rate limiting

BFF
  -> client-specific API behavior
     aggregation
     shaping
     orchestration
```

A request may flow:

```text
Mobile
  |
API Gateway
  |
Mobile BFF
  |
Services
```

## BFF and GraphQL

GraphQL can solve some client-specific query-shaping problems.

It does not automatically replace BFF responsibilities such as:

- session handling;
- client-specific orchestration;
- protocol translation;
- backend security policy.

Likewise, a BFF does not require REST.

It can expose GraphQL.

## Failure Handling

Aggregation introduces partial failure.

```text
Orders succeeds
Recommendations fails
```

Should the whole page fail?

Maybe not.

A BFF can define client-specific degradation:

```text
return order
omit recommendations
```

That is a user-experience decision.

## Latency

Aggregation can reduce client round trips while increasing server fan-out.

Parallelize independent calls.

Set timeouts.

Avoid turning the BFF into a sequential waterfall:

```text
A -> B -> C -> D
```

Measure the critical path.

## Security

The BFF is often a valuable security boundary.

Browser-based architectures can keep sensitive tokens server-side and use secure cookies between browser and BFF.

But authentication design depends on client type and threat model.

Do not treat "BFF" as a magic security label.

## Ownership

A BFF works best when owned close to the client team.

If every BFF change requires approval from a centralized API team, much of the organizational benefit disappears.

Conway's Law matters.

## Duplication

Some duplication between BFFs is intentional.

Two clients may each map order status differently.

That is fine.

Duplicating **domain logic** is not.

The distinction is:

```text
presentation/client behavior duplication
    often acceptable

business invariant duplication
    dangerous
```

## Observability

Track:

```text
client endpoint latency
downstream fan-out latency
partial failures
cache hit rate
downstream dependency failures
payload size
```

Distributed tracing is particularly valuable because one client call may fan out to several services.

## Testing

Test:

```text
client contract
aggregation behavior
partial dependency failure
authorization
timeout behavior
response compatibility
```

Contract tests with the frontend can be highly valuable.

## When It Helps

Use BFF when:

- clients have materially different API needs;
- client round trips are expensive;
- client-specific aggregation is common;
- teams need independent client-facing evolution.

## When It Hurts

It hurts when:

- every frontend gets a BFF by policy;
- core business logic moves into BFFs;
- BFFs become giant monoliths over all services;
- duplicated client APIs provide no actual benefit.

## Summary

Backend for Frontend creates an API boundary around a client experience.

It gives the frontend a contract designed for its own needs while keeping core business rules in the systems that own them.

Use it to reduce client/backend impedance—not to duplicate the domain.
