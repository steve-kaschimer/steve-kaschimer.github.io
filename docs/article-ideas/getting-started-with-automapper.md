# Getting Started with AutoMapper in .NET

AutoMapper's convention-based mapping -- properties matched by name automatically, everything else configured via a `Profile` -- is still exactly as convenient as it was before April 2025. What's changed is that adding AutoMapper to a new project is no longer a purely technical decision; it's also a licensing one, since current versions require a paid license beyond the free community tier for larger organizations. That's the piece worth resolving before writing any mapping code, not after.

This guide covers installing AutoMapper (including the licensing question you need to settle first), bootstrapping profiles and configuration correctly, the core patterns for custom mapping and EF Core's `ProjectTo`, and the best practices that keep AutoMapper's convention-based magic from becoming a debugging headache. By the end you'll have a working mapping setup and a clear-eyed view of where AutoMapper stands today.

If you're deciding between mapping approaches first, a comparison of the top .NET mapping libraries covers where AutoMapper fits relative to Mapster, Mapperly, manual mapping, and Facet -- including the full context on its 2025 licensing change.

## What You'll Need

- .NET 8 SDK or later
- A resolved answer on licensing -- confirm whether your organization's usage falls within AutoMapper's free community tier or requires a paid license, before building meaningful architecture around it

## Installing AutoMapper

```bash
dotnet add package AutoMapper
```

Check AutoMapper's current licensing terms directly before adding this to a project of real consequence -- the specifics (free tier thresholds, pricing) are the kind of detail that's worth confirming against the source rather than an article, since licensing terms can be refined over time.

## Bootstrapping the Ideal Environment

### Defining a mapping profile

```csharp
public class OrderProfile : Profile
{
    public OrderProfile()
    {
        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.Name));

        CreateMap<CreateOrderRequest, Order>();
    }
}
```

`CreateMap<Source, Destination>()` establishes convention-based mapping (matching property names automatically); `.ForMember(...)` configures anything that doesn't follow convention -- a renamed property, a computed value, or a flattened nested object.

### Registering AutoMapper in Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAutoMapper(typeof(OrderProfile).Assembly);

var app = builder.Build();
```

`AddAutoMapper` scans the given assembly for all `Profile` classes and registers them automatically -- no need to register each profile individually.

### Using the mapper

```csharp
public class OrderController(IMapper mapper, IOrderRepository repository) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await repository.GetByIdAsync(id);
        var dto = mapper.Map<OrderDto>(order);
        return Ok(dto);
    }
}
```

`IMapper` is injected the same as any other service; `.Map<TDestination>(source)` performs the actual mapping using whichever profile applies to that type pair.

### ProjectTo for EF Core query projection

```csharp
var orderDtos = await db.Orders
    .Where(o => o.Status == OrderStatus.Processing)
    .ProjectTo<OrderDto>(mapper.ConfigurationProvider)
    .ToListAsync();
```

`ProjectTo` translates your mapping configuration directly into the SQL query's `SELECT` clause, only fetching columns the destination type actually needs -- this remains one of AutoMapper's most distinctive and mature capabilities, genuinely harder to replicate with equivalent maturity in the alternatives.

## Core Workflow

- **Let convention handle matching property names, and use `.ForMember()` only for exceptions.** Over-configuring every property defeats the purpose of a convention-based mapper.
- **Use `ProjectTo` for EF Core queries, `Map` for in-memory objects already loaded.** `ProjectTo` pushes the projection into the database query itself; `Map` operates on objects already in memory -- using the wrong one for a given scenario either fetches more data than needed or fails to leverage database-level projection.
- **Validate your configuration at startup**, not just implicitly trust it -- `mapper.ConfigurationProvider.AssertConfigurationIsValid()` catches missing or misconfigured mappings before they become a runtime surprise in production.

## Verifying Your Setup

1. **Profiles are discovered and registered correctly** -- confirm `AddAutoMapper` picked up all your `Profile` classes, not just some
2. **Configuration validation passes** -- run `AssertConfigurationIsValid()` (typically in a test) and confirm it doesn't flag unmapped or misconfigured properties
3. **`ProjectTo` generates efficient SQL** -- confirm the generated query only selects the columns your destination DTO actually needs, not every column on the source entity
4. **Licensing is actually resolved** -- confirm your organization's usage is either within the free tier or covered by an active license before shipping to production

## Best Practices

**Resolve the licensing question explicitly before building significant architecture around AutoMapper.** This is now a real business decision, not just a technical one -- don't let it be an afterthought discovered during a compliance review.

**Validate configuration at startup or in a test, using `AssertConfigurationIsValid()`.** This catches a whole category of runtime mapping errors (missing mappings, unmapped properties) before they ever reach production.

**Use `ProjectTo` for database queries specifically.** It's AutoMapper's strongest remaining differentiator versus faster alternatives -- underusing it in favor of `Map` on fully-loaded entities gives up real database efficiency for no benefit.

**Keep profiles organized by feature or bounded context, not one giant profile for the whole application.** This mirrors the same organizational discipline that applies to any configuration that grows with your codebase.

**Reserve AutoMapper for scenarios where its specific strengths (convention-based mapping, mature `ProjectTo`) genuinely matter**, rather than defaulting to it purely out of habit for a new project where a faster, free alternative might now be the better fit.

## Comparison with Mapperly

| | AutoMapper | Mapperly |
| --- | --- | --- |
| Mechanism | Runtime reflection/expression trees | Compile-time source generator |
| Performance | Slowest of the dedicated mappers | Fastest, on par with manual mapping |
| License | Commercial (2025+), free community tier | Free, MIT |
| EF Core ProjectTo equivalent | Mature, widely used | Available, less battle-tested |
| Error detection | Runtime | Compile-time |

AutoMapper's `ProjectTo` maturity remains a real reason to keep it specifically for EF Core-heavy data access patterns, even in an otherwise Mapperly-based codebase -- the two aren't mutually exclusive.

## Frequently Asked Questions

### Do I need to pay for AutoMapper to use it?

Not necessarily -- there's a free community tier that covers many users. Larger organizations need a paid license for current versions. Confirm which category your organization falls into by checking AutoMapper's current licensing terms directly before committing to it for a project of real consequence.

### What's the difference between Map and ProjectTo?

`Map` operates on an object already loaded into memory, converting it to the destination type. `ProjectTo` operates on an `IQueryable` (typically an EF Core query) and translates the mapping directly into the SQL query's projection, fetching only the columns the destination type needs rather than the full entity. Using `Map` after loading a full entity when `ProjectTo` could have limited the query is a common efficiency mistake.

### How do I catch mapping configuration errors before they reach production?

Call `mapper.ConfigurationProvider.AssertConfigurationIsValid()`, ideally in a test that runs as part of your CI pipeline. This validates that every configured mapping is actually resolvable, catching typos or missing member mappings at build/test time rather than as a runtime surprise.

### Should I migrate away from AutoMapper because of the licensing change?

Not automatically -- if you're within the free community tier, or the paid license is a reasonable cost against your existing investment (especially if you rely heavily on `ProjectTo`), staying is often the right call. Migration makes more sense for new projects starting fresh, or for organizations where the licensing cost is genuinely prohibitive.

### Can I use AutoMapper alongside a newer library like Mapperly?

Yes, and it's a deliberate pattern some teams use -- keeping AutoMapper specifically for `ProjectTo`-based EF Core projections where it remains most mature, while routing other in-memory mapping through a faster, free alternative like Mapperly.

### Is AutoMapper still actively maintained?

Yes -- it continues to receive updates despite the licensing change. It hasn't been abandoned; its development model has shifted to a commercial one, but the project itself remains active.

### What's the most common mistake in a first AutoMapper setup?

Not resolving the licensing question before building significant architecture around it, only to discover the compliance implications later. The second common mistake is skipping `AssertConfigurationIsValid()`, leaving configuration errors to surface as confusing runtime bugs instead of being caught immediately in a test.
