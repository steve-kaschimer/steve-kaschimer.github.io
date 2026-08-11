# Getting Started with Custom Validation in .NET

Every validation library in this series eventually admits the same thing in its own documentation: some rules just don't fit the model. A rule that needs to check three related entities in a database, or one so specific to a single business process that expressing it declaratively would be more convoluted than just writing the logic -- that's exactly where custom, hand-written validation stops being "what you do before adopting a real library" and becomes the actually correct tool.

This guide covers structuring custom validation in .NET without a library, the patterns that keep hand-written validation consistent as a codebase grows, the core techniques for guard clauses and result-based validation, and the best practices that prevent custom validation from becoming an inconsistent mess across a team. By the end you'll have a validation approach with zero dependencies and no ceiling on what it can express.

If you're deciding between validation approaches first, a comparison of the top .NET validation approaches covers where custom validation fits relative to FluentValidation, DataAnnotations, MiniValidation, and .NET 10's native Minimal API validation.

## What You'll Need

- Nothing beyond the .NET SDK and C# itself

## Structuring Custom Validation

### Guard clauses for simple, fail-fast checks

```csharp
public class OrderService
{
    public async Task ProcessAsync(int orderId)
    {
        if (orderId <= 0)
            throw new ArgumentOutOfRangeException(nameof(orderId), "Order ID must be positive");

        var order = await repository.GetByIdAsync(orderId)
            ?? throw new OrderNotFoundException(orderId);

        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException($"Order {orderId} is not in a processable state");

        order.Status = OrderStatus.Processing;
        await repository.SaveAsync(order);
    }
}
```

Guard clauses are the simplest form of custom validation -- immediate, fail-fast checks at the top of a method, throwing on the first violated invariant. Appropriate for internal, programmer-facing invariants (a method contract being violated) more than user-facing input validation, where a single exception on the first failure is less useful than collecting every error to show the user at once.

### Result-based validation for user-facing scenarios

```csharp
public record ValidationResult(bool IsValid, IReadOnlyList<string> Errors)
{
    public static ValidationResult Success() => new(true, []);
    public static ValidationResult Failure(params string[] errors) => new(false, errors);
}

public class CreateOrderValidator
{
    public ValidationResult Validate(CreateOrderRequest request)
    {
        var errors = new List<string>();

        if (request.CustomerId <= 0)
            errors.Add("A valid customer is required");

        if (request.Items.Count == 0)
            errors.Add("An order must contain at least one item");

        if (request.HasDiscount && string.IsNullOrEmpty(request.DiscountCode))
            errors.Add("A discount code is required when a discount is applied");

        return errors.Count == 0 ? ValidationResult.Success() : ValidationResult.Failure(errors.ToArray());
    }
}
```

This mirrors what a validation library gives you -- a collected list of every violation, not just the first one -- but as plain, transparent C# with no framework dependency. Note this handles the exact conditional rule (`HasDiscount` requiring `DiscountCode`) that would otherwise need `IValidatableObject` or FluentValidation's `.When()`.

### Validation requiring external checks (database, service calls)

```csharp
public class OrderValidator(IOrderRepository repository, ICustomerService customerService)
{
    public async Task<ValidationResult> ValidateAsync(CreateOrderRequest request)
    {
        var errors = new List<string>();

        if (!await customerService.ExistsAsync(request.CustomerId))
            errors.Add($"Customer {request.CustomerId} does not exist");

        if (request.DiscountCode is not null &&
            !await repository.IsValidDiscountCodeAsync(request.DiscountCode))
            errors.Add("The discount code is invalid or has expired");

        return errors.Count == 0 ? ValidationResult.Success() : ValidationResult.Failure(errors.ToArray());
    }
}
```

This is exactly the scenario custom validation handles most naturally that no attribute-based library manages cleanly -- rules requiring a database lookup or a call to another service, injected via ordinary dependency injection into a validator class.

### Wiring custom validation into a Minimal API endpoint

```csharp
app.MapPost("/orders", async (CreateOrderRequest request, OrderValidator validator) =>
{
    var result = await validator.ValidateAsync(request);
    if (!result.IsValid)
        return Results.BadRequest(new { errors = result.Errors });

    // proceed with valid request
    return Results.Created();
});
```

## Core Workflow

- **Use guard clauses for internal invariants and fail-fast method contracts**, where throwing immediately on the first violation is the right behavior.
- **Use a result-collecting pattern (`ValidationResult` with a list of errors) for user-facing input validation**, where showing every problem at once is more useful than failing on the first one.
- **Inject dependencies into validator classes the same way you would any other service**, taking full advantage of custom validation's unlimited expressiveness for rules requiring external checks.

## Verifying Your Setup

1. **Guard clauses fail fast and clearly** -- confirm violated invariants throw immediately with a clear, actionable error message
2. **Result-based validators collect all errors, not just the first** -- confirm a request violating multiple rules returns every violation, not just the first one encountered
3. **Validators with external dependencies work correctly** -- confirm database or service-backed validation checks behave correctly against both valid and invalid inputs
4. **Validation is applied consistently across the codebase** -- audit whether different areas of the application solve "how do I validate this" the same way, or have drifted into inconsistent patterns

## Best Practices

**Pick one pattern (a shared `ValidationResult` type, a consistent validator class shape) and use it consistently.** Custom validation's biggest risk isn't capability -- it's inconsistency, where different developers invent different validation shapes across the same codebase.

**Reserve guard clauses for internal invariants, not user-facing input validation.** A guard clause throwing on the first violation is right for "this method was called incorrectly" -- it's the wrong shape for "tell the user everything wrong with their form submission."

**Inject external dependencies into validator classes rather than static service locator patterns.** This keeps custom validators testable the same way any other service is testable, with mockable dependencies rather than hidden static calls.

**Write unit tests for custom validation logic, the same as any other business logic.** Validation rules are exactly the kind of code that benefits from explicit test coverage, since a validation bug either lets bad data through or incorrectly rejects good data -- both have real consequences.

**Recognize when custom validation is accumulating enough complexity that a library would express it more clearly.** If a hand-written validator is growing many conditional branches that start looking like what FluentValidation's fluent syntax handles more readably, that's a legitimate signal to reconsider, not a reason to keep pushing custom code further.

## Comparison with FluentValidation

| | Custom Validation | FluentValidation |
| --- | --- | --- |
| Expressiveness | Unlimited -- it's just code | Excellent for conditional/cross-property rules, within its model |
| Dependency | None | A NuGet package |
| External checks (DB, services) | Natural via constructor injection | Supported, but less commonly the first reason to reach for it |
| Consistency | Requires team discipline to maintain | Enforced by the library's structure |
| Best fit | Simple validation, or genuinely unique business rules | Complex conditional validation with a consistent library-enforced shape |

Custom validation's strength -- unlimited expressiveness -- is also its risk: without a library imposing structure, consistency across a team depends entirely on discipline rather than being enforced by the tool itself.

## Frequently Asked Questions

### When should I write custom validation instead of using a library?

Two scenarios: when validation is simple enough that a library's ceremony isn't worth it (a couple of straightforward checks), or when it's complex enough that no library's abstraction fits naturally -- particularly validation requiring cross-entity checks, external service calls, or deep domain logic that doesn't map cleanly onto attributes or fluent rule builders.

### What's the difference between a guard clause and a validation result pattern?

A guard clause throws immediately on the first violated invariant, appropriate for internal method contracts where failing fast is the right behavior. A validation result pattern collects every violation into a list before returning, appropriate for user-facing input validation where showing all problems at once is more useful than stopping at the first one.

### How do I keep custom validation consistent across a team without a library enforcing structure?

Agree on and document one pattern -- a shared `ValidationResult` type, a consistent validator class shape, clear conventions for where validation logic lives -- and apply it consistently. This is genuinely more work than a library, which enforces structure by design, but it's manageable with clear team conventions and code review discipline.

### Can custom validation handle rules that require a database lookup?

Yes, and this is one of its most natural strengths -- inject a repository or service into your validator class via ordinary dependency injection, and call it directly as part of your validation logic. This is exactly the kind of rule that attribute-based libraries handle awkwardly, if at all.

### Should I write unit tests for custom validation logic?

Yes, the same as any other business logic with real behavior. A bug in validation logic either lets invalid data through (a correctness problem) or incorrectly rejects valid data (a usability problem) -- both are worth catching with tests, especially for validation with any conditional branching.

### Is custom validation actually more work than using a library?

For simple validation, often less work -- there's no library ceremony (validator base classes, registration, configuration) to set up. For complex validation with many conditional rules, it can become more work to maintain consistency without a library's enforced structure, which is exactly the trade-off point where FluentValidation starts looking more attractive.

### What's the most common mistake with custom validation?

Inconsistency -- different parts of a codebase solving "how do I validate this" differently, making validation logic harder to find, trust, and maintain than it needs to be. The fix is agreeing on a shared pattern early, the same discipline that applies to manual object mapping, and applying it consistently rather than reinventing the approach in every new area of the codebase.
