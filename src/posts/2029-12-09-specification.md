---
author: Steve Kaschimer
date: 2029-12-09
image: /images/posts/2029-12-09-hero.webp
image_alt: "A checkmark inside a small named tag shape, overlaid on a filtered subset highlighted within a larger set."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small amber tag glyph containing a teal checkmark, positioned above a loose cluster of shapes where only a filtered subset is highlighted solid and the rest remain faint outlines, implying a named predicate selecting exactly the members that satisfy it. Mood is selective and named. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Encapsulate reusable business predicates and composable selection rules without turning every LINQ expression into an abstraction or coupling the domain to persistence mechanics."
tags: ["dotnet", "architecture", "design-patterns", "domain-driven-design"]
title: "Specification: Giving Business Predicates a Name"
---

Business rules often begin as conditionals.

``` csharp
if (customer.IsActive &&
    customer.TotalSpend >= 10_000m &&
    !customer.IsDelinquent)
{
    // ...
}
```

Then the same rule appears elsewhere.

Specification gives that rule a name.

## A Domain Specification

``` csharp
public sealed class PreferredCustomerSpecification
{
    public bool IsSatisfiedBy(Customer customer)
        => customer.IsActive
           && customer.TotalSpend >= Money.Usd(10_000)
           && !customer.IsDelinquent;
}
```

Now code can say:

``` csharp
if (preferredCustomers.IsSatisfiedBy(customer))
{
}
```

The business concept is explicit.

## The Value Is the Language

Specification is most useful when the predicate itself is meaningful:

``` text
CustomerIsEligibleForRefund
OrderRequiresManualReview
ShipmentCanBeExpedited
```

A specification named:

``` text
CustomerNameStartsWithS
```

may simply be a LINQ predicate wearing formal clothing.

## Composing Specifications

Specifications are often composable:

``` text
PreferredCustomer
AND
AccountInGoodStanding
AND NOT
RestrictedRegion
```

That can be modeled with combinators.

But composition machinery can quickly become more complicated than the
business rule.

Start simple.

## In-Memory vs. Queryable Specifications

There are two different problems hiding behind the same name.

### Domain predicate

``` csharp
bool IsSatisfiedBy(Customer customer)
```

evaluates an existing domain object.

### Query specification

``` csharp
Expression<Func<Customer, bool>>
```

can potentially be translated by EF Core into SQL.

These are related but not identical responsibilities.

## Query Specification Example

``` csharp
public sealed class ActiveCustomers
{
    public Expression<Func<Customer, bool>>
        ToExpression()
        => customer => customer.IsActive;
}
```

Then:

``` csharp
var customers = await db.Customers
    .Where(spec.ToExpression())
    .ToListAsync(cancellationToken);
```

This can reduce duplicated query rules.

But it also means the specification knows about expression trees and
query-provider constraints.

That may be acceptable in an application/query layer and undesirable in
a pure domain layer.

## The Translation Trap

A perfectly valid C# method:

``` csharp
customer.IsPreferred()
```

may not translate into SQL.

Trying to make every domain specification both:

``` text
rich domain behavior
and
database-translatable expression
```

can distort the model.

Do not force one abstraction to satisfy incompatible concerns.

## Specification and CQRS

CQRS gives us an elegant escape hatch.

Command-side specifications can operate on aggregates.

Query-side filters can use efficient SQL-oriented expressions.

They do not have to be the same object.

``` text
Write Model
  -> domain specification

Read Model
  -> query filter/projection
```

## Specification vs. Validation

Validation asks whether input/state is valid.

Specification often asks whether an object satisfies a business
criterion.

``` text
Email syntax valid?
    -> validation

Customer eligible for premium shipping?
    -> specification/policy
```

The boundary can overlap, but the intent differs.

## Specification vs. Policy

The names are often close.

A Policy may decide or calculate behavior.

A Specification traditionally answers whether something satisfies a
criterion.

``` csharp
bool IsSatisfiedBy(T candidate)
```

Do not become doctrinaire about terminology. Prefer the domain's
language.

## Repository Specifications

Some architectures expose:

``` csharp
Task<IReadOnlyList<T>> ListAsync(
    ISpecification<T> specification);
```

This can centralize filtering, includes, ordering, and pagination.

It can also turn the repository into a custom LINQ provider.

Evaluate whether the abstraction is buying clarity or hiding EF Core
behind a less capable API.

## Testing

Specifications should have table-driven examples:

``` text
active + high spend + good standing -> true
inactive                         -> false
delinquent                       -> false
low spend                        -> false
```

Tests become executable examples of the business term.

## When It Helps

Specification is valuable when:

-   a business predicate has a meaningful name;
-   the rule is reused;
-   rules compose;
-   the concept belongs in the ubiquitous language.

## When It Hurts

It hurts when:

-   every `Where` clause becomes a class;
-   generic infrastructure overwhelms simple predicates;
-   domain code is distorted to satisfy SQL translation;
-   repository abstractions become query languages.

## How It Relates to Fowler

Specification complements Domain Model, Query Object, Repository, and
Value Object.

It gives recurring selection/business criteria first-class
representation.

## Summary

Specification is powerful because it turns a recurring business question
into an explicit concept.

Use it for predicates worth naming.

Do not create a class hierarchy merely to avoid writing a readable LINQ
expression.
