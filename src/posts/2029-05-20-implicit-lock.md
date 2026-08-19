---
author: Steve Kaschimer
date: 2029-05-20
image: /images/posts/2029-05-20-hero.webp
image_alt: "A padlock glyph embedded seamlessly into the frame of a larger structural shape rather than attached as a separate visible object, implying protection built into the structure itself."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single teal structural frame glyph with a small amber padlock shape embedded seamlessly into one of its corners, flush with no visible seam, implying protection built directly into the structure itself rather than applied as a separate, rememberable step. Mood is built-in and quietly reliable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A locking strategy is only reliable if every relevant operation follows it - Implicit Lock moves that enforcement into framework or infrastructure code so developers can't accidentally forget it. Covers EF Core's automatic concurrency-token checking as the clearest modern example, and why implicit behavior still needs to stay explicit in diagnostics and documentation."
tags: ["dotnet", "architecture", "design-patterns", "concurrency"]
title: "Implicit Lock in Modern .NET"
---



Implicit Lock moves lock acquisition and concurrency enforcement into framework or infrastructure code so developers do not have to remember to apply it manually. That matters because a locking strategy is only reliable if every relevant operation follows it.

## The Dangerous Version

Suppose developers must remember:
``` csharp
await lockManager.AcquireAsync(order.Id, ct);

order.Submit();

await repository.SaveAsync(order, ct);

await lockManager.ReleaseAsync(order.Id, ct);
```

Eventually, someone writes:
``` csharp
order.Cancel();
await repository.SaveAsync(order, ct);
```

and forgets the lock. One missing call can invalidate the concurrency strategy.

## Make the Rule Structural

A better approach makes concurrency part of the persistence mechanism. EF Core optimistic concurrency is a good modern example:
``` csharp
builder.Property(x => x.Version)
    .IsConcurrencyToken();
```

Application code simply performs normal work:
``` csharp
order.Submit();

await db.SaveChangesAsync(cancellationToken);
```

EF Core automatically includes the original concurrency token in the update condition. The developer does not explicitly acquire an optimistic lock for every operation.

## SQL Server Rowversion

For SQL Server:
``` csharp
builder.Property(x => x.Version)
    .IsRowVersion();
```

The database updates the token, and EF Core compares the original token during persistence. The concurrency rule becomes part of the mapping metadata. That is a strong form of implicit enforcement.

## A Unit of Work Boundary

A custom Unit of Work can also centralize conflict translation:
``` csharp
public sealed class EfUnitOfWork(
    AppDbContext db)
{
    public async Task CommitAsync(
        CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException exception)
        {
            throw new ConcurrencyConflictException(
                "The data changed before the transaction committed.",
                exception);
        }
    }
}
```

Application services no longer repeat exception translation.

## SaveChanges Interceptors

EF Core interceptors can enforce cross-cutting persistence behavior. For application-managed version tokens, an interceptor could identify modified concurrency-protected entities and assign new versions before saving. Conceptually:
``` csharp
public interface IVersionedEntity
{
    Guid Version { get; set; }
}
```

Then infrastructure code ensures every modified entity receives a new token. This reduces the chance that a developer forgets to update the version.

## Domain Base Types

A Layer Supertype can also make the rule harder to miss:
``` csharp
public abstract class VersionedEntity
{
    public Guid Version { get; protected set; }
}
```

Common EF Core configuration can then mark every derived entity's `Version` property as a concurrency token. Be careful not to force unrelated entities into inheritance merely for infrastructure convenience.

## Pessimistic Locks

Implicit Lock can also support pessimistic strategies. For example, an application service decorator might acquire a logical resource lock before invoking a command handler:
``` text
HTTP request
   |
Authorization
   |
Locking decorator
   |
Command handler
   |
Unit of Work
```

The handler does not need to remember lock acquisition.

## Decorators

Imagine:
``` csharp
public interface ICommandHandler<TCommand>
{
    Task HandleAsync(
        TCommand command,
        CancellationToken cancellationToken);
}
```

A decorator can apply a locking policy:
``` csharp
public sealed class LockingHandler<TCommand>(
    ICommandHandler<TCommand> inner,
    ILockPolicy<TCommand> policy,
    IOfflineLockManager locks)
    : ICommandHandler<TCommand>
{
    public async Task HandleAsync(
        TCommand command,
        CancellationToken cancellationToken)
    {
        var resource = policy.GetResource(command);

        await using var lease =
            await locks.AcquireAsync(
                resource,
                cancellationToken);

        await inner.HandleAsync(
            command,
            cancellationToken);
    }
}
```

The concurrency concern becomes infrastructure rather than handler boilerplate.

## Metadata-Driven Lock Policies

A framework can derive locking behavior from metadata:
``` csharp
[RequiresOfflineLock("Order")]
public sealed record SubmitOrder(
    OrderId OrderId);
```

or through registration:
``` csharp
services.AddLockPolicy<SubmitOrder>(
    command => LockResource.For(command.OrderId));
```

The second approach avoids putting infrastructure attributes on application messages.

## Why Implicit Behavior Is Risky Too

Hidden behavior can surprise developers. A call that appears simple:
``` csharp
await handler.HandleAsync(command, ct);
```

may now:
-   acquire a distributed lease,
-   wait,
-   fail because of contention,
-   renew a lease,
-   release it.

Implicit infrastructure must therefore be observable and documented.

## Logging and Diagnostics

Record:
-   resource being locked,
-   acquisition duration,
-   contention,
-   lease expiration,
-   concurrency conflicts,
-   retry attempts.

Automatic locking that cannot be diagnosed is difficult to operate.

## Avoid Magical Lock Discovery

Do not build an elaborate reflection system that guesses which objects a command might modify. Prefer explicit policies declared centrally. The goal is to remove repetitive lock calls, not to hide the concurrency model.

## Testing

Test the infrastructure itself:
``` text
protected commands acquire locks
unprotected commands do not
locks release on success
locks release on failure
concurrency exceptions translate consistently
```

Then application-handler tests can focus on business behavior.

## When to Use It

Implicit Lock is valuable when:
-   concurrency rules must never be skipped,
-   many operations share the same policy,
-   infrastructure can reliably identify the lock boundary,
-   repeated explicit locking would be error-prone.

## When Explicit Is Better

For rare, unusual, or highly visible locks, explicit acquisition may communicate intent more clearly. Not every cross-cutting concern benefits from being hidden.

## Related Patterns

-   Optimistic Offline Lock
-   Pessimistic Offline Lock
-   Coarse-Grained Lock
-   Unit of Work
-   Layer Supertype

## Summary

Implicit Lock makes concurrency protection part of the application's infrastructure rather than a convention every developer must remember. EF Core's automatic concurrency-token checking is a modern example of the principle. The pattern improves consistency, but implicit behavior should remain explicit in architecture, diagnostics, and documentation.
