---
author: Steve Kaschimer
date: 2027-08-24
image: /images/posts/2027-08-24-hero.webp
image_alt: "Two overlapping outlines of the same shape - one solid, one dashed - implying protocol compatibility between two separate implementations, with a small multi-core grid glyph beneath."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two nearly identical rectangular outlines overlapping closely - the left one solid teal, the right one dashed in amber - implying the same wire protocol spoken by two distinct implementations. Beneath them, a small grid of four evenly spaced squares implies multi-core performance. Mood is compatible, modern, and quietly confident. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art."
layout: post.njk
site_title: Tech Notes
summary: "Same protocol as Redis, so existing client code mostly just works, but built in C# by Microsoft Research with a modern GC design aimed at multi-core performance. A setup guide for connecting with the existing StackExchange.Redis client and verifying command compatibility before trusting it as a drop-in replacement."
tags: ["dotnet", "caching", "performance", "tooling"]
title: "Getting Started with Garnet in .NET"
---

Garnet's pitch is unusually direct for a caching tool: same protocol as Redis, so your existing client code mostly just works, but built in C# by Microsoft Research with a modern, epoch-based garbage collection design aimed squarely at strong multi-core performance. For .NET shops, that combination - Redis-compatible on the wire, native .NET under the hood - is the whole appeal, along with the honest caveat that it's meaningfully younger than everything else in this comparison.

This guide covers installing and running Garnet, bootstrapping a connection using the same `StackExchange.Redis` client you'd use for Redis itself, the core workflow (which is close to identical to Redis, by design), and the best practices for adopting something newer without getting burned by gaps between it and the tool it's compatible with. By the end you'll have a working Garnet setup and a clear sense of what to verify before trusting it with production traffic.

If you're deciding between caching options first, [a comparison of the top .NET caching solutions](/posts/2027-08-03-top-5-dotnet-caching-solutions-compared/) covers where Garnet fits relative to `IMemoryCache`, Redis, NCache, and Memcached.

## What You'll Need

- .NET 8 SDK or later
- Docker, or the ability to build/run Garnet's server binary directly
- An existing familiarity with Redis is genuinely useful here, since Garnet's client-facing behavior is designed to mirror it closely

```bash
docker run -d -p 6379:6379 ghcr.io/microsoft/garnet
```

## Installing Garnet Client Libraries

Because Garnet speaks RESP (the same wire protocol Redis uses), you don't need a Garnet-specific client - the standard Redis client for .NET works directly:

```bash
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
```

This is Garnet's core practical advantage for .NET teams: if you already have Redis integration code, pointing it at a Garnet instance is frequently just a connection string change, not a rewrite.

## Bootstrapping the Ideal Environment

### Connecting exactly like you would to Redis

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Garnet");
});

builder.Services.AddHybridCache();
```

Because `HybridCache` works against any registered `IDistributedCache`, and Garnet's RESP compatibility means `AddStackExchangeRedisCache` connects to it without modification, the entire `HybridCache` setup from the Redis guide applies here unchanged - same API, same stampede protection, same L1/L2 tiering, just pointed at a different backend.

```csharp
public class ProductService(HybridCache cache, IProductRepository repository)
{
    public async Task<Product> GetProductAsync(int id) =>
        await cache.GetOrCreateAsync(
            $"product:{id}",
            async cancel => await repository.GetByIdAsync(id, cancel));
}
```

### Verify command compatibility before assuming full parity

RESP-compatible doesn't automatically mean every Redis command or module you rely on is implemented identically. Before migrating a production workload:

```csharp
var multiplexer = ConnectionMultiplexer.Connect(connectionString);
var db = multiplexer.GetDatabase();

// Test the specific commands/patterns your app actually uses
await db.StringSetAsync("test-key", "test-value");
var result = await db.StringGetAsync("test-key");
```

Run through your application's actual Redis usage patterns - not just basic get/set, but any sorted sets, pub/sub, Lua scripting, or specific modules (RediSearch, RedisJSON) you depend on - and confirm each is supported before treating Garnet as a drop-in replacement rather than a protocol-compatible alternative.

## Core Workflow

The workflow is intentionally identical to Redis, since that's the entire design goal:

- **Cache-aside via `HybridCache`**, same as the Redis guide - `GetOrCreateAsync` with tag-based invalidation where useful
- **Share one connection across your application**, the same discipline that applies to `StackExchange.Redis` against real Redis
- **Monitor Garnet-specific operational behavior separately from what you know about Redis operations.** Even with wire compatibility, operational characteristics (memory behavior, GC pauses, failure modes) come from a genuinely different implementation and shouldn't be assumed identical just because the protocol is.

```csharp
await cache.GetOrCreateAsync(
    $"product:{id}",
    async cancel => await repository.GetByIdAsync(id, cancel),
    tags: ["products"]);

await cache.RemoveByTagAsync("products");
```

## Verifying Your Setup

1. **Existing Redis client code connects without modification** - confirm `StackExchange.Redis` (directly or via `HybridCache`) works against Garnet with just a connection string change
2. **Your specific command usage is supported** - test the actual Redis features your application depends on, not just basic get/set, against a real Garnet instance
3. **Performance matches expectations under your actual workload** - Garnet's benchmark strength is on multi-core machines specifically; validate against your real traffic pattern rather than trusting generic benchmarks
4. **You have a rollback plan** - given Garnet's relative youth compared to Redis, confirm you can revert to Redis (or another option) without a major rework if something doesn't hold up in production

## Best Practices

**Treat "RESP-compatible" as "very likely to work," not "guaranteed identical."** Test your application's actual Redis usage patterns against Garnet directly rather than assuming full command and module parity.

**Take advantage of the low switching cost to actually evaluate it, not just read about it.** Because adopting Garnet often requires nothing more than a connection string change on top of existing Redis integration code, there's little reason not to run a real evaluation against your actual workload rather than deciding from benchmarks alone.

**Weigh production maturity honestly against your risk tolerance.** Garnet has strong backing and active development, but meaningfully less time in production at scale than Redis, NCache, or Memcached - factor that into how central you make it to critical-path infrastructure, at least initially.

**Use `HybridCache` the same way you would with Redis.** There's no reason to write Garnet-specific caching code - the whole point of RESP compatibility is that your existing `IDistributedCache`-based patterns carry over directly.

**Keep an eye on the project's release cadence and community activity before committing long-term.** As a newer, actively developed project, checking that development momentum continues is more relevant due diligence here than it would be for an established tool like Redis.

## Comparison with Redis

| | Garnet | Redis |
| --- | --- | --- |
| Protocol | RESP-compatible | RESP (native) |
| Implementation language | C#, built by Microsoft Research | C++ |
| .NET client | Same `StackExchange.Redis` client works directly | `StackExchange.Redis` (the native, original target) |
| Production maturity | Newer, less battle-tested at scale | Over a decade of production use across huge deployments |
| Ecosystem | Smaller, growing | Largest of any option in this comparison |
| Best fit | .NET shops wanting Redis compatibility with a .NET-native codebase, willing to accept newer-project risk | Most distributed caching needs, especially where maturity matters most |

The practical migration cost between the two is genuinely low given the shared protocol - which makes Garnet worth directly evaluating rather than dismissing, but doesn't erase the real gap in how long each has been proven at scale.

## Frequently Asked Questions

### Do I need a different client library to use Garnet instead of Redis?

No - because Garnet speaks RESP, the same protocol Redis uses, the standard `StackExchange.Redis` client (and by extension, `Microsoft.Extensions.Caching.StackExchangeRedis` and `HybridCache`) connects to Garnet without any client-side changes, typically just a different connection string.

### Is Garnet a full drop-in replacement for Redis?

Mostly, for common usage patterns, but not guaranteed for everything. RESP compatibility covers the core protocol and most commands, but specific Redis modules (RediSearch, RedisJSON) or less common commands may not have identical support. Test your application's actual usage against Garnet directly before treating it as a verified drop-in replacement.

### Is Garnet ready for production use?

It depends on your risk tolerance and how central caching is to your system's reliability. Garnet has strong performance characteristics and active Microsoft Research backing, but it has meaningfully less production track record at scale than Redis. Many teams are well-served evaluating it for non-critical-path caching first before trusting it with core infrastructure.

### Why would a .NET team choose Garnet over just using Redis?

The main draw is a codebase and governance model closer to home for .NET shops - Garnet is built in C#, which some teams value for contribution and debugging familiarity, combined with strong reported performance on multi-core hardware. It's a deliberate trade of Redis's much longer track record for a .NET-native implementation and active Microsoft Research development.

### What performance benefits does Garnet actually offer over Redis?

Garnet's design, including its epoch-based garbage collection approach, shows strong benchmark results specifically on multi-core machines. Whether that translates into a meaningful difference for your specific workload depends heavily on your actual traffic patterns and hardware - validate against your own workload rather than relying on generic benchmark claims.

### Can I run Garnet and Redis side by side during a migration?

Yes, and it's a reasonable approach given the shared protocol - you could route some traffic to Garnet for evaluation while keeping Redis as the primary, or migrate incrementally by service or feature. Because the client code is identical either way, the migration itself is mostly a configuration change rather than a code change.

### What's the most common mistake evaluating Garnet?

Assuming full command and module parity with Redis based on RESP compatibility alone, without testing the application's actual specific usage patterns first. The second is skipping a real evaluation against production-like traffic because the switching cost seems low - low switching cost is a reason to actually test thoroughly, not a reason to skip testing.
