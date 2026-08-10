# Getting Started with NLog in ASP.NET Core

Setting up **NLog in ASP.NET Core** is straightforward once you've done it once, but the first pass usually raises a few questions: do you configure it in XML or JSON, how do you make sure buffered log entries flush before the process exits, and why does the official guidance wrap `Program.cs` in a `try/catch/finally`? None of these are complicated on their own, but hitting all of them at once in an unfamiliar library slows people down.

This guide walks through a complete NLog setup for .NET 8: installing the right package, both configuration styles, the startup/shutdown pattern for ASP.NET Core apps and Worker Services, and how to use `ILogger<T>` once it's wired up. By the end you'll have a configuration you can drop into any project as a starting point.

If you're comparing NLog against other options first, a comparison of the top .NET logging frameworks is worth reading before committing.

## What You'll Need

- .NET 8 SDK or later
- An ASP.NET Core Web API, Blazor, or Worker Service project
- NuGet access

This guide sticks to file and console logging, no external log server required. Database targets, Seq, and custom targets are natural next steps once this baseline is working.

## Installing NLog

For ASP.NET Core, one package covers everything you need:

```bash
dotnet add package NLog.Web.AspNetCore
```

This brings in the base `NLog` package automatically and adds the `UseNLog()` host builder extension, ASP.NET Core-aware layout renderers, and the `Microsoft.Extensions.Logging` integration.

For a Worker Service or console app that doesn't need HTTP-aware renderers, install the smaller pair instead:

```bash
dotnet add package NLog
dotnet add package NLog.Extensions.Logging
```

## The Two Configuration Approaches

NLog supports XML and JSON configuration, and you can switch between them without touching application code.

### Approach 1: nlog.config (XML)

Create `nlog.config` in your project root:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      autoReload="true"
      throwConfigExceptions="true"
      internalLogLevel="Warn"
      internalLogFile="${basedir}/internal-nlog.txt">

  <targets>
    <target xsi:type="AsyncWrapper" name="asyncFile" queueLimit="5000" overflowAction="Discard">
      <target xsi:type="File"
              name="logfile"
              fileName="${basedir}/logs/app-${shortdate}.log"
              archiveEvery="Day"
              maxArchiveFiles="14"
              layout="${longdate}|${uppercase:${level}}|${logger}|${message} ${exception:format=tostring}" />
    </target>
    <target xsi:type="Console" name="console"
            layout="${level:truncate=4:uppercase=true}|${logger:shortName=true}|${message}" />
  </targets>

  <rules>
    <logger name="Microsoft.*" maxlevel="Info" final="true" />
    <logger name="*" minlevel="Debug" writeTo="asyncFile,console" />
  </rules>
</nlog>
```

Make sure it's copied to the output directory:

```xml
<ItemGroup>
  <Content Include="nlog.config">
    <CopyToOutputDirectory>Always</CopyToOutputDirectory>
  </Content>
</ItemGroup>
```

| Attribute | Purpose |
| --- | --- |
| `autoReload="true"` | Hot-reload config changes without restarting |
| `throwConfigExceptions="true"` | Throw on config errors instead of failing silently |
| `internalLogLevel` | NLog's own diagnostic log level |
| `internalLogFile` | Where NLog logs its own messages |

Keep `throwConfigExceptions="true"` on during development -- silent config failures are hard to diagnose, since the app just runs with no logs and no error.

### Approach 2: appsettings.json

If you'd rather keep all configuration centralized:

```json
{
  "NLog": {
    "autoReload": true,
    "throwConfigExceptions": true,
    "internalLogLevel": "Warn",
    "extensions": [{ "assembly": "NLog.Web.AspNetCore" }],
    "targets": {
      "async": true,
      "logfile": {
        "type": "File",
        "fileName": "${basedir}/logs/app-${shortdate}.log",
        "archiveEvery": "Day",
        "maxArchiveFiles": 14,
        "layout": "${longdate}|${uppercase:${level}}|${logger}|${message}"
      },
      "console": {
        "type": "Console",
        "layout": "${level:truncate=4:uppercase=true}|${logger:shortName=true}|${message}"
      }
    },
    "rules": [
      { "logger": "Microsoft.*", "maxLevel": "Info", "final": true },
      { "logger": "*", "minLevel": "Debug", "writeTo": "logfile,console" }
    ]
  }
}
```

`"async": true` on the `targets` block is the JSON equivalent of wrapping every target in `AsyncWrapper` -- one setting instead of nesting each target manually.

## Program.cs Setup: ASP.NET Core (.NET 8)

```csharp
using NLog.Web;

var logger = NLogBuilder.ConfigureNLog("nlog.config").GetCurrentClassLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Logging.ClearProviders();
    builder.Host.UseNLog();

    builder.Services.AddControllers();

    var app = builder.Build();
    app.MapControllers();
    app.Run();
}
catch (Exception ex)
{
    logger.Fatal(ex, "Application startup failed");
    throw;
}
finally
{
    NLog.LogManager.Shutdown();
}
```

The manually created `logger` at the top captures fatal startup errors before DI exists. `LogManager.Shutdown()` in `finally` flushes anything still buffered in `AsyncWrapper` targets before the process exits.

If you're using the `appsettings.json` approach instead, the `NLog` section is picked up automatically during host builder initialization -- no explicit `ConfigureNLog` call needed, though the same `try/catch/finally` pattern is still worth keeping for startup-error visibility.

## Program.cs Setup: Worker Service

```csharp
using NLog.Web;

var builder = Host.CreateApplicationBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddNLog();

builder.Services.AddHostedService<OrderProcessingWorker>();

var host = builder.Build();

try
{
    host.Run();
}
finally
{
    NLog.LogManager.Shutdown();
}
```

Worker Services use `AddNLog()` on the logging builder rather than `UseNLog()` on the host, since `UseNLog()` targets the web-specific `IHostBuilder` variant.

## Injecting and Using ILogger

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

Stick to message template syntax (`{OrderId}`) rather than string interpolation -- collapsing it into the message string throws away the structured property that database or JSON-based targets could otherwise index independently.

## Verifying Your Setup

1. **Log files appear** under `${basedir}/logs/`
2. **Console output uses NLog's format**, not the default ASP.NET Core console format
3. **Framework noise is reduced** -- `Microsoft.*` rules should quiet EF Core and hosting logs
4. **`internal-nlog.txt` is clean** -- errors there point to configuration problems

If nothing is logging, check `internal-nlog.txt` first. `throwConfigExceptions="true"` surfaces most problems at startup, but the internal log also captures anything NLog logs about itself after initialization.

## Configuration Best Practices

**Set `throwConfigExceptions="true"` during development.** A silently failing config means an app that runs normally but produces zero logs.

**Use `autoReload="true"` everywhere.** It lets you raise verbosity in production temporarily without a restart.

**Always call `LogManager.Shutdown()` in `finally`.** Skipping it risks losing buffered entries from `AsyncWrapper` on shutdown.

**Silence `Microsoft.*` explicitly with `final="true"`.** Otherwise EF Core and HTTP client tracing will drown out application logs.

**Keep environment overrides in `appsettings.Development.json`**, not in the production config directly.

## Comparison with Serilog Setup

| | NLog | Serilog |
| --- | --- | --- |
| Config style | XML file or JSON section | C# fluent API |
| ASP.NET Core integration | `builder.Host.UseNLog()` | `builder.Host.UseSerilog()` |
| Shutdown | `LogManager.Shutdown()` | `Log.CloseAndFlush()` |
| Async logging | `AsyncWrapper` target or `async=true` | Async sinks vary by package |

Both integrate identically with `ILogger<T>` from the application code's perspective.

## Frequently Asked Questions

### What package do I need to use NLog in ASP.NET Core?

Install `NLog.Web.AspNetCore`. It provides `UseNLog()`, the `${aspnet-*}` layout renderers, and the `Microsoft.Extensions.Logging` integration, pulling in the base `NLog` package automatically.

### Should I use nlog.config or appsettings.json?

Both work. Use XML if you want config that's fully separate from application settings and hot-reloadable independently. Use `appsettings.json` if you want everything centralized with environment-specific overrides via `appsettings.Development.json`.

### Why do I need the try/catch/finally pattern?

The `catch` block logs fatal startup errors that happen before DI initializes. The `finally` block's `LogManager.Shutdown()` flushes any buffered entries so they aren't lost when the process exits.

### How do I stop NLog from logging noisy Microsoft framework messages?

Add a rule with `final="true"` for `Microsoft.*` above your catch-all rule -- this stops evaluation after matching, silencing EF Core and hosting logs without affecting your own application's logger categories.

### Does NLog work with .NET 8 minimal APIs?

Yes. `builder.Logging.ClearProviders()` and `builder.Host.UseNLog()` work identically whether you're using controllers or minimal API endpoints.

### What is internal-nlog.txt used for?

It's NLog's self-diagnostics log -- configuration parse errors, target write failures, and other internal events. It's the first place to check when application logs aren't appearing as expected.

### How do I configure NLog differently for Development vs Production?

Override the `NLog` section in `appsettings.Development.json`, or edit `nlog.config` directly at runtime -- `autoReload="true"` picks up XML changes without a restart in any environment.
