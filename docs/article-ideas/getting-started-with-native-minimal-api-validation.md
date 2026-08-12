# Getting Started with Native Minimal API Validation in .NET 10

Minimal APIs went four major versions without a first-party answer to a question MVC solved on day one: how does a request get validated before it reaches your handler. Every project either wrote manual checks, reached for MiniValidation, or brought in FluentValidation just to cover a gap that should have been built in. .NET 10 closes that gap directly -- the same `DataAnnotations` attributes MVC has used for over a decade now work automatically in Minimal API endpoints, with no third-party package required.

This guide covers enabling native validation in .NET 10, bootstrapping it correctly for both simple and nested request models, the core patterns for what it covers and what it doesn't, and the best practices for using it as the default for new Minimal API projects. By the end you'll have automatic, first-party request validation with the same attributes you already know from MVC.

If you're deciding between validation approaches first, a comparison of the top .NET validation approaches covers where native Minimal API validation fits relative to FluentValidation, DataAnnotations, MiniValidation, and custom validation.

## What You'll Need

- .NET 10 SDK or later -- this feature is not available on earlier versions
- A Minimal API project

## Enabling Native Validation

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidation();

var app = builder.Build();
```

That's the entire setup -- `AddValidation()` registers the validation services needed for the Minimal API pipeline to automatically validate `DataAnnotations`-decorated parameters, with no separate filter or manual wiring required.

## Bootstrapping the Ideal Environment

### Models use standard DataAnnotations attributes

```csharp
using System.ComponentModel.DataAnnotations;

public class CreateOrderRequest
{
    [Required(ErrorMessage = "A customer is required")]
    public int CustomerId { get; set; }

    [Required, MinLength(1, ErrorMessage = "An order must contain at least one item")]
    public List<OrderItem> Items { get; set; } = [];

    [StringLength(20)]
    public string? DiscountCode { get; set; }
}
```

No new attribute vocabulary -- if you've used DataAnnotations in MVC before, this is identical.

### Validation runs automatically on the endpoint

```csharp
app.MapPost("/orders", (CreateOrderRequest request) =>
{
    // If we reach here, request has already passed validation.
    // Invalid requests never reach this handler at all.
    return Results.Created();
});
```

There's no `TryValidate` call, no endpoint filter to write -- once `AddValidation()` is registered, every Minimal API endpoint with a `DataAnnotations`-decorated parameter is validated automatically before the handler executes, and an invalid request receives a standardized `ValidationProblem` response without you writing that logic yourself.

### Nested objects and collections

```csharp
public class OrderItem
{
    [Required]
    public string ProductId { get; set; } = "";

    [Range(1, 100)]
    public int Quantity { get; set; }
}
```

Nested types (like `OrderItem` inside `CreateOrderRequest.Items`) validate automatically as part of the same pass -- you don't need separate configuration for nested validation the way some manual DataAnnotations approaches require.

### IValidatableObject still works for conditional logic

```csharp
public class CreateOrderRequest : IValidatableObject
{
    public int CustomerId { get; set; }
    public bool HasDiscount { get; set; }
    public string? DiscountCode { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (HasDiscount && string.IsNullOrEmpty(DiscountCode))
        {
            yield return new ValidationResult(
                "A discount code is required when a discount is applied",
                [nameof(DiscountCode)]);
        }
    }
}
```

Native Minimal API validation runs `IValidatableObject.Validate()` as part of the same automatic pass -- the same mechanism classic DataAnnotations has always used for conditional and cross-property rules, now working automatically in Minimal APIs without any extra wiring.

## Core Workflow

- **Enable `AddValidation()` once at startup, and rely on it for every endpoint with a `DataAnnotations`-decorated parameter.** There's no per-endpoint configuration needed -- it applies broadly once registered.
- **Use `IValidatableObject` for the same conditional/cross-property scenarios you'd use it for in MVC.** The mechanism is identical; only the automatic triggering context (Minimal APIs instead of MVC's model binder) has changed.
- **Reach for FluentValidation specifically when a rule genuinely needs more expressiveness than attributes and `IValidatableObject` provide.** Native validation doesn't extend DataAnnotations' capabilities -- it just makes them automatic in a context where they previously weren't.

## Verifying Your Setup

1. **`AddValidation()` is registered** -- confirm it's called during service configuration, or validation won't trigger automatically
2. **Invalid requests are rejected automatically** -- confirm a request violating a `[Required]` or other attribute is rejected with a standardized validation error response, without any explicit check in the handler
3. **Nested validation works** -- confirm a validation failure on a nested object property (like `OrderItem.Quantity`) is correctly reported
4. **`IValidatableObject` logic runs as part of the same pass** -- confirm conditional rules implemented there fire correctly alongside attribute-based checks

## Best Practices

**Use this as the default for new Minimal API projects on .NET 10+.** It's first-party, requires no new dependency, and covers the majority of straightforward validation needs with less setup than any third-party alternative.

**Don't expect it to add expressiveness beyond what DataAnnotations and `IValidatableObject` already provide.** It's a delivery mechanism (automatic triggering in the Minimal API pipeline), not a new validation model -- the same expressiveness ceiling that applies to classic DataAnnotations applies here.

**Reach for FluentValidation specifically for genuinely complex conditional or cross-property rules**, the same guidance that applies to classic DataAnnotations. Native validation doesn't change when that trade-off point is reached.

**Confirm your target .NET version before assuming this feature is available.** It's exclusive to .NET 10 and later -- projects on earlier versions need MiniValidation, FluentValidation, or manual validation instead.

**Keep validation attributes focused on data shape, the same discipline that applies to any DataAnnotations usage.** Rules requiring a database lookup or complex domain logic still belong in a service layer or custom validator, not crammed into an attribute or `IValidatableObject` implementation trying to do too much.

## Comparison with FluentValidation

| | Native Minimal API Validation | FluentValidation |
| --- | --- | --- |
| Dependency | None -- built into .NET 10+ | A NuGet package |
| .NET version | 10+ only | Any supported .NET version |
| Conditional/cross-property rules | Via IValidatableObject, same ceiling as DataAnnotations | Excellent, built for this |
| Setup | `AddValidation()`, two lines | Validator classes + registration + filter (for Minimal APIs) |
| Performance | Fast, similar model to MiniValidation | Often the slowest option in benchmarks |

Native validation is the right default for straightforward validation needs on .NET 10+; FluentValidation remains the better choice specifically where conditional or cross-property complexity exceeds what attributes and `IValidatableObject` express cleanly.

## Frequently Asked Questions

### Do I need a NuGet package for native Minimal API validation?

No -- it's built directly into the .NET 10 SDK. `builder.Services.AddValidation()` is all that's needed to enable it; there's no third-party package to install.

### Can I use this on .NET 8 or .NET 9?

No -- native Minimal API validation is a .NET 10 feature specifically. Projects on earlier versions need to continue using MiniValidation, FluentValidation, or manual validation for Minimal APIs.

### Does native validation support conditional or cross-property rules?

Through `IValidatableObject`, yes -- the same mechanism classic DataAnnotations has always used. It doesn't add new expressiveness beyond what `IValidatableObject` and built-in attributes already support; for genuinely complex conditional logic, FluentValidation remains more natural to read and write.

### How is this different from just using MiniValidation in a Minimal API?

Native validation is first-party and requires no separate package, built directly into the Minimal API request pipeline as of .NET 10. MiniValidation is a third-party library providing similar DataAnnotations-based validation, useful specifically for .NET versions before 10 or application types beyond Minimal APIs (console apps, for instance) where native validation doesn't apply.

### What response do I get when validation fails?

A standardized `ValidationProblem` response (following the Problem Details format), generated automatically -- you don't need to construct this response yourself the way you would with a custom endpoint filter approach.

### Should I migrate from MiniValidation or a manual endpoint filter to native validation once I'm on .NET 10?

It's a reasonable simplification if your validation needs are the straightforward, attribute-expressible kind both approaches already handle similarly -- removing a dependency and a custom filter in favor of the first-party mechanism reduces surface area with no loss of capability. If you were using FluentValidation for genuinely complex rules, there's no reason to migrate away from it, since native validation doesn't add expressiveness beyond DataAnnotations.

### What's the most common mistake when adopting native Minimal API validation?

Forgetting to call `builder.Services.AddValidation()`, so validation silently doesn't run despite the attributes being present on the model. The second common mistake is expecting it to handle complex conditional validation as naturally as FluentValidation, when it shares the exact same expressiveness ceiling as classic DataAnnotations underneath.
