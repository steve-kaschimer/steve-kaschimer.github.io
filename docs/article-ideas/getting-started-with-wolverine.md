# Getting Started with Wolverine in .NET

Wolverine is the one entry in this series where "getting started with background jobs" and "getting started with the whole library" are almost the same document -- scheduling is one feature of a much broader messaging framework, not the framework's reason for existing. That's worth internalizing before you write any code: if you came here purely for a job scheduler, Wolverine's in-process mediation, distributed messaging, and durable outbox are all things you're adopting alongside scheduling, not optional extras you can ignore.

This guide covers installing Wolverine, bootstrapping handlers and the durable outbox that gives scheduled and published messages real delivery guarantees, the core patterns for commands, events, and scheduled jobs under one handler model, and the best practices for using Wolverine's breadth deliberately rather than accidentally. By the end you'll understand both how to schedule background work in Wolverine and why that capability sits inside a larger design.

If you're deciding between background job libraries first, a comparison of the top .NET background job libraries covers where Wolverine fits relative to Hangfire, Quartz.NET, Coravel, and Azure Functions -- including why it's usually the wrong choice if scheduling is genuinely your only need.

## What You'll Need

- .NET 8 SDK or later
- A database if you want the durable outbox -- SQL Server or PostgreSQL (via Marten) are supported
- Some familiarity with message-driven thinking (commands, events, handlers), since that's Wolverine's core vocabulary

## Installing Wolverine

```bash
dotnet add package WolverineFx
```

For durable outbox support with SQL Server:

```bash
dotnet add package WolverineFx.SqlServer
```

## Bootstrapping the Ideal Environment

### Registering Wolverine

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseWolverine(opts =>
{
    opts.PersistMessagesWithSqlServer(builder.Configuration.GetConnectionString("Wolverine")!);
    opts.Services.AddDbContext<AppDbContext>(dbOpts =>
        dbOpts.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
});

var app = builder.Build();
app.Run();
```

Unlike MediatR, Wolverine doesn't require implementing `IRequest` or `IRequestHandler<T>` interfaces -- handlers are discovered by naming and parameter convention, which is part of what keeps its handler code notably free of framework-specific ceremony.

### Handlers: no interfaces required

```csharp
public record ProcessOrderCommand(int OrderId);

public class ProcessOrderHandler
{
    public static async Task Handle(ProcessOrderCommand command, AppDbContext db, ILogger<ProcessOrderHandler> logger)
    {
        var order = await db.Orders.FindAsync(command.OrderId);
        if (order is null) throw new OrderNotFoundException(command.OrderId);

        order.Status = OrderStatus.Processing;
        await db.SaveChangesAsync();

        logger.LogInformation("Order {OrderId} processed", command.OrderId);
    }
}
```

Wolverine finds this handler by convention -- a public method named `Handle` (or `HandleAsync`) taking the message type as its first parameter -- and generates the dispatch code at compile time via source generators, rather than resolving it through runtime reflection the way MediatR does.

### Scheduled jobs

Wolverine has a distinct concept for background jobs specifically: scheduled jobs that send messages, separate from the message handling itself.

```csharp
public class CleanupExpiredOrdersJob
{
    public async Task ExecuteAsync(IMessageBus bus) =>
        await bus.SendAsync(new CleanupExpiredOrdersCommand());
}
```

```csharp
builder.Host.UseWolverine(opts =>
{
    opts.Schedule.CronJob<CleanupExpiredOrdersJob>("0 */5 * * * ?");
});
```

The job itself doesn't contain the actual cleanup logic -- it sends a command, and a separate handler processes that command. This indirection is deliberate: it means the same durability, retry, and outbox guarantees that apply to any Wolverine message also apply to work triggered by a schedule.

### The durable outbox: real delivery guarantees

```csharp
public class OrderService(IMessageBus bus, AppDbContext db)
{
    public async Task PlaceOrderAsync(Order order)
    {
        db.Orders.Add(order);
        await bus.PublishAsync(new OrderPlacedEvent(order.Id));
        await db.SaveChangesAsync(); // Wolverine coordinates this with the outbox
    }
}
```

With the outbox configured, the database write and the message publish are committed atomically -- either both happen, or neither does. This solves a real, easy-to-miss reliability problem: publishing a message and then having the corresponding database transaction fail (or vice versa) leaves your system in an inconsistent state without an outbox coordinating the two.

### Delayed messages, without a separate scheduling concept

```csharp
await bus.ScheduleAsync(new CancelIfUnpaidCommand(orderId), TimeSpan.FromHours(24));
```

Unlike the cron-based scheduled job above, this schedules a one-time message for future delivery -- conceptually similar to Hangfire's `Schedule` method, but using the same message/handler model as everything else in Wolverine rather than a separate job API.

## Core Workflow

- **Model background work as messages with handlers, not standalone job classes.** This is the core mental shift from the other four tools in this series -- Wolverine wants you thinking in commands and events, with scheduling as one way those messages get triggered.
- **Use the durable outbox for anything where message delivery correctness matters**, not just for distributed messaging -- even in-process publishing benefits from the same durability guarantees.
- **Reserve cron-style scheduled jobs for genuinely recurring work, and delayed messages for one-time future execution.** Wolverine's `Schedule.CronJob` and `bus.ScheduleAsync` map to these two distinct needs respectively.

## Verifying Your Setup

1. **Handlers are discovered correctly** -- confirm Wolverine's startup diagnostics (or a test message) show your handler being found by convention, not silently ignored due to a naming mismatch
2. **The outbox is actually coordinating writes and publishes** -- test a scenario where the database write would fail and confirm the corresponding message isn't published either
3. **Scheduled jobs fire on their cron schedule** -- confirm a `CronJob` registration executes at the expected interval
4. **Delayed messages arrive at the expected time** -- confirm `ScheduleAsync` messages are delivered close to their intended delay, not immediately or dropped

## Best Practices

**Don't adopt Wolverine purely for scheduling if that's genuinely your only need.** Its scope is much broader than a scheduler, and taking on that scope for one feature is a poor trade unless you're also getting value from its messaging capabilities.

**Use the durable outbox whenever message delivery correctness actually matters.** The atomic coordination between database writes and message publishing is one of Wolverine's most concretely valuable features -- underusing it means missing much of the reliability benefit of adopting Wolverine at all.

**Keep handler methods focused and let Wolverine's middleware handle cross-cutting concerns.** Wolverine's middleware model integrates directly into the generated dispatch code (rather than a runtime pipeline), which is part of its performance advantage -- use it for logging, validation, and transaction handling rather than repeating that logic in every handler.

**Model scheduled cron jobs as message-senders, not as containers for the actual work.** The pattern shown above -- a scheduled job sends a command, a separate handler does the work -- keeps the same delivery guarantees and testability as any other Wolverine message.

**If you're already using MediatR and considering Wolverine, evaluate it as a broader replacement, not a drop-in swap.** Wolverine's value is in unifying in-process mediation with messaging and scheduling -- treating it as "MediatR but faster" undersells (and underuses) what it actually offers.

## Comparison with Hangfire

| | Wolverine | Hangfire |
| --- | --- | --- |
| Scope | Full messaging framework (in-process, distributed, scheduling) | Background job processing specifically |
| Handler model | Convention-based, no interfaces, source-generated | `IBackgroundJobClient`, method expressions |
| Delivery guarantees | Durable outbox, atomic with database writes | Retry-based, storage-backed |
| Dashboard | None dedicated | Yes, built in |
| Best fit | Teams already doing (or planning) message-driven architecture | Most teams wanting jobs with visibility |

If your system's architecture is already (or heading toward) message-driven -- CQRS, event-driven service communication -- Wolverine unifying that with scheduling under one model is a real advantage. If you just need reliable background jobs with visibility, Hangfire remains the more direct fit.

## Frequently Asked Questions

### Do I need to use Wolverine's messaging features to use its scheduling, or can I use scheduling alone?

Technically you can use just the scheduling pieces, but doing so means adopting Wolverine's full conceptual model (handlers, message dispatch, the outbox) for a feature set Hangfire or Quartz.NET would give you with far less overhead. If scheduling really is your only need, those tools are the more direct fit.

### What's the difference between Schedule.CronJob and bus.ScheduleAsync?

`Schedule.CronJob` registers a recurring job on a cron expression, evaluated at startup and run on that schedule going forward. `bus.ScheduleAsync` schedules a one-time message for delivery after a specified delay, called from application code at the point you want to schedule something -- conceptually closer to Hangfire's `Schedule` method for delayed jobs.

### How does Wolverine's durable outbox actually work?

It coordinates a database transaction (via EF Core or Marten) with message publishing, so both are committed atomically as a single unit -- if the database transaction fails, the message isn't published, and vice versa. This solves the classic "dual write" problem where publishing a message and writing to a database independently can end up inconsistent if one succeeds and the other fails.

### Is Wolverine faster than MediatR?

Generally yes, for in-process dispatch -- Wolverine uses compile-time source generation to build dispatch code rather than MediatR's runtime reflection-based approach, which shows up as reduced startup cost and lower per-call overhead, particularly in larger applications with many handlers.

### Does Wolverine require external infrastructure like RabbitMQ or Azure Service Bus?

Not necessarily -- Wolverine supports in-memory transport for purely in-process messaging and scheduling, with RabbitMQ, Azure Service Bus, and other transports available when you need genuinely distributed messaging between services. The durable outbox does require a database (SQL Server or PostgreSQL via Marten) if you want that specific guarantee.

### Should I migrate from MediatR to Wolverine?

Consider it if you're already finding yourself bolting distributed messaging, an outbox, or scheduling onto MediatR via separate libraries -- Wolverine unifies those under one model. If MediatR is meeting your needs as a pure in-process mediator with no messaging ambitions, there's less urgency, though MediatR's shift toward commercial licensing is a separate factor worth weighing for some teams.

### What's the most common mistake when adopting Wolverine?

Adopting it purely for background job scheduling without realizing (or wanting) the broader messaging framework that comes with it, leading to unnecessary conceptual overhead for teams that just needed a scheduler. The second common mistake is not using the durable outbox where it would actually matter, missing one of Wolverine's most concrete reliability benefits.
