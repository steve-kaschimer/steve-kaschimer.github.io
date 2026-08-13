---
author: Steve Kaschimer
date: 2027-03-23
image: /images/posts/2027-03-23-hero.webp
image_alt: "A shape split evenly down the middle, one half a compact generated-method icon, the other half a raw SQL bracket glyph, meeting at a shared connector in the center."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single rounded rectangle split cleanly down the vertical middle by a thin hairline: the left half in teal contains four small compact icons representing generated CRUD methods (insert, update, delete, query arrows), the right half in amber contains a raw SQL bracket glyph. Both halves connect to a shared small circular node at the bottom center, implying one underlying connection powering both paths. Mood is balanced, pragmatic, and dual-purpose. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art."
layout: post.njk
site_title: Tech Notes
summary: "Dapper is fast but leaves you writing the same CRUD SQL repeatedly; EF Core writes it for you at a real cost. A setup guide for RepoDb's generated CRUD methods, the raw-SQL escape hatch, bulk operations, and the bootstrap call that's easy to skip."
tags: ["dotnet", "orm", "database", "performance", "developer-productivity"]
title: "Getting Started with RepoDb in .NET"
---

RepoDb's whole reason for existing is a specific complaint: Dapper is fast but leaves you writing the same CRUD SQL over and over, while EF Core does CRUD for you but at a real performance and abstraction cost. RepoDb sits deliberately between them - generated CRUD methods when you want convenience, raw SQL when you want control, and consistently strong benchmark performance either way.

This guide covers installing RepoDb, bootstrapping connection handling and its code-generation-free mapping approach, the core CRUD and raw-query workflow, and the best practices that make the most of its hybrid design instead of accidentally using it like a slower Dapper. By the end you'll have a fast, low-boilerplate data layer that still gives you an escape hatch to raw SQL whenever you need it.

If you're deciding between ORMs first, [a comparison of the top .NET ORMs](/posts/2027-02-16-top-5-dotnet-orms-compared/) covers where RepoDb fits relative to EF Core, Dapper, NHibernate, and Linq2Db.

## What You'll Need

- .NET 8 SDK or later
- A database and the corresponding RepoDb extension package
- The same ADO.NET provider you'd use with Dapper, since RepoDb also works on top of `IDbConnection`

## Installing RepoDb

```bash
dotnet add package RepoDb
dotnet add package RepoDb.SqlServer
```

RepoDb ships a core package plus database-specific extension packages (`RepoDb.SqlServer`, `RepoDb.PostgreSql`, `RepoDb.MySql`, `RepoDb.Sqlite`, and others) that register provider-specific behavior. Call the provider's bootstrap method once at startup:

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

SqlServerBootstrap.Initialize();

builder.Services.AddSingleton<IDbConnectionFactory>(
    new SqlConnectionFactory(builder.Configuration.GetConnectionString("Default")!));
```

## Bootstrapping the Ideal Environment

### Define plain entity classes

RepoDb doesn't require attributes, base classes, or a fluent mapping API for basic use - convention-based mapping (matching property names to column names) works out of the box:

```csharp
public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public OrderStatus Status { get; set; }
}
```

For cases where naming doesn't match, map explicitly:

```csharp
[Map("tbl_orders")]
public class Order
{
    [Map("order_id")]
    public int Id { get; set; }
}
```

### Connection handling, the same pattern as Dapper

```csharp
public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

public class SqlConnectionFactory(string connectionString) : IDbConnectionFactory
{
    public IDbConnection CreateConnection() => new SqlConnection(connectionString);
}
```

RepoDb extends `IDbConnection` the same way Dapper does, so if you're migrating from or pairing with Dapper, the connection lifecycle management is identical - create per unit of work, wrap in `using`.

## Core Workflow

### Generated CRUD methods for the common case

```csharp
using var connection = connectionFactory.CreateConnection();

var order = await connection.QueryAsync<Order>(o => o.Id == orderId);

var newId = await connection.InsertAsync(new Order { CustomerId = 1, Status = OrderStatus.Pending });

await connection.UpdateAsync(new Order { Id = orderId, Status = OrderStatus.Shipped },
    o => o.Id == orderId);

await connection.DeleteAsync<Order>(orderId);
```

This is RepoDb's core value proposition over plain Dapper: the same kind of CRUD you'd otherwise hand-write as SQL strings is available as strongly-typed method calls, without the change-tracking overhead a full ORM would add.

### Raw SQL when you need it

```csharp
using var connection = connectionFactory.CreateConnection();

var results = await connection.ExecuteQueryAsync<OrderSummary>(
    """
    SELECT o.Id, o.Status, c.Name AS CustomerName
    FROM Orders o
    JOIN Customers c ON c.Id = o.CustomerId
    WHERE o.Status = @Status
    """,
    new { Status = OrderStatus.Processing });
```

This is the same Dapper-style raw SQL execution - RepoDb doesn't force you to express everything through its method-based API, which is the point of the hybrid design.

### Bulk operations

```csharp
using var connection = connectionFactory.CreateConnection();

await connection.InsertAllAsync(newOrders);
```

`InsertAllAsync`, `UpdateAllAsync`, and `MergeAllAsync` are optimized for bulk operations, generally outperforming issuing individual insert/update calls in a loop.

## Verifying Your Setup

1. **Provider bootstrap ran** - confirm `SqlServerBootstrap.Initialize()` (or the equivalent for your provider) executes once at startup; skipping it causes provider-specific features to silently not work
2. **Convention-based mapping matches your schema** - for entities without explicit `[Map]` attributes, confirm property names align with actual column names
3. **Generated CRUD produces expected SQL** - RepoDb supports tracing/logging; check a few queries to confirm the generated SQL matches expectations
4. **Bulk operations are actually being used for bulk scenarios** - confirm you're not looping individual `InsertAsync` calls where `InsertAllAsync` would be both simpler and faster

## Best Practices

**Use generated CRUD methods for standard operations, raw SQL for anything complex.** That split is the entire point of choosing RepoDb over plain Dapper - lean into both sides rather than defaulting to raw SQL everywhere out of Dapper habit.

**Use the bulk operation methods for anything inserting or updating more than a handful of rows.** `InsertAllAsync` and `UpdateAllAsync` are specifically optimized for this and meaningfully outperform row-by-row loops.

**Enable RepoDb's built-in caching deliberately for read-heavy, infrequently-changing data.** Its `MemoryCache` integration is a real feature worth using where it fits, not something to bolt on reflexively everywhere.

**Keep entity classes plain where possible, and use `[Map]` attributes only where naming conventions don't align.** This keeps the convention-based mapping doing most of the work without unnecessary annotation clutter.

**Pick a schema migration tool, the same as with Dapper or Linq2Db.** RepoDb doesn't manage schema evolution - that's consistently true across every micro-ORM in this series, and needs a separate, deliberate decision.

## Comparison with Dapper

| | RepoDb | Dapper |
| --- | --- | --- |
| Query style | Method-based CRUD + raw SQL | Raw SQL only |
| Boilerplate for common CRUD | Low - generated methods | Higher - every query hand-written |
| Performance | Comparable to or exceeding Dapper in benchmarks | Consistently fast baseline |
| Built-in caching | Yes, via MemoryCache integration | No |
| Community size | Smaller | Larger, more established |

RepoDb is best understood as "what if Dapper generated the boring CRUD for you" - it keeps Dapper's raw SQL escape hatch and connection model while removing the need to hand-write basic insert/update/delete/select statements for straightforward entities.

## Frequently Asked Questions

### How is RepoDb different from Dapper if both lack change tracking?

RepoDb adds generated, strongly-typed CRUD methods (`InsertAsync`, `UpdateAsync`, `DeleteAsync`, `QueryAsync` with expression-based filters) on top of the same raw-SQL-when-you-want-it model Dapper uses. Dapper requires you to hand-write SQL for every operation, including simple ones; RepoDb only requires it for queries complex enough to need it.

### Do I need to call a bootstrap method before using RepoDb?

Yes, for most providers - something like `SqlServerBootstrap.Initialize()` needs to run once at application startup to register provider-specific behavior. Skipping it is a common cause of confusing runtime errors that look unrelated to the actual missing step.

### Does RepoDb support migrations?

No - like Dapper and Linq2Db, schema management is left entirely to you. Pair it with a dedicated migration tool such as DbUp or Fluent Migrator, and keep schema changes versioned independently of your RepoDb query and CRUD code.

### Is RepoDb actually faster than Dapper?

Benchmarks frequently show RepoDb matching or slightly exceeding Dapper's performance, particularly for its generated CRUD operations and bulk methods. The practical difference for most applications is smaller than raw benchmark numbers suggest - the bigger win is usually reduced boilerplate, not a dramatic performance gap.

### Can I mix RepoDb's generated methods with raw SQL in the same project?

Yes, and that's the intended usage pattern - use generated CRUD methods (`InsertAsync`, `UpdateAsync`, expression-based `QueryAsync`) for straightforward operations, and drop into `ExecuteQueryAsync` with raw SQL for anything complex enough that the generated API doesn't fit cleanly.

### Is RepoDb mature enough for production use?

Yes, it's used in production systems, though with a meaningfully smaller community than EF Core or Dapper. That means fewer tutorials, less third-party tooling, and a smaller pool of developers already familiar with it - a reasonable trade-off for many teams, but worth weighing against the two more established options.

### What's the most common mistake in a first RepoDb setup?

Forgetting to call the provider's bootstrap method at startup, and treating RepoDb exactly like Dapper by hand-writing raw SQL for everything - which works, but skips the reduced-boilerplate CRUD methods that are RepoDb's main advantage over plain Dapper in the first place.
