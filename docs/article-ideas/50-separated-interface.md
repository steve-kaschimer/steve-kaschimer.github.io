---
category: Base Patterns
csharp: 14
description: Place an interface in a different package or assembly from
  its implementation to invert dependencies and build clean .NET
  architectural boundaries.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/separatedInterface.html"
order: 50
pattern: Separated Interface
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: separated-interface
status: draft
title: Separated Interface in Modern .NET
---

# Separated Interface in Modern .NET

Separated Interface places an interface in a different package from its
implementation.

That simple move can reverse the direction of a dependency.

It is one of the ideas underneath many modern .NET architectures built
around dependency inversion.

## The Problem

Suppose an application service directly depends on an infrastructure
class:

``` csharp
public sealed class SubmitOrder(
    SqlOrderRepository repository)
{
}
```

Now the application layer depends on SQL persistence.

Conceptually:

``` text
Application -> Infrastructure
```

That makes infrastructure part of the application's compile-time model.

## Separate the Interface

Move the abstraction into the application or domain-facing assembly:

``` csharp
public interface IOrderRepository
{
    Task<Order?> GetAsync(
        OrderId id,
        CancellationToken cancellationToken);

    void Add(Order order);
}
```

The application depends only on this interface:

``` csharp
public sealed class SubmitOrder(
    IOrderRepository orders)
{
}
```

Infrastructure implements it:

``` csharp
public sealed class EfOrderRepository(
    AppDbContext db)
    : IOrderRepository
{
}
```

Now:

``` text
Application <- Infrastructure
```

Infrastructure depends on the application contract.

The dependency direction has inverted.

## Assembly Structure

A simple solution might be:

``` text
MyApp.Domain
MyApp.Application
MyApp.Infrastructure
MyApp.Web
```

References:

``` text
Application -> Domain
Infrastructure -> Application
Infrastructure -> Domain
Web -> Application
Web -> Infrastructure
```

The repository interface can live in `Application` while its EF Core
implementation lives in `Infrastructure`.

## Why Location Matters

If the interface lives beside the implementation:

``` text
Infrastructure/
    IOrderRepository
    EfOrderRepository
```

then the application still needs to reference the infrastructure
assembly just to see the abstraction.

The interface may be abstract in C#, but the package dependency has not
been inverted.

Separated Interface addresses that physical dependency.

## Dependency Injection

ASP.NET Core's DI container wires the separated pieces together at
composition time:

``` csharp
builder.Services.AddScoped<
    IOrderRepository,
    EfOrderRepository>();
```

The application does not need to know which implementation was selected.

The composition root does.

## Gateway Example

The same approach works for external services.

Application contract:

``` csharp
public interface IExchangeRateGateway
{
    Task<ExchangeRate> GetRateAsync(
        Currency from,
        Currency to,
        CancellationToken cancellationToken);
}
```

Infrastructure:

``` csharp
public sealed class VendorExchangeRateGateway(
    HttpClient httpClient)
    : IExchangeRateGateway
{
}
```

The vendor integration depends inward on the application's required
capability.

## Who Owns the Interface?

A useful principle is:

> The consumer owns the abstraction.

If the application needs "something that can authorize a payment,"
define that capability in terms the application understands:

``` csharp
public interface IPaymentAuthorizer
{
    Task<AuthorizationResult> AuthorizeAsync(...);
}
```

Do not automatically copy the vendor's interface into your core project.

The purpose is independence, not interface proliferation.

## Ports and Adapters

In Hexagonal Architecture, the interface is often called a **port** and
the implementation an **adapter**.

``` text
Application
   |
 Port
   ^
   |
Adapter
```

Separated Interface predates much of today's terminology, but the
dependency mechanism is closely related.

## Clean Architecture

The same principle appears in Clean Architecture:

``` text
Policies and use cases
should not depend on
frameworks and infrastructure.
```

A separated interface gives infrastructure a contract to implement while
allowing the application to remain independent of the implementation
package.

## Interfaces Are Not Automatically Architecture

This:

``` csharp
public interface ICustomerService
{
}

public sealed class CustomerService
    : ICustomerService
{
}
```

does not create meaningful separation if both types live in the same
assembly, change together, and have no alternate boundary purpose.

Interfaces have architectural value when they control dependency
direction or represent a useful polymorphic contract.

## Do You Need an Interface for Everything?

No.

A class used only inside one layer often does not need an interface.

For example:

``` csharp
public sealed class CalculateOrderTotal
{
}
```

can be injected directly if there is no boundary to invert and no
meaningful polymorphism.

Do not confuse dependency injection with "every class needs an
interface."

## Testing

Separated Interface can make tests easier:

``` csharp
public sealed class StubPaymentAuthorizer
    : IPaymentAuthorizer
{
    public Task<AuthorizationResult>
        AuthorizeAsync(...)
        => Task.FromResult(
            AuthorizationResult.Approved);
}
```

But testability is a secondary benefit.

The primary architectural value is dependency direction.

## Package-Level Thinking

This pattern becomes clearer when you stop thinking only about
individual classes.

Ask:

``` text
Which assembly knows about which assembly?
Which NuGet package references which package?
Which project can compile without the other?
```

Those questions reveal whether the separation is real.

## Avoid a Giant Abstractions Project

Some solutions create:

``` text
MyApp.Abstractions
```

and put every interface in it.

That can become a miscellaneous dependency magnet.

Prefer locating an interface with the consumer or policy that owns it
unless there is a strong reason for a dedicated contract package.

## Plugin Architectures

Separated Interface is especially useful for plugins.

A small contracts assembly can define:

``` csharp
public interface IReportExporter
{
    Task ExportAsync(
        Report report,
        Stream output,
        CancellationToken cancellationToken);
}
```

Independent plugin assemblies implement it without the core application
depending on those implementations.

## When to Use It

Use Separated Interface when:

-   dependency direction matters,
-   an implementation belongs in an outer layer,
-   a plugin or integration must implement a core contract,
-   you need package-level independence.

## When to Skip It

Do not create interfaces merely to satisfy a layering rule.

If there is no dependency boundary to protect, a concrete class may be
simpler.

## Related Patterns

-   Gateway
-   Mapper
-   Repository
-   Layer Supertype

## Summary

Separated Interface is deceptively simple: put the abstraction where the
consumer can depend on it without depending on the implementation
package.

In modern .NET, project references and dependency injection make this
pattern especially powerful.

It is one of the clearest mechanisms for turning architectural
dependency rules into compiler-enforced structure.
