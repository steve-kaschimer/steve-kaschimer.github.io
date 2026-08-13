---
author: Steve Kaschimer
date: 2027-11-02
image: /images/posts/2027-11-02-hero.webp
image_alt: "A small dashboard-panel glyph with a job-list icon inside it, connected to a locked badge implying the panel requires authorization before it can be viewed."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a flat rectangular dashboard panel containing three thin horizontal job-row lines, each with a small status dot. A solid amber lock badge sits in the panel's corner, implying authorization required before access. A faint polling-clock icon pulses beneath the panel, implying a recurring background check. Mood is polished, visible, and appropriately guarded. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art."
layout: post.njk
site_title: Tech Notes
summary: "Hangfire's install-to-first-job time is genuinely a few minutes, and that speed is exactly why it's easy to skip the two decisions that determine whether it stays cheap to run. A setup guide for storage, securing the dashboard, and fire-and-forget, delayed, and recurring jobs."
tags: ["dotnet", "tooling", "architecture", "developer-productivity"]
title: "Getting Started with Hangfire in .NET"
---

Hangfire's install-to-first-job time is genuinely a few minutes, and that speed is exactly why it's easy to skip the two decisions that determine whether it stays cheap to run: what storage backend you point it at, and how much you rely on the polling interval defaults. Neither is complicated, but both are easy to leave on autopilot in a way that quietly costs you either database load or missed reliability guarantees.

This guide covers installing Hangfire, bootstrapping storage and the dashboard correctly, the core patterns for fire-and-forget, delayed, and recurring jobs, and the best practices that keep Hangfire's polling model from becoming its own performance problem. By the end you'll have a background job setup with real visibility into what's running and what's failed.

If you're deciding between background job libraries first, [a comparison of the top .NET background job libraries](/posts/2027-10-26-top-5-dotnet-background-job-libraries-compared/) covers where Hangfire fits relative to Quartz.NET, Coravel, Azure Functions, and Wolverine.

## What You'll Need

- .NET 8 SDK or later
- A storage backend - SQL Server is the most common, though Redis, PostgreSQL, and others are supported via separate storage packages

## Installing Hangfire

```bash
dotnet add package Hangfire.AspNetCore
dotnet add package Hangfire.SqlServer
```

## Bootstrapping the Ideal Environment

### Registering Hangfire and its storage

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("Hangfire")));

builder.Services.AddHangfireServer();

var app = builder.Build();
app.UseHangfireDashboard();
app.Run();
```

`AddHangfireServer()` is what actually processes jobs - without it, jobs get enqueued into storage but nothing picks them up. This is a common first mistake: registering Hangfire's client-side services and forgetting the server component entirely.

### Secure the dashboard before it goes anywhere near production

By default, `UseHangfireDashboard()` is accessible to anyone who can reach the URL. Restrict it:

```csharp
app.UseHangfireDashboard("/jobs", new DashboardOptions
{
    Authorization = [new HangfireDashboardAuthorizationFilter()]
});
```

```csharp
public class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        return httpContext.User.Identity?.IsAuthenticated == true
            && httpContext.User.IsInRole("Admin");
    }
}
```

An unsecured Hangfire dashboard exposed publicly is a real, well-known security risk - it shows job details and, depending on configuration, can let visitors trigger job execution.

## Core Workflow

### Fire-and-forget jobs

```csharp
public class OrderController(IBackgroundJobClient backgroundJobs) : ControllerBase
{
    [HttpPost("{id}/notify")]
    public IActionResult NotifyCustomer(int id)
    {
        backgroundJobs.Enqueue<INotificationService>(svc => svc.SendOrderConfirmationAsync(id));
        return Accepted();
    }
}
```

### Delayed jobs

```csharp
backgroundJobs.Schedule<IOrderService>(
    svc => svc.CancelIfUnpaidAsync(orderId),
    TimeSpan.FromHours(24));
```

### Recurring jobs

```csharp
RecurringJob.AddOrUpdate<IReportService>(
    "daily-sales-report",
    svc => svc.GenerateDailySalesReportAsync(),
    Cron.Daily);
```

`AddOrUpdate` is idempotent by design - calling it again with the same ID and a changed cron expression updates the existing recurring job rather than creating a duplicate, which matters for how you register recurring jobs at startup without accumulating stale entries across deployments.

### Continuations for job chains

```csharp
var jobId = backgroundJobs.Enqueue<IOrderService>(svc => svc.ProcessAsync(orderId));
backgroundJobs.ContinueJobWith<INotificationService>(jobId, svc => svc.SendProcessedNotificationAsync(orderId));
```

## Verifying Your Setup

1. **`AddHangfireServer()` is registered, not just `AddHangfire()`** - confirm enqueued jobs actually execute, not just sit in storage
2. **The dashboard requires authentication** - confirm an unauthenticated request to your dashboard path is rejected
3. **Recurring jobs survive a redeploy** - confirm `RecurringJob.AddOrUpdate` calls at startup don't create duplicates on each deploy
4. **Storage load is reasonable for your job volume** - for a small number of infrequent jobs, confirm the polling interval isn't generating excessive database load relative to actual job frequency

## Best Practices

**Always register `AddHangfireServer()` alongside `AddHangfire()`.** Forgetting it is the most common "my jobs aren't running" issue, and it's silent - no error, just jobs that never execute.

**Secure the dashboard before any non-local deployment.** This isn't optional hardening - an open Hangfire dashboard is a known, actively scanned-for exposure.

**Use `AddOrUpdate` with a stable, explicit job ID for recurring jobs, registered at startup.** This keeps recurring job registration idempotent across deployments instead of accumulating duplicates or orphaned entries.

**Keep job methods idempotent where possible.** Retries (automatic on failure) and rare double-execution scenarios mean a job that isn't safe to run twice can cause real problems - design job logic defensively.

**Be aware storage load scales with polling, not job volume.** For very infrequent jobs, Hangfire's default polling still queries your database regularly - factor this into database load planning, especially on a shared or cost-sensitive instance.

## Comparison with Quartz.NET

| | Hangfire | Quartz.NET |
| --- | --- | --- |
| Setup effort | Low | Moderate - more configuration |
| Dashboard | Yes, built in | No - external tooling needed |
| Scheduling sophistication | Good for common cases | Purpose-built for complex rules (time zones, calendars, non-overlap) |
| Clustering | Yes, via shared storage | Yes, purpose-built |
| Best fit | Most teams wanting jobs with visibility | Genuinely complex scheduling requirements |

Hangfire wins on setup speed and out-of-the-box visibility; Quartz.NET wins when your scheduling rules are complex enough that Hangfire's simpler model doesn't cleanly express them.

## Frequently Asked Questions

### Why aren't my Hangfire jobs running even though they're enqueued?

The most common cause is forgetting `builder.Services.AddHangfireServer()` - without it, jobs are stored but nothing processes them. Confirm both `AddHangfire` (client-side registration) and `AddHangfireServer` (the worker that processes jobs) are both registered.

### Is the Hangfire dashboard safe to expose publicly?

Not without authorization configured. By default it's accessible to anyone who reaches the URL, which is a real security exposure - always configure an `IDashboardAuthorizationFilter` restricting access before deploying anywhere beyond local development.

### How do I avoid duplicate recurring jobs across deployments?

Use `RecurringJob.AddOrUpdate` with a stable, explicit job ID string, called at application startup. Because it's idempotent by ID, redeploying doesn't create duplicates - it updates the existing job if its schedule or method reference changed.

### Does Hangfire guarantee a job runs exactly once?

Not strictly - Hangfire targets at-least-once execution, meaning retries after a failure (or rare edge cases around worker crashes) can result in a job running more than once. Design job logic to be idempotent (safe to run twice) rather than assuming exactly-once semantics.

### What database load should I expect from Hangfire?

Load is driven primarily by polling frequency, not actual job volume - Hangfire's server periodically checks storage for due jobs regardless of how many jobs you actually have. For a small number of infrequent jobs, this constant polling can be disproportionate to your actual workload; factor it into your database capacity planning.

### Can I use Hangfire without SQL Server?

Yes - Redis, PostgreSQL, and other storage backends are supported via their own Hangfire storage packages (`Hangfire.Redis.StackExchange`, `Hangfire.PostgreSql`, and others). SQL Server is simply the most common and best-documented choice.

### What's the most common mistake in a first Hangfire setup?

Forgetting `AddHangfireServer()`, and deploying the dashboard without authorization configured. Both are easy to fix once known, but both fail silently or dangerously (respectively) if missed - worth checking explicitly rather than assuming the defaults are production-safe.
