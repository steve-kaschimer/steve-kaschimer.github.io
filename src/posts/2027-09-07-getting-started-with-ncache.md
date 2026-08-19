---
author: Steve Kaschimer
date: 2027-09-07
image: /images/posts/2027-09-07-hero.webp
image_alt: "A peer-to-peer mesh of three connected nodes drawn in an angular native style, each node holding its own storage rather than routing through a single central hub."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on three angular node shapes arranged in a triangle, each connected directly to the other two by thin teal lines with no central hub, implying peer-to-peer distribution rather than primary/replica hierarchy. A small amber badge on one node represents native .NET object storage, distinct from a generic serialized-blob icon. Mood is purpose-built, enterprise, and precise. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "NCache's whole pitch is being the distributed cache built for .NET rather than adapted to it - ASP.NET Core session state and EF Core query caching are first-class integrations, not something assembled on top of a generic IDistributedCache. A setup guide for named caches, native object caching, and the purpose-built session and EF Core integrations."
tags: ["dotnet", "caching", "architecture", "developer-productivity"]
title: "Getting Started with NCache in .NET"
---



NCache's whole pitch is being the distributed cache built for .NET rather than adapted to it, and that shows up most clearly in the setup itself - ASP.NET Core session state and EF Core query caching are first-class, purpose-built integrations rather than something you assemble yourself on top of a generic `IDistributedCache` implementation. The trade-off is a smaller ecosystem and, for the full feature set, a commercial license - worth knowing upfront rather than discovering halfway through evaluation.

This guide covers installing and connecting to NCache from .NET, bootstrapping a cache and its ASP.NET Core integrations, the core read/write/session workflow, and the best practices that make the most of its .NET-native design. By the end you'll have a working NCache setup and a clear sense of which of its enterprise features are worth turning on for your specific workload.

If you're deciding between caching options first, [a comparison of the top .NET caching solutions](/posts/2027-08-03-top-5-dotnet-caching-solutions-compared/) covers where NCache fits relative to `IMemoryCache`, Redis, Memcached, and Garnet.

## What You'll Need

- .NET 8 SDK or later
- An NCache installation - Open Source edition is available for evaluation and smaller deployments; Enterprise unlocks the full feature set (write-behind caching, advanced replication, peer-to-peer clustering)
- A running NCache cache server, either locally or in your target environment

## Installing NCache

Install the NCache server following Alachisoft's setup instructions for your platform, then add the client SDK to your .NET project:

```bash
dotnet add package Alachisoft.NCache.SDK
```

Create a named cache through NCache's management tools (the NCache Web Manager, or `createcache` from the command line) before connecting to it from your application - unlike Redis, where a database exists implicitly the moment you connect, NCache caches are provisioned as named, configured entities.

## Bootstrapping the Ideal Environment

### Connecting to a cache

```csharp
using Alachisoft.NCache.Client;

var builder = WebApplication.CreateBuilder(args);

var cache = CacheManager.GetCache("myAppCache");
builder.Services.AddSingleton(cache);
```

`CacheManager.GetCache` returns a connection to a named cache cluster - like Redis's connection multiplexer, this should be created once and shared, not reconnected per request.

### Basic get/set

```csharp
public class ProductService(ICache cache, IProductRepository repository)
{
    public async Task<Product?> GetProductAsync(int id)
    {
        var cacheKey = $"product:{id}";
        if (cache.Contains(cacheKey))
            return cache.Get<Product>(cacheKey);

        var product = await repository.GetByIdAsync(id);
        if (product is not null)
        {
            cache.Insert(cacheKey, product, new CacheItemExpiration(TimeSpan.FromMinutes(30)));
        }
        return product;
    }
}
```

NCache caches native .NET objects directly - no manual JSON serialization step the way raw `IDistributedCache` requires, since NCache's client handles object serialization internally.

### ASP.NET Core session state, the purpose-built way

This is one of NCache's strongest differentiators over a generic `IDistributedCache`-based session provider:

```csharp
builder.Services.AddNCacheSession(options =>
{
    options.CacheName = "myAppCache";
});

builder.Services.AddSession();
```

```csharp
app.UseSession();
```

Sessions stored this way are replicated according to your cache cluster's topology, so a session isn't lost if a specific cache node goes down - a concern that's handled at the infrastructure level rather than something you build yourself.

### EF Core integration

NCache offers extension methods specifically for caching EF Core query results:

```csharp
var activeOrders = await db.Orders
    .Where(o => o.Status == OrderStatus.Processing)
    .FromCache(TimeSpan.FromMinutes(10)) // NCache extension method
    .ToListAsync();
```

This caches query results transparently at the EF Core query level, which is a meaningfully different (and more automatic) approach than manually wrapping repository methods in cache-aside logic yourself.

## Core Workflow

- **Use named caches deliberately, provisioned ahead of time.** Unlike Redis's implicit key namespace, NCache caches are explicit, configured entities - decide your cache topology (replicated, partitioned, client cache) as part of setup, not as an afterthought.
- **Lean on native object caching rather than manual serialization.** This is one of the concrete conveniences of NCache's .NET-native design - don't reintroduce JSON serialization boilerplate that the client already handles.
- **Use write-behind caching for write-heavy workloads where eventual database consistency is acceptable.** NCache can batch writes to your database asynchronously rather than requiring every cache write to also block on a synchronous database write.

```csharp
// Explicit invalidation on write
public async Task UpdateProductAsync(Product product)
{
    await repository.UpdateAsync(product);
    cache.Remove($"product:{product.Id}");
}
```

## Verifying Your Setup

1. **Cache connection is a shared singleton** - confirm `CacheManager.GetCache` is called once and the resulting connection is reused, not recreated per request
2. **Session state survives a node failure** - if using replicated topology, test that a session remains available after taking one cache node offline
3. **EF Core query caching is actually hitting the cache** - confirm a repeated query within the cache window doesn't re-execute against the database
4. **Expiration and eviction policies match your data's actual change frequency** - audit cache entries for appropriate expiration rather than defaults copied from a tutorial

## Best Practices

**Provision named caches with a deliberate topology, not a default.** NCache's peer-to-peer, replicated, and partitioned topologies each suit different workloads - pick based on your actual availability and scale requirements rather than accepting whatever a quickstart guide used.

**Use the ASP.NET Core session and EF Core integrations instead of building your own.** These are exactly the areas where NCache's .NET-native design pays off over a generic distributed cache - using them is the whole reason to choose NCache in the first place.

**Reserve write-behind caching for workloads that can tolerate eventual database consistency.** It's a powerful feature for write-heavy scenarios, but it changes your consistency guarantees - understand the trade-off before enabling it broadly.

**Share one cache connection across your application**, the same discipline `IConnectionMultiplexer` requires with Redis - `CacheManager.GetCache` shouldn't be called repeatedly per request.

**Confirm which features require Enterprise licensing before architecting around them.** Some of NCache's more advanced capabilities (certain replication and clustering options) require the commercial edition - verify what your evaluation or open-source setup actually supports before committing to a design that assumes them.

## Comparison with Redis

| | NCache | Redis |
| --- | --- | --- |
| .NET integration | Native, purpose-built | Mature client library, not .NET-native |
| Object caching | Native .NET objects, automatic serialization | Requires manual serialization, or HybridCache's built-in handling |
| ASP.NET Core session | Deep, purpose-built provider | Via generic IDistributedCache session provider |
| EF Core integration | Purpose-built extension methods | Requires custom cache-aside logic |
| Ecosystem | Smaller, .NET-focused | Largest of any option in this comparison |
| Licensing | Commercial for full feature set | Open-source core, licensing has shifted over time |

NCache's advantage is depth of integration specifically within the .NET and Microsoft ecosystem; Redis's advantage is breadth - more tooling, more community knowledge, and applicability beyond .NET if your organization is polyglot.

## Frequently Asked Questions

### Do I need to create a cache before connecting to it, unlike Redis?

Yes - NCache caches are named, explicitly provisioned entities configured through NCache's management tools before your application connects to them. This is different from Redis, where you connect to a server and start using keys immediately without a separate provisioning step.

### Does NCache require manual object serialization like raw IDistributedCache does with Redis?

No - NCache's client caches native .NET objects directly, handling serialization internally. This is one of its concrete .NET-native conveniences compared to working with raw `IDistributedCache`, where you'd typically serialize to JSON yourself, unless you're using `HybridCache`, which handles this for you regardless of backend.

### Is NCache free to use?

NCache offers an Open Source edition suitable for evaluation and smaller deployments, with an Enterprise edition unlocking the full feature set - advanced replication topologies, write-behind caching, and other enterprise capabilities. Confirm which edition covers the specific features your design depends on before committing.

### How does NCache's session state provider compare to using Redis for sessions?

NCache's session provider is purpose-built with replication awareness specific to NCache's cache topology, generally requiring less manual configuration than assembling equivalent behavior around Redis's `IDistributedCache`-based session provider. Both are viable in production; NCache's is more turnkey specifically because it's built for exactly this use case.

### What's write-behind caching, and when should I use it?

Write-behind caching lets NCache batch and asynchronously flush writes to your actual database rather than requiring every cache write to synchronously also write through to the database. It improves write throughput at the cost of eventual, not immediate, database consistency - appropriate for write-heavy workloads that can tolerate a short window where the cache is ahead of the database, not appropriate where every write needs to be immediately durable.

### Can I use NCache and Redis together, or should I pick one?

Technically you could run both for different purposes, but that's unusual and adds operational complexity without a clear benefit for most teams - pick one as your primary distributed cache based on whether native .NET integration (NCache) or ecosystem breadth (Redis) matters more for your situation, rather than running both.

### What's the most common mistake in a first NCache setup?

Treating it like a drop-in Redis replacement and missing its purpose-built ASP.NET Core session and EF Core integrations - which is where NCache's .NET-native design actually pays off. The second common mistake is not confirming upfront which features require Enterprise licensing, leading to a design that assumes capabilities the deployed edition doesn't actually include.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
