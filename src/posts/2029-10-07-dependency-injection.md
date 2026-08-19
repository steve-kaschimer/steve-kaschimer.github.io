---
author: Steve Kaschimer
date: 2029-10-07
image: /images/posts/2029-10-07-hero.webp
image_alt: "A socket-and-plug pair being wired into place by a separate composition-root box positioned outside both."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a teal socket glyph and an amber plug glyph not yet touching, with a small off-white composition-root box positioned above both, a thin line reaching down to connect them, implying an external boundary that assembles dependencies rather than the pieces wiring themselves. Mood is externalized and orderly. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Use dependency injection as an architectural composition technique in modern .NET, with explicit dependencies, correct lifetimes, keyed services, factories, decorators, and a disciplined composition root."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Dependency Injection Beyond AddScoped"
---



Dependency Injection is so normal in modern .NET that it is easy to mistake the container API for the pattern.
``` csharp
builder.Services.AddScoped<IOrderRepository, EfOrderRepository>();
```

That line is useful. But Dependency Injection is not primarily about registering services. It is about **making dependencies explicit and moving object composition to the edge of the application**.

## The Problem

Without DI, a class may construct its own infrastructure:
``` csharp
public sealed class PlaceOrder
{
    private readonly SqlOrderRepository _orders =
        new(new SqlConnection(...));

    private readonly VendorPaymentGateway _payments =
        new(new HttpClient());

    public async Task ExecuteAsync(...)
    {
        // ...
    }
}
```

`PlaceOrder` now knows:
-   which database technology is used;
-   how the repository is constructed;
-   which payment vendor is used;
-   how HTTP infrastructure is constructed.

Business workflow and composition are tangled together.

## Invert Construction

Instead:
``` csharp
public sealed class PlaceOrder(
    IOrderRepository orders,
    IPaymentGateway payments,
    TimeProvider timeProvider)
{
    public async Task ExecuteAsync(
        PlaceOrderCommand command,
        CancellationToken cancellationToken)
    {
        // Application behavior.
    }
}
```

The class says what it needs. Something else decides what satisfies those needs. That "something else" is the composition root.

## The Composition Root

In a small ASP.NET Core application, `Program.cs` is often the composition root:
``` csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<OrdersDbContext>(...);

builder.Services.AddScoped<
    IOrderRepository,
    EfOrderRepository>();

builder.Services.AddHttpClient<
    IPaymentGateway,
    VendorPaymentGateway>();

builder.Services.AddScoped<PlaceOrder>();

var app = builder.Build();
```

The rest of the application should rarely need to know that the DI container exists.

## Explicit Dependencies

Constructor injection gives a class an honest API:
``` csharp
public sealed class ShippingService(
    IShippingGateway gateway,
    ILogger<ShippingService> logger)
{
}
```

A developer can inspect the constructor and understand what the service needs. Compare that with:
``` csharp
public sealed class ShippingService(
    IServiceProvider services)
{
    public async Task ShipAsync(...)
    {
        var gateway =
            services.GetRequiredService<IShippingGateway>();
    }
}
```

The second version hides the real dependency. The DI container has become a Service Locator.

## Lifetimes Are Architecture

The built-in container gives us three fundamental lifetimes:
``` text
Transient
Scoped
Singleton
```

They are not merely performance settings. They define ownership and sharing.

### Transient

A new instance is created each time the service is requested. Good candidates are usually lightweight, stateless services.

### Scoped

One instance exists within a scope. In ASP.NET Core, the normal request scope means one scoped instance per request. EF Core `DbContext` is scoped by default. That aligns naturally with a request-oriented Unit of Work.

### Singleton

One instance is shared for the application's lifetime. Singletons must be safe for concurrent use. They should not capture request-specific state.

## The Captive Dependency Problem

This is dangerous:
``` text
Singleton
   |
   v
Scoped DbContext
```

A long-lived object has captured a short-lived dependency. The scope semantics are now broken. If a singleton genuinely needs to perform scoped work, create an explicit scope at the appropriate operation boundary rather than capturing a scoped service indefinitely.

## Do Not Make Everything an Interface

This:
``` csharp
public interface IPriceCalculator
{
    Money Calculate(Order order);
}

public sealed class PriceCalculator
    : IPriceCalculator
{
}
```

may be useful. But if `PriceCalculator` is an internal application component with one implementation and no boundary role, injecting the concrete class may be perfectly reasonable:
``` csharp
builder.Services.AddScoped<PriceCalculator>();
```

Interfaces are valuable when they express:
-   polymorphism;
-   a dependency inversion boundary;
-   a plugin contract;
-   a replaceable external capability.

They are not an entrance fee for DI.

## Keyed Services

Sometimes several implementations are intentionally available:
``` csharp
builder.Services.AddKeyedSingleton<
    INotificationSender,
    EmailNotificationSender>("email");

builder.Services.AddKeyedSingleton<
    INotificationSender,
    SmsNotificationSender>("sms");
```

Keyed services can be useful when selection is part of composition. But if business logic is choosing among implementations dynamically, a domain-specific strategy registry or factory may communicate the intent better than scattering container keys through application code.

## Factories

Some dependencies cannot be selected until runtime. A factory makes that explicit:
``` csharp
public interface IPaymentGatewayFactory
{
    IPaymentGateway Get(PaymentProvider provider);
}
```

The factory can receive all available implementations and choose among them. This keeps `IServiceProvider` out of the business workflow.

## Decorators

DI works particularly well with Decorator:
``` text
PaymentGateway
      ^
      |
LoggingPaymentGateway
      ^
      |
RetryingPaymentGateway
```

Each decorator implements the same contract and wraps another implementation. This is useful for cross-cutting behavior such as:
-   metrics;
-   tracing;
-   caching;
-   authorization;
-   idempotency.

Do not automatically build a decorator pipeline for every service. Middleware, interceptors, and framework-native resilience may be better at some boundaries.

## Registration by Feature

A large `Program.cs` can become unreadable. Group registrations by capability:
``` csharp
builder.Services
    .AddOrdering(builder.Configuration)
    .AddPayments(builder.Configuration)
    .AddFulfillment(builder.Configuration);
```

Inside:
``` csharp
public static IServiceCollection AddOrdering(
    this IServiceCollection services,
    IConfiguration configuration)
{
    services.AddScoped<PlaceOrder>();
    services.AddScoped<CancelOrder>();

    return services;
}
```

The composition root remains centralized while details remain navigable.

## DI Does Not Eliminate `new`

This is a common misconception. Domain code should happily create ordinary objects:
``` csharp
var order = Order.Create(
    customerId,
    shippingAddress);
```

Do not resolve entities or value objects from DI. The container is best for services whose construction requires dependency management or lifecycle control.

## Too Many Dependencies Are Information

Consider:
``` csharp
public sealed class OrderService(
    IOrderRepository orders,
    ICustomerRepository customers,
    IPaymentGateway payments,
    IShippingGateway shipping,
    IEmailSender email,
    IInventoryGateway inventory,
    ILogger<OrderService> logger,
    TimeProvider timeProvider,
    IEventPublisher events)
```

The container can resolve this. That does not make the design good. A huge constructor often tells us that the class has accumulated too many responsibilities. DI makes coupling visible. Listen to what it is telling you.

## Testing

Constructor injection makes focused tests straightforward:
``` csharp
var handler = new PlaceOrder(
    orders: new InMemoryOrderRepository(),
    payments: new ApprovedPaymentGatewayStub(),
    timeProvider: fakeTimeProvider);
```

But do not create interfaces solely to mock every internal method call. Tests should generally substitute meaningful boundaries, not implementation trivia.

## Production Considerations

Validate the container during startup where appropriate. Watch for:
-   captive dependencies;
-   thread-unsafe singletons;
-   disposable transient services;
-   expensive construction;
-   hidden Service Locator usage;
-   excessive reflection scanning.

DI configuration is production code.

## How It Relates to Fowler

Dependency Injection connects directly to several Volume I patterns:
``` text
Registry
   -> often replaced by explicit DI

Separated Interface
   -> defines the inward-facing contract

Gateway
   -> implementation injected at the edge

Plugin
   -> implementations selected through composition
```

The biggest shift is that modern .NET gives us a first-class composition mechanism built into the platform.

## When It Helps

Use DI when dependencies have lifetimes, implementations, configuration, or boundaries that should be composed externally.

## When It Hurts

DI becomes harmful when:
-   everything gets an interface for no reason;
-   the container is used as a global registry;
-   runtime service lookup hides dependencies;
-   object construction that should be ordinary C# becomes container
magic;
-   teams confuse "resolvable" with "well designed."

## Summary

Dependency Injection is not `AddScoped`. It is the architectural decision to make dependencies explicit and move composition out of business behavior. ASP.NET Core's container makes the mechanics easy. The design skill is deciding what should be composed, what lifetime it owns, and where the dependency boundary belongs.
