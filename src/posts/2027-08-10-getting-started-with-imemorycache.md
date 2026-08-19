---
author: Steve Kaschimer
date: 2027-08-10
image: /images/posts/2027-08-10-hero.webp
image_alt: "A small solid dot fully contained inside a single box with no connecting lines leaving its border, a fainter second box beside it representing a stampede-protected wrapper layer."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small solid teal dot fully enclosed within a single flat rectangular box, with no lines or arrows crossing its border, emphasizing complete containment within one process. A second, fainter rectangle sits just behind and slightly offset from the first, implying a protective wrapper layer added on top. A tiny amber gauge icon near the base implies a size limit. Mood is contained, immediate, and deliberately narrow. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art."
layout: post.njk
site_title: Tech Notes
summary: "IMemoryCache is the easiest caching decision in .NET to get right and, paradoxically, one of the easiest to misuse. A setup guide for size limits, the GetOrCreateAsync pattern, explicit invalidation on write, and why HybridCache is the better default even for single-server apps."
tags: ["dotnet", "caching", "performance", "developer-productivity"]
title: "Getting Started with IMemoryCache in .NET"
---



`IMemoryCache` is the easiest caching decision in .NET to get right and, paradoxically, one of the easiest to misuse - not because the API is complicated, but because it's so simple to add that people reach for it in places a distributed cache actually belongs, and forget it exists in places where it would help. Understanding what it is (a single-process dictionary with expiration policies) and isn't (anything that survives a restart, or is visible to another instance) is most of what you need to use it well.

This guide covers using `IMemoryCache` in .NET, bootstrapping it correctly with expiration and size limits, the core `GetOrCreate` pattern that avoids most common mistakes, and the best practices - including when .NET 9's `HybridCache` is a better starting point than `IMemoryCache` directly. By the end you'll know exactly which caching problems this tool solves, and which ones it doesn't.

If you're deciding between caching options first, [a comparison of the top .NET caching solutions](/posts/2027-08-03-top-5-dotnet-caching-solutions-compared/) covers where `IMemoryCache` fits relative to Redis, NCache, Memcached, and Garnet.

## What You'll Need

- .NET 8 SDK or later
- Nothing else - `IMemoryCache` is part of the framework, no external service or NuGet package required beyond what ASP.NET Core already includes

## Installing IMemoryCache

For most ASP.NET Core apps, it's already available. If you're in a non-web host or want the package explicitly:

```bash
dotnet add package Microsoft.Extensions.Caching.Memory
```

Register it:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMemoryCache();
```

## Bootstrapping the Ideal Environment

The default configuration works, but two settings matter enough to set deliberately rather than leave at defaults: a size limit, and consistent expiration policy.

### Set a size limit to prevent unbounded growth

Without a limit, a memory cache can grow without bound and become its own memory problem:

```csharp
builder.Services.AddMemoryCache(options =>
{
    options.SizeLimit = 1024; // units are arbitrary -- you define what "1" means per entry
});
```

Every entry then needs a `Size` set explicitly when it's cached, or it won't count against the limit:

```csharp
var entryOptions = new MemoryCacheEntryOptions
{
    Size = 1,
    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
};
cache.Set(cacheKey, value, entryOptions);
```

### Use GetOrCreate / GetOrCreateAsync instead of manual check-then-set

```csharp
public async Task<Product> GetProductAsync(int id)
{
    return await cache.GetOrCreateAsync($"product:{id}", async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
        entry.Size = 1;
        return await repository.GetByIdAsync(id);
    });
}
```

`GetOrCreateAsync` handles the "check the cache, and if missing, compute and store the value" pattern in one call. Writing that check-then-set logic manually is a common source of subtle bugs, particularly around concurrent requests for the same missing key.

### Consider HybridCache instead, even for a single-server app

.NET 9 introduced `HybridCache`, which wraps `IMemoryCache` as its fast local (L1) tier and adds cache-stampede protection - if 100 concurrent requests miss the same key at once, only one actually executes the factory function; the rest await that single result instead of each independently hitting your database:

```bash
dotnet add package Microsoft.Extensions.Caching.Hybrid
```

```csharp
builder.Services.AddHybridCache();
```

```csharp
public class ProductService(HybridCache cache, IProductRepository repository)
{
    public async Task<Product> GetProductAsync(int id) =>
        await cache.GetOrCreateAsync(
            $"product:{id}",
            async cancel => await repository.GetByIdAsync(id, cancel),
            new HybridCacheEntryOptions { Expiration = TimeSpan.FromMinutes(10) });
}
```

This works with zero extra infrastructure - it behaves like `IMemoryCache` until you register a distributed cache backend, at which point `HybridCache` automatically picks it up as an L2 tier without any change to your call sites. Because of the stampede protection and near-identical API, `HybridCache` is worth defaulting to over raw `IMemoryCache` for new code, even if you never add a distributed backend.

## Core Workflow

- **Cache computed or fetched values, not the source of truth itself.** `IMemoryCache` should be a performance optimization sitting in front of a database or external call, never the only place a piece of data lives.
- **Set expiration on every entry.** An entry with no expiration lives until evicted by memory pressure or explicitly removed - almost always the wrong default for application data that can change.
- **Invalidate explicitly on writes.** When the underlying data changes, remove or update the cached entry rather than waiting for expiration - `cache.Remove(key)` after a successful write is the simplest correct pattern.

```csharp
public async Task UpdateProductAsync(Product product)
{
    await repository.UpdateAsync(product);
    cache.Remove($"product:{product.Id}");
}
```

## Verifying Your Setup

1. **A size limit is set, and entries specify `Size`** - confirm entries without a `Size` aren't silently bypassing your limit
2. **Every cached entry has an expiration policy** - audit for any `Set` call missing `AbsoluteExpirationRelativeToNow` or `SlidingExpiration`
3. **Writes invalidate the cache** - confirm an update to underlying data is reflected in reads shortly after, not stuck serving stale cached data for the full expiration window
4. **Concurrent cache misses don't cause a stampede** - if you're using raw `IMemoryCache` rather than `HybridCache`, test what happens when many requests hit a cold cache key simultaneously

## Best Practices

**Default to `HybridCache` over raw `IMemoryCache` for new code.** The API is nearly identical, but stampede protection and a clear upgrade path to a distributed L2 tier make it the better starting point in .NET 9+.

**Always set a size limit and per-entry `Size`.** An unbounded in-memory cache is a slow memory leak waiting to happen under enough traffic.

**Never treat IMemoryCache as shared state across instances.** This is the single most common mistake - a value cached on one instance is completely invisible to any other instance, which becomes a real bug, not just a missed optimization, the moment your app scales beyond one instance.

**Invalidate on write, don't rely solely on expiration.** Expiration is a safety net for staleness, not a substitute for actively invalidating a cache entry when you know the underlying data just changed.

**Use short, deliberate expirations for anything that changes.** A long expiration on frequently-changing data trades correctness for cache hit rate in a way that's easy to regret later - tune expiration to how often the data actually changes, not how long you can get away with.

## Comparison with Redis

| | IMemoryCache | Redis (via IDistributedCache) |
| --- | --- | --- |
| Scope | Single process | Shared across all instances |
| Latency | Nanosecond-scale | Millisecond-scale |
| Survives restart | No | Yes, if persistence is enabled |
| Infrastructure | None - built in | Requires a running Redis instance |
| Best fit | Single-instance apps, or a fast local layer in front of a distributed cache | Multi-instance apps needing shared cache state |

They're not really competitors - `IMemoryCache` (or `HybridCache`'s L1 tier) and Redis solve different problems and combine naturally, with `HybridCache` specifically designed to let you use both without maintaining separate cache-aside logic for each.

## Frequently Asked Questions

### Does IMemoryCache work across multiple instances of my app?

No. Each instance has its own completely independent `IMemoryCache` - a value cached on Instance A is invisible to Instance B. If you need cache state shared across instances, you need a distributed cache like Redis, or `HybridCache` with a distributed backend registered.

### What happens to IMemoryCache data when my app restarts?

It's gone entirely - `IMemoryCache` has no persistence. This is by design; if you need cached data to survive a restart, that's a signal you actually need a distributed cache with persistence enabled, not a workaround for `IMemoryCache`.

### Should I use IMemoryCache or HybridCache for a new project?

`HybridCache`, in almost every case where you're on .NET 9 or later. It offers the same core API, adds cache-stampede protection `IMemoryCache` doesn't have, and gives you a clean upgrade path to a distributed L2 cache later without touching your call sites. There's little reason to reach for raw `IMemoryCache` directly in new code.

### How do I prevent IMemoryCache from growing unbounded?

Set a `SizeLimit` when registering the cache, and specify a `Size` value on every entry you add - entries without an explicit size don't count against the limit, so both pieces are necessary. Combine this with sensible expiration policies so entries don't accumulate indefinitely even before hitting the size limit.

### What's cache stampede, and why does it matter?

A cache stampede happens when many concurrent requests all miss the same cache key at once - for example, right after an expiration - and all independently fall through to the expensive operation being cached (a database query, an API call), multiplying load at exactly the moment you were trying to reduce it. Raw `IMemoryCache` doesn't protect against this; `HybridCache`'s `GetOrCreateAsync` does, by coalescing concurrent requests for the same key into a single execution.

### Can I use IMemoryCache for session state?

Technically yes, but it's usually the wrong choice for anything beyond single-instance, throwaway scenarios - session data lost on restart or invisible to other instances behind a load balancer is a real problem for most production apps. ASP.NET Core's session middleware is generally backed by a distributed cache (Redis being the most common) specifically to avoid this.

### What's the most common mistake with IMemoryCache?

Treating it as if it were shared state across instances - caching something on one server and being surprised another server doesn't see it. The second most common is forgetting expiration entirely, letting entries accumulate until memory pressure forces eviction rather than actively managing entry lifetime.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
