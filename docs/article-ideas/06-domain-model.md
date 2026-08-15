---
category: Domain Logic Patterns
csharp: 14
description: "Build behavior-rich domain models in modern C# while
  keeping business rules explicit, testable, and independent of
  infrastructure."
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/domainModel.html"
order: 6
pattern: Domain Model
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: domain-model
status: draft
title: Domain Model in Modern .NET
---

# Domain Model in Modern .NET

A Domain Model organizes business logic around objects representing
concepts in the problem domain. Instead of treating an order as a bag of
data manipulated by services, the order itself can own the rules
governing its behavior.

## A Behavior-Rich Order

``` csharp
public sealed class Order
{
    private readonly List<OrderLine> _lines = [];

    public OrderStatus Status { get; private set; }
    public IReadOnlyCollection<OrderLine> Lines => _lines;

    public void Submit()
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Only draft orders can be submitted.");

        if (_lines.Count == 0)
            throw new InvalidOperationException("An order must contain at least one line.");

        Status = OrderStatus.Submitted;
    }
}
```

The model does more than store state: it protects it.

## Invariants and Value Objects

An invariant is a rule that must remain true for a domain concept to be
valid. Modern C# records and record structs are useful for value
concepts:

``` csharp
public readonly record struct Money(decimal Amount, string Currency)
{
    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Cannot add different currencies.");

        return this with { Amount = Amount + other.Amount };
    }
}
```

## Domain Model and Service Layer

The service coordinates the use case while the model owns business
decisions:

``` csharp
var order = await orders.GetByIdAsync(id, ct)
    ?? throw new OrderNotFoundException(id);

order.Submit();

await orders.SaveAsync(order, ct);
```

## Persistence With EF Core

The domain object does not need to call EF Core. Mapping configuration
can live in infrastructure:

``` csharp
public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Status).HasConversion<string>();
    }
}
```

## Testing

Many important domain tests are ordinary in-memory unit tests:

``` csharp
[Fact]
public void Empty_order_cannot_be_submitted()
{
    var order = new Order();
    Assert.Throws<InvalidOperationException>(() => order.Submit());
}
```

## When to Use It

Domain Model becomes attractive when rules are complex, invariants
matter, behavior is reused across workflows, and state transitions have
business meaning.

## When Not to Use It

A rich model may be unnecessary for CRUD-heavy systems, simple
integrations, or applications where the database representation already
closely matches the problem.

## Related Patterns

-   Service Layer
-   Data Mapper
-   Repository
-   Unit of Work
-   Identity Map

## Summary

A good Domain Model is executable business knowledge. Use it when the
complexity of the business justifies the complexity of the model.
