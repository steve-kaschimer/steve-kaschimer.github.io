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

The water everyone swims in. Built into every ASP.NET Core and Worker Service template. Every other logger on this list plugs into `ILogger<T>` rather than replacing it.

Zero setup. Configure via `appsettings.json`. The built-in providers are thin (Console, Debug, EventSource) - no rolling files, no structured sinks without adding something else.

Use it for small apps, for libraries that shouldn't force a logging dependency on their consumers, or when you genuinely don't care about logging infrastructure yet. Later, when you want a real sinking system, you swap in Serilog or NLog without touching your application code, they all implement `ILogger<T>`.

## Serilog

Structured logging: a log event is a set of named properties, not a formatted string. Configure via fluent C# API in `Program.cs`, not XML. Properties are queryable.

The sink ecosystem is enormous, Seq, Elasticsearch, Application Insights, Datadog, and dozens more are one NuGet away. Enrichers attach contextual data (machine name, correlation IDs, request ID) to every event automatically.

Bootstrap logger pattern (a temporary logger before the host builds, then the real one) trips up newcomers. Fluent configuration can get long for complex setups. But if you're shipping to Seq or Elasticsearch, properties being queryable instead of buried in a string matters.

## NLog

Flexible routing to many targets: file, console, database, network, custom. Configure via XML or JSON. Change levels and targets at runtime with `autoReload="true"` without restarting.

ASP.NET Core-aware layout renderers: `${aspnet-request-url}`, `${aspnet-TraceIdentifier}`. Async targets keep logging off your request threads.

XML configuration is powerful but steeper than Serilog's fluent API. Structured logging exists but isn't first-class. Requires explicit `LogManager.Shutdown()` to avoid losing buffered entries.

## log4net

Stable. Decades of production use. Simple appender/layout model. Still maintained under Apache Logging Services.

Only XML configuration. Fails silently on config errors by default. No first-class structured logging or async-by-default. Smaller ecosystem than NLog.

Use it for existing codebases already built on it. For new projects, better choices exist.

## ZLogger

Zero allocation, source-generated at compile time. Writes structured data directly to UTF-8 using C# string interpolation. Fastest option in benchmarks, particularly on .NET 8+.

Native string interpolation for log calls: `logger.ZLogInformation($"Order {orderId} processed")`. Built on `ILogger<T>`, slots into existing code. Supports Console, File, RollingFile, HTTP batching.

Smaller sink ecosystem than Serilog or NLog. Requires C# 10+, best on .NET 8. Younger project, smaller community.

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


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
