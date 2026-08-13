---
author: Steve Kaschimer
date: 2026-12-08
image: /images/posts/2026-12-08-hero.webp
image_alt: "A lightning bolt inside a thin square outline next to a gauge with its needle pinned at zero, above a thin stream of small byte-like marks flowing directly into a file icon."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a lightning bolt icon inside a thin off-white square outline on the left, connected by a short teal line to a small circular gauge on the right with its needle resting firmly at the zero mark, labeled only by the needle position rather than text. Below both, a thin horizontal stream of small rectangular byte-marks flows directly from the bolt into a flat file icon, bypassing any intermediate shape, implying a direct write path. Mood is fast, precise, and minimal. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic speedometer/dashboard car imagery."
layout: post.njk
site_title: Tech Notes
summary: "ZLogger looks like any other Microsoft.Extensions.Logging provider until the log calls, which trade message templates for native string interpolation in exchange for allocation-free output. A complete setup guide."
tags: ["dotnet", "logging", "performance", "observability"]
title: "Getting Started with ZLogger in ASP.NET Core"
---

Setting up **ZLogger in ASP.NET Core** looks almost identical to setting up any other `Microsoft.Extensions.Logging` provider - until you get to the actual log calls, where ZLogger asks you to write things a little differently in exchange for a meaningful performance win. Instead of message templates like `"Order {OrderId} processed"`, you write native C# string interpolation, and a source generator turns each call into allocation-free, directly-UTF8-encoded output at compile time.

This guide covers a complete ZLogger setup for .NET 8: installing the package, the two ways to configure providers, `Program.cs` wiring for ASP.NET Core apps and Worker Services, and the interpolation-based logging syntax that replaces the usual `LogInformation(...)` calls. By the end you'll have a fast, low-allocation logging baseline suitable for high-throughput services.

If you're not sure ZLogger is the right fit yet, [a comparison of the top .NET logging frameworks](/posts/2026-11-10-top-5-dotnet-logging-frameworks-compared/) walks through when its performance trade-offs are worth the smaller ecosystem.

## What You'll Need

- .NET 8 SDK or later (ZLogger's full performance benefit depends on .NET 8's `IUtf8SpanFormattable`)
- C# 11 or later, since the source generator relies on newer compiler features
- An ASP.NET Core Web API, Blazor, or Worker Service project
- NuGet access

This guide covers Console and RollingFile output. ZLogger also supports HTTP-based batching for shipping logs to external services, which is a natural next step once the basics are working.

## Installing ZLogger

A single package covers both web and non-web hosts, since ZLogger is built directly on top of `Microsoft.Extensions.Logging` rather than needing a separate ASP.NET Core-specific package:

```bash
dotnet add package ZLogger
```

Because it plugs into the standard `ILoggingBuilder`, there's no separate "web" vs. "worker" package split the way NLog has - the same `ZLogger` package works in both hosting models.

## The Two Configuration Approaches

ZLogger is configured through code, but it supports reading log levels from the standard `appsettings.json` `Logging` section since it builds on `Microsoft.Extensions.Logging`'s existing configuration model.

### Approach 1: Code-based provider configuration

```csharp
builder.Logging.ClearProviders();

builder.Logging.AddZLoggerConsole(options =>
{
    options.UsePlainTextFormatter(formatter =>
    {
        formatter.SetPrefixFormatter(
            $"{0} | {1} |",
            (in MessageTemplate template, in LogInfo info) =>
                template.Format(info.Timestamp, info.LogLevel));
    });
});

builder.Logging.AddZLoggerRollingFile(options =>
{
    options.FilePathSelector = (timestamp, sequenceNumber) =>
        $"logs/app_{timestamp.ToLocalTime():yyyy-MM-dd}_{sequenceNumber:000}.log";
    options.RollingInterval = RollingInterval.Day;
    options.RollingSizeKB = 1024 * 10;
});
```

| Call | Purpose |
| --- | --- |
| `AddZLoggerConsole(...)` | Registers the console provider with a customizable formatter |
| `AddZLoggerRollingFile(...)` | File output that rolls by day, size, or both |
| `UsePlainTextFormatter` | Configures a human-readable output template, similar in spirit to NLog's `layout` |

For structured, machine-parseable output instead of plain text, swap in `UseJsonFormatter()` on either provider.

### Approach 2: appsettings.json for log levels

ZLogger doesn't have its own JSON schema for sinks the way Serilog does, but it fully respects the standard `Logging:LogLevel` section since providers are still registered through `Microsoft.Extensions.Logging`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  }
}
```

This means switching to ZLogger from the built-in providers doesn't require touching your existing level configuration at all - only the provider registration in `Program.cs` changes.

## Program.cs Setup: ASP.NET Core (.NET 8)

```csharp
using ZLogger;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddZLoggerConsole();
builder.Logging.AddZLoggerRollingFile(options =>
{
    options.FilePathSelector = (timestamp, sequenceNumber) =>
        $"logs/app_{timestamp.ToLocalTime():yyyy-MM-dd}_{sequenceNumber:000}.log";
    options.RollingInterval = RollingInterval.Day;
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();
app.MapControllers();
app.Run();
```

There's no separate shutdown call needed for the Console and RollingFile providers in typical usage - ZLogger's default providers handle flushing internally. If you add the HTTP batching processor for shipping logs to an external endpoint, check its specific disposal guidance, since network-based sinks generally need an explicit flush-on-shutdown step regardless of which logging library provides them.

## Program.cs Setup: Worker Service

```csharp
using ZLogger;

var builder = Host.CreateApplicationBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddZLoggerConsole();
builder.Logging.AddZLoggerRollingFile(options =>
{
    options.FilePathSelector = (timestamp, sequenceNumber) =>
        $"logs/worker_{timestamp.ToLocalTime():yyyy-MM-dd}_{sequenceNumber:000}.log";
    options.RollingInterval = RollingInterval.Day;
});

builder.Services.AddHostedService<OrderProcessingWorker>();

var host = builder.Build();
host.Run();
```

The registration is identical to the ASP.NET Core setup - since ZLogger providers register through the standard `ILoggingBuilder`, there's no host-specific variant to worry about the way NLog needs `UseNLog()` vs `AddNLog()`.

## Injecting and Using ILogger

This is where ZLogger diverges most from the other providers in this series. You still inject the standard `ILogger<T>`, but log calls use `Z`-prefixed methods with native string interpolation instead of message templates:

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
        _logger.ZLogInformation($"Received request to process order {orderId}");

        try
        {
            await _orderService.ProcessAsync(orderId);
            _logger.ZLogInformation($"Order {orderId} processed successfully");
            return Ok();
        }
        catch (OrderNotFoundException ex)
        {
            _logger.ZLogWarning(ex, $"Order {orderId} not found");
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.ZLogError(ex, $"Unexpected error processing order {orderId}");
            return StatusCode(500);
        }
    }
}
```

That `$"Order {orderId}"` isn't collapsed into a plain string the way it would be with a regular `LogInformation` call using string interpolation. ZLogger's source generator intercepts the interpolated string handler at compile time, so `orderId` is still captured as a structured, named value - you get the ergonomics of interpolation without losing the queryability that message templates exist to preserve in other providers.

## Verifying Your Setup

1. **Console output appears** in your configured formatter's style
2. **Log files roll daily** under the path pattern you configured
3. **Framework noise is reduced** - confirm `Microsoft.AspNetCore` entries respect your `appsettings.json` overrides
4. **Structured properties survive** - if using `UseJsonFormatter()`, confirm interpolated values appear as separate JSON fields, not flattened into the message string

If log calls aren't compiling or the interpolation isn't being intercepted as expected, confirm your project's `LangVersion` supports C# 11 - the source generator that ZLogger relies on for its performance characteristics requires it, and without it you'll fall back to slower reflection-based formatting.

## Configuration Best Practices

**Confirm you're targeting .NET 8 and C# 11+.** ZLogger's headline performance benefit comes from `IUtf8SpanFormattable` and the source generator, both of which need the newer toolchain to kick in.

**Use `ZLog*` methods consistently, not a mix of `ZLogInformation` and `LogInformation`.** Mixing them means some calls get the source-generated fast path and others fall back to standard `Microsoft.Extensions.Logging` formatting, which defeats the purpose of choosing ZLogger.

**Prefer `UseJsonFormatter()` if you're shipping logs anywhere structured.** The plain-text formatter is convenient for local development but throws away the same structured-property advantage that makes ZLogger worth using in the first place.

**Keep an eye on the sink ecosystem before committing for a new service.** ZLogger covers Console, File, RollingFile, InMemory, and HTTP batching well, but it doesn't have the breadth of ready-made sinks that Serilog does - confirm your target log platform is covered before standardizing on it.

**Override noisy namespaces the same way you would with any Microsoft.Extensions.Logging provider**, via `Logging:LogLevel` in `appsettings.json`.

## Comparison with Serilog Setup

| Dimension | ZLogger | Serilog |
| --- | --- | --- |
| Config style | Code-based provider registration | C# fluent API or JSON |
| Log call syntax | Native string interpolation (`ZLogInformation($"...")`), source-generated | Message templates (`LogInformation("... {Prop}", value)`) |
| Performance | Near-zero allocation, fastest of the two | Good, but not allocation-optimized to the same degree |
| Structured logging | Native, via interpolation handler interception | Native, via message templates |
| Sink ecosystem | Console, File, RollingFile, HTTP batching | 100+ community sinks |
| Shutdown | Handled internally for built-in providers | `Log.CloseAndFlush()` required |

Both give you structured logging by default; the trade-off is ZLogger's narrower ecosystem in exchange for meaningfully lower allocation overhead per log call.

## Frequently Asked Questions

### What package do I need to use ZLogger in ASP.NET Core?

Just `ZLogger`. Unlike NLog, there's no separate web-specific package - the same package works for both ASP.NET Core apps and Worker Services since it registers through the standard `ILoggingBuilder`.

### Do I need to change my log level configuration to use ZLogger?

No. ZLogger respects the standard `Logging:LogLevel` section in `appsettings.json`, so switching from the built-in providers only requires changing the provider registration in `Program.cs`, not your existing level configuration.

### Why does ZLogger use string interpolation instead of message templates?

ZLogger's source generator intercepts the C# interpolated string handler at compile time, generating code that writes each interpolated value directly to UTF-8 output without first allocating an intermediate formatted string. This gives you interpolation's familiar syntax while still preserving each value as a structured, named property - you're not trading structure for convenience the way plain string interpolation with a standard `LogInformation` call would.

### Do I need to call a shutdown/flush method like NLog's LogManager.Shutdown()?

Not for the Console and RollingFile providers in typical usage - they handle flushing internally. If you add the HTTP batching processor for shipping logs externally, check its specific guidance, since asynchronous network sinks generally need an explicit flush step before the process exits.

### Does ZLogger work with .NET 8 minimal APIs?

Yes, identically to controller-based routing. `builder.Logging.AddZLoggerConsole()` and friends register at the host level regardless of endpoint style.

### What happens if I mix ZLogInformation and regular LogInformation calls?

Both work, since ZLogger's providers still implement the standard `ILogger` interface. But only the `ZLog*` calls get the source-generated, allocation-free fast path - regular `LogInformation` calls fall back to standard formatting. Mixing them isn't broken, just inconsistent with the performance reason you'd choose ZLogger in the first place.

### Is ZLogger worth it if I'm not logging at high volume?

Probably not on its own. ZLogger's main advantage is allocation and throughput at high log volume - game servers, real-time systems, anything logging heavily per request. For typical CRUD APIs logging a handful of events per request, the built-in providers or Serilog will serve you just as well with a larger ecosystem to draw on.
