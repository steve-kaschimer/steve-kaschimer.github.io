---
author: Steve Kaschimer
date: 2027-07-06
image: /images/posts/2027-07-06-hero.webp
image_alt: "A lightning-fast adapt glyph with a loose, unconstrained outline flowing directly between two shapes with no visible setup step, a faint slowing-pulse marker beside it."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a loosely drawn, free-flowing teal arrow connecting two roughly matching shapes with no intermediate panel or setup glyph, implying zero-configuration mapping. A small amber pulse-wave icon beside it fades gradually toward its right edge, subtly implying a slowing cadence. Mood is quick, flexible, and slightly cautionary. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art."
layout: post.njk
site_title: Tech Notes
summary: "Mapster's Adapt() is the fastest on-ramp of any mapper in this series - zero configuration, works immediately. That immediacy is real, but worth pairing with an honest look at the project's genuinely slowed development pace. A setup guide for zero-config mapping, TypeAdapterConfig, and the compile-time mode that closes the gap with Mapperly."
tags: ["dotnet", "tooling", "developer-productivity", "performance"]
title: "Getting Started with Mapster in .NET"
---

Mapster's `Adapt()` extension method is the fastest on-ramp of any library in this series - it works on any object with zero configuration, matching properties by name automatically. That immediacy is real, but it's worth pairing with an honest look at where the project stands: development has genuinely slowed in recent times, and its long-term maintenance trajectory carries more uncertainty than it used to. Neither of those facts should stop you from using Mapster today; they should inform how much you build around it for tomorrow.

This guide covers installing Mapster, bootstrapping both its zero-config runtime mode and its optional compile-time source-generation mode, the core patterns for custom mapping configuration, and the best practices for using it well given its current position in the ecosystem. By the end you'll have a fast, flexible mapping setup and a clear sense of when to lean on which of its two execution modes.

If you're deciding between mapping approaches first, [a comparison of the top .NET mapping libraries](/posts/2027-06-22-top-5-dotnet-mapping-libraries-compared/) covers where Mapster fits relative to AutoMapper, Mapperly, manual mapping, and Facet.

## What You'll Need

- .NET 8 SDK or later
- Optionally, `Mapster.Tool` if you want compile-time source-generated mappings rather than the default runtime mode

## Installing Mapster

```bash
dotnet add package Mapster
```

For compile-time generation:

```bash
dotnet add package Mapster.Tool
dotnet tool install --global dotnet-mapster
```

## Bootstrapping the Ideal Environment

### Zero-configuration mapping

```csharp
var orderDto = order.Adapt<OrderDto>();
```

This is genuinely the entire setup for straightforward, matching-property-name scenarios - no registration, no profile, no DI setup required. `Adapt<T>()` is an extension method available on any object once the Mapster package is referenced.

### Custom configuration via TypeAdapterConfig

For anything beyond automatic property matching:

```csharp
public class MapsterConfig
{
    public static void Configure()
    {
        TypeAdapterConfig<Order, OrderDto>.NewConfig()
            .Map(dest => dest.CustomerName, src => src.Customer.Name);
    }
}
```

```csharp
// Program.cs
MapsterConfig.Configure();
```

Configuration is global by default, registered once at startup - a meaningfully different model from AutoMapper's `Profile`-per-feature organization, closer to a single central configuration surface unless you deliberately organize it otherwise.

### Registering Mapster with dependency injection

```csharp
builder.Services.AddSingleton(TypeAdapterConfig.GlobalSettings);
builder.Services.AddScoped<IMapper, ServiceMapper>();
```

`IMapper`/`ServiceMapper` gives you an AutoMapper-compatible-feeling injectable interface if you want dependency injection rather than the static `Adapt()` extension method - useful specifically for easier unit testing of code that depends on mapping.

```csharp
public class OrderController(IMapper mapper, IOrderRepository repository) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await repository.GetByIdAsync(id);
        return Ok(mapper.Map<OrderDto>(order));
    }
}
```

### Enabling compile-time source generation

```csharp
[Mapper]
public static class OrderMapper
{
    public static OrderDto ToDto(this Order order) => order.Adapt<OrderDto>();
}
```

Running `dotnet mapster` (from `Mapster.Tool`) with configuration pointing at classes marked for generation produces static mapping methods in a partial class at build time - eliminating Mapster's default runtime reflection/expression-tree overhead entirely, closing much of the performance gap with Mapperly.

## Core Workflow

- **Default to zero-config `Adapt<T>()` for straightforward, matching-name scenarios.** This is Mapster's core strength - don't add configuration ceremony where convention already handles the mapping correctly.
- **Use `TypeAdapterConfig` for exceptions**, the same principle as AutoMapper's `.ForMember()` - configure only what doesn't follow convention.
- **Consider enabling compile-time generation for performance-sensitive paths**, without needing to abandon Mapster's syntax or rewrite mapping logic to adopt it.

## Verifying Your Setup

1. **Zero-config mapping produces correct results** - confirm matching property names map as expected without any configuration
2. **Custom configuration overrides convention correctly** - confirm a `TypeAdapterConfig` mapping for a renamed or computed property behaves as configured
3. **Compile-time generation is actually active, if enabled** - confirm generated static mapping methods appear in build output and that runtime reflection overhead is genuinely eliminated for those paths
4. **Repository activity and maintenance status are current** - periodically check Mapster's actual repository activity, given its slowed development pace, before assuming continued active maintenance

## Best Practices

**Lean into zero-configuration mapping where it fits.** Adding unnecessary `TypeAdapterConfig` setup for scenarios that already map correctly by convention defeats Mapster's core convenience.

**Register configuration once at startup, organized clearly even without AutoMapper's per-feature Profile structure.** Consider grouping related `TypeAdapterConfig` calls into well-named static classes by feature area, similar in spirit to how you'd organize AutoMapper profiles, even though Mapster doesn't enforce this structure itself.

**Enable compile-time generation for genuinely performance-sensitive mapping paths.** It's a real, available option that closes much of the gap with Mapperly without requiring you to change syntax or libraries.

**Go in aware of Mapster's slowed development pace for new, long-lived projects.** It remains fully functional today, but if long-term active maintenance is a priority for a new project, Mapperly's momentum is the more conservative bet - factor this honestly into the decision rather than assuming indefinite parity.

**Use the `IMapper`/`ServiceMapper` DI-based approach specifically when you need to mock mapping in unit tests.** The static `Adapt()` extension method is harder to substitute in tests than an injected interface.

## Comparison with Mapperly

| | Mapster | Mapperly |
| --- | --- | --- |
| Default mechanism | Runtime (reflection/expression trees) | Compile-time source generator |
| Zero-config mapping | Yes, `Adapt<T>()` works immediately | No - requires explicit partial mapper methods |
| Compile-time mode | Optional, via Mapster.Tool | Always compile-time by design |
| Development activity | Slowed | Actively developed, growing momentum |
| Best fit | Quick, flexible drop-in with minimal setup | New projects wanting best performance and active maintenance |

Mapster's zero-configuration convenience is a real advantage Mapperly doesn't match - the trade-off is Mapster's less certain long-term development trajectory versus Mapperly's growing momentum.

## Frequently Asked Questions

### Do I need to configure anything before using Mapster's Adapt method?

No - `source.Adapt<Destination>()` works immediately for matching property names with zero setup, which is Mapster's core convenience over AutoMapper's profile-registration requirement. Configuration via `TypeAdapterConfig` is only needed for properties that don't follow convention.

### Is Mapster still being actively maintained?

Its development pace has genuinely slowed compared to its earlier years, and its long-term maintenance future carries real uncertainty - worth checking current repository activity directly before betting a new, long-lived project on it. It remains functional and free today; the concern is specifically about ongoing future development momentum.

### How do I get better performance out of Mapster?

Enable compile-time source generation via `Mapster.Tool`, which generates static mapping methods at build time instead of relying on Mapster's default runtime reflection/expression-tree approach. This closes much of the performance gap with Mapperly while keeping Mapster's familiar syntax.

### What's the difference between using Adapt() directly and injecting IMapper?

`Adapt<T>()` is a static extension method, simple and immediate but harder to substitute in unit tests. `IMapper`/`ServiceMapper` gives you a DI-injectable interface with a similar feel to AutoMapper's `IMapper`, making it easier to mock mapping behavior in tests that depend on it. Choose based on whether testability of the mapping call itself matters for your scenario.

### Should I choose Mapster or Mapperly for a new project?

If active long-term development and the strongest possible performance matter most, Mapperly is the more conservative choice given its growing momentum. If you want the absolute lowest setup friction with zero-configuration mapping and are comfortable with Mapster's less certain maintenance trajectory, it remains a legitimate, free choice today.

### Does Mapster support EF Core query projection like AutoMapper's ProjectTo?

Support is more limited than AutoMapper's mature `ProjectTo` capability. If EF Core projection is a significant part of your data access pattern, this is a real gap worth weighing against Mapster's other advantages, and may be a reason to keep AutoMapper specifically for that use case even while using Mapster elsewhere.

### What's the most common mistake in a first Mapster setup?

Adding unnecessary `TypeAdapterConfig` configuration for mappings that would have worked correctly by convention alone, missing out on Mapster's core zero-configuration convenience. The second common mistake is not checking current project activity before committing a new, long-lived project to it, given its genuinely slowed development pace.
