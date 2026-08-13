---
author: Steve Kaschimer
date: 2027-05-18
image: /images/posts/2027-05-18-hero.webp
image_alt: "A fluent sentence-shaped bracket glyph with a small branching condition arrow feeding into a separate validator-class panel, set apart from a plain model rectangle beside it."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a thin bracket-shaped glyph on the left resembling a flowing sentence, with a small amber branching arrow breaking off it to represent a conditional rule. It connects by a short line to a separate rectangular panel on the right, deliberately apart from a plain, unmarked model rectangle beneath it, emphasizing that validation logic lives outside the model. A small stopwatch glyph with a slower-than-average marker sits faintly in the corner. Mood is expressive, deliberate, and slightly weighty. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art."
layout: post.njk
site_title: Tech Notes
summary: "FluentValidation's rules read like sentences and handle conditional logic naturally - but it's consistently one of the slower validation options in independent benchmarks. A setup guide for validator classes, MVC and Minimal API integration, and knowing exactly where its ceremony earns its keep."
tags: ["dotnet", "validation", "developer-productivity", "tooling"]
title: "Getting Started with FluentValidation in .NET"
---

FluentValidation's core appeal is genuinely simple to state: validation rules read like sentences, live in their own class away from your model, and handle conditional logic naturally. What's less obvious until you've profiled it is that this expressiveness has a real performance cost - FluentValidation is consistently one of the slower validation options in independent benchmarks, sometimes by a wide margin. Neither fact should be a surprise by the time you're setting it up; they should shape where in your application you actually reach for it.

This guide covers installing FluentValidation, bootstrapping validators and ASP.NET Core integration correctly, the core patterns for conditional and cross-property rules, and the best practices that make the most of its expressiveness without paying its performance cost where you don't need to. By the end you'll have validation logic that's genuinely easier to read for complex rules, deployed specifically where that complexity exists.

If you're deciding between validation approaches first, [a comparison of the top .NET validation approaches](/posts/2027-05-11-top-5-dotnet-validation-approaches-compared/) covers where FluentValidation fits relative to DataAnnotations, MiniValidation, custom validation, and .NET 10's native Minimal API validation.

## What You'll Need

- .NET 8 SDK or later
- An ASP.NET Core project - MVC or Minimal APIs both work, with slightly different integration steps

## Installing FluentValidation

```bash
dotnet add package FluentValidation
dotnet add package FluentValidation.AspNetCore
```

`FluentValidation.AspNetCore` provides the MVC-specific integration; for Minimal APIs, you'll wire validation in through an endpoint filter instead, using just the core `FluentValidation` package.

## Bootstrapping the Ideal Environment

### Defining a validator

```csharp
public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.CustomerId)
            .GreaterThan(0).WithMessage("A valid customer is required");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("An order must contain at least one item");

        RuleFor(x => x.DiscountCode)
            .NotEmpty()
            .When(x => x.HasDiscount)
            .WithMessage("A discount code is required when a discount is applied");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}
```

Notice the conditional rule (`.When(x => x.HasDiscount)`) and the nested collection rule (`RuleForEach`) - this is exactly the kind of validation logic that's genuinely awkward to express with attribute-based approaches, and where FluentValidation earns its ceremony.

### Registering validators with dependency injection

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderRequestValidator>();
```

`AddValidatorsFromAssemblyContaining<T>()` scans the given assembly and registers every `AbstractValidator<T>` it finds - no need to register each validator individually as your validation surface grows.

### MVC integration

```csharp
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
```

With auto-validation registered, `[ApiController]`'s automatic model validation now runs your FluentValidation validators instead of relying purely on DataAnnotations, with no change to the controller action itself.

### Minimal API integration via an endpoint filter

```csharp
public static class ValidationFilterExtensions
{
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) =>
        builder.AddEndpointFilter(async (context, next) =>
        {
            var arg = context.Arguments.OfType<T>().FirstOrDefault();
            var validator = context.HttpContext.RequestServices.GetService<IValidator<T>>();
            if (validator is not null && arg is not null)
            {
                var result = await validator.ValidateAsync(arg);
                if (!result.IsValid)
                    return Results.ValidationProblem(result.ToDictionary());
            }
            return await next(context);
        });
}
```

```csharp
app.MapPost("/orders", CreateOrder).WithValidation<CreateOrderRequest>();
```

Since FluentValidation has no first-party Minimal API integration package the way it does for MVC, this filter pattern is the standard way to wire validation into an endpoint automatically rather than calling `ValidateAsync` manually inside every handler.

### Manual validation, outside the request pipeline

```csharp
var validator = new CreateOrderRequestValidator();
var result = validator.Validate(request);

if (!result.IsValid)
{
    foreach (var failure in result.Errors)
        Console.WriteLine($"{failure.PropertyName}: {failure.ErrorMessage}");
}
```

Useful for validating outside a web request entirely - a background job, a console app, or a service processing a message from a queue.

## Core Workflow

- **Reach for FluentValidation specifically where conditional or cross-property rules make attribute-based validation awkward.** Don't reflexively write a full validator class for a model with three simple required-field checks - that's real ceremony for minimal benefit.
- **Use `.When()` for conditional rules and `RuleForEach` for collection validation**, FluentValidation's core mechanisms for the scenarios it's genuinely strongest at.
- **Keep validators focused on one request/model type each.** A validator trying to cover multiple unrelated types is a sign it should be split.

## Verifying Your Setup

1. **Validators are discovered and registered correctly** - confirm `AddValidatorsFromAssemblyContaining<T>()` picked up every validator class in your assembly
2. **MVC auto-validation triggers correctly** - confirm an invalid model returns a 400 with FluentValidation's error details, not a generic DataAnnotations-only response
3. **Minimal API validation filter runs before the handler** - confirm an invalid request is rejected by the filter, never reaching your endpoint logic
4. **Conditional rules behave as expected** - confirm a `.When()` condition correctly includes or excludes the rule based on the model's actual state

## Best Practices

**Reserve FluentValidation for genuinely complex validation, not every model in your application.** Given its measured performance cost relative to attribute-based alternatives, using it uniformly everywhere - including trivial cases - pays that cost without a corresponding benefit.

**Use `.When()` and cross-property rules deliberately where they express real business logic**, not just because the syntax is available. This is exactly the scenario FluentValidation is worth its ceremony for.

**Register validators via assembly scanning, not one-by-one.** `AddValidatorsFromAssemblyContaining<T>()` keeps registration maintenance-free as your validation surface grows.

**For Minimal APIs, use a shared endpoint filter rather than calling `ValidateAsync` manually in every handler.** This keeps validation consistent and centralizes the error-response shape across your API.

**Consider .NET 10's native Minimal API validation, or a lighter option like MiniValidation, for the simpler validation scenarios in the same application.** Nothing requires every model in a codebase to use FluentValidation just because some of them genuinely need it.

## Comparison with DataAnnotations

| | FluentValidation | DataAnnotations |
| --- | --- | --- |
| Style | Separate validator classes, fluent rules | Attributes directly on the model |
| Conditional/cross-property rules | Excellent, built for this | Limited without `IValidatableObject` |
| Performance | Often the slowest option in benchmarks | Fast |
| Minimal API integration | Manual, via endpoint filter | Native as of .NET 10 |
| Best fit | Complex, conditional validation logic | Simple validation, especially in MVC |

FluentValidation's expressiveness advantage is real and specific - it's worth reaching for exactly where DataAnnotations' attribute model starts to feel constraining, not as a blanket replacement for simpler validation needs.

## Frequently Asked Questions

### Is FluentValidation slower than DataAnnotations-based validation?

Yes, in independently reported benchmarks - often meaningfully slower, sometimes by roughly double for equivalent validation scenarios. For most applications this difference is negligible in absolute terms, but it's worth knowing before assuming FluentValidation is the performance-optimal choice, especially in high-throughput validation paths.

### How do I integrate FluentValidation with Minimal APIs?

There's no first-party integration package the way MVC has `FluentValidation.AspNetCore` - the standard approach is a custom endpoint filter that resolves the appropriate `IValidator<T>` from DI and runs it before the handler executes, returning a validation problem response if it fails.

### Should I use FluentValidation for every model in my application?

Not necessarily - its ceremony is worth it specifically for complex, conditional, or cross-property validation. For simple models with a few basic checks, DataAnnotations or .NET 10's native Minimal API validation is often less overhead for the same result.

### How do I express a rule that only applies conditionally?

Use `.When(predicate)` after a rule definition: `RuleFor(x => x.DiscountCode).NotEmpty().When(x => x.HasDiscount)`. This is one of FluentValidation's clearest advantages over attribute-based validation, which has no clean equivalent for expressing conditional rules directly.

### Can I validate nested objects or collections with FluentValidation?

Yes - `RuleForEach` validates each item in a collection, and you can chain `.ChildRules(...)` or reference a separate validator for nested object types via `SetValidator()`. This handles the same nested-graph validation scenarios that plain DataAnnotations handles more awkwardly.

### Can I use FluentValidation outside of ASP.NET Core, like in a background job or console app?

Yes - create a validator instance directly and call `.Validate()` or `.ValidateAsync()` on it manually. FluentValidation doesn't require a web request context at all; it's a general-purpose validation library that happens to have strong ASP.NET Core integration options.

### What's the most common mistake in a first FluentValidation setup?

Using it uniformly for every model regardless of complexity, paying its ceremony and performance cost for validation simple enough that DataAnnotations or native Minimal API validation would have handled just as well with less overhead. The second common mistake, specific to Minimal APIs, is calling `ValidateAsync` manually inside every handler instead of centralizing that logic in a shared endpoint filter.
