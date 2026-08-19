---
author: Steve Kaschimer
date: 2027-03-16
image: /images/posts/2027-03-16-hero.webp
image_alt: "A teal LINQ query bracket passing cleanly through a narrow funnel with no obstruction into a single SQL statement, with no intermediate tracking layer shown."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a thin bracket-shaped LINQ glyph on the left, connected by a clean, unobstructed straight teal line passing directly through a narrow funnel shape in the middle, emerging on the right as a single flat SQL-statement rectangle. No intermediate layer or badge sits along the line, emphasizing the lack of a tracking mechanism. Below, a small 'SET' label rendered as a compact rectangle with an arrow connects directly to a database-row icon, implying a set-based update with no fetch step. Mood is lean, predictable, and direct. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art."
layout: post.njk
site_title: Tech Notes
summary: "Linq2Db gives you EF Core's most-loved feature - strongly-typed LINQ - without the change tracking, identity map, or unit-of-work machinery. A setup guide for attribute-based mapping, set-based updates, and the adjustment away from EF Core's fetch-mutate-save habit."
tags: ["dotnet", "orm", "database", "performance", "tooling"]
title: "Getting Started with Linq2Db in .NET"
---



Linq2Db occupies an unusual spot in the .NET ORM landscape: it gives you EF Core's most-loved feature - strongly-typed, composable LINQ queries - without the change tracking, identity map, or unit-of-work machinery that comes bundled with a full ORM whether you want it or not. For teams that want LINQ's ergonomics and nothing else, that's the entire pitch, and it's a narrower, more deliberate tool than either EF Core or Dapper.

This guide covers installing Linq2Db, bootstrapping a data connection and mapped entities, the core query and update workflow without change tracking to lean on, and the best practices that keep a Linq2Db data layer predictable as it grows. By the end you'll have a lightweight, fast, strongly-typed query layer that stays honest about exactly what SQL it's generating.

If you're deciding between ORMs first, [a comparison of the top .NET ORMs](/posts/2027-02-16-top-5-dotnet-orms-compared/) covers where Linq2Db fits relative to EF Core, Dapper, NHibernate, and RepoDb.

## What You'll Need

- .NET 8 SDK or later
- A database and its corresponding Linq2Db provider package
- Comfort with LINQ, since it's the entire query interface - there's no raw-SQL-first mode the way Dapper has

## Installing Linq2Db

```bash
dotnet add package linq2db
dotnet add package linq2db.SqlServer
```

Linq2Db supports a wide range of database providers - PostgreSQL, MySQL, SQLite, Oracle, and others each have their own provider package following the same `linq2db.<Provider>` naming convention.

## Bootstrapping the Ideal Environment

### Define mapped entities

```csharp
[Table("Orders")]
public class Order
{
    [PrimaryKey, Identity]
    public int Id { get; set; }

    [Column]
    public int CustomerId { get; set; }

    [Column]
    public OrderStatus Status { get; set; }
}
```

Mapping is attribute-based by default, similar in spirit to EF Core's data annotations, though Linq2Db also supports a fluent mapping API if you'd rather keep entities free of Linq2Db-specific attributes.

### Define your data connection

```csharp
public class AppDataConnection(DataOptions options) : DataConnection(options)
{
    public ITable<Order> Orders => this.GetTable<Order>();
    public ITable<Customer> Customers => this.GetTable<Customer>();
}
```

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

var dataOptions = new DataOptions()
    .UseSqlServer(builder.Configuration.GetConnectionString("Default")!);

builder.Services.AddScoped(_ => new AppDataConnection(dataOptions));
```

Unlike EF Core's `DbContext`, `DataConnection` is intentionally thin - there's no change tracking or identity map underneath it, so registering it as scoped is mostly about connection lifetime, not about preserving any tracked entity state across calls.

### Schema, the same way as Dapper and RepoDb

Linq2Db has no built-in migrations system. Pair it with a dedicated schema migration tool (DbUp, Fluent Migrator) the same way you would with Dapper or RepoDb, and keep schema changes versioned independently of your query code.

## Core Workflow

### Querying with LINQ, mapped directly to SQL

```csharp
using var db = new AppDataConnection(dataOptions);

var activeOrders = await db.Orders
    .Where(o => o.Status == OrderStatus.Processing)
    .ToListAsync();
```

Because there's no change tracking layer to translate through, the LINQ-to-SQL mapping in Linq2Db tends to be more predictable and closer to what you'd write by hand than EF Core's, at the cost of not having the automatic dirty-checking EF Core provides.

### Updates: explicit, not automatic

Since there's no change tracking, updates are explicit operations rather than "mutate a tracked entity and call SaveChanges":

```csharp
using var db = new AppDataConnection(dataOptions);

await db.Orders
    .Where(o => o.Id == orderId)
    .Set(o => o.Status, OrderStatus.Shipped)
    .UpdateAsync();
```

This set-based update syntax maps directly to a single `UPDATE` statement - no need to fetch the entity first, unlike EF Core's fetch-mutate-save pattern. For scenarios where you do need to fetch first, `InsertOrUpdateAsync` and direct `UpdateAsync(entity)` calls are also available.

### Joins stay in LINQ, translated directly to SQL joins

```csharp
var results = await db.Orders
    .Join(db.Customers, o => o.CustomerId, c => c.Id, (o, c) => new { o.Id, o.Status, c.Name })
    .Where(x => x.Status == OrderStatus.Processing)
    .ToListAsync();
```

## Verifying Your Setup

1. **Mappings match your schema** - confirm entity attributes reflect actual column names and types, since there's no runtime schema validation the way `SchemaExport` provides in NHibernate
2. **Generated SQL is what you expect** - Linq2Db supports logging generated SQL; check it for a few representative queries to confirm the LINQ-to-SQL translation is behaving as intended
3. **Set-based updates are used where appropriate** - for bulk updates, confirm you're using `Set().UpdateAsync()` rather than fetching and updating each entity individually, which defeats the performance advantage
4. **Connections are properly scoped** - confirm `DataConnection` instances aren't being held longer than a single unit of work

## Best Practices

**Use set-based updates for bulk or simple property changes.** `db.Orders.Where(...).Set(...).UpdateAsync()` translates to a single efficient `UPDATE` statement - don't fall into an EF Core-style fetch-then-save habit that Linq2Db doesn't need.

**Log generated SQL during development.** Because Linq2Db has less abstraction between LINQ and SQL than EF Core, checking the actual generated queries is quick and catches mapping issues early.

**Don't expect automatic change tracking, and don't try to bolt it on.** If your project genuinely needs change tracking and a full unit-of-work pattern, that's a signal to reconsider whether EF Core is a better fit rather than working around Linq2Db's intentional lack of it.

**Pick a schema migration tool early, the same as you would with Dapper.** Linq2Db doesn't manage schema, and treating that as an afterthought leads to undocumented, ad hoc schema changes.

**Keep entity mapping attributes clean and minimal.** Linq2Db's attribute-based mapping is meant to stay close to the database schema - resist adding business logic or computed properties directly onto mapped entities; keep that in a separate layer.

## Comparison with RepoDb

| | Linq2Db | RepoDb |
| --- | --- | --- |
| Query style | Strongly-typed LINQ | Method-based CRUD + raw SQL |
| Change tracking | None | None |
| Type safety | Strong - compiler-checked LINQ expressions | Moderate - string-based SQL for anything beyond basic CRUD |
| Best for | Teams wanting LINQ without ORM overhead | Teams wanting Dapper's speed with less CRUD boilerplate |

Both are micro-ORMs without change tracking, but they optimize for different things: Linq2Db leans into LINQ's compile-time safety and composability, while RepoDb leans into reducing boilerplate for common CRUD operations while still allowing raw SQL when needed. Neither manages schema migrations - that's a deliberate gap in both, not an oversight.

## Frequently Asked Questions

### Does Linq2Db have change tracking like EF Core?

No, deliberately. Linq2Db is closer to a thin LINQ layer over SQL than a full ORM - updates are explicit (set-based updates or direct entity updates), not automatic dirty-checking. This keeps overhead low but means you can't rely on "fetch, mutate, save" the way you would with EF Core.

### How does Linq2Db compare to EF Core in terms of raw performance?

Linq2Db is generally faster than EF Core for equivalent queries, since there's no change tracking or identity map overhead to pay for. The gap is most noticeable on large result sets or high-throughput paths - for small, simple queries the difference is often negligible in absolute terms.

### Can I write raw SQL with Linq2Db when LINQ doesn't fit?

Yes - Linq2Db supports raw SQL execution alongside its LINQ query API for cases where a hand-written query is clearer or more efficient than the LINQ equivalent, similar in spirit to how Dapper works, just available as an escape hatch rather than the primary interface.

### Does Linq2Db support migrations?

No, the same gap Dapper and RepoDb have. Pair it with a dedicated schema migration tool like DbUp or Fluent Migrator, and keep schema evolution versioned independently of your Linq2Db query code.

### Is Linq2Db actively maintained?

Yes, it has an active open-source community and ongoing releases, though its user base and ecosystem are meaningfully smaller than EF Core's or Dapper's. That translates to fewer tutorials and community resources, which is worth factoring into a team's decision alongside its technical merits.

### Why would I choose Linq2Db over Dapper if both lack change tracking?

The main difference is query style - Linq2Db gives you strongly-typed, compiler-checked LINQ expressions that get translated to SQL, while Dapper has you write SQL directly as strings. If you value LINQ's refactor-safety and composability but don't want EF Core's change-tracking overhead, Linq2Db fills that specific niche; if you'd rather write and fully control the SQL yourself, Dapper is the more direct fit.

### What's the most common mistake in a first Linq2Db setup?

Falling into an EF Core-style habit of fetching an entity, mutating it, and looking for a `SaveChanges()` equivalent that doesn't exist. Linq2Db's update model is set-based and explicit by design - learning that pattern early avoids writing code that looks idiomatic but doesn't take advantage of what makes Linq2Db efficient in the first place.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
