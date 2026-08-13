---
author: Steve Kaschimer
date: 2027-03-02
image: /images/posts/2027-03-02-hero.webp
image_alt: "A raw SQL bracket glyph flowing directly into a mapped object rectangle with almost no gap between them, beside a small padlock icon marking a parameterized value."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a thin bracket-shaped glyph on the left representing a raw query, connected by a very short direct teal line to a flat mapped rectangle on the right, with almost no visual gap between them - implying minimal machinery in between. Just above the connecting line, a small amber padlock icon marks a parameter placeholder. Below, a single connection icon flows outward into several thin lines terminating in a shared pool shape, representing pooled reuse rather than a persistent single connection. Mood is direct, minimal, and fast. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic lightning-bolt speed clip art."
layout: post.njk
site_title: Tech Notes
summary: "You write the SQL, Dapper maps the results onto your objects, and almost nothing happens in between. A setup guide for connection lifecycle, multi-mapping joined queries, parameterization as the one non-negotiable rule, and pairing it with a real migration tool."
tags: ["dotnet", "orm", "database", "performance", "security"]
title: "Getting Started with Dapper in .NET"
---

Dapper's entire pitch fits in one sentence: you write the SQL, Dapper maps the results onto your objects, and almost nothing happens in between. That simplicity is exactly why it's fast, and exactly why the things that trip people up aren't Dapper's fault so much as gaps it deliberately doesn't fill - connection management, migrations, and mapping conventions all become your responsibility rather than the library's.

This guide covers installing Dapper, bootstrapping connection handling and query patterns that scale past a single "hello world" query, the core workflow for reads, writes, and multi-mapping, and the best practices that keep a Dapper-based data layer maintainable once it's more than a handful of queries. By the end you'll have a lightweight, fast data access layer with the rough edges Dapper leaves exposed already sanded down.

If you're deciding between ORMs first, [a comparison of the top .NET ORMs](/posts/2027-02-16-top-5-dotnet-orms-compared/) covers where Dapper fits relative to EF Core, NHibernate, Linq2Db, and RepoDb.

## What You'll Need

- .NET 8 SDK or later
- A database and its corresponding ADO.NET provider (`Microsoft.Data.SqlClient` for SQL Server, `Npgsql` for PostgreSQL, etc.) - Dapper works on top of any `IDbConnection`, so the provider choice is yours
- Comfort writing SQL directly, since that's the entire interface

## Installing Dapper

```bash
dotnet add package Dapper
dotnet add package Microsoft.Data.SqlClient
```

That's the whole install - Dapper is a single lightweight library with no configuration files, no fluent setup, and no code generation step.

## Bootstrapping the Ideal Environment

Dapper doesn't manage connections for you, which is a deliberate design choice - but it means your setup needs to handle connection lifecycle explicitly instead of relying on the library to do it.

### A connection factory, registered through DI

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

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IDbConnectionFactory>(
    new SqlConnectionFactory(builder.Configuration.GetConnectionString("Default")!));
```

Each call site creates and disposes its own connection via `using`, letting ADO.NET's connection pooling do the actual reuse work under the hood - you don't need to manage a long-lived shared connection yourself.

### A first query

```csharp
public class OrderRepository(IDbConnectionFactory connectionFactory)
{
    public async Task<Order?> GetByIdAsync(int orderId)
    {
        using var connection = connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Order>(
            "SELECT Id, CustomerId, Status FROM Orders WHERE Id = @OrderId",
            new { OrderId = orderId });
    }
}
```

Dapper maps columns to properties by name automatically - no configuration needed as long as your query's column names (or aliases) match your class's property names.

### Handling schema, since Dapper won't

Dapper has no migrations system. Pick a dedicated schema migration tool independent of your query layer - DbUp, Fluent Migrator, and Flyway are all common choices - and keep schema changes versioned the same way you'd version anything else, just through a different tool than your query code.

## Core Workflow

### Multi-mapping for joined queries

```csharp
var sql = """
    SELECT o.Id, o.Status, c.Id, c.Name
    FROM Orders o
    JOIN Customers c ON c.Id = o.CustomerId
    WHERE o.Id = @OrderId
    """;

using var connection = connectionFactory.CreateConnection();
var order = await connection.QueryAsync<Order, Customer, Order>(
    sql,
    (order, customer) => { order.Customer = customer; return order; },
    new { OrderId = orderId },
    splitOn: "Id");
```

`splitOn` tells Dapper where one mapped object ends and the next begins in the result set - it's the piece of "configuration" multi-mapping needs, since Dapper can't infer object boundaries from column names alone.

### Writes: parameterized, not string-concatenated

```csharp
using var connection = connectionFactory.CreateConnection();
await connection.ExecuteAsync(
    "UPDATE Orders SET Status = @Status WHERE Id = @OrderId",
    new { Status = OrderStatus.Shipped, OrderId = orderId });
```

Always use parameters (`@OrderId`, passed as an anonymous object) rather than string-interpolating values into SQL. This isn't just a style preference - it's the difference between a parameterized query and a SQL injection vulnerability.

### Batching multiple statements in one round trip

```csharp
using var connection = connectionFactory.CreateConnection();
var orders = await connection.QueryAsync<Order>(
    "SELECT * FROM Orders WHERE CustomerId = @CustomerId", new { CustomerId = customerId });
```

For genuinely bulk inserts or updates, Dapper's `Execute` accepts an `IEnumerable` of parameter objects and batches them efficiently rather than issuing one round trip per row.

## Verifying Your Setup

1. **Queries map correctly** - confirm column aliases match property names, or add explicit aliases where they don't (`SELECT customer_name AS Name`)
2. **Connections aren't leaking** - confirm every `IDbConnection` is created inside a `using` block, since Dapper won't dispose connections for you
3. **Parameters are used everywhere, not string interpolation** - audit for any place SQL is being built with string concatenation instead of `@Parameter` placeholders
4. **Multi-mapped queries split correctly** - for joined queries, confirm `splitOn` is set correctly by checking that nested objects are populated, not null or duplicated

## Best Practices

**Always parameterize, never concatenate.** This is the single non-negotiable rule - string-interpolated SQL is a direct SQL injection risk, and Dapper's anonymous-object parameter syntax makes there no good excuse to skip it.

**Wrap every connection in `using`.** Dapper doesn't manage connection lifecycle, so it's entirely your responsibility to ensure connections are disposed and returned to the pool.

**Keep SQL close to the code that uses it, but out of business logic.** A dedicated repository or query class per feature (especially natural if you're also using [Vertical Slice Architecture](/posts/2026-10-20-getting-started-with-vertical-slice-architecture-dotnet/)) keeps SQL readable without scattering raw strings through unrelated logic.

**Choose a schema migration tool deliberately, don't skip it.** Dapper's lack of built-in migrations doesn't mean schema changes should be undocumented or manual - a lightweight tool like DbUp keeps schema evolution versioned and repeatable.

**Reach for Dapper on specific hot paths, not as a wholesale EF Core replacement, unless your project genuinely doesn't need change tracking or migrations at all.** The EF Core-plus-Dapper hybrid is a common, well-supported pattern precisely because each tool does one part of the job well.

## Comparison with EF Core

| | Dapper | EF Core |
| --- | --- | --- |
| Query style | Raw SQL, mapped to objects | LINQ over tracked entities |
| Change tracking | None | Built in |
| Migrations | None - bring your own | Built-in, mature |
| Connection management | Manual, via `using` | Handled by `DbContext` |
| Best for | Read-heavy paths, reporting, hand-tuned SQL | Domain modeling, schema evolution, most CRUD |

Dapper's speed comes directly from doing less - no change tracking, no query translation layer, no migrations system. That's an advantage on specific performance-sensitive paths and a real gap everywhere else, which is exactly why so many teams use Dapper alongside EF Core rather than instead of it.

## Frequently Asked Questions

### Does Dapper support async?

Yes, throughout - `QueryAsync`, `ExecuteAsync`, `QuerySingleOrDefaultAsync`, and their variants all support async/await, and should be your default over the synchronous equivalents in any ASP.NET Core application.

### How do I prevent SQL injection with Dapper?

Always pass values as parameters using Dapper's anonymous-object syntax (`new { OrderId = orderId }` matched to `@OrderId` in the SQL string), never by concatenating or interpolating user input directly into the query string. This is Dapper's built-in protection, and skipping it defeats the purpose entirely.

### Can Dapper handle complex object graphs with multiple joins?

Yes, via multi-mapping - passing multiple generic type parameters to `QueryAsync` along with a `splitOn` parameter telling Dapper where each object's columns start in the result set. It's more manual than EF Core's navigation properties, but it gives you precise control over exactly what SQL executes.

### Does Dapper support stored procedures?

Yes - pass the procedure name as the SQL text and set `commandType: CommandType.StoredProcedure` in the call. Parameters work the same way as with inline SQL.

### How do I manage database schema changes without EF Core's migrations?

Use a dedicated schema migration tool independent of Dapper itself - DbUp, Fluent Migrator, and Flyway are common choices in the .NET ecosystem. Keep migration scripts versioned in source control the same way you would EF Core migrations, just run through a separate tool.

### Is Dapper actually faster than EF Core in practice?

For complex raw SQL and large result sets, yes, meaningfully. For simple, well-indexed CRUD operations, a properly tuned EF Core query using `AsNoTracking()` often performs within a few percent of Dapper - the performance gap matters most exactly where Dapper's lack of overhead has room to show, not universally.

### Should I write a generic repository wrapper around Dapper?

It's optional and somewhat a matter of team preference. A thin repository per feature or entity keeps SQL organized and testable, but resist making it so generic that it starts re-implementing a mini-ORM - if you find yourself building change tracking or a query builder on top of Dapper, that's usually a sign you actually want a different tool for that specific use case.
