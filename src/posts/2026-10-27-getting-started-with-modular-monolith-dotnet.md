---
author: Steve Kaschimer
date: 2026-10-27
image: /images/posts/2026-10-27-hero.webp
image_alt: "A grid of bordered boxes representing modules, each with a small padlock on its interior and a single narrow doorway line labeled Contracts connecting adjacent boxes."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is a 2x2 grid of bordered rectangular boxes (modules), each with a small amber padlock icon near its center representing internal, protected content. Between adjacent boxes, a single thin teal line with a small doorway/gate glyph connects them at one narrow point only, labeled implicitly as a crossing point rather than an open wall. One box in the grid has a faint red crack running partway across its border, suggesting a boundary under strain. Mood is orderly but watchful - structure that requires upkeep. Avoid: vendor logos, brand colors, circuit-board textures, gears, or literal brick-wall imagery."
layout: post.njk
site_title: Tech Notes
summary: "A Modular Monolith is deceptively easy to describe and genuinely hard to keep honest. A setup guide for making module boundaries a compiler-enforced guarantee instead of an aspiration that erodes under deadline pressure."
tags: ["dotnet", "architecture", "microservices", "platform-engineering", "ci-cd"]
title: "Getting Started with Modular Monolith Architecture in .NET"
---

A Modular Monolith is deceptively easy to describe and genuinely hard to keep honest: one deployable application, internally split into modules that behave almost like separate services - owning their own data, exposing narrow public interfaces, and never reaching directly into each other's internals. The description sounds like good hygiene any codebase should have. The hard part is that nothing forces it to stay true except deliberate enforcement, and the moment that enforcement lapses, it's just a monolith again.

This guide covers structuring a Modular Monolith solution in .NET, bootstrapping module boundaries so they're compiler-enforced rather than aspirational, the core workflow of adding a feature within the right module, and the best practices that keep boundaries intact as the system and team grow. By the end you'll have a structure that gets most of the benefit people associate with Microservices, without the operational cost.

If you're deciding between architecture styles first, [a comparison of the top .NET architecture patterns](/posts/2026-09-29-top-5-dotnet-architecture-patterns-compared/) covers where Modular Monolith fits relative to layered architecture, Clean Architecture, Vertical Slice, and Microservices.

## What You'll Need

- .NET 8 SDK or later
- A relational database - modules can share a database with separate schemas, or use fully separate databases, depending on how strict you want isolation to be
- A library like `NetArchTest` or `ArchUnitNET` for enforcing boundaries automatically in CI

## Installing and Scaffolding

There's no special package that makes a solution a Modular Monolith - the pattern lives entirely in how you structure projects and enforce references between them. Start with one project per module, plus a thin host:

```bash
dotnet new sln -n MyApp

dotnet new webapi -n MyApp.Host

dotnet new classlib -n MyApp.Modules.Orders
dotnet new classlib -n MyApp.Modules.Orders.Contracts

dotnet new classlib -n MyApp.Modules.Inventory
dotnet new classlib -n MyApp.Modules.Inventory.Contracts

dotnet sln add MyApp.Host MyApp.Modules.Orders MyApp.Modules.Orders.Contracts MyApp.Modules.Inventory MyApp.Modules.Inventory.Contracts

dotnet add MyApp.Host reference MyApp.Modules.Orders MyApp.Modules.Inventory

# Modules depend on each other's Contracts projects only -- never on each other's implementation
dotnet add MyApp.Modules.Orders reference MyApp.Modules.Inventory.Contracts
```

Note what's missing: `MyApp.Modules.Orders` never gets a reference to `MyApp.Modules.Inventory` directly - only to its `Contracts` project. That asymmetry is the whole mechanism that keeps modules from reaching into each other's internals.

## Bootstrapping the Ideal Environment

Two decisions determine whether a Modular Monolith stays a Modular Monolith: how modules communicate, and how modules store data. Get both wrong and it quietly becomes a regular monolith with extra folders.

### Contracts projects: the only thing modules can see of each other

Each module exposes a `Contracts` project containing the interfaces, DTOs, and events other modules are allowed to depend on - nothing else:

```csharp
// MyApp.Modules.Inventory.Contracts/IInventoryService.cs
public interface IInventoryService
{
    Task<bool> IsInStockAsync(string sku, int quantity);
    Task ReserveAsync(string sku, int quantity);
}
```

```csharp
// MyApp.Modules.Inventory/InventoryService.cs
internal class InventoryService(InventoryDbContext db) : IInventoryService
{
    // internal -- cannot be referenced directly from outside this module,
    // only through the IInventoryService interface in Contracts
    public async Task<bool> IsInStockAsync(string sku, int quantity) { /* ... */ return true; }
    public Task ReserveAsync(string sku, int quantity) => Task.CompletedTask;
}
```

Marking the implementation `internal` is what makes the boundary a compile-time guarantee - `MyApp.Modules.Orders` physically cannot instantiate `InventoryService` directly, only consume it through `IInventoryService`.

### Each module owns its own data

Give each module its own `DbContext`, scoped to only the tables it owns:

```csharp
// MyApp.Modules.Inventory/InventoryDbContext.cs
internal class InventoryDbContext(DbContextOptions<InventoryDbContext> options) : DbContext(options)
{
    public DbSet<StockItem> StockItems => Set<StockItem>();
}
```

Whether modules share one physical database with separate schemas, or use fully separate databases, is a deployment decision independent of the code-level boundary - both are legitimate, and many teams start with shared-database-separate-schema and split databases later only if a real need arises.

### Registering each module's services from the host

```csharp
// MyApp.Modules.Orders/OrdersModule.cs
public static class OrdersModule
{
    public static IServiceCollection AddOrdersModule(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<OrdersDbContext>(opts => opts.UseSqlServer(config.GetConnectionString("Orders")));
        services.AddScoped<IOrderService, OrderService>();
        return services;
    }
}
```

```csharp
// MyApp.Host/Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOrdersModule(builder.Configuration);
builder.Services.AddInventoryModule(builder.Configuration);

var app = builder.Build();
app.Run();
```

Each module registers itself; the host stays thin, just composing modules rather than knowing their internals.

### Enforce boundaries with architecture tests

Project references stop the most obvious cross-module reach, but add an explicit test so a violation fails CI rather than waiting for code review to catch it:

```csharp
[Fact]
public void Orders_Should_Only_Depend_On_Inventory_Contracts()
{
    var result = Types.InAssembly(typeof(OrdersModule).Assembly)
        .That().ResideInNamespace("MyApp.Modules.Orders")
        .ShouldNot().HaveDependencyOn("MyApp.Modules.Inventory")
        .GetResult();

    Assert.True(result.IsSuccessful);
}
```

## Core Workflow

Adding a feature starts with a question layered architecture and Vertical Slice Architecture don't ask: **which module owns this?** Once that's settled:

1. Implement the feature entirely within that module - internally, it can use Clean Architecture, Vertical Slice Architecture, or whatever fits that module best
2. If the feature needs data or behavior from another module, go through that module's `Contracts` interface - never its internals
3. If two modules need to react to the same event (an order being placed, inventory needing to be reserved), consider an in-process event/message mechanism rather than a direct synchronous call, so modules stay loosely coupled

## Verifying Your Setup

1. **Cross-module references only touch Contracts projects** - audit each module's `.csproj` and confirm it never references another module's implementation project
2. **Implementation types are `internal`, not `public`** - confirm a module's service classes can't be instantiated directly from outside the module
3. **Architecture tests fail on a deliberate violation** - as a test, temporarily add a direct cross-module reference and confirm your CI build catches it
4. **Each module's data is genuinely isolated** - confirm one module's `DbContext` has no `DbSet` for tables another module owns

## Best Practices

**Decide module boundaries around business capabilities, not technical layers.** "Orders" and "Inventory" are good module boundaries; "Controllers" and "Services" are not - that's just layered architecture with extra ceremony.

**Make internals `internal`, not just conventionally private.** The compiler enforcing the boundary is worth far more than a naming convention or a comment saying "don't reach into this."

**Automate boundary enforcement from day one.** A Modular Monolith with only code-review-enforced boundaries degrades within a few sprints under any real deadline pressure. Architecture tests in CI are what make the boundary durable.

**Let each module choose its own internal architecture.** A complex module can use Clean Architecture internally; a simple one can use Vertical Slice Architecture or even plain layered code. The modular boundary is what protects the rest of the system - it doesn't need to dictate what happens inside.

**Communicate between modules through contracts and events, not shared database queries.** A module querying another module's tables directly defeats the entire point of the boundary, even if it happens to work today.

## Comparison with Microservices

| Dimension | Modular Monolith | Microservices |
| --- | --- | --- |
| Deployment unit | One application | Many independently deployable services |
| Module communication | In-process, through Contracts interfaces | Over the network (HTTP, messaging) |
| Data isolation | Enforced by convention/DbContext scoping, physically co-located | Enforced by physical separation - each service owns its own database |
| Operational overhead | Minimal - one thing to deploy, monitor, and scale | Significant - service discovery, distributed tracing, per-service pipelines |
| Best fit | Systems needing internal boundaries without distributed complexity | Organizations needing independent team deployment and scaling |

A Modular Monolith is often the more honest starting point for systems that might eventually need Microservices - module boundaries enforced in-process translate far more cleanly into service boundaries later than trying to retrofit boundaries into a tangled monolith after the fact.

## Frequently Asked Questions

### Should each module have its own database?

It depends on how much isolation you need now versus how much migration flexibility you want later. Separate schemas in a shared database is a common starting point - simpler operationally, while still keeping each module's tables logically scoped to that module. Fully separate databases give stronger isolation and a more direct path to Microservices later, at the cost of more operational setup upfront.

### How do modules communicate without breaking the boundary?

Through each module's `Contracts` project - interfaces and DTOs specifically designed to be consumed externally. For scenarios where synchronous, direct calls create too much coupling (module A needs to know about an event in module B without calling it directly), an in-process event or messaging mechanism keeps modules reacting to each other without depending on each other's implementation details.

### What stops a Modular Monolith from becoming a regular monolith over time?

Automated enforcement - architecture tests that fail the build on a boundary violation, and implementation types marked `internal` so illegal cross-module references are compile errors, not just discouraged. Without both, boundaries erode under deadline pressure regardless of how clearly they were originally documented.

### Can different modules use different architectures internally?

Yes, and this is one of the pattern's real strengths. A module with complex domain logic can use Clean Architecture internally; a simpler module can use Vertical Slice Architecture or plain layered code. The modular boundary protects the rest of the system regardless of what's happening inside any one module.

### Is a Modular Monolith just a stepping stone to Microservices?

Not necessarily - it's a complete, legitimate architecture that many systems stay on indefinitely, because the organizational need that would justify Microservices' operational cost never actually materializes. That said, well-enforced module boundaries do make a later split into services meaningfully easier if that need does eventually show up.

### How many modules is too many for a Modular Monolith?

There's no fixed number - the practical limit is usually about whether your team can still reason about module boundaries and ownership clearly. If modules start needing to know a lot about each other's internals just to function, that's usually a sign the boundaries were drawn in the wrong place, not that the pattern has been outgrown.

### Do I need message queues or an event bus for a Modular Monolith?

Not necessarily. Because modules run in the same process, in-process event dispatching (a simple mediator or domain event pattern) is often enough to keep modules decoupled without introducing external messaging infrastructure. A real message broker becomes more relevant if you're anticipating splitting specific modules into separate services later.
