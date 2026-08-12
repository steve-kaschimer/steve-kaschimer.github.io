# Getting Started with Manual Mapping in .NET

There's no package to install for this one, which is exactly the point -- manual mapping is just writing the conversion between two types as ordinary C#, the same way you'd write any other method. It's easy to dismiss as "what you do before you get a real mapping library," but that framing undersells it: for a genuinely large share of applications, manual mapping is the fastest, most transparent, and most maintainable option in this entire comparison series, not a placeholder for something better.

This guide covers the patterns that make manual mapping scale cleanly as a codebase grows -- where mapping logic should live, how to keep it from becoming its own kind of boilerplate mess, and the specific techniques (constructors, static factory methods, extension methods) that keep it readable. By the end you'll have a mapping approach with zero dependencies, full transparency, and nothing hidden behind a library's internals.

If you're deciding between mapping approaches first, a comparison of the top .NET mapping libraries covers where manual mapping fits relative to AutoMapper, Mapster, Mapperly, and Facet.

## What You'll Need

- Nothing beyond the .NET SDK and C# itself -- this is the entire installation section

## Structuring Manual Mapping

### Static extension methods, the most common pattern

```csharp
public static class OrderMappingExtensions
{
    public static OrderDto ToDto(this Order order) => new()
    {
        Id = order.Id,
        Status = order.Status,
        CustomerName = order.Customer.Name,
        Total = order.Items.Sum(i => i.Price * i.Quantity)
    };

    public static Order ToEntity(this CreateOrderRequest request) => new()
    {
        CustomerId = request.CustomerId,
        Status = OrderStatus.Pending
    };
}
```

```csharp
var dto = order.ToDto();
```

This reads almost identically to calling `Adapt<T>()` or `Map<T>()` from a library, but every line is explicit, ordinary C# -- no convention to trust, no attribute to decode, nothing happening that isn't visible directly in this method.

### Static factory methods on the DTO itself

```csharp
public class OrderDto
{
    public int Id { get; init; }
    public OrderStatus Status { get; init; }
    public string CustomerName { get; init; } = "";
    public decimal Total { get; init; }

    public static OrderDto FromEntity(Order order) => new()
    {
        Id = order.Id,
        Status = order.Status,
        CustomerName = order.Customer.Name,
        Total = order.Items.Sum(i => i.Price * i.Quantity)
    };
}
```

```csharp
var dto = OrderDto.FromEntity(order);
```

This pattern keeps the mapping logic co-located with the type it constructs, which some teams prefer over extension methods living in a separate file -- a matter of team convention rather than a technical difference that matters much either way.

### Constructor-based mapping

```csharp
public class OrderDto
{
    public int Id { get; }
    public OrderStatus Status { get; }
    public string CustomerName { get; }

    public OrderDto(Order order)
    {
        Id = order.Id;
        Status = order.Status;
        CustomerName = order.Customer.Name;
    }
}
```

Constructor-based mapping is the most direct option but couples the DTO's construction tightly to the source type -- reasonable for a DTO that only ever gets built from one source, less flexible if the same DTO needs to be constructed from multiple different sources over time.

### Handling collections

```csharp
public static class OrderMappingExtensions
{
    public static OrderDto ToDto(this Order order) => new() { /* ... */ };

    public static IEnumerable<OrderDto> ToDtos(this IEnumerable<Order> orders) =>
        orders.Select(o => o.ToDto());
}
```

A small, explicit collection-mapping overload avoids repeating `.Select(o => o.ToDto())` at every call site -- worth adding once a single-item mapping method is established, rather than leaving every caller to write the projection themselves.

## Core Workflow

- **Keep mapping logic in one clear, discoverable location per type pair** -- an extension method, a static factory, or a constructor, chosen consistently across your codebase rather than mixed arbitrarily.
- **Let the compiler do the maintenance work.** When a source or destination type's shape changes, the compiler immediately flags every manual mapping method that needs updating -- this is manual mapping's built-in safety net, doing the same job a source-generator's compile-time checking does, just via ordinary type-checking rather than generated code.
- **Extract genuinely shared conversion logic (formatting, calculations) into small, named helper methods**, the same discipline that applies to any repeated logic in a codebase, mapping or otherwise.

## Verifying Your Setup

1. **Mapping methods produce correct results** -- straightforward unit tests against representative source objects confirm the mapping logic, the same as testing any other method
2. **Mapping methods are used consistently** -- confirm the codebase doesn't have some type pairs mapped via extension methods and others via ad hoc inline object initializers scattered around, which would undermine the discoverability manual mapping is otherwise good at
3. **Collection mapping helpers exist where needed** -- confirm repeated `.Select(x => x.ToDto())` patterns have been consolidated into a named helper where that repetition shows up often
4. **The compiler is actually catching breaking changes** -- as a sanity check, rename a source property and confirm the corresponding mapping method fails to compile rather than silently mapping incorrectly

## Best Practices

**Pick one pattern (extension methods, static factories, or constructors) and use it consistently across the codebase.** Manual mapping's biggest risk isn't performance or correctness -- it's inconsistency, where different developers solve the same problem differently across the same project.

**Keep mapping methods small and focused on one type pair.** A mapping method trying to handle multiple source types or conditional logic based on unrelated concerns is a sign it should be split, the same code-quality principle that applies to any method growing too many responsibilities.

**Don't manually reimplement patterns a library would give you for free if you're hitting them constantly.** If you find yourself writing the same flattening or nested-mapping pattern repeatedly across many types, that's a legitimate signal to reconsider whether a library (Mapperly, in particular, given its comparable performance) would reduce real, recurring boilerplate.

**Write unit tests for non-trivial mapping logic**, the same as any other business logic. A mapping method that only copies matching properties barely needs a test; one performing calculations, conditional logic, or flattening deserves the same test coverage as any other method with real behavior.

**Use collection-mapping helper overloads once a pattern repeats.** Don't leave every call site to independently write `.Select(x => x.ToDto())` once that pattern shows up more than a couple of times.

## Comparison with Mapperly

| | Manual Mapping | Mapperly |
| --- | --- | --- |
| Performance | Fastest -- the baseline everything else is measured against | Fastest of the libraries, on par with manual |
| Dependencies | None | One NuGet package |
| Debuggability | Perfect -- it's just your code | Excellent -- generated code is readable and steppable |
| Boilerplate for large type graphs | Real, grows with complexity | Handled automatically by convention |
| Error detection | Compiler catches structural changes | Compiler catches structural changes and mapping typos |

For a small to moderate mapping surface, the two are close enough in practice that the choice comes down to whether you want zero dependencies (manual) or automatic handling of larger, more repetitive mapping surfaces (Mapperly) -- neither is a clearly superior default.

## Frequently Asked Questions

### Is manual mapping actually competitive with library-based approaches, or just a fallback?

It's genuinely competitive, not a fallback -- it's the fastest option in every benchmark (since it has zero abstraction overhead) and offers full transparency with zero dependency risk. For small to moderate mapping surfaces, it's a completely legitimate permanent choice, not something you do only until you "graduate" to a library.

### When does manual mapping stop being the right choice?

When the volume and repetitiveness of mapping code becomes genuinely tedious -- many types, deeply nested object graphs, or frequent flattening patterns that a library would handle automatically. At that point, a source-generator-based library like Mapperly offers comparable performance with much less boilerplate for that specific kind of repetitive work.

### Should I use extension methods, static factory methods, or constructors for manual mapping?

Any of the three works well -- the important thing is picking one convention and using it consistently across your codebase. Extension methods keep mapping logic separate from the DTO definition; static factories co-locate it with the type; constructors couple it most tightly. Team preference matters more here than any technical advantage of one over the others.

### How do I keep manual mapping maintainable as my codebase grows?

Consistency and discoverability -- one clear pattern used everywhere, mapping logic kept in predictable, well-named locations (a `*MappingExtensions` class per feature, for instance), and unit tests for any mapping logic beyond trivial property copying. The same organizational discipline that keeps any part of a growing codebase maintainable applies directly here.

### Does manual mapping handle EF Core query projection the way AutoMapper's ProjectTo does?

Not automatically -- you'd need to write your own `Select()` projection expressions by hand for EF Core queries, which is more manual work than `ProjectTo`'s automatic translation from mapping configuration. This is a genuine area where a library like AutoMapper offers real convenience manual mapping doesn't replicate without extra effort.

### Is it reasonable to mix manual mapping with a library in the same codebase?

Yes, and it's common -- using manual mapping for a handful of simple, stable type pairs while reaching for a library where the mapping surface is larger or more repetitive. There's no rule requiring one uniform approach across an entire codebase, as long as the choice per area is deliberate and consistent within that area.

### What's the most common mistake with manual mapping?

Inconsistency -- different developers solving the same "convert type A to type B" problem with different patterns (extension methods here, inline object initializers there, constructors somewhere else) across the same codebase, making mapping logic harder to find and trust than it needs to be. The fix is agreeing on one convention early and following it consistently, not switching to a library purely to solve a discipline problem a library won't actually fix on its own.
