---
author: Steve Kaschimer
date: 2027-08-31
image: /images/posts/2027-08-31-hero.webp
image_alt: "A minimal flat rectangle with no ornamentation, connected by a plain straight line to a single small value dot, deliberately stripped of any extra glyph or layer."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single flat, unornamented rectangle connected by one plain straight teal line to a small solid dot, representing pure key-value simplicity with nothing else attached. A faint secondary rectangle sits beside it at a slight offset, sharing no connecting lines, implying a second independent node with no cross-communication. Mood is stripped-down, fast, and deliberately narrow. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Memcached's setup story is the shortest in this entire series, and that's not an accident - no data structure configuration, no persistence tuning, no replication topology to choose between. A setup guide for the EnyimMemcachedCore client, client-side sharding, and knowing exactly when reaching for it over Redis is the right call."
tags: ["dotnet", "caching", "performance", "tooling"]
title: "Getting Started with Memcached in .NET"
---

Memcached's setup story is the shortest in this entire series, and that's not an accident - it's the entire design philosophy in one fact. There's no data structure configuration to reason about, no persistence tuning, no replication topology to choose between. You get a fast, multi-threaded key-value store and nothing else, which is exactly right when nothing else is what you need.

This guide covers installing Memcached and connecting to it from .NET, bootstrapping a client with sensible connection pooling, the core get/set workflow (which is most of what there is), and the best practices that keep you from accidentally fighting Memcached's intentional simplicity. By the end you'll know exactly when reaching for this over Redis is the right call, not just the familiar one.

If you're deciding between caching options first, [a comparison of the top .NET caching solutions](/posts/2027-08-03-top-5-dotnet-caching-solutions-compared/) covers where Memcached fits relative to `IMemoryCache`, Redis, NCache, and Garnet.

## What You'll Need

- .NET 8 SDK or later
- A running Memcached instance - locally via Docker, or a managed offering from your cloud provider

```bash
docker run -d -p 11211:11211 memcached:latest
```

## Installing a Memcached Client

.NET doesn't have a first-party Memcached client the way it does for Redis (`StackExchange.Redis` is community-standard but extremely mature). `EnyimMemcached` is the most widely used community client:

```bash
dotnet add package EnyimMemcachedCore
```

## Bootstrapping the Ideal Environment

### Registering the client

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEnyimMemcached(options =>
{
    options.AddServer("localhost", 11211);
});
```

For multiple Memcached nodes (Memcached itself has no clustering - the client distributes keys across nodes via consistent hashing):

```csharp
builder.Services.AddEnyimMemcached(options =>
{
    options.AddServer("memcached-1", 11211);
    options.AddServer("memcached-2", 11211);
});
```

This client-side distribution is a meaningfully different model from Redis Cluster or NCache's server-side clustering - Memcached nodes don't know about each other at all; the client decides which node a given key belongs to.

### Basic get/set

```csharp
public class ProductService(IMemcachedClient cache, IProductRepository repository)
{
    public async Task<Product?> GetProductAsync(int id)
    {
        var cacheKey = $"product:{id}";
        var cached = await cache.GetAsync<Product>(cacheKey);
        if (cached is not null)
            return cached;

        var product = await repository.GetByIdAsync(id);
        if (product is not null)
        {
            await cache.SetAsync(cacheKey, product, TimeSpan.FromMinutes(30));
        }
        return product;
    }
}
```

That's close to the entirety of Memcached's API surface - `Get`, `Set`, `Remove`, and a handful of atomic increment/decrement operations for counters. There's no equivalent to Redis's sorted sets, hashes, or pub/sub, because Memcached deliberately doesn't try to be more than a fast key-value store.

## Core Workflow

- **Cache-aside is the only pattern Memcached really supports.** There's no server-side scripting, no pub/sub for invalidation notifications - your application code is fully responsible for cache-aside logic.
- **Key size and value size both have hard limits** (typically 250 bytes for keys, 1MB for values by default) - Memcached will silently reject or fail on values that exceed configured limits, so keep this in mind for large cached objects.
- **Invalidate explicitly on writes**, the same as any cache-aside pattern - Memcached has no built-in mechanism for reacting to changes elsewhere.

```csharp
public async Task UpdateProductAsync(Product product)
{
    await repository.UpdateAsync(product);
    await cache.RemoveAsync($"product:{product.Id}");
}
```

## Verifying Your Setup

1. **Multiple nodes distribute keys as expected** - if running more than one Memcached instance, confirm the client's consistent hashing is spreading keys across nodes rather than concentrating them
2. **Values under the size limit are cached correctly** - confirm large objects aren't silently failing to cache due to exceeding Memcached's default value size limit
3. **A node going down degrades gracefully** - since nodes don't replicate to each other, confirm your client and application handle a node becoming unavailable without hard failures
4. **Expiration is set on every entry** - Memcached does support a "never expire" option, but that's rarely the right default for application data

## Best Practices

**Only reach for Memcached when your caching need is genuinely simple key-value.** The moment you want data structures beyond strings, or need persistence, Redis is the better fit - Memcached's simplicity is a strength specifically for the use cases it's designed for, not a general-purpose caching upgrade path.

**Understand that Memcached has no persistence at all.** A restart means a fully cold cache - if that's a problem for your use case (versus just a minor and expected performance dip), Memcached is the wrong tool regardless of how simple your data shape is.

**Be deliberate about key and value size limits.** Memcached's defaults (roughly 250-byte keys, 1MB values) are lower than what Redis typically accommodates - check these before caching larger objects, and consider whether they actually need to be cached whole or split.

**Understand client-side sharding if you're running multiple nodes.** Because Memcached nodes don't communicate with each other, your client library's consistent hashing determines key distribution - and if that consistent hashing scheme changes (e.g., adding or removing a node), cache keys can redistribute and cause a temporary wave of cache misses.

**Use Memcached specifically for session stores, page fragments, or simple lookups at high throughput.** These are the scenarios where its multi-threaded simplicity genuinely outperforms a more feature-rich cache carrying overhead it doesn't need.

## Comparison with Redis

| | Memcached | Redis |
| --- | --- | --- |
| Data structures | Simple key-value only | Rich (lists, sets, hashes, sorted sets, streams) |
| Persistence | None | Optional (snapshotting, AOF) |
| Clustering | Client-side sharding, nodes don't communicate | Server-side clustering (Redis Cluster) |
| Threading | Multi-threaded by design | Historically single-threaded per instance, though this has evolved |
| .NET client maturity | Solid community client, less mature than StackExchange.Redis | Very mature, first-party Microsoft package support |
| Best fit | Pure key-value at very high throughput | Anything needing more than simple key-value, or persistence |

Memcached wins specifically on raw simplicity and multi-threaded throughput for pure key-value workloads. Redis wins on everything else - richer functionality, persistence, and a substantially more mature .NET ecosystem around it.

## Frequently Asked Questions

### Does .NET have a first-party Memcached client like it does for Redis?

No - there's no Microsoft-maintained equivalent to `Microsoft.Extensions.Caching.StackExchangeRedis` for Memcached. `EnyimMemcachedCore` is the most widely used community client and is a mature, production-viable choice, but it doesn't have the same institutional backing as the Redis tooling.

### Can Memcached persist data to disk?

No, never - this is a deliberate design choice, not a missing feature. A Memcached restart or crash means a completely cold cache. If persistence matters for your use case, Memcached is the wrong tool regardless of how well its simple key-value model otherwise fits.

### How does Memcached handle multiple server nodes?

Through client-side consistent hashing - the client library decides which node a given key belongs to, and Memcached nodes have no awareness of or communication with each other. This is different from Redis Cluster, where the cluster itself manages data distribution and replication server-side.

### What happens if a Memcached node goes down?

Every key that hashed to that node becomes unavailable - there's no replication to fall back on, since nodes don't communicate. Your application needs to treat this as an expected cache miss (falling through to the real data source) rather than a hard failure, and be aware that losing a node effectively means losing that portion of your cached data until it's repopulated.

### Is there a size limit on what I can store in Memcached?

Yes - by default, keys are limited to around 250 bytes and values to about 1MB, both configurable but worth knowing as defaults. This is generally smaller than what you'd hit caching similar data in Redis, so it's worth checking before assuming a large object will cache without issue.

### Should I use Memcached or Redis for session state?

Redis is the far more common choice for session state in .NET, mainly because Memcached's total lack of persistence means a Memcached restart logs every active user out. If session loss on a cache restart is unacceptable, which it usually is, Redis's optional persistence makes it the safer default.

### What's the most common mistake when adopting Memcached?

Choosing it out of familiarity or simplicity when the actual caching need has already outgrown simple key-value - needing to cache a list, a set, or anything with more structure than a flat value is a clear signal Memcached isn't the right fit, and reaching for Redis or another richer cache would save a workaround later.
