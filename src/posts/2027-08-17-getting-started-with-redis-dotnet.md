---
author: Steve Kaschimer
date: 2027-08-17
image: /images/posts/2027-08-17-hero.webp
image_alt: "A richer layered-shapes glyph with a cube, a small hash symbol, and a list icon clustered together, connected to a two-tier box representing a local cache in front of a shared cache."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small cluster of three distinct shapes - a cube, a hash-mark glyph, and a short stacked-line list icon - grouped tightly together on the left, implying rich data structures. A teal line connects them to a two-tier rectangle on the right: a small fast tier stacked directly above a larger shared tier, implying a local cache layered in front of a distributed one. Mood is established, broad, and richly capable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Most of the friction people hit adopting Redis in .NET isn't Redis's fault - it's the boilerplate that used to be necessary around IDistributedCache. A setup guide for the recommended HybridCache-with-Redis path, sharing one connection multiplexer, and tag-based invalidation."
tags: ["dotnet", "caching", "performance", "architecture", "devops"]
title: "Getting Started with Redis in .NET"
---



Redis is the default distributed cache for .NET, and most of the friction people hit adopting it isn't Redis's fault - it's the boilerplate that used to be necessary around `IDistributedCache`: manual serialization, hand-written cache-aside logic, and no built-in protection against a cold cache getting hammered by concurrent requests. .NET 9's `HybridCache` addresses most of that directly, and it's worth knowing about before you build your own wrapper around `IDistributedCache` the way most tutorials from before 2025 will show you.

This guide covers installing and connecting to Redis from .NET, bootstrapping it through both the classic `IDistributedCache` approach and the newer, recommended `HybridCache` path, the core patterns for reads, writes, and invalidation, and the best practices that keep a Redis-backed cache fast and correct. By the end you'll have a distributed cache that's shared cleanly across every instance of your application.

If you're deciding between caching options first, [a comparison of the top .NET caching solutions](/posts/2027-08-03-top-5-dotnet-caching-solutions-compared/) covers where Redis fits relative to `IMemoryCache`, NCache, Memcached, and Garnet.

## What You'll Need

- .NET 8 SDK or later (.NET 9+ if you want `HybridCache`)
- A running Redis instance - locally via Docker, or a managed offering from your cloud provider
- Awareness of Redis's current licensing terms for your use case, or a look at Valkey (a BSD-licensed, drop-in-compatible fork) if that's a concern

```bash
docker run -d -p 6379:6379 redis:latest
```

## Installing Redis Client Libraries

```bash
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
```

This brings in `StackExchange.Redis`, the standard .NET client, along with the `IDistributedCache` implementation backed by it.

## Bootstrapping the Ideal Environment

### The recommended path: HybridCache with Redis as L2

```bash
dotnet add package Microsoft.Extensions.Caching.Hybrid
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "myapp:"; // prefixes all keys, useful for shared Redis instances
});

builder.Services.AddHybridCache(options =>
{
    options.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(30),        // L2 (Redis) expiration
        LocalCacheExpiration = TimeSpan.FromMinutes(5) // L1 (in-process) expiration
    };
});
```

Registering `AddStackExchangeRedisCache` alongside `AddHybridCache` is all it takes - `HybridCache` detects the registered `IDistributedCache` and automatically uses Redis as its L2 tier, with its own fast in-process L1 tier layered in front. No code at the call site changes:

```csharp
public class ProductService(HybridCache cache, IProductRepository repository)
{
    public async Task<Product> GetProductAsync(int id) =>
        await cache.GetOrCreateAsync(
            $"product:{id}",
            async cancel => await repository.GetByIdAsync(id, cancel));
}
```

Requests hit L1 (in-process memory) first, fall through to L2 (Redis) on an L1 miss, and only reach your actual data source on a miss at both tiers - with stampede protection at every level, so concurrent requests for the same cold key coalesce into a single execution.

### The classic path: IDistributedCache directly

If you're not yet on .NET 9, or want lower-level control:

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});
```

```csharp
public class ProductService(IDistributedCache cache, IProductRepository repository)
{
    public async Task<Product?> GetProductAsync(int id)
    {
        var cacheKey = $"product:{id}";
        var cached = await cache.GetStringAsync(cacheKey);
        if (cached is not null)
            return JsonSerializer.Deserialize<Product>(cached);

        var product = await repository.GetByIdAsync(id);
        if (product is not null)
        {
            await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(product),
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) });
        }
        return product;
    }
}
```

Notice everything `HybridCache` handles for you here: manual serialization, a manual check-then-set pattern, and no protection against concurrent requests all hitting `GetByIdAsync` simultaneously on a cache miss. This is exactly the boilerplate `HybridCache` exists to eliminate.

### Sharing one connection multiplexer

`StackExchange.Redis`'s `IConnectionMultiplexer` is expensive to create and designed to be a long-lived singleton shared across your whole application - including other features that also talk to Redis directly (a SignalR backplane, distributed locks, and so on):

```csharp
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis")!));
```

If multiple features each open their own connection instead of sharing one multiplexer, you end up with far more Redis connections than your application actually needs.

## Core Workflow

- **Cache-aside is the default pattern**, whether via `HybridCache.GetOrCreateAsync` or hand-rolled `IDistributedCache` logic: check cache, fall through to source on miss, populate cache with the result.
- **Invalidate explicitly on writes.** `HybridCache` supports tag-based invalidation for removing groups of related entries at once, which is considerably cleaner than tracking individual keys by hand.
- **Use Redis's richer data structures when key-value alone isn't enough.** For scenarios like leaderboards or rate limiting, `StackExchange.Redis`'s direct API (sorted sets, hashes) is more appropriate than the cache abstraction layer.

```csharp
// Tag-based invalidation with HybridCache
await cache.GetOrCreateAsync(
    $"product:{id}",
    async cancel => await repository.GetByIdAsync(id, cancel),
    tags: ["products"]);

// Later, invalidate every entry tagged "products" at once
await cache.RemoveByTagAsync("products");
```

## Verifying Your Setup

1. **Connection is shared, not duplicated** - confirm `IConnectionMultiplexer` is registered as a singleton and reused across features, not reconnected per request
2. **HybridCache is actually using Redis as L2** - stop your Redis container temporarily and confirm the app degrades to L1-only behavior rather than failing outright, or confirm your chosen failure mode matches expectations
3. **Stampede protection works** - fire many concurrent requests at a cold cache key and confirm only one actually reaches your data source
4. **Keys are properly namespaced** - if sharing a Redis instance across applications, confirm `InstanceName` or an equivalent prefix prevents key collisions

## Best Practices

**Default to `HybridCache` over hand-rolled `IDistributedCache` logic.** It eliminates serialization boilerplate, adds stampede protection, and gives you a free in-process L1 tier - there's very little reason to write the manual check-then-set pattern yourself in new code.

**Share one `IConnectionMultiplexer` across your whole application.** Register it as a singleton and reuse it for caching, SignalR backplanes, distributed locks, or anything else that talks to Redis - one connection pool, not one per feature.

**Set both L1 and L2 expiration deliberately with HybridCache.** `LocalCacheExpiration` (L1) should generally be shorter than `Expiration` (L2) - the local tier is meant to be a very fast, short-lived cache of what's already in the shared tier.

**Use tag-based invalidation for related entries instead of tracking keys manually.** Removing "everything related to product 42" by tag is more maintainable than remembering every individual key that needs to be cleared.

**Check current Redis licensing for your use case, or evaluate Valkey.** Licensing terms have shifted more than once in recent years - confirm what applies to you before standardizing on Redis specifically versus a compatible fork.

## Comparison with NCache

| | Redis | NCache |
| --- | --- | --- |
| .NET integration | Mature client library, not .NET-native | Built specifically for .NET |
| Data structures | Rich (lists, sets, hashes, sorted sets, streams) | Rich, .NET-native object caching |
| Ecosystem | Largest of any option in this comparison | Smaller, .NET-focused |
| ASP.NET Core session support | Via IDistributedCache | Deep, purpose-built integration |
| Best fit | Most distributed caching needs | .NET-heavy enterprises wanting native tooling |

Both are legitimate distributed caches for .NET - Redis wins on ecosystem breadth and community size, NCache on depth of native .NET integration. For most teams without a specific reason to prefer NCache's native tooling, Redis remains the more broadly supported default.

## Frequently Asked Questions

### Should I use HybridCache or IDistributedCache directly with Redis?

`HybridCache`, if you're on .NET 9 or later. It wraps `IDistributedCache` implementations (including Redis) and adds a fast in-process L1 tier, automatic serialization, and cache-stampede protection, all through a simpler API. There's little reason to hand-write the check-then-set pattern `IDistributedCache` requires when `HybridCache` handles it for you.

### What happens if Redis goes down while my app is running?

With `HybridCache`, behavior depends on configuration, but typically requests fall through to your data source directly (bypassing the L2 cache) rather than failing outright, since L1 (in-process) continues working independently. With raw `IDistributedCache`, a Redis outage will generally surface as exceptions from cache calls unless you've wrapped them in your own fallback logic - worth testing deliberately rather than assuming.

### Do I need to worry about Redis licensing?

It's worth checking current terms for your specific situation, since Redis's licensing has changed more than once in recent years. Valkey, a BSD-licensed fork backed by the Linux Foundation and major cloud providers, is a common alternative if licensing terms are a concern - it's largely a drop-in replacement using the same client libraries and protocol.

### How do I invalidate a group of related cache entries at once?

With `HybridCache`, tag entries when creating them (`tags: ["products"]`) and invalidate the whole group with `RemoveByTagAsync("products")`. With raw `IDistributedCache`, you'd need to track related keys yourself, which is more error-prone - this is one of the concrete conveniences `HybridCache` adds over the lower-level abstraction.

### Why should I share one IConnectionMultiplexer instead of creating connections as needed?

`ConnectionMultiplexer.Connect()` is expensive and designed to be a long-lived singleton - it manages its own internal connection pooling to Redis. Creating a new one per request or per feature multiplies connection overhead unnecessarily and can exhaust Redis's connection limits under load; registering it once as a singleton and injecting it wherever needed is the correct pattern.

### Can I use Redis for things other than caching, like a SignalR backplane or session state?

Yes - Redis's pub/sub and data structure support make it a common backing store for SignalR's distributed backplane, ASP.NET Core session state, distributed locks, and rate limiting, in addition to general-purpose caching. If you're already running Redis for caching, sharing the same instance (and connection multiplexer) for these other purposes is common and efficient, provided you're mindful of key namespacing to avoid collisions.

### What's the most common mistake in a first Redis setup for .NET?

Writing manual cache-aside logic with `IDistributedCache` instead of using `HybridCache`, and creating a new `IConnectionMultiplexer` per request or per feature instead of sharing one singleton across the application. Both are easy to avoid once you know to look for them, but both are the default outcome of following an older tutorial without noticing `HybridCache` now exists.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
