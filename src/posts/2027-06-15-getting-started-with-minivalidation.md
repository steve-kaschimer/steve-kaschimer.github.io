---
author: Steve Kaschimer
date: 2027-06-15
image: /images/posts/2027-06-15-hero.webp
image_alt: "A minimal single-function-call glyph with a lightning-bolt speed accent, feeding directly into a compact recursive-loop icon representing automatic nested validation."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single small function-call glyph on the left with a solid amber lightning-bolt accent beside it implying speed, connected by a short teal line to a compact recursive loop icon on the right representing automatic nested and cyclic validation. Beneath, a tiny secondary marker distinguishes it faintly from a larger native-pipeline glyph, implying a lighter-weight cousin. Mood is fast, minimal, and purpose-built. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art."
layout: post.njk
site_title: Tech Notes
summary: "MiniValidation's pitch is one sentence: the same DataAnnotations attributes you already know, running through a validator optimized specifically to be fast, with none of FluentValidation's ceremony. A setup guide for the single-line TryValidate call and knowing when it's actually the right choice over native .NET 10 validation."
tags: ["dotnet", "validation", "performance", "developer-productivity"]
title: "Getting Started with MiniValidation in .NET"
---

MiniValidation's whole pitch fits in one sentence: it's the same DataAnnotations attributes you already know, running through a validator specifically optimized to be fast, with none of FluentValidation's ceremony. Built by Damian Edwards specifically for the gap Minimal APIs used to have - no automatic validation pipeline the way MVC has always had - it's a single-function-call library that stayed relevant even after .NET 10 introduced native Minimal API validation, since it still covers console apps and .NET versions before 10.

This guide covers installing MiniValidation, bootstrapping validation calls for Minimal API endpoints and other application types, the core patterns for nested and recursive validation, and the best practices for using it in exactly the scenarios it's built for. By the end you'll have fast, low-ceremony validation using attributes you already know.

If you're deciding between validation approaches first, [a comparison of the top .NET validation approaches](/posts/2027-05-11-top-5-dotnet-validation-approaches-compared/) covers where MiniValidation fits relative to FluentValidation, DataAnnotations, custom validation, and .NET 10's native Minimal API validation.

## What You'll Need

- .NET 8 SDK or later - MiniValidation works across a broad range of .NET versions, including those without native Minimal API validation
- If targeting Minimal APIs specifically on ASP.NET Core 6+, consider `MinimalApis.Extensions`, which adds ASP.NET Core-specific integration on top of the core MiniValidation library

## Installing MiniValidation

```bash
dotnet add package MiniValidation
```

For Minimal API-specific integration (an endpoint filter, request binding helpers):

```bash
dotnet add package MinimalApis.Extensions
```

## Bootstrapping the Ideal Environment

### Models use the same DataAnnotations attributes you already know

```csharp
using System.ComponentModel.DataAnnotations;

public class CreateOrderRequest
{
    [Required]
    public int CustomerId { get; set; }

    [Required, MinLength(1)]
    public List<OrderItem> Items { get; set; } = [];
}
```

No new attribute vocabulary to learn - MiniValidation runs the exact same `System.ComponentModel.DataAnnotations` attributes DataAnnotations and .NET 10's native Minimal API validation both use.

### A single-line validation call

```csharp
var request = new CreateOrderRequest { CustomerId = 0 };

var isValid = MiniValidator.TryValidate(request, out var errors);

if (!isValid)
{
    foreach (var (member, memberErrors) in errors)
        Console.WriteLine($"{member}: {string.Join(", ", memberErrors)}");
}
```

This is the entirety of MiniValidation's core API - `TryValidate` in, a boolean and a dictionary of errors out. No configuration object, no validator class to instantiate first.

### Wiring into a Minimal API endpoint

```csharp
app.MapPost("/orders", (CreateOrderRequest request) =>
{
    if (!MiniValidator.TryValidate(request, out var errors))
        return Results.ValidationProblem(errors);

    // proceed with valid request
    return Results.Created();
});
```

Or, using an endpoint filter for consistency across multiple endpoints:

```csharp
app.MapPost("/orders", CreateOrder)
    .AddEndpointFilter(async (context, next) =>
    {
        var request = context.Arguments.OfType<CreateOrderRequest>().FirstOrDefault();
        if (request is not null && !MiniValidator.TryValidate(request, out var errors))
            return Results.ValidationProblem(errors);
        return await next(context);
    });
```

The filter pattern keeps validation consistent across many endpoints rather than repeating the `TryValidate` call in every handler - the same discipline that applies to FluentValidation's Minimal API integration.

### Validation with dependency-injected services (for validators needing DI)

```csharp
var isValid = await MiniValidator.TryValidateAsync(request, serviceProvider, out var errors);
```

```csharp
public class Widget : IValidatableObject
{
    [Required, MinLength(3)]
    public string Name { get; set; } = "";

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var disallowedNames = validationContext.GetService(typeof(IDisallowedNamesService)) as IDisallowedNamesService;
        if (disallowedNames?.IsDisallowedName(Name) == true)
            yield return new ValidationResult($"'{Name}' is not an allowed name", [nameof(Name)]);
    }
}
```

Passing a `serviceProvider` lets `IValidatableObject` implementations resolve injected services during validation - useful for rules that need to check against a database or another registered service, the same `IValidatableObject` mechanism DataAnnotations uses more broadly.

## Core Workflow

- **Use `TryValidate` directly for straightforward cases**, and wrap it in an endpoint filter for consistency once you have more than a couple of validated endpoints.
- **Rely on MiniValidation's built-in recursion and cycle detection for nested objects.** Unlike hand-rolled DataAnnotations validation, it handles object graphs, including circular references, correctly out of the box.
- **Reach for `TryValidateAsync` with a `serviceProvider` when `IValidatableObject` logic needs dependency injection.**

## Verifying Your Setup

1. **Validation catches invalid models correctly** - confirm `TryValidate` returns `false` and populates errors for an invalid request
2. **Nested objects and collections validate correctly** - confirm validation recurses into nested types and collection items, not just top-level properties
3. **The endpoint filter (if used) runs consistently across endpoints** - confirm every validated route rejects invalid requests the same way
4. **DI-dependent `IValidatableObject` rules work** - confirm `TryValidateAsync` with a `serviceProvider` correctly resolves and uses injected services during validation

## Best Practices

**Use MiniValidation specifically for Minimal APIs on .NET versions before 10, or for console/non-web applications.** On .NET 10+, native Minimal API validation covers much of the same ground with zero extra dependency - MiniValidation's clearest remaining niche is pre-.NET 10 projects and non-Minimal-API application types.

**Centralize validation calls in an endpoint filter rather than repeating `TryValidate` in every handler**, once you have more than a couple of validated endpoints.

**Reach for `TryValidateAsync` with a service provider whenever `IValidatableObject` logic needs injected dependencies.** This is a genuine capability MiniValidation supports cleanly, worth using rather than working around with static service locator patterns.

**Recognize the same expressiveness ceiling as classic DataAnnotations.** MiniValidation is fast and low-ceremony, but it doesn't add expressiveness beyond what DataAnnotations attributes and `IValidatableObject` already support - for genuinely complex conditional rules, FluentValidation remains the more natural fit.

**Don't add MiniValidation to a .NET 10+ Minimal API project by default without checking if native validation already covers your needs.** Adding a dependency for functionality now available natively is unnecessary overhead.

## Comparison with Native Minimal API Validation (.NET 10+)

| | MiniValidation | Native Minimal API Validation |
| --- | --- | --- |
| Dependency | Small NuGet package | None - built into .NET 10+ |
| .NET version support | Broad - works on versions before .NET 10 | .NET 10+ only |
| Application types | Minimal APIs, console apps, anywhere | Minimal APIs specifically |
| Performance | Fastest of the library-based options | Fast, built on a similar underlying model |
| Underlying attributes | Same DataAnnotations attributes | Same DataAnnotations attributes |

They're close cousins built on the same foundation - native validation is the first-party evolution of what MiniValidation pioneered for Minimal APIs specifically, while MiniValidation remains relevant for broader application types and pre-.NET 10 projects.

## Frequently Asked Questions

### Is MiniValidation still relevant now that .NET 10 has native Minimal API validation?

Yes, for two specific cases: projects still on .NET 8 or earlier that can't use native validation, and application types beyond Minimal APIs, like console apps or background services, where MiniValidation's general-purpose `TryValidate` call still applies but the native Minimal API feature doesn't.

### Does MiniValidation use a different attribute syntax than DataAnnotations?

No - it's built directly on top of `System.ComponentModel.DataAnnotations`, using the exact same `[Required]`, `[StringLength]`, and other attributes. There's no new syntax to learn; MiniValidation is a fast, purpose-built runtime for validating models decorated with attributes you already know.

### How does MiniValidation handle nested objects and collections?

Automatically, with built-in recursive traversal and cycle detection - this is one of its concrete advantages over naive hand-rolled DataAnnotations validation, which requires more manual work to handle nested graphs correctly, including guarding against circular references.

### Can I use MiniValidation with dependency-injected services in my validation logic?

Yes, via `TryValidateAsync(model, serviceProvider, out errors)`, which allows `IValidatableObject` implementations to resolve services from the provided service provider during validation - useful for rules requiring a database check or another registered service.

### Is MiniValidation actually faster than DataAnnotations validation done manually?

Yes, in independent benchmarks - MiniValidation adds metadata caching on top of the same reflection-based approach naive DataAnnotations validation would use, resulting in meaningfully better performance for repeated validation of the same model types.

### Should I use MiniValidation or FluentValidation for a Minimal API project?

Depends on your validation complexity - MiniValidation is faster and lower-ceremony for straightforward, attribute-expressible validation. FluentValidation is the better choice once you need genuinely complex conditional or cross-property rules that DataAnnotations' attribute model, which MiniValidation shares, doesn't express naturally.

### What's the most common mistake when adopting MiniValidation?

Adding it to a .NET 10+ Minimal API project without checking whether native validation already covers the same need, introducing an unnecessary dependency. The second common mistake is expecting MiniValidation to handle complex conditional validation as naturally as FluentValidation, when it shares the same expressiveness ceiling as classic DataAnnotations.
