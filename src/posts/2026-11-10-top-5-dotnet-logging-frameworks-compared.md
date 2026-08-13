---
author: Steve Kaschimer
date: 2026-11-10
image: /images/posts/2026-11-10-hero.webp
image_alt: "Five columns of abstract logging glyphs positioned along a horizontal axis running from built-in on the left to allocation-optimized on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: a simple wall-outlet/plug icon, a small tag-shaped property pill with a curly-brace mark, a branching tree of thin lines ending in three small target boxes, a faintly aged scroll/parchment rectangle with a soft crack, and a lightning bolt inside a thin square outline. Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'built-in' on the left to 'allocation-optimized' on the right, with a small glowing teal dot positioned at a different point under each column. Mood is comparative, engineering-first, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, robot faces, generic gears or lightbulb clip art."
layout: post.njk
site_title: Tech Notes
summary: "Microsoft.Extensions.Logging, Serilog, NLog, log4net, and ZLogger don't solve the same problem. A practical breakdown of what each actually optimizes for, and why the decision is unusually reversible."
tags: ["dotnet", "logging", "observability", "performance", "tooling"]
title: "The Top 5 .NET Logging Frameworks Compared: Which One Should You Choose?"
---

Picking a logging framework for a new .NET project sounds like it should take five minutes, but the options don't all solve the same problem. Some are built in and require zero setup. Others trade a bit of setup complexity for raw throughput. Others exist specifically because plain-text logs stopped being good enough once teams started shipping to centralized log platforms that expect structured data.

This guide compares the five logging frameworks .NET developers reach for most often: **Microsoft.Extensions.Logging**, **Serilog**, **NLog**, **log4net**, and **ZLogger**. Rather than declaring one universal winner, it breaks down what each one is actually good at, where it falls short, and which project profile it fits best - so you can match the framework to your situation instead of your situation to the framework. This series continues with dedicated getting-started walkthroughs for each one in ASP.NET Core.

## Quick Comparison

| Dimension | Microsoft.Extensions.Logging | Serilog | NLog | log4net | ZLogger |
| --- | --- | --- | --- | --- | --- |
| **Setup effort** | None - built in | Low | Low | Low-Medium | Low |
| **Config style** | JSON or code | Code-first (fluent API) | XML or JSON | XML | Code-first |
| **Structured logging** | Basic (scopes) | Native, first-class | Supported via layout renderers | Not native | Native |
| **Performance** | Good | Good | Good | Fair | Best-in-class (near-zero allocation) |
| **Ecosystem / sinks** | Small (built-in providers only) | Huge (100+ sinks) | Large (many targets) | Moderate | Growing |
| **Best for** | Small apps, libraries, defaults | Cloud-native apps shipping to log platforms | Enterprise apps needing flexible file/target routing | Legacy or already-log4net codebases | High-throughput, allocation-sensitive services |
| **Maturity** | Ships with .NET | Mature, actively developed | Very mature (since 2006) | Oldest .NET logger (since 2001) | Newer, actively developed by Cysharp |

## Microsoft.Extensions.Logging

This is the logging abstraction and default provider set that ships with every ASP.NET Core and Worker Service template. It's less a "framework you choose" and more the water everyone is already swimming in - every other library in this list plugs into `ILogger<T>` rather than replacing it.

**Strengths:**

- Zero installation for ASP.NET Core and Worker Service projects
- `appsettings.json`-driven configuration that every .NET developer already recognizes
- The `ILogger<T>` interface it defines is what all the other frameworks in this article implement, so switching later doesn't touch your application code

**Weaknesses:**

- The built-in providers (Console, Debug, EventSource, EventLog) are thin - no rolling files, no structured sinks, no database targets without adding something else
- No native structured-logging story beyond `BeginScope`
- Not really a competitor to the other four so much as the foundation they all sit on

```csharp
builder.Logging.AddFilter("Microsoft.AspNetCore", LogLevel.Warning);
builder.Logging.SetMinimumLevel(LogLevel.Information);
```

**Choose this when:** you're building something small, a class library that shouldn't force a specific logging dependency on consumers, or a prototype where you don't want to think about logging infrastructure yet.

## Serilog

Serilog popularized structured logging in .NET - the idea that a log event is a set of named properties, not just a formatted string. It configures almost entirely through a fluent C# API rather than XML, which many developers find more discoverable and easier to unit test around.

**Strengths:**

- Structured logging is the default behavior, not an add-on
- The sink ecosystem is enormous - Seq, Elasticsearch, Application Insights, Datadog, and dozens more are one NuGet package away
- Enrichers let you attach contextual data (machine name, correlation IDs, request properties) to every log event automatically

**Weaknesses:**

- Fluent configuration in `Program.cs` can get long for complex setups, and it's less hot-reloadable than XML-based alternatives
- Two-stage initialization (a bootstrap logger before the host builds, then the real one) trips up newcomers
- Slightly more ceremony than NLog for simple file-and-console scenarios

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

builder.Host.UseSerilog();
```

**Choose this when:** you're shipping logs to a structured log platform (Seq, Elasticsearch, Datadog) and want properties to be queryable and filterable rather than buried in a formatted string.

## NLog

NLog has been around since 2006 and remains one of the most flexible options for routing logs to many different destinations. It supports both XML and JSON configuration, and its `AsyncWrapper` target pattern makes it straightforward to keep logging off your request-handling threads.

**Strengths:**

- Extremely flexible target system - file, console, database, network, and many community-maintained custom targets
- `autoReload="true"` lets you change log levels and targets at runtime without restarting the app
- ASP.NET Core-aware layout renderers (`${aspnet-request-url}`, `${aspnet-TraceIdentifier}`) via `NLog.Web.AspNetCore`

**Weaknesses:**

- XML configuration, while powerful, has a steeper learning curve than Serilog's fluent API or ZLogger's code-first approach
- Structured logging support exists but isn't as central to the design as it is in Serilog or ZLogger
- Requires the explicit `LogManager.Shutdown()` shutdown pattern to avoid losing buffered log entries

```xml
<target xsi:type="File"
        fileName="${basedir}/logs/app-${shortdate}.log"
        layout="${longdate}|${uppercase:${level}}|${logger}|${message}" />
```

**Choose this when:** you need fine-grained control over routing different loggers to different targets (file, database, email alerts) and want that routing to be adjustable at runtime without a redeploy.

## log4net

log4net is the oldest logging framework on this list - a .NET port of the Java `log4j` library dating back to 2001. It's the grandparent that NLog itself was partly inspired by, and it's still actively maintained under the Apache Logging Services project. Most teams encounter it today through legacy codebases rather than choosing it fresh.

**Strengths:**

- Extremely stable, well-understood API with decades of production usage behind it
- Simple appender/layout model that's easy to reason about for straightforward file and console logging
- Low dependency footprint

**Weaknesses:**

- No native JSON configuration - everything is XML
- Fails silently on configuration errors by default, unlike NLog's `throwConfigExceptions` option
- No first-class structured logging or async-by-default writing the way Serilog and ZLogger offer
- Smaller and slower-moving ecosystem than NLog or Serilog for new integrations

```xml
<appender name="RollingFile" type="log4net.Appender.RollingFileAppender">
  <file value="logs/app.log" />
  <rollingStyle value="Date" />
</appender>
```

**Choose this when:** you're maintaining an existing codebase already built on log4net and there's no compelling reason to migrate, or you're working in an organization with established log4net tooling and conventions.

## ZLogger

ZLogger is the newest and most specialized entry here - a zero-allocation, source-generator-based logger from Cysharp built directly on top of `Microsoft.Extensions.Logging`. Instead of formatting log messages into strings and then encoding them, it writes structured data directly to UTF-8 using C# string interpolation handlers, which the source generator turns into highly optimized code at compile time.

**Strengths:**

- Consistently the fastest option in allocation and throughput benchmarks, particularly on .NET 8+
- Uses native C# string interpolation for log calls (`logger.ZLogInformation($"Order {orderId} processed")`) rather than a separate template syntax
- Built on `Microsoft.Extensions.Logging`, so it slots into existing `ILogger<T>` code with minimal friction
- Supports the output destinations most services actually need: Console, File, RollingFile, and HTTP-based batching

**Weaknesses:**

- Much smaller sink ecosystem than Serilog or NLog - fewer out-of-the-box integrations with log platforms
- Requires C# 10+ (source generator needs C# 11) and is best on .NET 8 or later to get its full performance benefit
- Younger project with a smaller community than the other four, so fewer Stack Overflow answers and third-party tutorials

```csharp
using ZLogger;

builder.Logging.AddZLoggerConsole();
builder.Logging.AddZLoggerRollingFile(options =>
{
    options.FilePathSelector = (dt, x) => $"logs/{dt.ToLocalTime():yyyy-MM-dd}_{x:000}.log";
});

logger.ZLogInformation($"Order {orderId} processed successfully");
```

**Choose this when:** you're building a high-throughput service - game backends, real-time systems, anything logging at high volume - where allocation pressure from logging is measurably affecting performance, and you're comfortable with a smaller ecosystem in exchange for speed.

## How to Decide

A few heuristics that cover most real-world decisions:

**Building a small app, a library, or a prototype?** Stick with Microsoft.Extensions.Logging's built-in providers until you have a concrete reason to add something else. Libraries especially should log against `ILogger<T>` and let the consuming application choose the provider.

**Shipping logs to Seq, Elasticsearch, Datadog, or a similar platform?** Serilog's structured-logging-first design and massive sink ecosystem make it the path of least resistance.

**Need flexible routing to many different targets, with runtime-adjustable configuration?** NLog's target system and `autoReload` support are hard to beat.

**Already have a log4net codebase and no urgent reason to migrate?** Don't rewrite working logging infrastructure just to chase a trend - log4net is stable and well understood.

**Logging at high volume where allocations matter?** ZLogger is purpose-built for this and will outperform the others in throughput-sensitive scenarios.

None of these are permanent decisions. Because Serilog, NLog, log4net, and ZLogger all ultimately implement `Microsoft.Extensions.Logging`'s `ILogger<T>`, your application and controller code doesn't need to change if you swap providers later - only your `Program.cs` wiring and configuration files do.

## Frequently Asked Questions

### Which .NET logging framework is fastest?

ZLogger is consistently the fastest in allocation and throughput benchmarks, largely because it writes UTF-8 output directly via source-generated code rather than formatting strings first. Microsoft.Extensions.Logging's built-in providers and NLog are both reasonably fast for typical application logging volumes; log4net tends to lag behind on performance-focused comparisons.

### Do I have to pick just one logging framework?

No, but you generally should. All of these frameworks (aside from raw Microsoft.Extensions.Logging) work by plugging into `ILogger<T>` as a provider, so technically you could register more than one - but doing so usually means duplicate log output rather than added value. Pick one provider per application.

### Is Serilog better than NLog?

Neither is strictly better - they solve overlapping but different problems well. Serilog is stronger if structured logging and a large sink ecosystem are priorities. NLog is stronger if you want highly flexible, runtime-adjustable routing across many target types with an XML-based configuration model. Many teams have strong preferences based on which one they learned first.

### Should I migrate an existing log4net project to something newer?

Not automatically. If log4net is meeting your needs and the codebase is stable, migrating purely to be "modern" introduces risk without a clear benefit. Migration becomes worth considering when you need capabilities log4net doesn't offer well - native structured logging, JSON configuration, or a broader sink ecosystem for a new log aggregation platform.

### What logging framework does Microsoft recommend for ASP.NET Core?

Microsoft doesn't officially endorse a third-party framework - `Microsoft.Extensions.Logging` with its built-in providers is what ships by default, and Microsoft's own documentation describes it as extensible via provider packages. NLog, Serilog, log4net, and ZLogger are all community-maintained providers that plug into this abstraction rather than replacements for it.

### Is ZLogger production-ready?

Yes, it's used in production, particularly in performance-sensitive contexts like game server backends, but it's a younger project with a smaller community than Serilog, NLog, or log4net. Evaluate its sink ecosystem against your specific output needs (log aggregators, structured platforms) before committing, since it has fewer built-in integrations than the more established libraries.
