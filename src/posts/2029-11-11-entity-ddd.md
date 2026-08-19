---
author: Steve Kaschimer
date: 2029-11-11
image: /images/posts/2029-11-11-hero.webp
image_alt: "A circle with a small persistent identity tag attached, and a faint trail of past positions behind it."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one solid teal circle with a small amber identity-tag glyph attached to its edge, trailed by two faint fading outline copies of the same circle behind it, implying one continuous identity persisting while its state changes over time. Mood is continuous and persistent. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Model domain concepts whose identity and continuity matter more than their current attribute values, while protecting invariants with ordinary modern C#."
tags: ["dotnet", "architecture", "design-patterns", "domain-driven-design"]
title: "Entity in Domain-Driven Design"
---



An Entity is a domain object defined primarily by **identity and continuity**, not by the values of all its properties. Two customers can have the same name. They are still different customers. One customer can change their name. They are still the same customer. That distinction is the heart of Entity.

## Identity Before Data

A tempting model is:
``` csharp
public sealed record Customer(
    Guid Id,
    string Name,
    string Email);
```

Records provide value-based equality. That can be exactly wrong for an entity. If two independently created customers happen to contain the same values, they do not become the same customer. Entity equality is usually about identity.

## Strongly Typed Identity

Modern C# makes identity types inexpensive:
``` csharp
public readonly record struct CustomerId(Guid Value)
{
    public static CustomerId New()
        => new(Guid.NewGuid());
}
```

Then:
``` csharp
public sealed class Customer
{
    public CustomerId Id { get; private set; }

    public string Name { get; private set; }

    private Customer()
    {
    }

    private Customer(
        CustomerId id,
        string name)
    {
        Id = id;
        Rename(name);
    }

    public static Customer Register(string name)
        => new(CustomerId.New(), name);

    public void Rename(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException(
                "Customer name is required.");

        Name = name.Trim();
    }
}
```

The entity owns the state transition.

## An Entity Is Not a Database Row

This distinction matters. A database table may contain:
``` text
Customers
---------
Id
Name
Email
CreatedAt
```

That does not mean the domain needs a `Customer` entity. If the application simply edits rows with no meaningful identity-driven behavior, a CRUD model may be enough. DDD entities earn their cost when identity, lifecycle, and business rules matter.

## Protect Valid State

Avoid public setters:
``` csharp
customer.CreditLimit = -1_000_000;
customer.Status = CustomerStatus.Platinum;
```

Prefer behavior:
``` csharp
customer.ChangeCreditLimit(newLimit);
customer.QualifyForPreferredStatus();
```

Methods should express domain language and preserve invariants.

## Identity Across Time

An entity's attributes change:
``` text
Customer #42

2024 -> Steven, old@example.com
2026 -> Steven, new@example.com
```

The entity remains Customer #42. That continuity is what makes identity significant.

## Entity vs. Value Object

Compare:
``` text
Customer
  identity matters

ShippingAddress
  values usually matter
```

If a customer changes address, the old address value can be replaced by a new value. If the customer changes email, we normally do not replace the customer with another customer.

## Equality

If domain entities need equality semantics, base them on stable identity. Do not blindly implement equality across every property. Also be careful with newly constructed entities whose database-generated identity does not yet exist. Strongly typed IDs created by the domain can simplify this considerably.

## Persistence

EF Core can map encapsulated entities. Persistence requirements should not force the domain into:
``` csharp
public string Name { get; set; }
```

everywhere. Private setters, backing fields, owned/complex values, and explicit configuration allow a domain model to remain behavior-oriented.

## Do Not Put Infrastructure in the Entity

This is a warning sign:
``` csharp
public async Task SaveAsync()
{
    await _dbContext.SaveChangesAsync();
}
```

The entity should model the domain. Persistence, HTTP calls, logging, and message-broker APIs belong outside it.

## Lifecycle

Entities often have meaningful lifecycle transitions:
``` text
Draft
  |
Submit
  |
Approved
  |
Fulfilled
```

Model those transitions rather than exposing arbitrary status assignment.
``` csharp
public void Submit()
{
    if (Status != OrderStatus.Draft)
        throw new DomainException(
            "Only draft orders can be submitted.");

    Status = OrderStatus.Submitted;
}
```

The method explains why the state can change.

## Testing

Entity tests should focus on business behavior:
``` csharp
[Fact]
public void Draft_order_can_be_submitted()
{
    var order = Order.Create(...);

    order.Submit();

    Assert.Equal(
        OrderStatus.Submitted,
        order.Status);
}
```

Also test prohibited transitions. The important tests prove invariants, not getters and setters.

## When It Helps

Use an Entity when:
-   identity matters across time;
-   lifecycle matters;
-   behavior belongs with the state;
-   invariants must survive every mutation.

## When It Hurts

Do not turn every table into a DDD Entity. If the application is straightforward data maintenance, a simpler persistence or DTO model may communicate the design better.

## How It Relates to Fowler

Volume I's Domain Model established the broader pattern. DDD's Entity gives us one of the fundamental building blocks inside that model. The next article introduces the boundary that makes entities especially useful: the Aggregate.

## Summary

An Entity is not "a class with an ID." It is a domain concept whose identity persists while its state changes. Modern C# lets us model that identity explicitly while keeping behavior and invariants where they belong: inside the domain.
