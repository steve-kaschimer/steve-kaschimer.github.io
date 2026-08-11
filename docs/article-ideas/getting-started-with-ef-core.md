# Getting Started with EF Core in .NET

EF Core's reputation as "the default" .NET ORM is well earned, but the gap between a tutorial's `dotnet ef migrations add` and a setup that stays maintainable is bigger than it looks at first. Change tracking that silently costs you performance on read-only queries, migrations that mysteriously fail to find your `DbContext`, and repository abstractions people add out of habit rather than need are the three things that trip up most first real projects.

This guide covers installing EF Core, bootstrapping a `DbContext` and migrations workflow that won't fight you later, the core query and change-tracking patterns worth knowing from day one, and the best practices that keep performance predictable as your model grows. By the end you'll have a data access layer that's fast by default, not fast only after a painful profiling session.

If you're deciding between ORMs first, a comparison of the top .NET ORMs covers where EF Core fits relative to Dapper, NHibernate, Linq2Db, and RepoDb.

## What You'll Need

- .NET 8 SDK or later
- A database to target -- SQL Server, PostgreSQL, and SQLite are all well-supported; this guide uses SQL Server for examples
- The EF Core CLI tools for migrations

## Installing EF Core

Add the provider package for your database, plus the design-time package needed for migrations:

```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
```

`Microsoft.EntityFrameworkCore.Design` must be installed in your **startup project** -- the one with `Program.cs` -- not just the project containing your `DbContext`, even if those are different projects. This is the single most common cause of migrations failing to work in a multi-project solution.

Install the CLI tool globally if you haven't already:

```bash
dotnet tool install --global dotnet-ef
```

Keep the tool version aligned with your `Microsoft.EntityFrameworkCore` runtime version -- a mismatch produces a warning and occasionally subtle migration issues.

## Bootstrapping the Ideal Environment

### Define your DbContext and entities

```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>()
            .HasOne(o => o.Customer)
            .WithMany(c => c.Orders)
            .HasForeignKey(o => o.CustomerId);
    }
}

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public OrderStatus Status { get; set; }
}
```

### Register it in Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();
app.Run();
```

The design-time tooling relies on being able to discover this registration by probing your app's host, which is why `app.Run()` (or a return of the built host) needs to remain reachable in `Program.cs` -- restructuring top-level statements in a way that prevents the tool from finding the host is a common cause of migration commands failing.

### Create and apply your first migration

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

This generates three files under a `Migrations/` folder: the migration itself (`Up`/`Down` operations), a designer file EF uses internally, and a model snapshot. Commit all three to version control.

### If your DbContext lives in a different project than your host

Specify both explicitly:

```bash
dotnet ef migrations add AddOrderStatus --project MyApp.Infrastructure --startup-project MyApp.Web
```

And point the migrations assembly at the right project in your `DbContext` registration:

```csharp
options.UseSqlServer(connectionString, b => b.MigrationsAssembly("MyApp.Infrastructure"));
```

### If dotnet ef can't instantiate your DbContext

For class libraries, test projects, or a `DbContext` with constructor parameters the tool can't resolve without a running host, implement `IDesignTimeDbContextFactory<T>`:

```csharp
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=localhost;Database=MyAppDb;Trusted_Connection=True;")
            .Options;
        return new AppDbContext(options);
    }
}
```

## Core Workflow

- **Query with `AsNoTracking()` for anything read-only.** Change tracking has real overhead; skip it whenever you're not going to modify and save the entities you're fetching.
- **Let EF Core's change tracking handle updates for tracked entities.** Fetch, mutate the properties, call `SaveChangesAsync()` -- no manual update statements needed for tracked entities.
- **Add a migration for every schema change, immediately.** Don't let model changes and migrations drift apart; add the migration as part of the same commit as the entity change.
- **Use `Include()` deliberately, not defensively.** Eager-loading everything "just in case" produces bloated queries -- include only the navigation properties a given query actually needs.

```csharp
// Read-only: skip change tracking
var activeOrders = await db.Orders
    .AsNoTracking()
    .Where(o => o.Status == OrderStatus.Processing)
    .ToListAsync();

// Write: let change tracking do the work
var order = await db.Orders.FindAsync(orderId);
order.Status = OrderStatus.Shipped;
await db.SaveChangesAsync();
```

## Verifying Your Setup

1. **Migrations apply cleanly** -- run `dotnet ef database update` against a fresh database and confirm the schema matches your model
2. **`AsNoTracking()` is actually reducing overhead** -- profile a read-heavy endpoint with and without it if performance is a concern
3. **Generated SQL is reasonable** -- log EF Core's generated SQL (`options.LogTo(Console.WriteLine)` in development) and sanity-check a few key queries
4. **The migrations history table matches your codebase** -- confirm `__EFMigrationsHistory` in the database reflects exactly the migrations present in your `Migrations/` folder

## Best Practices

**Default to `AsNoTracking()` for queries, and opt into tracking only when you need to update.** This single habit accounts for a large share of the performance gap people mistakenly attribute to EF Core being "slow."

**Don't add a repository/unit-of-work layer reflexively.** `DbContext` already implements the unit-of-work pattern and provides a clean, testable API on its own. Add abstraction when you have a concrete reason -- isolating tests from a real database, or genuinely needing to swap data stores -- not as a default habit.

**Commit every migration to version control, including the designer and snapshot files.** All three matter; missing the snapshot file in particular causes confusing state mismatches for the next developer generating a migration.

**Review generated SQL for anything performance-sensitive.** EF Core's LINQ-to-SQL translation is good but not infallible, especially for complex aggregations -- don't assume the generated query is optimal without checking, particularly on hot paths.

**Reach for Dapper for specific reporting or bulk-read queries where EF Core's abstraction gets in the way.** This is a normal, widely accepted pattern, not a sign EF Core was the wrong choice.

## Comparison with Dapper

| | EF Core | Dapper |
| --- | --- | --- |
| Query style | LINQ over tracked entities | Raw SQL, mapped to objects |
| Change tracking | Yes, built in | No |
| Migrations | Built-in, mature | None -- bring your own |
| Best for | Domain modeling, most CRUD, schema evolution | Read-heavy paths, reporting, hand-tuned SQL |

Many production systems use both -- EF Core for the domain and schema, Dapper for the specific queries where raw SQL control matters more than LINQ's abstraction. You can pull the underlying `DbConnection` straight from your `DbContext` and hand it to Dapper without maintaining two separate connection configurations.

## Frequently Asked Questions

### Why does dotnet ef migrations add fail with "Unable to create an object of type 'AppDbContext'"?

The design-time tool couldn't instantiate your `DbContext`, usually because it can't find or run a host to discover the DI registration. Confirm `--startup-project` points at your actual host project, that `Program.cs` still builds and runs (or returns) a `WebApplication`, and that your `DbContext` constructor doesn't require a type the tool can't resolve without the app fully running. If none of that applies, implement `IDesignTimeDbContextFactory<T>` as a direct fallback.

### Do I need Microsoft.EntityFrameworkCore.Design in every project, or just one?

Just the startup project -- the one containing `Program.cs` that the `dotnet ef` tooling actually runs. It's a common mistake to add it only to the project containing the `DbContext` in a multi-project solution, which doesn't work if that's not also your startup project.

### What's the performance impact of change tracking?

It's real but often overstated for typical CRUD workloads -- a well-tuned EF Core query with `AsNoTracking()` performs within a few percent of Dapper for standard indexed operations. The overhead matters most on large result sets or high-throughput read paths, which is exactly where `AsNoTracking()` (or a specific Dapper query) earns its keep.

### Should I use the repository pattern with EF Core?

Not by default. `DbContext` already provides a clean, mockable API and implements the unit-of-work pattern itself. Add a repository abstraction when you have a specific need -- isolating unit tests from a real database without an in-memory provider, or genuinely anticipating a data store swap -- rather than as a blanket architectural habit, since over-abstracting EF Core tends to obscure LINQ's expressiveness rather than protect it.

### How do I handle migrations across multiple environments (dev, staging, production)?

Keep the same set of migration files across all environments and apply them with `dotnet ef database update` (or the equivalent runtime `context.Database.Migrate()` call) as part of your deployment process. Avoid manually editing the database schema outside of migrations in any environment -- that's what causes the migrations history table to drift out of sync with reality.

### Can I use EF Core with a database EF Core doesn't have a first-party provider for?

Yes, via community-maintained providers -- MySQL, Oracle, and others all have EF Core provider packages, though quality and update cadence vary by provider. Confirm the specific provider you need is actively maintained before committing, since the built-in SQL Server, PostgreSQL (via Npgsql), and SQLite providers have the strongest first-party support.

### What's the most common mistake in a first EF Core setup?

Forgetting `AsNoTracking()` on read-only queries, which quietly adds overhead across an entire application, and installing `Microsoft.EntityFrameworkCore.Design` in the wrong project in a multi-project solution, which breaks migrations in a way that's confusing to diagnose the first time you hit it.
