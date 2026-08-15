---
category: Base Patterns
csharp: 14
description: Replace repeated null and exceptional-case checks with
  objects that represent meaningful special cases in the domain.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/specialCase.html"
order: 54
pattern: Special Case
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: special-case
status: draft
title: "Special Case in Modern C#"
---

# Special Case in Modern C

Special Case creates an object that represents an exceptional or unusual
situation so callers can treat it like an ordinary object.

Instead of scattering:

``` csharp
if (customer is null)
```

throughout the application, a special object can embody the behavior of
the missing or unusual case.

## The Repeated Conditional

Imagine:

``` csharp
var customer = await repository.FindAsync(id, ct);

var name = customer is null
    ? "Guest"
    : customer.DisplayName;

var discount = customer is null
    ? Money.Zero(Usd)
    : customer.CalculateDiscount(total);
```

The same condition starts appearing everywhere.

The missing customer has behavior. We simply have not modeled it yet.

## A Special Case Object

``` csharp
public interface ICustomer
{
    string DisplayName { get; }

    Money CalculateDiscount(Money total);
}
```

A normal customer:

``` csharp
public sealed class Customer : ICustomer
{
    public string DisplayName { get; }

    public Money CalculateDiscount(Money total)
    {
        // Normal customer rules.
    }
}
```

and a special case:

``` csharp
public sealed class GuestCustomer : ICustomer
{
    public string DisplayName => "Guest";

    public Money CalculateDiscount(Money total)
        => Money.Zero(total.Currency);
}
```

Callers can now write:

``` csharp
var discount =
    customer.CalculateDiscount(total);
```

without repeatedly checking whether the customer is a guest.

## Special Case vs. Null Object

Null Object is a common form of Special Case.

But Special Case is broader.

Examples include:

``` text
GuestCustomer
UnknownEmployee
NoPromotion
UnavailableExchangeRate
UnlimitedQuota
```

These objects represent meaningful domain states, not merely `null`.

## Factory Methods

A repository or factory can return the special case:

``` csharp
public async Task<ICustomer> GetAsync(
    CustomerId id,
    CancellationToken cancellationToken)
{
    return await FindAsync(id, cancellationToken)
        ?? GuestCustomer.Instance;
}
```

If the absence of a customer is genuinely exceptional, this would be the
wrong design.

Special Case is appropriate only when the special state has legitimate
semantics.

## Singleton Special Cases

Immutable stateless special cases can often be shared:

``` csharp
public sealed class GuestCustomer : ICustomer
{
    public static GuestCustomer Instance { get; }
        = new();

    private GuestCustomer()
    {
    }
}
```

Do not use a singleton if the special case contains request-specific
mutable state.

## Pattern Matching

Modern C# pattern matching can make explicit special cases readable:

``` csharp
return customer switch
{
    GuestCustomer => GuestPricing.Apply(cart),
    Customer registered =>
        RegisteredPricing.Apply(
            registered,
            cart),
    _ => throw new UnreachableException()
};
```

The pattern does not require eliminating every conditional.

Its goal is to stop unrelated callers from repeatedly rediscovering the
same special-case rules.

## Discriminated-Union-Style Results

Sometimes the special cases are better represented as explicit result
variants:

``` csharp
public abstract record CustomerLookupResult;

public sealed record Found(Customer Customer)
    : CustomerLookupResult;

public sealed record NotFound
    : CustomerLookupResult;

public sealed record AccessDenied
    : CustomerLookupResult;
```

Then:

``` csharp
return result switch
{
    Found(var customer) => Ok(customer),
    NotFound => Results.NotFound(),
    AccessDenied => Results.Forbid(),
    _ => throw new UnreachableException()
};
```

This is often better than inventing a fake domain object for error
conditions.

## Do Not Hide Errors

Suppose a payment gateway fails.

Returning:

``` csharp
PaymentResult.None
```

may hide an operational failure that should be retried or surfaced.

Special Case should model a legitimate special state, not turn every
exception into a harmless-looking object.

## Special Case and Value Object

A value type can also represent a special value.

For example:

``` csharp
public readonly record struct Quantity(int Value)
{
    public static Quantity Unlimited => new(-1);
}
```

But magic sentinel values are risky.

A clearer representation might be:

``` csharp
public abstract record Quota;

public sealed record LimitedQuota(int Maximum)
    : Quota;

public sealed record UnlimitedQuota
    : Quota;
```

The special meaning is now explicit.

## Optional Values

Nullable reference types and `T?` are often perfectly good.

If the only behavior is:

``` text
present or absent
```

then:

``` csharp
Customer?
```

may be simpler than a special object.

Use Special Case when the unusual state has enough behavior or meaning
to deserve representation.

## ASP.NET Core Example

Suppose anonymous and authenticated users can both see a product page.

Instead of spreading:

``` csharp
if (User.Identity?.IsAuthenticated == true)
```

through pricing and personalization logic, application code can resolve:

``` csharp
IShopper shopper =
    authenticated
        ? registeredShopper
        : AnonymousShopper.Instance;
```

The page logic can then ask the shopper abstraction for the capabilities
it needs.

## Testing

Special cases deserve the same tests as normal implementations.

Verify that the object behaves correctly:

``` csharp
[Fact]
public void Guest_customer_receives_no_discount()
{
    var total = Money.Usd(100m);

    var discount =
        GuestCustomer.Instance
            .CalculateDiscount(total);

    Assert.Equal(Money.Usd(0m), discount);
}
```

The value is in behavior, not merely avoiding `null`.

## When to Use It

Use Special Case when:

-   one exceptional state is legitimate and recurring,
-   callers repeat the same conditional behavior,
-   the special state can honor the normal abstraction,
-   giving the state a name clarifies the domain.

## When Not to Use It

Prefer nullability, explicit result types, or exceptions when the state
is simply absent, failed, or invalid.

Do not manufacture fake domain objects just to eliminate `if`
statements.

## Related Patterns

-   Value Object
-   Gateway
-   Service Stub

## Summary

Special Case turns recurring exceptional-state logic into an explicit
object.

Modern C# gives us several alternatives---nullable types, records,
pattern matching, and result unions---so the pattern should be used
deliberately.

It shines when the "exception" is actually a meaningful domain state
with stable behavior.
