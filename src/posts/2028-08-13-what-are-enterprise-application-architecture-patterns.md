---
author: Steve Kaschimer
date: 2028-08-13
image: /images/posts/2028-08-13-hero.webp
image_alt: "A layered blueprint stack of four horizontal bands fading from dense at the base to light at the top, implying a foundational structure the rest of a series builds on."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single layered blueprint glyph: four horizontal bands of decreasing width stacked like a stepped pyramid, rendered in thin outline strokes, with the bottom band solid teal and each band above progressively lighter until the top band is a faint off-white outline. Mood is foundational and exploratory. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Martin Fowler's *Patterns of Enterprise Application Architecture* catalog gave developers a shared vocabulary for organizing business rules, data, and presentation - and most of it holds up two decades later. This opens a series translating that catalog into modern .NET 10 and C# 14, starting with why patterns are tools for a specific problem, not architecture to apply by default."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "What Are Enterprise Application Architecture Patterns?"
---



Enterprise applications have a particular kind of complexity. They aren't usually difficult because calculating a mortgage payment or validating an email address is intrinsically hard. They're difficult because they have to coordinate **business rules, data, users, external systems, transactions, concurrency, and changing requirements**---often for years. A large business application might need to:
-   accept orders through a web API,
-   apply complicated pricing rules,
-   persist data in a relational database,
-   communicate with payment providers,
-   expose information to other applications,
-   deal with multiple users modifying the same data,
-   and remain understandable after dozens of developers have worked on
it. This is the problem space addressed by Martin Fowler's *Patterns of Enterprise Application Architecture*. Fowler's catalog organizes patterns for areas such as domain logic, data access, object-relational mapping, web presentation, distribution, concurrency, session state, and general application structure. This series explores those patterns using modern C# and .NET 10.

## Patterns Are Solutions to Recurring Problems

A design pattern isn't a class diagram that you copy into every project. It's better understood as a **named solution to a recurring design problem**. Suppose an application has a collection of business rules:
``` csharp
if (order.Customer.IsPreferred)
{
    discount = order.Total * 0.10m;
}

if (order.Total > 1_000m)
{
    discount += 50m;
}
```

That's not inherently bad. But imagine that the same rules start appearing in:
-   an HTTP endpoint,
-   a background job,
-   an import process,
-   a command handler,
-   and a reporting application.

Eventually the rules diverge. One implementation gets updated while another doesn't. A developer fixes a bug in one location but misses another. Tests become difficult because business behavior is scattered across infrastructure and presentation code. The underlying problem isn't "we need a design pattern." The problem is **we need a better way to organize business logic**. Patterns give us vocabulary for discussing those choices. Fowler describes, for example, **Transaction Script** as organizing business logic into procedures where each procedure handles a request, while **Domain Model** organizes business behavior around an object model containing both data and behavior. Those names let a team have a much more useful conversation:
> "This workflow is getting complicated enough that Transaction Script
> is no longer serving us. Should we introduce a Domain Model?"

That's considerably more precise than:
> "This code feels messy."

## Patterns Aren't Recipes

Consider the Repository pattern. At a high level, Fowler describes Repository as mediating between the domain and data-mapping layers using a collection-like interface for domain objects. A simplistic implementation might look like this:
``` csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(
        OrderId id,
        CancellationToken cancellationToken);

    Task AddAsync(
        Order order,
        CancellationToken cancellationToken);
}
```

That interface might be perfectly appropriate. But adding a repository interface to every entity in an application isn't automatically good architecture. In modern .NET, Entity Framework Core already provides abstractions such as:
-   a unit of work,
-   identity tracking,
-   change detection,
-   database mapping,
-   querying,
-   transaction integration.

So blindly wrapping EF Core can produce an abstraction that adds little value:
``` csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(OrderId id);
    Task<List<Order>> GetAllAsync();
    Task AddAsync(Order order);
    Task UpdateAsync(Order order);
    Task DeleteAsync(Order order);
}
```

If the implementation simply forwards every call to `DbSet<Order>`, we've arguably created another API without solving an architectural problem. The pattern is still useful. The question is whether **the problem the pattern solves exists in our application**.

## Patterns Exist in Context

The same pattern can be useful in one application and unnecessary in another. Imagine two applications.

### Application A: A Simple CRUD API

The application manages a list of internal company contacts. The requirements are straightforward:
``` text
Create contact
Update contact
Delete contact
Search contacts
```

A straightforward ASP.NET Core API backed by EF Core may be entirely sufficient. Introducing:
-   repositories,
-   domain services,
-   application services,
-   command buses,
-   elaborate mapping layers,
-   multiple abstractions around EF Core,

could make the application harder to understand rather than easier.

### Application B: A Trading Platform

Now imagine an application where an operation must:
1.  validate a trading account,
2.  check market rules,
3.  reserve funds,
4.  calculate fees,
5.  create a trade,
6.  update positions,
7.  publish an event,
8.  maintain an audit trail,
9.  handle concurrent updates.

Now the architecture has significantly different problems. Patterns such as:
-   Domain Model,
-   Unit of Work,
-   Repository,
-   Optimistic Offline Lock,
-   Service Layer,
-   Data Transfer Object,

may become extremely useful. The difference isn't that Application B is "enterprise" while Application A isn't. The difference is **complexity**.

## The Cost of Abstraction

Every abstraction has a cost. Consider:
``` csharp
public interface ICustomerService
{
    Task<CustomerDto> GetCustomerAsync(
        CustomerId id,
        CancellationToken cancellationToken);
}
```

Then:
``` csharp
public sealed class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repository;
    private readonly ICustomerMapper _mapper;

    // ...
}
```

And:
``` csharp
public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(...);
}
```

And perhaps:
``` csharp
public interface ICustomerMapper
{
    CustomerDto Map(Customer customer);
}
```

There are situations where this structure is justified. There are also situations where it turns a simple query into a journey through six files. A good architecture doesn't maximize the number of abstractions. It **puts abstractions where they buy us something**. That might mean:
-   isolating business rules,
-   protecting a domain model,
-   hiding infrastructure,
-   controlling transactions,
-   making external systems replaceable,
-   improving testability,
-   enforcing architectural boundaries,
-   or reducing coupling.

If an abstraction doesn't accomplish something valuable, it deserves scrutiny.

## The .NET Framework Is Already Full of Patterns

One reason these patterns are particularly interesting today is that modern frameworks implement many of the ideas that developers once had to build themselves. For example, Entity Framework Core provides behavior associated with several object-relational patterns. A `DbContext` tracks entities:
``` csharp
var order = await db.Orders
    .SingleAsync(o => o.Id == orderId, cancellationToken);

order.Status = OrderStatus.Paid;

await db.SaveChangesAsync(cancellationToken);
```

The application doesn't explicitly maintain a list like:
``` csharp
var changedObjects = new List<object>();
```

EF Core does that work for us. Similarly, the ASP.NET Core request pipeline embodies ideas associated with Front Controller and related presentation patterns. This means modern developers can sometimes **use a pattern without realizing they're using it**. Understanding the pattern remains useful because it helps us understand what the framework is doing - and when the framework's implementation isn't sufficient for our problem.

## Patterns Help With Communication

Perhaps the greatest value of patterns isn't implementation. It's vocabulary. Compare these two conversations.

### Conversation A

> "We have some classes that get data and some classes that do business
> logic, and I'm not sure if they're in the right place."

### Conversation B

> "We're using a Transaction Script approach for these workflows, but
> the business rules are now shared across multiple operations. A Domain
> Model may give us a better boundary."

Conversation B is considerably more productive. A shared vocabulary lets developers communicate architectural ideas without describing every implementation detail from scratch. That's one reason patterns survive technological changes. The syntax changes. The frameworks change. The databases change. The underlying problems often don't.

## What Makes a Good Pattern?

A useful pattern usually describes several things:
1.  **A recurring problem**
2.  **The forces or constraints involved**
3.  **A general solution**
4.  **The consequences of that solution**

The consequences are particularly important. Every pattern makes trade-offs. For example, a Data Transfer Object can reduce the number of network calls by transferring data in larger chunks. Fowler describes DTO specifically in terms of carrying data between processes to reduce method calls. But DTOs also introduce:
-   another representation of the data,
-   mapping code,
-   maintenance overhead,
-   potential duplication.

The pattern isn't "good." It's useful **when its benefits outweigh those costs**.

## Patterns Don't Replace Design

A common mistake is to approach architecture as pattern selection:
> "Which pattern should I use here?"

A better question is:
> "What problem am I trying to solve?"

Only then should we ask whether a known pattern helps. This distinction will be important throughout this series. We'll encounter patterns that are:
-   still highly relevant,
-   useful but frequently overused,
-   implemented automatically by modern frameworks,
-   occasionally useful in specialized systems,
-   or mostly valuable as historical context.

Some of Fowler's catalog is almost unchanged conceptually since its original publication in 2003. Fowler's current catalog explicitly notes that its content remains the same as the original publication even though the site received a design refresh in 2024. Our implementations, however, won't be frozen in 2003. We'll use modern C# and .NET.

## The Goal of This Series

The goal isn't to turn every application into an elaborate enterprise architecture. Instead, we'll use the patterns as a way to answer practical questions:
-   Where should this business rule live?
-   How should application code interact with persistence?
-   When is a repository useful?
-   How should concurrency conflicts be handled?
-   When should data cross an application boundary?
-   How should web requests be structured?
-   How should state survive between requests?
-   Which patterns does EF Core already implement?
-   Which patterns does ASP.NET Core already implement?
-   When is an older pattern still useful?
-   When is it better to avoid the pattern entirely?

The most important lesson is simple:
> **Patterns are tools, not architecture.**

Good architecture comes from understanding the problem, the constraints, and the trade-offs - and then choosing the simplest design that solves the problem well.
