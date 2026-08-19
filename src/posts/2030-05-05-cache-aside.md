---
author: Steve Kaschimer
date: 2030-05-05
image: /images/posts/2030-05-05-hero.webp
image_alt: "A layered disc glyph positioned in front of a database cylinder, with a small lightning accent implying an intercepted fast path."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small amber layered-disc glyph positioned in front of a teal database-cylinder shape behind it, with one small off-white lightning-bolt accent between them, implying a fast intercepted path checked before the slower source is reached. Mood is fast but provisional. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Load frequently read data into a cache on demand while explicitly handling misses, invalidation, staleness, stampedes, expiration, and multi-instance behavior."
tags: ["dotnet", "architecture", "design-patterns", "caching"]
title: "Cache-Aside: Faster Reads Without Pretending Caches Are Simple"
---



Caching is often introduced as:
```text
put data in Redis
application gets faster
```

The hard part is not storing data. The hard part is deciding when cached data is valid. Cache-Aside is a common pattern where the application explicitly manages cache population.

## Read Flow

```text
Request
  |
Cache lookup
  |
  +-- hit --> return
  |
  +-- miss
        |
        v
     Database
        |
        v
   Populate cache
        |
        v
      Return
```

The cache is populated only when data is requested.

## Example

```csharp
public async Task<ProductDto?> GetAsync(
    ProductId id,
    CancellationToken cancellationToken)
{
    var key = $"product:{id.Value}";

    var cached = await cache.GetAsync<ProductDto>(
        key,
        cancellationToken);

    if (cached is not null)
        return cached;

    var product = await database.Products
        .AsNoTracking()
        .Where(x => x.Id == id)
        .Select(x => new ProductDto(
            x.Id.Value,
            x.Name,
            x.Price))
        .SingleOrDefaultAsync(cancellationToken);

    if (product is not null)
    {
        await cache.SetAsync(
            key,
            product,
            TimeSpan.FromMinutes(5),
            cancellationToken);
    }

    return product;
}
```

This is the happy path. Now the real architecture begins.

## Staleness

Suppose:
```text
cache: price = $100
database updated: price = $80
```

Until expiration or invalidation:
```text
reader sees $100
```

Is that acceptable? For a marketing description, maybe. For available bank balance, probably not. Cache strategy is a consistency decision.

## Invalidation

The famous hard problem. Common approaches:
```text
TTL expiration
explicit invalidation on write
versioned keys
event-driven invalidation
```

Each has trade-offs.

## Invalidate on Write

```text
Update database
Delete cache key
```

But this is another dual-write sequence. What if:
```text
DB update succeeds
cache delete fails
```

Stale data remains. For strict correctness, caching may not be appropriate for that data. For tolerant use cases, TTL bounds the stale period.

## Expiration

TTL is simple and powerful.
```text
product metadata: 10 minutes
feature configuration: 1 minute
```

Choose TTL from business tolerance for staleness, not arbitrary round numbers.

## Cache Stampede

A popular key expires.
```text
10,000 requests
all miss
all hit database
```

The cache protected the database until the exact moment it became most dangerous. Mitigations include:
- request coalescing;
- per-key locking;
- stale-while-revalidate;
- randomized expiration;
- background refresh.

## Negative Caching

If a missing resource is repeatedly requested:
```text
cache "not found"
```

for a short period. But be careful: if the resource is created moments later, the negative cache can hide it. Use shorter TTLs for negative entries.

## Local vs. Distributed Cache

In-memory cache:
```text
fast
simple
per-instance
```

Distributed cache:
```text
shared across instances
network hop
operational dependency
serialization
```

Do not deploy Redis merely because the application has more than one endpoint. Use it when shared caching provides meaningful value.

## Cache Failure

Ask:
> What happens if the cache is unavailable?

Often the application should fall back to the database. But if every instance suddenly bypasses cache:
```text
cache outage
   |
database receives full load
   |
database outage
```

That is a cascading-failure risk. Capacity planning must account for cache loss.

## Cache Penetration

Attackers or accidental clients can request huge numbers of nonexistent keys:
```text
product:random-1
product:random-2
...
```

Every miss reaches the database. Negative caching, request validation, rate limiting, and probabilistic structures can help in extreme cases.

## Cache Key Design

Keys are contracts too. Include dimensions that affect the value:
```text
tenant
locale
currency
user permissions
version
```

A missing dimension can become a data-isolation bug.

## Security

Never accidentally serve one user's cached private data to another. A key such as:
```text
/dashboard
```

is dangerous if the response depends on user identity. Cache only data whose scope is explicit.

## Serialization

Distributed caches store serialized data. Schema changes matter. Version cache entries or tolerate old representations during rolling deployments.

## Cache-Aside and CQRS

Read models are natural cache candidates.
```text
Query
  |
Cache
  |
Read Model
```

The write model remains authoritative. This keeps cache concerns away from domain invariants.

## Observability

Track:
```text
hit rate
miss rate
load latency
cache latency
evictions
memory usage
stampede/coalescing rate
fallback rate
```

Hit rate alone is insufficient. A 99% hit rate can still overload the database if the remaining 1% represents enormous traffic.

## Testing

Test:
```text
hit
miss
expiration
invalidation
cache unavailable
concurrent miss
tenant/user isolation
serialization compatibility
```

Load-test stampede scenarios.

## When It Helps

Use Cache-Aside when:
- reads are repeated;
- source access is expensive;
- some staleness is acceptable;
- data has a useful reuse window.

## When It Hurts

Caching hurts when:
- data must always be current;
- access is rarely repeated;
- invalidation complexity exceeds the performance benefit;
- the cache becomes an unplanned source of truth.

## Summary

Cache-Aside is simple to draw and difficult to operate well. The algorithm is:
```text
look in cache
miss -> load source
populate cache
```

The architecture is:
```text
staleness
invalidation
expiration
stampedes
security
failure behavior
capacity
```

Use caching when you can state the consistency trade explicitly. If you cannot explain how stale the data may be, you do not yet have a cache design.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
