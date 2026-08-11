# Getting Started with DataAnnotations in .NET

DataAnnotations have been quietly doing most of .NET's validation work since long before ASP.NET Core existed, and their biggest advantage is one that's easy to take for granted: they're already there. No package to add, no configuration to wire up -- decorate a property with `[Required]`, and MVC's model binding pipeline validates it automatically. The parts worth understanding well are where that automatic convenience ends, and how `IValidatableObject` picks up the slack for anything an attribute can't express on its own.

This guide covers using DataAnnotations for validation in .NET, bootstrapping automatic MVC validation and the manual validation you need elsewhere, the core patterns for built-in attributes and `IValidatableObject`, and the best practices for knowing when attribute-based validation is genuinely sufficient versus when it's time to reach for something more expressive. By the end you'll have validation that's fast, familiar, and correctly scoped to what it's actually good at.

If you're deciding between validation approaches first, a comparison of the top .NET validation approaches covers where DataAnnotations fit relative to FluentValidation, MiniValidation, custom validation, and .NET 10's native Minimal API validation.

## What You'll Need

- .NET 8 SDK or later
- Nothing else -- `System.ComponentModel.DataAnnotations` is part of the .NET base class libraries

## Using DataAnnotations

No installation step -- the namespace is available in every .NET project by default:

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

    [Range(0, 100)]
    public int DiscountPercentage { get; set; }
}
```

## Bootstrapping the Ideal Environment

### Automatic validation in MVC

```csharp
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpPost]
    public IActionResult Create(CreateOrderRequest request)
    {
        // If we reach here, request has already passed DataAnnotations validation
        // [ApiController] returns 400 automatically on an invalid model
        return Ok();
    }
}
```

`[ApiController]` is what makes this automatic -- without it, you'd need to check `ModelState.IsValid` manually inside every action. This is one of the most understated conveniences DataAnnotations provides in MVC: zero explicit validation code, and it's been working this way since ASP.NET Core's early versions.

### IValidatableObject for logic a single attribute can't express

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

`IValidatableObject` is DataAnnotations' answer to conditional and cross-property validation -- the model itself implements a `Validate` method with arbitrary logic, called automatically as part of the same validation pass as the attribute-based checks. It's more manual than FluentValidation's `.When()` syntax, but it stays within the DataAnnotations model without adding a dependency.

### Manual validation outside MVC's automatic pipeline

```csharp
var request = new CreateOrderRequest { CustomerId = 0 };
var context = new ValidationContext(request);
var results = new List<ValidationResult>();

bool isValid = Validator.TryValidateObject(request, context, results, validateAllProperties: true);

foreach (var result in results)
    Console.WriteLine(result.ErrorMessage);
```

`Validator.TryValidateObject` is the underlying mechanism MVC's automatic validation calls internally -- useful directly for validating outside a web request context (a console app, a background job, or anywhere DataAnnotations-decorated models need checking without MVC's pipeline involved).

### Custom validation attributes

```csharp
public class FutureDateAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is DateTime date && date <= DateTime.UtcNow)
            return new ValidationResult("Date must be in the future");
        return ValidationResult.Success;
    }
}
```

```csharp
public class ScheduleRequest
{
    [FutureDate]
    public DateTime ScheduledFor { get; set; }
}
```

For validation logic you want to reuse across multiple models as a single attribute, extending `ValidationAttribute` keeps it in the same declarative, attribute-based style as the built-in checks.

## Core Workflow

- **Rely on `[ApiController]`'s automatic model validation in MVC**, and don't manually check `ModelState.IsValid` unless you have a specific reason to -- the attribute already handles it.
- **Reach for `IValidatableObject` the moment a single attribute can't express the rule**, rather than trying to force conditional logic into a combination of built-in attributes that don't naturally support it.
- **Use `Validator.TryValidateObject` for anything outside the MVC request pipeline** -- background jobs, console apps, or message processing that still wants to validate DataAnnotations-decorated models.

## Verifying Your Setup

1. **MVC automatically rejects invalid requests** -- confirm `[ApiController]` returns a 400 with validation details on an invalid model, without any manual check in the action
2. **`IValidatableObject` logic runs as part of the same validation pass** -- confirm conditional rules implemented there fire correctly alongside attribute-based checks
3. **Custom validation attributes behave as expected** -- confirm a custom `ValidationAttribute` correctly flags invalid values and passes valid ones
4. **Manual validation outside MVC works correctly** -- confirm `Validator.TryValidateObject` produces the same validation results a web request would have triggered automatically

## Best Practices

**Let `[ApiController]` handle automatic validation rather than manually checking `ModelState.IsValid`.** This is free, built-in behavior -- reimplementing it manually is unnecessary work.

**Use `IValidatableObject` for conditional and cross-property rules, and recognize when it's getting unwieldy.** If a model's `Validate` method starts accumulating a lot of complex branching logic, that's a legitimate signal to consider FluentValidation instead, which expresses the same logic more readably.

**Write custom `ValidationAttribute` classes for logic you'll reuse across multiple models.** This keeps validation declarative and consistent with the built-in attributes, rather than duplicating the same `IValidatableObject` logic in several unrelated model classes.

**Keep validation attributes focused on data shape, not deep business rules.** Attributes are well suited to "this field is required" or "this value must be in range" -- rules requiring a database lookup or complex domain logic belong in a service layer, not crammed into a `ValidationAttribute`.

**For Minimal APIs on .NET 10+, rely on native validation support rather than manually calling `Validator.TryValidateObject` in every handler.** The built-in pipeline integration handles this automatically, the same convenience `[ApiController]` provides in MVC.

## Comparison with MiniValidation

| | DataAnnotations (classic) | MiniValidation |
| --- | --- | --- |
| Where it's automatic | MVC, via `[ApiController]` | Requires an explicit `TryValidate` call, or the Minimal API extensions package |
| Performance | Fast | Fastest of the library-based options |
| Conditional rules | Via `IValidatableObject` | Same ceiling -- built on the same DataAnnotations foundation |
| Dependency | None -- part of the BCL | A small NuGet package |
| Best fit | MVC applications, or anywhere the automatic pipeline applies | Minimal APIs and console apps wanting a fast, explicit validation call |

MiniValidation is best understood as DataAnnotations with a purpose-built runtime for scenarios (Minimal APIs, console apps) that don't get MVC's automatic validation pipeline for free -- both share the same underlying attribute vocabulary and expressiveness ceiling.

## Frequently Asked Questions

### Do I need to manually check ModelState.IsValid in my controllers?

No, not if your controller has `[ApiController]` applied -- it automatically validates the model and returns a 400 response with validation details if it's invalid, before your action method body ever runs. Manually checking `ModelState.IsValid` is redundant in that case.

### When should I use IValidatableObject instead of a validation attribute?

When the validation logic depends on more than one property, or requires conditional logic that a single declarative attribute can't express cleanly -- "this field is required only when that other field is true" is the classic example. For validation scoped to a single property with no conditions, a `ValidationAttribute` (built-in or custom) is simpler.

### Can DataAnnotations validate nested objects and collections?

Yes, though it requires `validateAllProperties: true` when calling `Validator.TryValidateObject` manually, or relies on MVC's model binder handling nested validation automatically in the MVC pipeline. Deeply nested graphs are one area where MiniValidation's purpose-built recursive validator or FluentValidation's `RuleForEach` tend to feel more natural than DataAnnotations' more manual approach.

### How do I write a reusable custom validation rule with DataAnnotations?

Extend `ValidationAttribute` and override `IsValid`, then apply your custom attribute to any property needing that rule. This keeps custom validation logic declarative and consistent with the built-in attribute vocabulary, rather than duplicating logic across multiple `IValidatableObject` implementations.

### Is DataAnnotations validation automatic in Minimal APIs?

Not before .NET 10 -- Minimal APIs historically had no first-party validation pipeline at all, requiring either manual `Validator.TryValidateObject` calls, a package like MiniValidation, or FluentValidation via an endpoint filter. As of .NET 10, native Minimal API validation applies DataAnnotations attributes automatically, closing this gap.

### Is DataAnnotations validation fast?

Yes, generally -- it benchmarks well relative to FluentValidation in most comparisons, though naive hand-rolled implementations using reflection without caching can be slower than purpose-optimized libraries like MiniValidation that add metadata caching on top of the same underlying attributes.

### What's the most common mistake in a first DataAnnotations setup?

Manually checking `ModelState.IsValid` in every MVC action when `[ApiController]` already handles it automatically, adding redundant code. The second common mistake is trying to force genuinely complex conditional validation into a combination of built-in attributes rather than reaching for `IValidatableObject` (or, once the logic gets unwieldy enough, FluentValidation) at the right point.
