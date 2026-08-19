---
author: Steve Kaschimer
date: 2028-08-27
image: /images/posts/2028-08-27-hero.webp
image_alt: "Three small distinct glyphs - a single arrow, a circle with internal texture, and a horizontal gate - arranged side by side with a faint connecting line beneath them, implying three related but distinct approaches."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on three small distinct glyphs arranged in a row: a single straight procedural arrow on the left, a circle with faint internal texture lines in the middle, and a horizontal gate shape with a small opening on the right, connected beneath by one faint dotted baseline implying they answer a shared question. Mood is comparative and exploratory. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Where should business logic actually live? A practical comparison of three of Fowler's most consequential answers - procedures organized around operations, a rich object model that owns its own rules, and a coordinating boundary layer - and why modern applications frequently combine all three rather than picking one."
tags: ["dotnet", "architecture", "design-patterns", "domain-logic"]
title: "Transaction Script, Domain Model, and Service Layer"
---



One of the most important decisions in application architecture is deciding **where business logic should live**. A beginner's application often starts with business logic in request handlers. At first, that's perfectly reasonable. Then another operation needs the same rules. And another. Eventually, the application has multiple procedures that partially overlap. Martin Fowler's catalog describes three particularly important approaches to organizing domain logic:
-   **Transaction Script**
-   **Domain Model**
-   **Table Module**

It also describes **Service Layer**, which defines the application's boundary and coordinates operations. This article focuses on Transaction Script, Domain Model, and Service Layer because they form one of the most useful architectural choices in everyday application development.

## Transaction Script

Transaction Script organizes business logic around operations. Each operation performs the work necessary to complete a particular request. For example:
``` csharp
public async Task SubmitOrderAsync(
    int orderId,
    AppDbContext db,
    CancellationToken cancellationToken)
{
    var order = await db.Orders
        .Include(x => x.Lines)
        .SingleAsync(
            x => x.Id == orderId,
            cancellationToken);

    if (order.Lines.Count == 0)
    {
        throw new InvalidOperationException(
            "An order cannot be submitted without lines.");
    }

    if (order.Status != OrderStatus.Draft)
    {
        throw new InvalidOperationException(
            "Only draft orders can be submitted.");
    }

    order.Status = OrderStatus.Submitted;

    await db.SaveChangesAsync(cancellationToken);
}
```

The procedure is the unit of business behavior. This approach can be excellent for simple applications.

## When Transaction Script Works Well

Transaction Script is particularly attractive when:
-   workflows are straightforward,
-   business rules aren't highly interconnected,
-   operations are independent,
-   the application is primarily CRUD,
-   the database already represents much of the business structure.

For example:
``` csharp
public async Task CancelSubscriptionAsync(
    Subscription subscription,
    CancellationToken cancellationToken)
{
    subscription.Status = SubscriptionStatus.Cancelled;

    await repository.SaveAsync(
        subscription,
        cancellationToken);
}
```

There may be little benefit in creating a rich domain model around such a simple operation.

## The Problem With Transaction Script

Complexity starts appearing when rules overlap. Suppose our order application has:
``` text
Create order
Submit order
Cancel order
Refund order
Calculate order total
Apply discount
Calculate shipping
```

If each procedure contains its own understanding of order rules, those rules can become duplicated. For example, a status check might appear in three different operations. Now imagine the business requirement changes:
> An order can also be submitted from `PendingApproval`.

We have to find every place where the rule is encoded. This is where a Domain Model can become valuable.

## Domain Model

Fowler describes Domain Model as an object model of the domain that incorporates both behavior and data. Instead of putting the rule in an operation, we can put the rule on the domain object:
``` csharp
public sealed class Order
{
    private readonly List<OrderLine> _lines = [];

    public OrderStatus Status { get; private set; }

    public IReadOnlyCollection<OrderLine> Lines => _lines;

    public void Submit()
    {
        if (Status is not
            (OrderStatus.Draft or OrderStatus.PendingApproval))
        {
            throw new InvalidOperationException(
                $"An order in {Status} state cannot be submitted.");
        }

        if (_lines.Count == 0)
        {
            throw new InvalidOperationException(
                "An order must contain at least one line.");
        }

        Status = OrderStatus.Submitted;
    }
}
```

Now the rule has a clear owner. Any application operation that needs to submit an order can call:
``` csharp
order.Submit();
```

The behavior is centralized.

## Rich Models vs. Anemic Models

A domain model is sometimes called "rich" when its objects contain meaningful behavior. Compare a data-only model:
``` csharp
public sealed class Order
{
    public OrderStatus Status { get; set; }
    public List<OrderLine> Lines { get; set; }
}
```

with:
``` csharp
public sealed class Order
{
    public OrderStatus Status { get; private set; }

    public void Submit()
    {
        // Business rules
    }
}
```

The first is mostly data. The second encapsulates behavior. Neither is automatically correct. An anemic model can be perfectly reasonable when the domain is simple. A rich model becomes more valuable as business rules become more complex and interconnected.

## The Service Layer

The Service Layer is different. Fowler describes it as defining an application's boundary with a layer of services that establishes available operations and coordinates the application's response to each operation. Consider:
``` csharp
public sealed class SubmitOrderService(
    IOrderRepository orders,
    IEventPublisher events)
{
    public async Task ExecuteAsync(
        OrderId orderId,
        CancellationToken cancellationToken)
    {
        var order = await orders.GetByIdAsync(
            orderId,
            cancellationToken)
            ?? throw new OrderNotFoundException(orderId);

        order.Submit();

        await orders.SaveAsync(
            order,
            cancellationToken);

        await events.PublishAsync(
            new OrderSubmitted(order.Id),
            cancellationToken);
    }
}
```

The service coordinates the use case. But the `Order` owns the business rule:
``` csharp
order.Submit();
```

That's an important distinction.

## Service Layer Doesn't Mean "Put All Logic in Services"

A common .NET architecture mistake is:
``` text
Controller
    ↓
Service
    ↓
Repository
```

with the service containing every business rule. Eventually the service becomes a procedural dumping ground. The better interpretation of Service Layer is **coordination**. The service answers:
> "What needs to happen to complete this application operation?"

The domain answers:
> "What business rules govern these concepts?"

## A Practical Combination

Modern applications frequently combine the approaches. For example:
``` text
HTTP endpoint
      ↓
Application service
      ↓
Domain model
      ↓
Persistence
```

The HTTP endpoint handles HTTP:
``` csharp
app.MapPost(
    "/orders/{id}/submit",
    async (
        int id,
        SubmitOrderService service,
        CancellationToken cancellationToken) =>
    {
        await service.ExecuteAsync(
            new OrderId(id),
            cancellationToken);

        return Results.NoContent();
    });
```

The application service coordinates:
``` csharp
public async Task ExecuteAsync(...)
{
    var order = await repository.GetByIdAsync(...);

    order.Submit();

    await repository.SaveAsync(...);
}
```

The domain object enforces business rules:
``` csharp
public void Submit()
{
    // Business rules
}
```

This isn't a contradiction. Transaction Script, Domain Model, and Service Layer solve different problems.

## How Do You Choose?

Start with the complexity of the domain.

### Choose Transaction Script when:

-   workflows are simple,
-   rules don't interact heavily,
-   CRUD dominates,
-   duplication is low,
-   introducing domain objects would mostly add ceremony.

### Consider Domain Model when:

-   rules are complex,
-   rules interact,
-   state transitions matter,
-   the same business behavior is used from multiple operations,
-   correctness depends on maintaining invariants.

### Consider Service Layer when:

-   the application has meaningful use cases,
-   multiple technical components must be coordinated,
-   transactions need orchestration,
-   the application has multiple entry points.

And these choices can coexist.

## An Example

Imagine a simple invoice application. A Transaction Script might be:
``` csharp
public async Task PayInvoiceAsync(
    int invoiceId,
    AppDbContext db)
{
    var invoice = await db.Invoices
        .SingleAsync(x => x.Id == invoiceId);

    if (invoice.Status != InvoiceStatus.Open)
        throw new InvalidOperationException();

    invoice.Status = InvoiceStatus.Paid;

    await db.SaveChangesAsync();
}
```

As requirements grow:
``` text
An invoice can only be paid if:
- it is open,
- its customer is active,
- the payment doesn't exceed the outstanding balance,
- currency matches,
- payment terms haven't expired,
- the invoice isn't disputed.
```

The operation now contains significant business knowledge. A domain model becomes more attractive:
``` csharp
invoice.Pay(payment);
```

with the business rules encapsulated by the invoice.

## Don't Turn Every Entity Into a Domain Model

There's another common mistake:
> "We're using Domain Model, therefore every class needs behavior."

No. A domain model should earn its complexity. A value object can be useful:
``` csharp
public readonly record struct CountryCode
{
    public string Value { get; }

    public CountryCode(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "Country code is required.",
                nameof(value));

        Value = value.ToUpperInvariant();
    }
}
```

That's useful behavior. But a simple database-backed lookup table doesn't necessarily need elaborate domain behavior.

## Modern C# Makes These Patterns Easier

Modern C# gives us useful tools for expressing domain concepts:
-   records,
-   record structs,
-   init-only properties,
-   pattern matching,
-   required members,
-   collection expressions,
-   nullable reference types,
-   primary constructors.

For example:
``` csharp
public readonly record struct Money(
    decimal Amount,
    string Currency);
```

can represent a value concept without requiring a large class hierarchy. Likewise, controlled state transitions can make invalid state changes difficult to express. The language helps us implement the model. It doesn't tell us whether we need the model.

## The Guiding Principle

The most useful rule is:
> **Put behavior where the knowledge required to perform that behavior
> naturally belongs.**

If the behavior is about HTTP, put it near HTTP. If it coordinates an application operation, put it in the application layer. If it represents an invariant of an order, invoice, reservation, or customer, consider putting it in the domain model. If the operation is trivial, a Transaction Script may be the better answer. Architecture is not about choosing the most sophisticated pattern. It's about choosing the pattern whose trade-offs fit the problem.
