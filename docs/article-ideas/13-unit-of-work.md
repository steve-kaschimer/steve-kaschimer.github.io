---
category: Object-Relational Behavioral Patterns
csharp: 14
description: Understand Unit of Work, how EF Core DbContext embodies the
  pattern, and when a custom abstraction helps or hurts.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/unitOfWork.html"
order: 13
pattern: Unit of Work
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: unit-of-work
status: draft
title: Unit of Work in Modern .NET
---

# Unit of Work in Modern .NET

Unit of Work keeps track of objects affected by a business transaction
and coordinates the database changes that result.

That definition maps remarkably well to the way many .NET developers
already use `DbContext`.

## The Problem

Suppose a use case changes several objects:

``` csharp
order.Submit();
customer.RecordPurchase(order.Total);
inventory.Reserve(order.Lines);
```

If each object immediately writes itself to the database, you can end up
with:

-   many small database calls,
-   complicated transaction handling,
-   partial updates if a later step fails,
-   duplicated persistence coordination,
-   difficult concurrency behavior.

A Unit of Work postpones persistence until the application reaches a
sensible boundary.

## A Manual Unit of Work

A simplified implementation might explicitly track changes:

``` csharp
public sealed class UnitOfWork
{
    private readonly HashSet<object> _new = [];
    private readonly HashSet<object> _dirty = [];
    private readonly HashSet<object> _removed = [];

    public void RegisterNew(object entity) => _new.Add(entity);

    public void RegisterDirty(object entity) => _dirty.Add(entity);

    public void RegisterRemoved(object entity) => _removed.Add(entity);

    public async Task CommitAsync(
        CancellationToken cancellationToken)
    {
        foreach (var entity in _new)
        {
            // INSERT
        }

        foreach (var entity in _dirty)
        {
            // UPDATE
        }

        foreach (var entity in _removed)
        {
            // DELETE
        }
    }
}
```

This illustrates the idea, but most EF Core applications do not need to
build this machinery themselves.

## DbContext as Unit of Work

EF Core tracks entity state for a `DbContext` instance.

A typical application operation looks like this:

``` csharp
var order = await db.Orders
    .Include(x => x.Lines)
    .SingleAsync(
        x => x.Id == orderId,
        cancellationToken);

order.Submit();

var audit = AuditEntry.ForOrderSubmitted(order);

db.AuditEntries.Add(audit);

await db.SaveChangesAsync(cancellationToken);
```

Several important things happen:

1.  `Order` is loaded and tracked.
2.  `order.Submit()` changes in-memory state.
3.  `AuditEntry` is registered as new.
4.  `SaveChangesAsync` inspects tracked state.
5.  EF Core generates the required SQL.
6.  The database changes are committed together when the provider
    supports the required transaction semantics.

This is Unit of Work behavior.

## The Lifetime Matters

A Unit of Work should generally correspond to one application-level
operation, not the lifetime of the whole application.

In a typical ASP.NET Core application, a scoped `DbContext` works
naturally:

``` csharp
builder.Services.AddDbContext<AppDbContext>(options =>
{
    // provider configuration
});
```

A request comes in, the application performs a use case, calls
`SaveChangesAsync`, and the context is disposed.

Long-lived contexts create problems:

-   ever-growing change trackers,
-   stale data,
-   unexpected object identity,
-   increasingly confusing state,
-   harder concurrency reasoning.

A short-lived Unit of Work keeps the persistence boundary clear.

## Service Layer and Unit of Work

A Service Layer operation is often a natural Unit of Work boundary:

``` csharp
public sealed class SubmitOrderService(
    AppDbContext db,
    IEventPublisher events)
{
    public async Task ExecuteAsync(
        OrderId orderId,
        CancellationToken cancellationToken)
    {
        var order = await db.Orders
            .SingleAsync(
                x => x.Id == orderId,
                cancellationToken);

        order.Submit();

        db.OutboxMessages.Add(
            OutboxMessage.From(
                new OrderSubmitted(order.Id)));

        await db.SaveChangesAsync(cancellationToken);
    }
}
```

The operation describes one business transaction. The `DbContext` tracks
and writes the persistence changes for that transaction.

## Should You Create `IUnitOfWork`?

Many .NET applications add:

``` csharp
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken);
}
```

with:

``` csharp
public sealed class EfUnitOfWork(AppDbContext db)
    : IUnitOfWork
{
    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken)
        => db.SaveChangesAsync(cancellationToken);
}
```

This is not automatically wrong, but it is worth asking what problem the
interface solves.

If it exists only to rename `DbContext.SaveChangesAsync`, it may add
ceremony without meaningfully decoupling the application.

A custom Unit of Work abstraction becomes more useful when it owns
additional application-level behavior such as:

-   explicit transaction boundaries,
-   an outbox,
-   domain-event dispatch,
-   coordination across repositories,
-   persistence policies,
-   commit hooks,
-   retry behavior.

For example:

``` csharp
public interface IUnitOfWork
{
    Task CommitAsync(
        CancellationToken cancellationToken);
}
```

and:

``` csharp
public sealed class EfUnitOfWork(
    AppDbContext db,
    IDomainEventDispatcher dispatcher)
    : IUnitOfWork
{
    public async Task CommitAsync(
        CancellationToken cancellationToken)
    {
        await db.SaveChangesAsync(cancellationToken);

        await dispatcher.DispatchPendingAsync(
            cancellationToken);
    }
}
```

Now the abstraction represents more than a renamed ORM method.

## Repositories and Unit of Work

Repositories often work inside one shared Unit of Work.

``` csharp
public sealed class SubmitOrderService(
    IOrderRepository orders,
    ICustomerRepository customers,
    IUnitOfWork unitOfWork)
{
    public async Task ExecuteAsync(
        OrderId orderId,
        CancellationToken cancellationToken)
    {
        var order = await orders.GetAsync(
            orderId,
            cancellationToken);

        var customer = await customers.GetAsync(
            order.CustomerId,
            cancellationToken);

        order.Submit();
        customer.RecordPurchase(order.Total);

        await unitOfWork.CommitAsync(
            cancellationToken);
    }
}
```

The key is that both repositories should participate in the same
persistence context if the changes must be committed atomically.

A separate `DbContext` per repository can quietly defeat that
assumption.

## Unit of Work and Transactions

A Unit of Work is not identical to a database transaction.

The Unit of Work is the application-side mechanism that tracks and
coordinates changes.

A database transaction is one mechanism for making those writes atomic.

Sometimes `SaveChangesAsync` is enough:

``` csharp
await db.SaveChangesAsync(cancellationToken);
```

For a more complex workflow, you may need an explicit transaction:

``` csharp
await using var transaction =
    await db.Database.BeginTransactionAsync(
        cancellationToken);

order.Submit();
await db.SaveChangesAsync(cancellationToken);

await paymentLedger.RecordAsync(
    order,
    cancellationToken);

await transaction.CommitAsync(
    cancellationToken);
```

The transaction should follow the consistency requirement of the use
case.

## The Outbox Example

A common modern example is coordinating state changes and integration
events.

This is dangerous:

``` csharp
order.Submit();

await db.SaveChangesAsync(cancellationToken);

await messageBus.PublishAsync(
    new OrderSubmitted(order.Id),
    cancellationToken);
```

If the database commit succeeds but publishing fails, the system is
inconsistent.

An outbox keeps both changes in the same Unit of Work:

``` csharp
order.Submit();

db.OutboxMessages.Add(
    OutboxMessage.From(
        new OrderSubmitted(order.Id)));

await db.SaveChangesAsync(cancellationToken);
```

A separate publisher can later deliver the message.

Unit of Work does not solve distributed consistency by itself, but it
gives you the right boundary for coordinating durable local changes.

## Testing

Business-rule tests should usually target domain objects directly.

Unit of Work behavior deserves integration tests:

``` csharp
[Fact]
public async Task Commit_persists_all_changes()
{
    await using var db = CreateDbContext();

    var order = OrderFixture.DraftWithOneLine();

    db.Orders.Add(order);

    order.Submit();

    await db.SaveChangesAsync();

    await using var verification = CreateDbContext();

    var saved = await verification.Orders
        .SingleAsync(x => x.Id == order.Id);

    Assert.Equal(
        OrderStatus.Submitted,
        saved.Status);
}
```

If you build a custom Unit of Work abstraction, test the semantics that
justify it: transactions, outbox behavior, event handling, or commit
ordering.

## When to Use It

You almost always need the *concept* when a business operation changes
persistent state.

You may not need a custom implementation if your ORM already provides
the behavior.

Use a custom abstraction when:

-   multiple repositories must share one commit boundary,
-   transaction behavior needs to be explicit,
-   commit has application-level semantics,
-   you coordinate domain events or outbox writes,
-   persistence infrastructure should be hidden from the application
    layer.

## When Not to Build Your Own

Avoid recreating ORM internals merely to implement the pattern
literally.

If EF Core already tracks your entities and `SaveChangesAsync` already
represents the correct commit boundary, adding `IUnitOfWork` may create
another layer without solving another problem.

## Related Patterns

-   Identity Map
-   Repository
-   Data Mapper
-   Optimistic Offline Lock
-   Service Layer

## Summary

Unit of Work is one of the clearest examples of a Fowler pattern that
modern .NET developers use constantly without necessarily naming it.

In EF Core, `DbContext` already provides most of the machinery.

The architectural decision is usually not whether to use Unit of Work.

It is whether the application's needs justify introducing another
abstraction on top of the Unit of Work you already have.
