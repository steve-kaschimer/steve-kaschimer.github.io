---
author: Steve Kaschimer
date: 2026-12-15
image: /images/posts/2026-12-15-hero.webp
image_alt: "A faintly aged rolling-file appender icon with a soft crack across one edge, beside a ghosted question mark where an error message would normally appear."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a flat file-drawer/appender icon rendered in a slightly desaturated off-white with a faint amber crack running diagonally across one corner, suggesting age without damage. To its right, a small dashed-outline question mark sits where an error indicator would normally be, rendered at very low opacity to suggest an absence rather than a presence - implying a failure with no visible warning. Below, a thin teal timeline line stretches from a small '2001' style tick mark on the left toward the present on the right, with a single dot near the far left end. Mood is stable, aged, and quietly cautious. Avoid: vendor logos, brand colors, circuit-board textures, gears, or literal antique/sepia photograph styling."
layout: post.njk
site_title: Tech Notes
summary: "log4net predates Microsoft.Extensions.Logging by well over a decade, and it fails silently on configuration errors. A setup guide covering the XML config, the required flush pattern, and the recommendation from the comparison post: keep it where it works, don't start new services on it."
tags: ["dotnet", "logging", "tooling", "developer-productivity"]
title: "Getting Started with log4net in ASP.NET Core"
---

Setting up **log4net in ASP.NET Core** is a bit less "batteries included" than some of the newer logging libraries, since log4net predates `Microsoft.Extensions.Logging` by well over a decade. That doesn't mean it's hard - but there are a handful of decisions and gotchas that catch people the first time through: XML config vs. code-based config, where the config file needs to live, and how to make sure buffered log entries actually get flushed before the process exits.

This guide walks through a complete setup from scratch: installing the right packages, configuring log4net, wiring it into `Program.cs` for both ASP.NET Core apps and Worker Services, and using `ILogger<T>` the same way you would with any other provider. By the end you'll have a working, production-ready log4net configuration for a .NET 8 project.

If you want a broader comparison of logging options before committing to log4net specifically, [a comparison of the top .NET logging frameworks](/posts/2026-11-10-top-5-dotnet-logging-frameworks-compared/) covers how it fits alongside NLog and Serilog.

## What You'll Need

- .NET 8 SDK or later
- An ASP.NET Core Web API, Blazor, or Worker Service project
- NuGet access

This guide sticks to file and console logging so you can follow along without any external log server. Database and rolling-appender configurations are a natural next step once the basics are working.

## Installing log4net

For ASP.NET Core, you need two packages: the core library and the `Microsoft.Extensions.Logging` bridge.

```bash
dotnet add package log4net
dotnet add package Microsoft.Extensions.Logging.Log4Net.AspNetCore
```

The second package is what makes log4net usable through the standard `ILogger<T>` abstraction - without it, you'd be calling log4net's own `ILog` interface directly and losing the benefits of DI-friendly, provider-agnostic logging.

## The Two Configuration Approaches

log4net configuration almost always lives in XML, but you have a choice of where that XML sits.

### Approach 1: log4net.config (standalone file)

Create a file named `log4net.config` in your project root:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<log4net>
  <appender name="RollingFile" type="log4net.Appender.RollingFileAppender">
    <file value="logs/app.log" />
    <appendToFile value="true" />
    <rollingStyle value="Date" />
    <datePattern value="yyyy-MM-dd'.log'" />
    <maxSizeRollBackups value="14" />
    <staticLogFileName value="true" />
    <layout type="log4net.Layout.PatternLayout">
      <conversionPattern value="%date [%thread] %-5level %logger - %message%newline%exception" />
    </layout>
  </appender>

  <appender name="Console" type="log4net.Appender.ConsoleAppender">
    <layout type="log4net.Layout.PatternLayout">
      <conversionPattern value="%-5level %logger{1} - %message%newline" />
    </layout>
  </appender>

  <!-- Silence noisy framework loggers -->
  <logger name="Microsoft">
    <level value="WARN" />
  </logger>
  <logger name="System.Net.Http">
    <level value="WARN" />
  </logger>

  <root>
    <level value="INFO" />
    <appender-ref ref="RollingFile" />
    <appender-ref ref="Console" />
  </root>
</log4net>
```

Make sure the file is copied to the output directory in your `.csproj`:

```xml
<ItemGroup>
  <Content Include="log4net.config">
    <CopyToOutputDirectory>Always</CopyToOutputDirectory>
  </Content>
</ItemGroup>
```

A few notable elements:

| Element | Purpose |
| --- | --- |
| `<root>` | The default logger every unmatched category falls back to |
| `<logger name="...">` | Overrides the level for a specific namespace |
| `rollingStyle="Date"` | Rolls the log file over once per day rather than by size |
| `maxSizeRollBackups` | How many archived files to retain before deleting the oldest |

Unlike NLog's `throwConfigExceptions`, log4net fails silently on bad XML by default. It's worth wrapping your startup logging call in a check that confirms at least one appender loaded, so a typo in the config doesn't quietly leave you with no logs at all.

### Approach 2: Embedded in appsettings.json (via a config section)

log4net wasn't designed around `IConfiguration`, so there's no first-class JSON schema the way NLog or Serilog offer. The common workaround is to keep the XML but store the *path* and *watch* behavior in `appsettings.json`, and let the rest of your team treat the XML file as the source of truth:

```json
{
  "Log4NetCore": {
    "Log4NetConfigFileName": "log4net.config",
    "WatchLogConfigFile": true
  }
}
```

You then read this section in `Program.cs` and pass it to the log4net provider explicitly (shown in the next section). This gives you environment-specific overrides - for example, pointing `Development` at a different config file with a lower minimum level - without abandoning log4net's native XML format for the actual appender definitions.

## Program.cs Setup: ASP.NET Core (.NET 8)

```csharp
using log4net;
using log4net.Config;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddLog4Net("log4net.config");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseHttpsRedirection();
app.MapControllers();

try
{
    app.Run();
}
finally
{
    // Ensure buffered appenders flush before the process exits
    LogManager.Flush(5000);
}
```

`AddLog4Net(...)` registers the provider and points it at your config file. Wrapping `app.Run()` in a `try/finally` with `LogManager.Flush()` matters more than it looks - log4net's file appenders can buffer writes, and without an explicit flush on shutdown you risk losing the last few log entries when the process terminates, especially under `dotnet publish` self-contained deployments or container restarts.

## Program.cs Setup: Worker Service

Worker Services use `Host.CreateApplicationBuilder` instead of `WebApplication.CreateBuilder`, but the log4net wiring is nearly identical:

```csharp
using log4net;

var builder = Host.CreateApplicationBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddLog4Net("log4net.config");

builder.Services.AddHostedService<OrderProcessingWorker>();

var host = builder.Build();

try
{
    host.Run();
}
finally
{
    LogManager.Flush(5000);
}
```

The `AddLog4Net` call works the same whether you're inside a web host or a generic host - the provider itself doesn't care about HTTP context, which is also why log4net has no equivalent to NLog's `${aspnet-request-url}`-style layout renderers out of the box.

## Injecting and Using ILogger

Once the provider is registered, `ILogger<T>` behaves exactly as it would with any other logging backend:

```csharp
public sealed class OrderController : ControllerBase
{
    private readonly ILogger<OrderController> _logger;
    private readonly IOrderService _orderService;

    public OrderController(
        ILogger<OrderController> logger,
        IOrderService orderService)
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
            _logger.LogInformation("Order {OrderId} processed successfully", orderId);
            return Ok();
        }
        catch (OrderNotFoundException ex)
        {
            _logger.LogWarning(ex, "Order {OrderId} not found", orderId);
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error processing order {OrderId}", orderId);
            return StatusCode(500);
        }
    }
}
```

Stick with message template syntax (`{OrderId}`) instead of string interpolation. log4net's `PatternLayout` will render the final message the same either way, but keeping the named placeholder means you're not throwing away information if you later swap in a structured-logging-aware provider.

## Verifying Your Setup

Once the app is running, confirm:

1. **Log files appear** in the path you configured (`logs/app.log` in the example above)
2. **Console output uses your pattern**, not the default ASP.NET Core console formatting
3. **Framework noise is reduced** - `Microsoft.*` categories should sit at `WARN` or above
4. **No silent failures** - temporarily introduce a deliberate typo in `log4net.config` and confirm you notice the absence of logs, since log4net won't throw by default

If nothing is being logged at all, the most common cause is a missing `CopyToOutputDirectory` setting on `log4net.config`, followed closely by forgetting to call `AddLog4Net(...)` before `ClearProviders()` takes effect elsewhere in the pipeline.

## Configuration Best Practices

**Confirm your config file is actually being copied to output.** Because log4net fails quietly, a missing config file just means no logging happens - with no error to point you at the cause.

**Always call `LogManager.Flush()` in a `finally` block.** File appenders buffer writes for performance; skipping the flush risks losing the final log entries on shutdown.

**Keep framework categories at `WARN` or higher.** Without explicit `<logger>` overrides for `Microsoft` and `System.Net.Http`, EF Core and HTTP client instrumentation will dominate your log output.

**Use `RollingFileAppender` with a date-based pattern, not size-based, for application logs.** Date-based rolling makes it far easier to correlate a log file with "what happened on a given day" during an incident.

**Treat `appsettings.Development.json` as the place for environment overrides**, and keep the XML appender definitions themselves consistent across environments where possible.

## Comparison with NLog Setup

If you've configured NLog before, here's how the pieces map:

|  | log4net | NLog |
| --- | --- | --- |
| Config style | XML file only (no native JSON schema) | XML file or JSON section |
| ASP.NET Core integration | `builder.Logging.AddLog4Net(...)` | `builder.Host.UseNLog()` |
| Shutdown | `LogManager.Flush(timeout)` | `LogManager.Shutdown()` |
| Config error handling | Silent by default | `throwConfigExceptions` available |
| HTTP-aware layout renderers | None built in | `${aspnet-*}` renderers via `NLog.Web.AspNetCore` |

Both integrate identically with `ILogger<T>` from the application code's point of view - the differences are almost entirely in configuration ergonomics and shutdown semantics.

## Frequently Asked Questions

### What package do I need to use log4net in ASP.NET Core?

Install both `log4net` and `Microsoft.Extensions.Logging.Log4Net.AspNetCore`. The first is the core logging engine; the second bridges it into `Microsoft.Extensions.Logging` so you can inject `ILogger<T>` instead of using log4net's native `ILog` API directly.

### Should I use a standalone log4net.config or embed settings in appsettings.json?

log4net doesn't have a native JSON configuration schema the way NLog does, so the appenders and layouts themselves need to stay in XML. You can still store the config file path and watch behavior in `appsettings.json` for environment-specific overrides, but the core `log4net.config` file remains XML either way.

### Why do I need to call LogManager.Flush() before shutdown?

log4net's file-based appenders buffer writes for performance. If the process exits without an explicit flush, entries still sitting in the buffer may never be written to disk. Wrapping `app.Run()` (or `host.Run()`) in a `try/finally` that calls `LogManager.Flush(timeout)` guarantees pending writes complete before the process terminates.

### How do I stop log4net from logging noisy Microsoft framework messages?

Add explicit `<logger>` elements for `Microsoft` and `System.Net.Http` with a higher minimum level, placed above your `<root>` element:

```xml
<logger name="Microsoft">
  <level value="WARN" />
</logger>
<logger name="System.Net.Http">
  <level value="WARN" />
</logger>
```

This raises the threshold for those namespaces without touching the root logger's level, so your own application code still logs at `INFO` or below.

### Does log4net work with .NET 8 minimal APIs?

Yes. The setup is identical regardless of whether you're using controllers or minimal API endpoints - `builder.Logging.AddLog4Net(...)` registers the provider at the host level, and any `ILogger<T>` you inject into an endpoint handler or service picks it up automatically.

### Why isn't log4net logging anything, with no errors?

This is the most common log4net gotcha: unlike NLog, it fails silently on configuration problems by default. Check that `log4net.config` is actually present in your output directory (`CopyToOutputDirectory` set to `Always`), and that `AddLog4Net(...)` is called with the correct file name. There's no equivalent to NLog's `throwConfigExceptions` flag, so you're largely relying on careful setup rather than startup errors to catch mistakes.

### How do I configure log4net differently for Development vs Production?

Since appender definitions live in XML rather than `appsettings.json`, the cleanest approach is maintaining a separate config file per environment (for example, `log4net.Development.config`) and selecting which one to load based on `builder.Environment.EnvironmentName` when you call `AddLog4Net(...)`. This keeps the JSON-based override pattern you may be used to from `Microsoft.Extensions.Logging`, adapted to log4net's XML-first design.
