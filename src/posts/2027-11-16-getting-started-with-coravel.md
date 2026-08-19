---
author: Steve Kaschimer
date: 2027-11-16
image: /images/posts/2027-11-16-hero.webp
image_alt: "A minimal single fluent-arrow glyph with no supporting infrastructure beneath it, chained through three small readable link segments ending in a plain clock marker."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single thin teal arrow built from three small connected link segments, chained left to right, terminating in a plain unadorned clock marker with no cylinder, database, or panel shape anywhere beneath it, emphasizing zero supporting infrastructure. Mood is minimal, fast, and unburdened. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clock clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Coravel's whole value proposition is that it doesn't ask you for anything - no database, no storage configuration, no dashboard to secure. A setup guide for the fluent scheduling API, PreventOverlapping, and knowing exactly where its zero-infrastructure boundaries are."
tags: ["dotnet", "tooling", "developer-productivity"]
title: "Getting Started with Coravel in .NET"
---



Coravel's whole value proposition is that it doesn't ask you for anything - no database, no storage configuration, no dashboard to secure. You add a package, write a fluent scheduling expression, and you're done. That simplicity is genuinely the point, not a limitation to work around, but it does mean the setup guide for Coravel is mostly about knowing exactly where its boundaries are, so you don't discover them the hard way after a restart wipes your schedule state.

This guide covers installing Coravel, bootstrapping its scheduler (and its optional queuing and caching helpers), the core scheduling workflow, and the best practices for using Coravel specifically within the scope it's designed for. By the end you'll know exactly when Coravel's zero-infrastructure model is the right fit and when it's time to graduate to something with persistence.

If you're deciding between background job libraries first, [a comparison of the top .NET background job libraries](/posts/2027-10-26-top-5-dotnet-background-job-libraries-compared/) covers where Coravel fits relative to Hangfire, Quartz.NET, Azure Functions, and Wolverine.

## What You'll Need

- .NET 8 SDK or later
- Nothing else - no database, no external service, which is the entire point

## Installing Coravel

```bash
dotnet add package Coravel
```

## Bootstrapping the Ideal Environment

### Registering the scheduler

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScheduler();
builder.Services.AddTransient<DailySalesReportJob>();

var app = builder.Build();

app.Services.UseScheduler(scheduler =>
{
    scheduler.Schedule<DailySalesReportJob>()
        .DailyAtHour(6)
        .PreventOverlapping("daily-sales-report");
});

app.Run();
```

`PreventOverlapping` is worth using by default on any job whose execution time could plausibly exceed its scheduling interval - it stops a slow-running job from starting a second overlapping execution before the first finishes.

### Defining an invocable job

```csharp
public class DailySalesReportJob(IReportService reportService, ILogger<DailySalesReportJob> logger) : IInvocable
{
    public async Task Invoke()
    {
        logger.LogInformation("Generating daily sales report");
        await reportService.GenerateDailySalesReportAsync();
    }
}
```

`IInvocable` is Coravel's job interface - register the class with DI, and Coravel resolves it fresh for each invocation, so constructor injection works normally.

### Coravel's fluent scheduling API

```csharp
scheduler.Schedule<CleanupTempFilesJob>().Hourly();
scheduler.Schedule<SendDigestEmailJob>().Weekly().Monday().At(9, 0);
scheduler.Schedule<HealthCheckJob>().EveryFiveMinutes();
scheduler.Schedule<CustomCronJob>().Cron("0 */3 * * *"); // cron is also supported directly
```

The fluent syntax covers the common cases readably; cron expressions remain available directly for anything the fluent API doesn't have a named method for.

## Core Workflow

- **Schedule jobs at startup, once, in `UseScheduler`.** There's no runtime API for dynamically adding schedules the way some other tools support - Coravel's scheduling is defined declaratively when the app starts.
- **Use `PreventOverlapping` for anything whose duration is uncertain.** Without it, a slow job and a short interval can result in overlapping executions competing for the same resources.
- **Remember schedule state doesn't persist.** A restart clears everything - Coravel re-registers the schedule from your `UseScheduler` code on every startup, which is fine since nothing was meant to persist independently of that code anyway.

## Verifying Your Setup

1. **Jobs fire on the expected schedule** - confirm a short-interval test job (like `EveryMinute()`) executes as expected before trusting a longer production schedule
2. **`PreventOverlapping` is applied where needed** - for any job whose execution time could exceed its interval, confirm overlapping runs are actually prevented
3. **Only one instance is running Coravel's scheduler, if you're horizontally scaled** - since Coravel has no built-in multi-instance coordination, confirm you're not accidentally running the same schedule redundantly across instances
4. **Jobs are resolved through DI correctly** - confirm constructor-injected dependencies in your `IInvocable` classes resolve as expected

## Best Practices

**Use Coravel specifically for single-instance applications with a small number of straightforward jobs.** This is the scope it's designed for - stretching it beyond that (multiple instances, jobs needing persistence or history) means fighting the tool rather than using it as intended.

**Always use `PreventOverlapping` unless you're certain a job's duration will never exceed its schedule interval.** This is cheap insurance against a slow job compounding into multiple overlapping executions.

**If you scale to multiple instances, either accept redundant execution for idempotent jobs, or move to a tool with coordination support.** Coravel has no built-in mechanism to prevent every instance from independently running the same schedule - know this going in rather than discovering it in production.

**Don't rely on Coravel for anything where a missed or failed job needs to be visible after the fact.** There's no dashboard or job history - if visibility into failures matters, either add your own logging/alerting around each job or reach for a tool (like Hangfire) that provides this natively.

**Treat Coravel's queuing and caching helpers as convenient extras, not a reason alone to adopt it.** They're useful if you're already using Coravel for scheduling, but not compelling enough on their own to choose over dedicated caching (Redis, `IMemoryCache`) or queuing tools.

## Comparison with Hangfire

| | Coravel | Hangfire |
| --- | --- | --- |
| Setup effort | Lowest - zero infrastructure | Low, but requires storage |
| Persistence | None | Yes |
| Dashboard | None | Yes, built in |
| Multi-instance coordination | None | Yes, via shared storage |
| Best fit | Small apps, single instance, simple jobs | Most teams wanting jobs with visibility and durability |

Coravel is the right choice specifically when Hangfire's infrastructure (a database, a dashboard to secure) is more than your application actually needs - the moment persistence, multi-instance coordination, or job visibility become real requirements, that's the signal to move to Hangfire or another tool with those features built in.

## Frequently Asked Questions

### Does Coravel survive an application restart?

Not in the sense of preserving in-flight or missed job state - but your schedule itself is re-registered from your `UseScheduler` code every time the app starts, so recurring jobs continue on schedule going forward. What's lost is any state about jobs that were due or running at the moment of restart, since Coravel doesn't persist that anywhere.

### Can I run Coravel across multiple instances of my app?

Not with built-in coordination - Coravel has no mechanism to prevent multiple instances from each independently running the same scheduled job. If you scale horizontally, either ensure your jobs are safe to run redundantly (fully idempotent, low-cost), or move to a tool like Hangfire or Quartz.NET that coordinates execution across instances.

### Does Coravel have a dashboard like Hangfire's?

No - there's no built-in visibility into job history, execution status, or failures. If you need that, you're either building your own logging/alerting around each job, or Coravel isn't the right tool for that requirement.

### How do I prevent a slow job from overlapping with its next scheduled run?

Use `.PreventOverlapping("some-unique-key")` when scheduling the job. This ensures a new execution won't start while a previous one with the same key is still running, which is important for anything whose duration is uncertain relative to its scheduling interval.

### What else does Coravel offer besides scheduling?

Lightweight queuing (`IQueue`) for fire-and-forget background work, and a simple in-memory caching abstraction, both usable independently of the scheduler. They're convenient if you're already using Coravel, but not typically a reason to adopt it on their own over dedicated tools for those specific needs.

### Should I start with Coravel and migrate to Hangfire later if I outgrow it?

That's a reasonable path if you're genuinely unsure how much scheduling complexity you'll need - Coravel's low setup cost means starting there isn't a large sunk cost if you do outgrow it. Just recognize the signals early: needing job history, multi-instance coordination, or persistence across restarts are all clear indicators it's time to move to Hangfire or another tool built for those requirements.

### What's the most common mistake in a first Coravel setup?

Using it in a multi-instance deployment without realizing there's no coordination between instances, resulting in the same job running once per instance instead of once total. The second common mistake is skipping `PreventOverlapping` on a job whose execution time isn't reliably shorter than its schedule interval.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
