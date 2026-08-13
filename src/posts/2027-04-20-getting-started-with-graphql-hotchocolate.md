---
author: Steve Kaschimer
date: 2027-04-20
image: /images/posts/2027-04-20-hero.webp
image_alt: "A flexible bracket shape with several thin branches fanning out to represent selectable fields, converging into a single batched query icon instead of many separate ones."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a flexible bracket-shaped glyph on the left with several thin teal branches fanning outward, each ending in a small selectable-field dot, representing client-selected fields. On the right, all branches converge through a narrow batching funnel into a single amber query icon, representing a DataLoader collapsing many lookups into one. Below, a small depth-limit ruler icon caps a short vertical stack of nested brackets. Mood is flexible, deliberate, and precise. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art."
layout: post.njk
site_title: Tech Notes
summary: "Hot Chocolate lets clients request exactly the fields they need instead of the server dictating a fixed shape - but the N+1 problem and unbounded query cost are real, common pitfalls. A setup guide for projections, DataLoader batching, and depth limiting."
tags: ["dotnet", "api-design", "graphql", "performance", "architecture"]
title: "Getting Started with GraphQL (Hot Chocolate) in .NET"
---

Hot Chocolate is the standard GraphQL server library for .NET, and its core pitch is real: clients get to request exactly the fields they need in a single query, instead of the server dictating a fixed response shape the way REST does. What the pitch leaves out is that this flexibility comes with two problems you'll hit almost immediately on any non-trivial schema - the N+1 query problem, and clients being able to construct expensive queries you didn't anticipate. Both have well-established fixes, but only if you know to apply them from the start.

This guide covers installing Hot Chocolate, defining a code-first schema with projections, solving the N+1 problem with `DataLoader`, and limiting query cost before a client can accidentally (or deliberately) construct an expensive query. By the end you'll have a GraphQL API that stays fast as your schema grows, not one that works fine in a demo and falls over on a real dataset.

If you're deciding between API styles first, [a comparison of the top .NET API styles](/posts/2027-03-30-top-5-dotnet-api-styles-compared/) covers where GraphQL fits relative to Minimal APIs, Controllers, gRPC, and SignalR.

## What You'll Need

- .NET 8 SDK or later
- An EF Core-backed data model, since this guide uses `HotChocolate.Data.EntityFramework` for its examples
- Comfort with the idea that a single `/graphql` endpoint replaces multiple REST endpoints, since that's a mental model shift for teams coming from REST

## Installing Hot Chocolate

```bash
dotnet add package HotChocolate.AspNetCore
dotnet add package HotChocolate.Data
dotnet add package HotChocolate.Data.EntityFramework
```

## Bootstrapping the Ideal Environment

### Define a code-first schema

```csharp
public class Query
{
    [UseProjection, UseFiltering, UseSorting]
    public IQueryable<Order> GetOrders(AppDbContext db) => db.Orders;
}

public class Mutation
{
    public async Task<Order> CreateOrder(CreateOrderInput input, AppDbContext db)
    {
        var order = new Order { CustomerId = input.CustomerId };
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return order;
    }
}
```

```csharp
// Program.cs
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddProjections()
    .AddFiltering()
    .AddSorting();

var app = builder.Build();
app.MapGraphQL();
```

`[UseProjection]` is what makes field selection actually efficient - without it, Hot Chocolate would fetch every column of every `Order` row regardless of which fields the client asked for, then discard the rest in memory. With it, the projection pushes down into the EF Core query itself, so the client selecting three fields out of fifteen produces a query that only selects those three columns.

### Explore the schema with Banana Cake Pop

Hot Chocolate ships an interactive GraphQL IDE at `/graphql` by default (Banana Cake Pop) - a query explorer and schema browser without needing a separate API client, useful during development for constructing and testing queries against your actual schema.

## Core Workflow

### The N+1 problem, and fixing it with DataLoader

Resolving a list of orders, then a related field (say, `Customer`) on each one, naively issues one query per order instead of one query for the whole batch:

```csharp
public class CustomerByIdDataLoader(IServiceScopeFactory scopeFactory, IBatchScheduler batchScheduler)
    : BatchDataLoader<int, Customer>(batchScheduler)
{
    protected override async Task<IReadOnlyDictionary<int, Customer>> LoadBatchAsync(
        IReadOnlyList<int> keys, CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return await db.Customers
            .Where(c => keys.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, cancellationToken);
    }
}
```

```csharp
public class OrderResolvers
{
    public async Task<Customer> GetCustomer([Parent] Order order, CustomerByIdDataLoader dataLoader) =>
        await dataLoader.LoadAsync(order.CustomerId);
}
```

`BatchDataLoader` collects every `CustomerId` requested during a single GraphQL request execution and issues one query for the whole batch instead of one per order - this is the standard fix for the N+1 problem in any GraphQL server, not a Hot Chocolate-specific workaround.

### Limiting query cost before it's a problem

A GraphQL schema without limits lets a client construct a deeply nested query that's expensive to resolve - unlike REST, where the server controls the response shape and implicitly bounds the cost:

```csharp
builder.Services
    .AddGraphQLServer()
    // ...
    .AddMaxExecutionDepthRule(15)
    .SetPagingOptions(new PagingOptions { MaxPageSize = 50, DefaultPageSize = 20 });
```

`AddMaxExecutionDepthRule` caps how deeply a query can nest, and `SetPagingOptions` caps how many items a paginated field can return per request - both are cheap to set up and protect against both accidental and deliberate abuse of the schema's flexibility.

## Verifying Your Setup

1. **Projections actually reduce the generated SQL** - log EF Core's generated queries and confirm selecting fewer fields in a GraphQL query produces a narrower `SELECT`
2. **DataLoader is batching, not issuing N queries** - log or profile a query resolving a list plus a related field per item, and confirm one batched query for the related data, not one per item
3. **Depth and paging limits actually reject over-limit queries** - send a deliberately over-nested query or an oversized page request and confirm it's rejected, not silently executed
4. **Banana Cake Pop reflects your actual schema** - open `/graphql` and confirm the schema explorer matches your defined types and fields

## Best Practices

**Apply `[UseProjection]` to every query resolver returning entity data, not selectively.** The efficiency gain scales with schema size - the more fields a type has, the more a naive full-row fetch wastes when the client only wanted a few.

**Use DataLoader for every resolver that fetches related data per-item, as a default habit rather than a fix applied after noticing a performance problem.** The N+1 problem is easy to introduce and easy to miss in a demo with a small dataset - assume it will happen and batch from the start.

**Set depth and paging limits before shipping the schema publicly, not after an expensive query shows up in production.** These are cheap, one-time configuration - there's no good reason to defer them.

**Keep resolvers thin and push filtering/sorting/projection down to the data layer via the built-in middleware, rather than hand-rolling equivalents.** `[UseFiltering]`/`[UseSorting]` compose with `[UseProjection]` and translate to efficient EF Core queries; hand-written equivalents rarely do as well without significant effort.

**Version schema changes with `@deprecated` rather than breaking changes.** GraphQL's single-endpoint model means there's no URL versioning escape hatch the way REST has - deprecate fields deliberately and give clients time to migrate before removal.

## Comparison with gRPC

| | GraphQL (Hot Chocolate) | gRPC |
| --- | --- | --- |
| Client flexibility | Client selects exact fields needed | Server dictates message shape |
| Transport | HTTP, JSON | HTTP/2, Protobuf |
| Browser support | Full | None without gRPC-Web + proxy |
| Performance | Good, resolver cost needs managing | Fastest - binary serialization |
| Best for | Client-driven, varied data needs | Internal service-to-service calls |

Both solve very different problems despite both being alternatives to plain REST - GraphQL optimizes for client flexibility over a public or semi-public API, gRPC optimizes for raw speed between services you control. They're rarely direct substitutes for the same use case.

## Frequently Asked Questions

### What is the N+1 problem in GraphQL, in plain terms?

Resolving a list of parent entities, then a related field on each one individually, issues one query per item instead of a single batched query - so a list of 100 orders with a `Customer` field naively issues 101 queries instead of 2. `DataLoader` fixes this by collecting all the keys requested during one execution and batching them into a single query.

### Does DataLoader need to be scoped per-request?

Yes - Hot Chocolate registers DataLoaders per GraphQL request execution by default, so the batching window is exactly one request, not shared or cached across unrelated requests. This is what makes it safe to use without stale-data concerns.

### How do I prevent clients from writing expensive queries?

`AddMaxExecutionDepthRule` limits nesting depth, and `SetPagingOptions` bounds how many items a paginated field returns per request. Together these cap the two most common ways a GraphQL query becomes expensive: deep nesting and unbounded list sizes.

### Should my GraphQL types mirror my EF Core entities directly, or use separate DTOs?

Either is workable, but separate DTOs (or dedicated GraphQL types) give you more control over what's exposed and avoid accidentally leaking internal entity structure or triggering unwanted lazy-loading behavior through the GraphQL layer. Mirroring entities directly is faster to set up initially and reasonable for smaller, less public-facing schemas.

### Can GraphQL coexist with REST or gRPC endpoints in the same application?

Yes - it's common for a service to expose a GraphQL endpoint for flexible client queries alongside REST or gRPC endpoints for other purposes (webhooks, service-to-service calls). There's no architectural conflict in running multiple API styles in the same ASP.NET Core application.

### What's the most common mistake in a first Hot Chocolate setup?

Not using `DataLoader` for resolvers that fetch related data per-item, which works fine in development against a small dataset and then produces an N+1 query explosion in production. Skipping depth/paging limits is the second most common - both are cheap to add early and expensive to retrofit after a real client is already depending on the unbounded schema.
