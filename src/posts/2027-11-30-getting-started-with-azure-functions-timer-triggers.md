---
author: Steve Kaschimer
date: 2027-11-30
image: /images/posts/2027-11-30-hero.webp
image_alt: "A cloud-bounded clock icon fully detached from any host shape, connected by a dashed line to a small isolated-worker box marked separate from a fading in-process silhouette."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small cloud-bounded clock icon floating with no connecting line to any host or application shape, emphasizing full decoupling from a process's lifecycle. A dashed teal line runs to a small solid rectangle labeled by position as an isolated worker, distinct from a faint, fading dotted-outline rectangle beside it representing a deprecated in-process model. Mood is decoupled, managed, and forward-looking. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic cloud clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Azure Functions timer triggers solve a problem the other four background job tools in this series structurally can't: what happens when your job needs to run even if your main application isn't. A setup guide for the isolated worker model, Azure's 6-field cron format, and designing for idempotency under serverless retries."
tags: ["dotnet", "cloud", "architecture", "devops"]
title: "Getting Started with Azure Functions Timer Triggers in .NET"
---

Azure Functions timer triggers solve a problem the other four tools in this series structurally can't: what happens when your job needs to run even if your main application isn't. An in-process scheduler is only as reliable as the app hosting it - if that app is down for a deploy, crashed, or scaled to zero, nothing runs. A timer-triggered Azure Function is its own deployable unit, on its own schedule, independent of any web app's lifecycle. That's the whole appeal, and it comes with a real platform commitment in exchange.

This guide covers setting up an Azure Functions project with a timer trigger using the current isolated worker model (the in-process model's support ends November 2026, so this is the only path worth building on new), bootstrapping dependency injection and configuration correctly, the core patterns for reliable execution, and the best practices for designing timer-triggered functions that behave correctly under retries and cold starts. By the end you'll have a background job that runs independently of your main application's process.

If you're deciding between background job libraries first, [a comparison of the top .NET background job libraries](/posts/2027-10-26-top-5-dotnet-background-job-libraries-compared/) covers where Azure Functions fits relative to Hangfire, Quartz.NET, Coravel, and Wolverine.

## What You'll Need

- .NET 8 SDK or later
- Azure Functions Core Tools v4
- An Azure subscription for deployment (local development and testing don't require one)

```bash
npm install -g azure-functions-core-tools@4
```

## Installing and Scaffolding

Create a new Functions project targeting the isolated worker model - this is the default for new projects using current tooling, but worth confirming explicitly:

```bash
func init MyApp.Functions --worker-runtime dotnet-isolated --target-framework net8.0
cd MyApp.Functions
func new --template "Timer trigger" --name DailySalesReportFunction
```

This scaffolds a `Program.cs` using the isolated worker host builder, plus a function class with a `[Function]`-attributed method and a `[TimerTrigger]` parameter.

## Bootstrapping the Ideal Environment

### The isolated worker host, with dependency injection wired up

```csharp
// Program.cs
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddScoped<IReportService, ReportService>();
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(Environment.GetEnvironmentVariable("SqlConnectionString")));
    })
    .Build();

host.Run();
```

This is a meaningful departure from the older in-process model's `Startup.cs` - in the isolated worker model, your function runs as a genuinely separate process from the Functions host, giving you full control over the DI container and middleware pipeline the same way you would in any other .NET application.

### The timer-triggered function

```csharp
public class DailySalesReportFunction(IReportService reportService, ILogger<DailySalesReportFunction> logger)
{
    [Function(nameof(DailySalesReportFunction))]
    public async Task Run([TimerTrigger("0 0 6 * * *")] TimerInfo timerInfo)
    {
        logger.LogInformation("Generating daily sales report. Next run: {NextRun}", timerInfo.ScheduleStatus?.Next);
        await reportService.GenerateDailySalesReportAsync();
    }
}
```

The cron expression here is a 6-field NCronTab expression (seconds-minutes-hours-day-month-weekday), which differs slightly from the 5-field format used elsewhere - worth double-checking against Azure's documentation rather than assuming standard cron syntax transfers directly.

### Configuration: local vs. deployed

Locally, settings live in `local.settings.json` (never committed to source control):

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "SqlConnectionString": "Server=localhost;Database=MyAppDb;Trusted_Connection=True;"
  }
}
```

In Azure, the equivalent values are set as Application Settings on the Function App, ideally pulling secrets from Azure Key Vault rather than storing them directly.

### Retry policies, since the platform doesn't guarantee correctness of your logic

```csharp
[Function(nameof(DailySalesReportFunction))]
[FixedDelayRetry(5, "00:00:10")]
public async Task Run([TimerTrigger("0 0 6 * * *")] TimerInfo timerInfo)
{
    // ...
}
```

`FixedDelayRetry` (or `ExponentialBackoffRetry`) handles retrying the function on failure - but the platform retrying your code doesn't make your code idempotent by itself; that's still your responsibility.

## Core Workflow

- **Design every timer-triggered function to be idempotent.** Retries and rare duplicate invocations are a real possibility on any serverless platform - a function that isn't safe to run twice with the same effective input is a latent bug.
- **Use Application Insights for observability rather than assembling your own.** The integration is deep and largely automatic once configured, giving you execution history, failures, and duration without extra instrumentation code.
- **Keep functions focused on one responsibility.** A timer trigger orchestrating a report generation should delegate the actual report logic to an injected service, the same discipline that applies to any other entry point in this series.

## Verifying Your Setup

1. **The function runs locally on schedule** - use `func start` and confirm the timer fires at the expected interval during local testing (temporarily shortening the schedule for faster feedback is a common technique)
2. **Cron expression matches intent** - Azure's 6-field format has caught people expecting standard 5-field cron; verify against a NCronTab reference or the Azure documentation directly
3. **Dependency injection resolves correctly** - confirm constructor-injected services in your function class resolve without error
4. **Retry behavior matches expectations** - deliberately throw an exception in a test function and confirm the configured retry policy behaves as expected

## Best Practices

**Build on the isolated worker model for anything new.** The in-process model's support ends November 10, 2026 - there's no reason to build new functions on a model with a clear expiration date.

**Design for idempotency from the start.** Serverless retry semantics mean your function may execute more than once for a given logical trigger - treat this as a certainty to design around, not an edge case.

**Use Key Vault for secrets rather than Application Settings directly, in production.** Application Settings are convenient but not the most secure place for sensitive connection strings and API keys at scale.

**Account for cold starts in your design, especially on Consumption plans.** A function that hasn't run recently may take longer to start executing - if timing precision matters, understand your hosting plan's cold-start characteristics (Premium and Dedicated plans largely avoid this; Consumption doesn't).

**Recognize the platform commitment you're making.** Migrating away from Azure Functions later is a real project, not a configuration change - this is a reasonable trade-off if you're already committed to Azure, but worth being deliberate about rather than defaulting into.

## Comparison with Hangfire

| | Azure Functions (Timer) | Hangfire |
| --- | --- | --- |
| Process independence | Fully decoupled from any app's lifecycle | Runs inside your app's process |
| Scaling | Elastic, managed by the platform | Manual, tied to your app's instances |
| Persistence/reliability | Managed by Azure | Managed by your chosen storage backend |
| Observability | Deep Application Insights integration | Built-in dashboard |
| Portability | Real Azure lock-in | Portable across any .NET hosting environment |

Azure Functions solves a structural reliability problem (running independently of any single app's uptime) that Hangfire, by design, can't - at the cost of genuine platform commitment. For teams not otherwise invested in Azure, that trade-off needs to be deliberate, not incidental.

## Frequently Asked Questions

### Should I use the in-process or isolated worker model for a new project?

Isolated worker, without much debate - Microsoft is ending support for the in-process model on November 10, 2026, and the isolated model additionally offers better dependency isolation and the ability to target non-LTS .NET versions. There's no good reason to start a new project on the in-process model at this point.

### What cron format does Azure Functions' TimerTrigger use?

A 6-field NCronTab expression: seconds, minutes, hours, day of month, month, day of week - one field more than the standard 5-field cron format used by most other tools in this comparison. This difference has caused real confusion for people assuming standard cron syntax transfers directly; verify against Azure's documentation when writing a new schedule.

### Does a timer trigger guarantee my function runs exactly once?

No - like most serverless retry models, Azure Functions targets reliable execution but doesn't guarantee exactly-once semantics under all failure conditions. Design your function logic to be idempotent, the same defensive principle that applies to any retriable background work.

### How do I test a timer trigger locally without waiting for its actual schedule?

Use the Azure Functions Core Tools (`func start`) and temporarily shorten the cron expression to something like every minute for local testing, reverting to the intended production schedule before deploying. There's also an admin API endpoint that can manually invoke a function for testing without waiting on its trigger at all.

### What's a cold start, and does it affect timer triggers?

A cold start is the delay incurred when a function app that hasn't been recently active needs to initialize before executing - most relevant on Consumption plans, less so on Premium or Dedicated plans which keep instances warm. For timer triggers where exact timing matters, understand which hosting plan you're on and its cold-start characteristics.

### How does Azure Functions handle secrets and configuration?

Locally, via `local.settings.json` (excluded from source control). In Azure, via Application Settings on the Function App, ideally referencing Azure Key Vault for sensitive values rather than storing secrets directly in settings, which is the more secure pattern for production deployments.

### What's the most common mistake in a first Azure Functions timer trigger setup?

Building on the in-process model out of habit or an outdated tutorial, when the isolated worker model is both the current recommendation and the only supported path going forward. The second common mistake is assuming standard 5-field cron syntax works in `[TimerTrigger]` without checking Azure's 6-field format first.
