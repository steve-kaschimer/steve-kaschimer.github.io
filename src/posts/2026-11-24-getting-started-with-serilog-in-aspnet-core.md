---
author: Steve Kaschimer
date: 2026-11-24
image: /images/posts/2026-11-24-hero.webp
image_alt: "A small tag-shaped property pill labeled with a curly brace flowing through a funnel into several destination icons, with a faint two-stage arrow showing a minimal logger becoming a fuller one."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small rounded tag/pill shape with a curly-brace glyph inside it, flowing along a teal line into a narrow funnel shape. Below the funnel, the line splits into three thin branches ending in small destination icons: a magnifying-glass-in-box (structured search platform), a database cylinder, and a cloud outline. Above the funnel, two faint stacked rectangles labeled only by relative size (a small one, then a larger one directly behind it) with a short arrow between them suggest a minimal setup becoming a fuller one. Mood is structured, flowing, and precise. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic funnel/plumbing clip art."
layout: post.njk
site_title: Tech Notes
summary: "Serilog's fluent, code-first configuration throws a curveball at anyone used to XML or JSON. A setup guide for both configuration styles, the bootstrap-logger pattern, and why message templates keep properties queryable."
tags: ["dotnet", "logging", "observability", "tooling"]
title: "Getting Started with Serilog in ASP.NET Core"
---



Setting up **Serilog in ASP.NET Core** is quick once you know the shape of it, but the fluent, code-first configuration style throws a curveball at people used to XML or JSON-based logging: there's no single config file to point at, and the two-stage initialization (a bootstrap logger before the host builds, then the real one) isn't obvious from the docs alone.

This guide covers a complete Serilog setup for .NET 8 - installing the right packages, both configuration styles, the startup pattern for ASP.NET Core apps and Worker Services, and how structured logging changes the way you write log calls. By the end you'll have a production-ready baseline you can extend with additional sinks as needed.

For a broader look at how Serilog stacks up against the alternatives, [a comparison of the top .NET logging frameworks](/posts/2026-11-10-top-5-dotnet-logging-frameworks-compared/) covers where it fits relative to NLog, log4net, and the rest.

## What You'll Need

- .NET 8 SDK or later
- An ASP.NET Core Web API, Blazor, or Worker Service project
- NuGet access

This guide uses the Console sink to start, with a File sink added for persistence. Structured sinks like Seq and Elasticsearch are natural next steps once the basics are in place.

## Installing Serilog

For ASP.NET Core, you need the core package, the ASP.NET Core integration, and whichever sinks you plan to use:

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
```

`Serilog.AspNetCore` bundles the core `Serilog` package along with `Serilog.Extensions.Hosting`, giving you the `UseSerilog()` host builder extension and the `Microsoft.Extensions.Logging` bridge. Sinks are separate packages by design - you only take the dependency for the destinations you actually write to.

For a Worker Service, the same packages apply; there's no separate "web" vs. "non-web" Serilog split the way there is with NLog.

## The Two Configuration Approaches

Serilog is configured almost entirely in code by default, but it also supports a JSON-driven approach if you'd rather avoid a hardcoded pipeline in `Program.cs`.

### Approach 1: Fluent API in code

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console()
    .WriteTo.File(
        "logs/app-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 14,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff}|{Level:u4}|{SourceContext}|{Message:lj}{NewLine}{Exception}")
    .CreateLogger();
```

Key pieces:

| Call | Purpose |
| --- | --- |
| `.MinimumLevel.Override(...)` | Namespace-specific overrides, same idea as NLog's per-logger rules |
| `.Enrich.FromLogContext()` | Picks up ambient properties added via `LogContext.PushProperty` or `BeginScope` |
| `.WriteTo.File(...)` with `rollingInterval` | Serilog's equivalent of NLog's archive settings, configured inline rather than via separate attributes |

Because this is C#, you can branch on environment, feature flags, or anything else directly in the configuration - there's no separate "code-based override" mechanism the way NLog needs `AddFilter` alongside its config file.

### Approach 2: appsettings.json (via Serilog.Settings.Configuration)

If you'd rather keep sinks and levels in JSON:

```bash
dotnet add package Serilog.Settings.Configuration
```

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.AspNetCore": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "logs/app-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 14
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName"]
  }
}
```

```csharp
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();
```

`ReadFrom.Configuration` maps sink names and arguments from JSON to the corresponding fluent calls, so the two approaches produce identical pipelines - pick whichever your team finds easier to review in a pull request.

## Program.cs Setup: ASP.NET Core (.NET 8)

Serilog's recommended pattern uses a **bootstrap logger** - a minimal logger created before the host builds, so startup failures before configuration loads are still captured:

```csharp
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting web application");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    builder.Services.AddControllers();

    var app = builder.Build();
    app.MapControllers();
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
```

`UseSerilog` with the three-argument overload rebuilds the logger using the fully-initialized `IConfiguration` and DI container, replacing the bootstrap logger once the host is ready. `Log.CloseAndFlush()` in `finally` is Serilog's equivalent of NLog's `LogManager.Shutdown()` - it flushes any buffered sink writes before the process exits.

## Program.cs Setup: Worker Service

```csharp
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = Host.CreateApplicationBuilder(args);

    builder.Services.AddSerilog((services, configuration) => configuration
        .ReadFrom.Configuration(builder.Configuration)
        .ReadFrom.Services(services));

    builder.Services.AddHostedService<OrderProcessingWorker>();

    var host = builder.Build();
    host.Run();
}
finally
{
    Log.CloseAndFlush();
}
```

`Host.CreateApplicationBuilder` doesn't expose `builder.Host.UseSerilog` the way the web host does, so Worker Services register Serilog via `builder.Services.AddSerilog(...)` instead. The bootstrap-logger-then-full-logger pattern still applies.

## Injecting and Using ILogger

Once registered, Serilog works through the standard `ILogger<T>` interface exactly like any other provider:

```csharp
public sealed class OrderController : ControllerBase
{
    private readonly ILogger<OrderController> _logger;
    private readonly IOrderService _orderService;

    public OrderController(ILogger<OrderController> logger, IOrderService orderService)
    {
        _logger = logger;
        _orderService = orderService;
    }

    [HttpPost("{orderId}/process")]
    public async Task<IActionResult> ProcessOrder(int orderId)
    {
        _logger.LogInformation("Received request to process order {OrderId}", orderId);

        try
        {
            await _orderService.ProcessAsync(orderId);
            return Ok();
        }
        catch (OrderNotFoundException ex)
        {
            _logger.LogWarning(ex, "Order {OrderId} not found", orderId);
            return NotFound();
        }
    }
}
```

Message templates matter more here than with most other providers - `{OrderId}` becomes a genuinely queryable, indexed property in structured sinks like Seq or Elasticsearch. String interpolation flattens it into plain text and throws that capability away entirely, not just as a formatting nicety.

You can also attach properties to every log call in a scope with `LogContext`:

```csharp
using (LogContext.PushProperty("OrderId", orderId))
{
    _logger.LogInformation("Starting order processing pipeline");
}
```

## Verifying Your Setup

1. **Console output appears** using your configured template
2. **The log file rolls daily** under `logs/app-<date>.log`
3. **Framework noise is reduced** - `Microsoft.AspNetCore` and EF Core entries should sit at `Warning`
4. **Properties are structured**, not flattened - if you're using Seq, confirm `{OrderId}` shows up as a filterable property, not just embedded text

If nothing appears, check that `CreateBootstrapLogger()` was actually replaced by the full pipeline - a common mistake is configuring sinks only in the bootstrap logger and forgetting to call `ReadFrom.Configuration` in the `UseSerilog` callback, which leaves you stuck with the minimal bootstrap setup for the app's entire lifetime.

## Configuration Best Practices

**Always use the bootstrap logger pattern.** Startup failures before configuration loads are otherwise invisible.

**Call `Log.CloseAndFlush()` in `finally`.** Buffered sink writes (especially file and network sinks) can be lost without it.

**Override noisy namespaces explicitly with `MinimumLevel.Override`.** `Microsoft.AspNetCore` and `Microsoft.EntityFrameworkCore` are the usual culprits.

**Prefer `Enrich.FromLogContext()` plus `LogContext.PushProperty` over manually formatting context into messages.** It keeps properties structured and queryable.

**Keep sink credentials and endpoints in `appsettings.Development.json` vs. production config**, especially for Seq URLs or API keys that differ by environment.

## Comparison with NLog Setup

| Dimension | Serilog | NLog |
| --- | --- | --- |
| Config style | C# fluent API (or JSON via `Serilog.Settings.Configuration`) | XML file or JSON section |
| ASP.NET Core integration | `builder.Host.UseSerilog(...)` | `builder.Host.UseNLog()` |
| Shutdown | `Log.CloseAndFlush()` | `LogManager.Shutdown()` |
| Structured logging | Native, first-class | Supported via layout renderers, less central |
| Startup error capture | Bootstrap logger pattern | Manually created logger before `try` block |

Both integrate identically with `ILogger<T>` from application code - the meaningful differences are in configuration style and how central structured data is to the design.

## Frequently Asked Questions

### What package do I need to use Serilog in ASP.NET Core?

Install `Serilog.AspNetCore`, which bundles the core library and the `UseSerilog()` host integration. Add sink packages separately - `Serilog.Sinks.Console`, `Serilog.Sinks.File`, `Serilog.Sinks.Seq`, and so on - for whichever destinations you need.

### Should I configure Serilog in code or appsettings.json?

Both are fully supported. Code-first configuration is more common and lets you branch on environment or DI-resolved services directly. Use `Serilog.Settings.Configuration` with `ReadFrom.Configuration` if your team prefers reviewing logging setup as JSON diffs rather than C# changes.

### Why does Serilog need a bootstrap logger?

The bootstrap logger is a minimal `Console`-only logger created before `WebApplication.CreateBuilder` runs, so exceptions during host configuration - before `IConfiguration` and DI exist - are still captured. `UseSerilog(...)` with the services-aware overload then replaces it with the fully configured pipeline once the host builds.

### How do I stop Serilog from logging noisy Microsoft framework messages?

Add `.MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)` (and similarly for `Microsoft.EntityFrameworkCore` or other noisy namespaces) to your `LoggerConfiguration`. This raises the threshold for that namespace specifically without affecting your application's own log level.

### Does Serilog work with .NET 8 minimal APIs?

Yes, identically to controller-based apps. `builder.Host.UseSerilog(...)` wires up the pipeline at the host level regardless of routing style, and `ILogger<T>` injected into minimal API handlers uses the same Serilog-backed provider.

### What's the difference between Enrich.FromLogContext and just adding properties to the message?

`Enrich.FromLogContext()` combined with `LogContext.PushProperty` attaches properties to the structured log event itself, which sinks like Seq can index and filter on independently. Embedding the same value into the message text loses that - it becomes unstructured text that has to be parsed back out rather than queried directly.

### How do I configure Serilog differently for Development vs Production?

If using JSON configuration, `appsettings.Development.json` overrides `MinimumLevel` and `WriteTo` the same way it does for any other configuration section. If using code-first configuration, branch on `builder.Environment.IsDevelopment()` directly inside the `UseSerilog` callback to add or remove sinks conditionally.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
