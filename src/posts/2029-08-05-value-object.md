---
author: Steve Kaschimer
date: 2029-08-05
image: /images/posts/2029-08-05-hero.webp
image_alt: "Two identical small shapes perfectly overlapping with no offset or seam between them, implying equivalence defined entirely by shared value rather than distinct identity."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two identical small teal shapes perfectly overlapping with zero offset between them, rendered so they appear as a single unified glyph with a faint amber double-outline, implying equivalence defined entirely by shared value rather than by distinct identity. Mood is equivalent and precise. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A Value Object is defined by its value rather than an identity - two coordinates with the same latitude and longitude represent the same value. Modern C# records and readonly record structs make this pattern genuinely expressive, covering strongly typed IDs, immutability, and why not every string needs a wrapper."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Value Object in Modern C#"
---



A Value Object is defined by its value rather than by an identity. Two value objects with the same constituent values are considered equivalent. Modern C# gives us excellent language features for expressing this pattern.

## Identity vs. Value

An entity has identity:
``` text
Customer 42
```

Even if every property changes, it is still Customer 42. A value object is different:
``` text
Latitude: 42.3314
Longitude: -83.0458
```

Two coordinates with the same values represent the same value.

## Records

C# records provide value-based equality:
``` csharp
public sealed record Address(
    string Line1,
    string City,
    string Region,
    string PostalCode,
    string CountryCode);
```

Then:
``` csharp
var a = new Address(
    "1 Main St",
    "Detroit",
    "MI",
    "48201",
    "US");

var b = new Address(
    "1 Main St",
    "Detroit",
    "MI",
    "48201",
    "US");

Console.WriteLine(a == b); // True
```

That aligns naturally with Value Object semantics.

## Validation

A value object should not allow invalid values merely because a record makes construction concise.
``` csharp
public sealed record EmailAddress
{
    public string Value { get; }

    private EmailAddress(string value)
        => Value = value;

    public static EmailAddress Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "Email address is required.");

        return new EmailAddress(
            value.Trim().ToLowerInvariant());
    }
}
```

The object normalizes and protects its value.

## Primitive Obsession

Without Value Objects:
``` csharp
Task SendEmailAsync(string email);
Task ShipAsync(string postalCode);
Task ChargeAsync(decimal amount, string currency);
```

Everything is a primitive. With Value Objects:
``` csharp
Task SendEmailAsync(EmailAddress email);
Task ShipAsync(PostalCode postalCode);
Task ChargeAsync(Money amount);
```

The type system now communicates meaning.

## Strongly Typed IDs

Identifiers are technically identity-related, but small value types are excellent wrappers around raw IDs:
``` csharp
public readonly record struct OrderId(Guid Value);
public readonly record struct CustomerId(Guid Value);
```

Now this mistake does not compile:
``` csharp
LoadOrder(customerId);
```

when the method expects `OrderId`.

## readonly record struct

Small scalar values can be represented efficiently:
``` csharp
public readonly record struct Percentage(decimal Value)
{
    public static Percentage Create(decimal value)
    {
        if (value is < 0 or > 100)
            throw new ArgumentOutOfRangeException(
                nameof(value));

        return new Percentage(value);
    }
}
```

This gives value semantics without heap allocation in many common scenarios.

## Immutability

Value Objects are usually immutable. Instead of:
``` csharp
address.City = "Ann Arbor";
```

create a new value:
``` csharp
var updated =
    address with { City = "Ann Arbor" };
```

Be careful: positional records with public `init` members may allow callers to create invalid values with `with`. For strongly invariant-driven values, control construction more tightly.

## Behavior Belongs on Value Objects

Value Objects are not merely bags of properties.
``` csharp
public readonly record struct Temperature(
    decimal Celsius)
{
    public decimal Fahrenheit =>
        Celsius * 9m / 5m + 32m;
}
```

Behavior that naturally belongs to the value should live with it.

## Equality

Equality must reflect the concept. For an email address, case normalization may mean:
``` text
Alice@example.com
alice@example.com
```

are treated as equal by your application. For another domain, original casing may matter. Value equality is a domain decision, not simply "compare every field."

## EF Core Complex Types

EF Core can map multi-property value objects as complex types. Conceptually:
``` csharp
builder.ComplexProperty(
    x => x.ShippingAddress);
```

The value object's properties can live as columns on the owning entity without requiring a separate entity identity. That is often a good fit for Address-like values.

## Value Converters

Single-value wrappers can often use a value converter:
``` csharp
builder.Property(x => x.Id)
    .HasConversion(
        id => id.Value,
        value => new OrderId(value));
```

This allows the domain to use a strongly typed ID while the database stores a normal `uniqueidentifier`.

## Owned Types

EF Core owned entity types have historically been used for value-object-like structures. Modern EF Core complex types more directly express types that have no independent identity. Choose based on the behavior and version of EF Core your application targets.

## Serialization

A strongly typed value object may need custom JSON representation. You might want:
``` json
"customerId": "8f..."
```

rather than:
``` json
"customerId": {
  "value": "8f..."
}
```

JSON converters can preserve the clean external representation while keeping the strong internal type.

## Value Objects as Dictionary Keys

Good immutable value semantics make Value Objects useful keys:
``` csharp
Dictionary<CurrencyPair, ExchangeRate>
```

Records automatically provide equality and hashing behavior, but confirm that the generated semantics match your domain.

## Avoid Tiny Types Everywhere

Not every string needs a wrapper. A Value Object earns its place when it captures:
-   meaning,
-   validation,
-   behavior,
-   equality semantics,
-   type safety.

Wrapping every primitive with no added semantics can create noise.

## Testing

Value Objects are easy and valuable to unit-test. Test:
-   valid construction,
-   invalid construction,
-   normalization,
-   equality,
-   operations,
-   serialization,
-   persistence conversion.

## When to Use It

Use Value Object when a concept is identified entirely by its value and deserves stronger semantics than a primitive. Common examples include:
-   money,
-   address,
-   date range,
-   percentage,
-   coordinates,
-   email address,
-   measurement,
-   currency pair.

## Related Patterns

-   Money
-   Embedded Value
-   Serialized LOB
-   Identity Field

## Summary

Value Object replaces loosely typed primitive data with immutable domain concepts whose equality is based on value. C# records and readonly record structs make the pattern especially expressive, while EF Core converters and complex types make persistence practical. The result is often a domain model that is both safer and easier to read.
