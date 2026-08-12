# Getting Started with GraphQL (Hot Chocolate) in .NET

GraphQL's promise -- clients ask for exactly the fields they need, nested across related entities, in one request -- is genuinely compelling, and it's also exactly what makes a naive first implementation slow. The classic trap is the N+1 query problem: a query for ten orders, each resolving its own customer, silently becomes eleven database round trips instead of two. Hot Chocolate's DataLoader pattern exists specifically to solve this, and understanding it early is the difference between a GraphQL API that scales and one that quietly falls over under real traffic.

This guide covers setting up Hot Chocolate in .NET, bootstrapping a schema with EF Core integration and DataLoaders from the start, the core query and mutation workflow, and the best practices -- including query depth limiting -- that keep a GraphQL API both fast and safe from the flexibility it deliberately gives clients. By the end you'll have a schema that resolves efficiently even for nested, nontrivial queries.

If you're deciding between API styles first, a comparison of the top .NET API styles covers where GraphQL fits relative to Minimal APIs, Controllers, gRPC, and SignalR.

## What You'll Need

- .NET 8 SDK or later
- A database and EF Core, if you're integrating GraphQL directly with your data layer (the most common setup)
- Comfort with the concept of a schema-first (or code-first, as Hot Chocolate favors) API design

## Installing Hot Chocolate

```bash
dotnet new web -n MyApp.GraphQL
cd MyApp.GraphQL

dotnet add package HotChocolate.AspNetCore
dotnet add package HotChocolate.Data
dotnet add package HotChocolate.Data.EntityFramework
```

## Bootstrapping the Ideal Environment

### Define your schema with query and mutation types

Hot Chocolate is code-first by default -- your schema is generated from C# classes and attributes, rather than hand-written in GraphQL's schema definition language:

```csharp
public class Query
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Order> GetOrders(AppDbContext db) => db.Orders;
}

public class Mutation
{
    public async Task<Order> ProcessOrder(int orderId, AppDbContext db)
    {
        var order = await db.Orders.FindAsync(orderId)
            ?? throw new GraphQLException($"Order {orderId} not found");

        order.Status = OrderStatus.Processing;
        await db.SaveChangesAsync();
        return order;
    }
}
```

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>();

var app = builder.Build();
app.MapGraphQL();
app.Run();
```

`[UseProjection]`, `[UseFiltering]`, and `[UseSorting]` are what let Hot Chocolate translate a client's GraphQL query directly into an efficient EF Core query -- only selecting the fields actually requested, applying filters and sorting at the database level rather than in memory.

### DataLoaders: solving the N+1 problem deliberately

Without a DataLoader, resolving a `Customer` for each `Order` in a list triggers one database call per order:

```csharp
public class OrderType : ObjectType<Order>
{
    protected override void Configure(IObjectTypeDescriptor<Order> descriptor)
    {
        descriptor.Field(o => o.Customer)
            .ResolveWith<OrderResolvers>(r => r.GetCustomer(default!, default!));
    }
}

public class OrderResolvers
{
    public async Task<Customer> GetCustomer(
        [Parent] Order order,
        CustomerByIdDataLoader dataLoader) =>
        await dataLoader.LoadAsync(order.CustomerId);
}
```

```csharp
public class CustomerByIdDataLoader : BatchDataLoader<int, Customer>
{
    private readonly IDbContextFactory<AppDbContext> _dbContextFactory;

    public CustomerByIdDataLoader(
        IDbContextFactory<AppDbContext> dbContextFactory,
        IBatchScheduler batchScheduler) : base(batchScheduler)
    {
        _dbContextFactory = dbContextFactory;
    }

    protected override async Task<IReadOnlyDictionary<int, Customer>> LoadBatchAsync(
        IReadOnlyList<int> keys, CancellationToken ct)
    {
        await using var db = await _dbContextFactory.CreateDbContextAsync(ct);
        return await db.Customers
            .Where(c => keys.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, ct);
    }
}
```

This batches all the customer lookups for a single query into one database call instead of one-per-order, regardless of how many orders the client requested -- this is the single most important optimization to understand before shipping a GraphQL API with any related-entity resolution.

### Guard against expensive queries

Because clients control query shape and depth, add limits before this becomes a production incident rather than after:

```csharp
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddMaxExecutionDepthRule(15)
    .SetPagingOptions(new PagingOptions { MaxPageSize = 100 });
```

## Core Workflow

- **Add fields to `Query` and `Mutation` classes, letting Hot Chocolate's conventions generate the schema.** You're describing what's queryable, not hand-writing endpoints per operation.
- **Use `[UseProjection]` for any field returning an `IQueryable`**, so client-requested fields translate directly into an efficient SQL `SELECT`.
- **Add a DataLoader the moment a field resolves a related entity**, not after profiling reveals an N+1 problem in production.

```csharp
// A query the client might send
query {
  orders(where: { status: { eq: PROCESSING } }) {
    id
    status
    customer {
      name
    }
  }
}
```

This single client-driven query replaces what would otherwise be a purpose-built REST endpoint (or several, for different client needs) -- the flexibility is real, but so is the responsibility to make sure it resolves efficiently regardless of what the client asks for.

## Verifying Your Setup

1. **Projection is actually reducing query cost** -- use EF Core's query logging to confirm a GraphQL query requesting few fields generates a `SELECT` with only those columns, not `SELECT *`
2. **DataLoaders are batching, not N+1ing** -- for any query resolving a list of entities with a related field, confirm the database log shows one batched query, not one per item
3. **Depth and complexity limits are enforced** -- attempt a deliberately deep or expensive nested query and confirm it's rejected rather than executed
4. **The schema is explorable** -- Hot Chocolate's built-in Banana Cake Pop IDE (available at `/graphql` in development) should let you browse the schema and run test queries

## Best Practices

**Add a DataLoader for every relationship a client might traverse, before it ships, not after a performance incident reveals it.** N+1 queries are the single most common GraphQL performance problem, and Hot Chocolate gives you the tool to prevent it from the start.

**Set query depth and complexity limits from day one.** An API that lets clients construct arbitrarily deep or expensive queries is an API with an unbounded cost model -- that's a real operational risk, not a theoretical one.

**Use `[UseProjection]`, `[UseFiltering]`, and `[UseSorting]` on `IQueryable`-returning fields.** This is what makes Hot Chocolate translate client query shape directly into efficient database queries rather than over-fetching and filtering in memory.

**Don't expose your EF Core entities directly as your GraphQL types without thinking about it.** It's convenient early on, but consider whether your GraphQL schema should be a deliberate API contract independent of your database schema, the same consideration that applies to REST DTOs.

**Version your schema thoughtfully.** GraphQL doesn't have REST's URL-based versioning convention -- deprecate fields explicitly (`@deprecated` directive) rather than removing them outright, giving clients time to migrate.

## Comparison with gRPC

| | GraphQL (Hot Chocolate) | gRPC |
| --- | --- | --- |
| Contract | Schema-defined, client chooses fields per request | Strict, `.proto`-defined, fixed per RPC method |
| Transport | HTTP, typically JSON | HTTP/2, binary Protobuf |
| Best fit | Front ends needing flexible, nested data | High-volume internal service-to-service calls |
| Browser support | Native | Requires gRPC-Web and a proxy |
| Query cost risk | Client-controlled, needs depth/complexity limits | Fixed per RPC, no equivalent risk |

They solve different problems -- GraphQL optimizes for client-driven flexibility at the edge, gRPC optimizes for strict, high-performance contracts between services. A system commonly uses GraphQL facing clients and gRPC internally between services, rather than choosing one for everything.

## Frequently Asked Questions

### What's the N+1 problem in GraphQL, and why does it matter so much?

It's when resolving a list of entities, each with a related field, triggers one database query per item instead of one batched query -- ten orders each resolving their own customer becomes eleven queries instead of two. It matters more in GraphQL than REST because GraphQL's whole value proposition is letting clients request nested, related data freely, which means N+1 patterns are the default outcome unless you deliberately prevent them with something like Hot Chocolate's DataLoader.

### Do I need a DataLoader for every field, or just relationships?

Just for fields that resolve related entities per item in a list -- a scalar field directly on the entity (like `order.Status`) doesn't need one, since it's already loaded with the parent. Any field that triggers an additional lookup per item (a related `Customer`, a related `Product`) is a DataLoader candidate.

### How do I prevent clients from writing expensive, deeply nested queries?

Configure `AddMaxExecutionDepthRule` and paging options (`SetPagingOptions` with a `MaxPageSize`) when registering your GraphQL server. This puts a hard limit on how deep or how much data a single query can request, regardless of how the client constructs it.

### Should my GraphQL types be my EF Core entities directly, or separate DTOs?

Either works, but treat it as a deliberate decision, not a default. Exposing entities directly is faster to set up but couples your API schema to your database schema -- the same trade-off REST APIs face when deciding whether to return entities or DTOs. For a schema meant to be a stable public contract, separate types give you more control over what's exposed and how it evolves independently of your data model.

### Can I combine GraphQL with a REST or gRPC API in the same solution?

Yes, and it's common -- GraphQL for client-facing, data-flexible needs; REST or gRPC for simpler operations, webhooks, or internal service-to-service calls that don't benefit from GraphQL's query flexibility. They can be hosted side by side in the same ASP.NET Core application.

### How do I version a GraphQL schema?

Deprecate fields explicitly using the `@deprecated` directive rather than removing them outright -- this signals to clients (and to tooling like Banana Cake Pop) that a field is going away without breaking existing queries immediately. GraphQL doesn't have REST's URL-based versioning convention; schema evolution is generally additive and deprecation-driven instead.

### What's the most common mistake in a first Hot Chocolate setup?

Shipping relationship-resolving fields without DataLoaders, which works fine in testing with small datasets and becomes a real performance problem the moment a query returns a realistic number of items. The second most common is skipping depth and complexity limits, leaving the API's cost model effectively unbounded and controlled entirely by whatever clients choose to send.
