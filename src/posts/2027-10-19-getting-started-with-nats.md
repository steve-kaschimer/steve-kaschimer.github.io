---
author: Steve Kaschimer
date: 2027-10-19
image: /images/posts/2027-10-19-hero.webp
image_alt: "A lightweight subject-hierarchy glyph shown as a small dot branching into three thin dotted paths, with one path terminating in a persisted-stream marker distinct from the other two ephemeral ones."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small solid teal dot branching into three thin dotted lines fanning outward at slightly different angles, representing a subject hierarchy. Two of the lines terminate in plain open endpoints implying ephemeral, fire-and-forget delivery, while the third terminates in a small solid amber cylinder-free stream marker implying persistence layered on top. Mood is light, fast, and deliberately minimal. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "NATS's core pitch is that most messaging doesn't need to be as heavy as it usually is - subject-based pub/sub, a tiny operational footprint, and genuinely low latency. A setup guide for core NATS's fire-and-forget model and JetStream's durability once persistence actually matters."
tags: ["dotnet", "messaging", "architecture", "performance", "microservices"]
title: "Getting Started with NATS in .NET"
---



NATS's core pitch is that most messaging doesn't need to be as heavy as it usually is - subject-based publish-subscribe, a tiny operational footprint, and genuinely low latency, without RabbitMQ's exchange configuration or Kafka's partition mechanics. The trade-off is equally direct: core NATS is fire-and-forget with no persistence at all, and understanding exactly when that's fine (and when you need JetStream layered on top) is the single most important decision in adopting it.

This guide covers installing and connecting to NATS from .NET, bootstrapping both core NATS pub/sub and JetStream for durable messaging, the core patterns for publish/subscribe and request-reply, and the best practices for knowing which of the two modes a given piece of your system actually needs. By the end you'll have a lightweight messaging setup and a clear mental model for when "lightweight" stops being enough.

If you're deciding between message brokers first, [a comparison of the top .NET message brokers](/posts/2027-09-14-top-5-dotnet-message-brokers-compared/) covers where NATS fits relative to RabbitMQ, Kafka, Azure Service Bus, and Amazon SQS.

## What You'll Need

- .NET 8 SDK or later
- Docker, for running NATS locally

```bash
docker run -d --name nats -p 4222:4222 -p 8222:8222 nats:latest -js
```

The `-js` flag enables JetStream on the server - worth including from the start even if you begin with core NATS, so you can add durability later without reprovisioning.

## Installing the NATS Client

```bash
dotnet add package NATS.Client.Core
dotnet add package NATS.Client.JetStream
```

## Bootstrapping the Ideal Environment

### Connecting

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(_ =>
    new NatsConnection(new NatsOpts { Url = builder.Configuration["Nats:Url"] ?? "nats://localhost:4222" }));

var app = builder.Build();
```

`NatsConnection` is designed to be a long-lived singleton, the same pattern as Redis's connection multiplexer or Service Bus's client - create once, share across the application.

### Core NATS: fire-and-forget publish/subscribe

```csharp
public class OrderEventPublisher(NatsConnection nats)
{
    public async Task PublishOrderSubmittedAsync(OrderSubmitted evt)
    {
        await nats.PublishAsync("orders.submitted", evt);
    }
}
```

```csharp
public class OrderEventSubscriber(NatsConnection nats, IOrderService orderService) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var msg in nats.SubscribeAsync<OrderSubmitted>("orders.submitted", cancellationToken: stoppingToken))
        {
            await orderService.ProcessAsync(msg.Data!.OrderId);
        }
    }
}
```

This is genuinely all there is to core NATS pub/sub - no queue declaration, no exchange configuration. But note what's missing compared to every other broker in this series: if no subscriber is connected when a message publishes, it's simply gone. There's no queue holding it for later.

### Subject hierarchies and wildcards

```csharp
// Publish to a specific, hierarchical subject
await nats.PublishAsync("orders.submitted.us-west", evt);

// Subscribe with a wildcard to receive from all regions
await foreach (var msg in nats.SubscribeAsync<OrderSubmitted>("orders.submitted.*", cancellationToken: stoppingToken))
{
    // handles orders.submitted.us-west, orders.submitted.eu-central, etc.
}
```

Subjects are dot-separated hierarchies, and `*` (single token) and `>` (multiple trailing tokens) wildcards let subscribers express interest in a range of related subjects without needing separate subscriptions for each - this is NATS's answer to RabbitMQ's topic exchange routing.

### JetStream: durability and replay, when you need them

```csharp
var js = new NatsJSContext(nats);

await js.CreateStreamAsync(new StreamConfig("ORDERS", ["orders.>"])
{
    Retention = StreamConfigRetention.Limits,
    MaxAge = TimeSpan.FromDays(7)
});
```

```csharp
// Publish through JetStream for persistence
var ack = await js.PublishAsync("orders.submitted", evt);
```

```csharp
// A durable consumer that survives restarts and tracks its own position
var consumer = await js.CreateOrUpdateConsumerAsync("ORDERS", new ConsumerConfig("order-processor")
{
    AckPolicy = ConsumerConfigAckPolicy.Explicit
});

await foreach (var msg in consumer.ConsumeAsync<OrderSubmitted>())
{
    await orderService.ProcessAsync(msg.Data!.OrderId);
    await msg.AckAsync();
}
```

This is a meaningfully different mode from core NATS - messages persist in a stream, consumers track their own position durably, and explicit acknowledgment (similar to Kafka's manual offset commit, or Service Bus's message completion) governs redelivery. Reach for this the moment "the message must not be lost if nobody's listening right now" becomes a real requirement.

## Core Workflow

- **Use core NATS for genuinely ephemeral, low-latency signaling** where losing a message when no one's listening is acceptable - real-time status updates, cache invalidation broadcasts, anything where a missed message just means slightly stale state rather than lost work.
- **Use JetStream the moment durability matters**, treating the decision the same way you'd decide between Kafka's log-based durability and a plain queue's simpler at-least-once model.
- **Use subject hierarchies deliberately**, designing your subject naming (`orders.submitted.region`) to support the wildcard subscriptions you'll actually need, the same care you'd put into RabbitMQ routing keys.

## Verifying Your Setup

1. **Core NATS pub/sub delivers to active subscribers** - confirm a message published while a subscriber is connected is received
2. **Core NATS messages are genuinely lost with no subscriber connected** - confirm this explicitly so it's a known, intentional trade-off rather than a surprise in production
3. **JetStream persists and redelivers correctly** - confirm a JetStream-published message is still delivered to a consumer that connects after the publish, unlike core NATS
4. **Explicit acknowledgment in JetStream governs redelivery correctly** - confirm an unacknowledged message is redelivered, and an acknowledged one isn't

## Best Practices

**Be explicit with yourself about which mode (core or JetStream) each part of your system needs.** This is the single most consequential decision in a NATS-based design - treating core NATS's fire-and-forget behavior as an oversight rather than a deliberate choice leads to real, silent message loss.

**Design subject hierarchies thoughtfully from the start.** Wildcards make hierarchical subjects powerful, but only if the hierarchy itself reflects how you'll actually want to subscribe later - retrofitting a subject naming scheme is more disruptive than planning one upfront.

**Use JetStream's explicit acknowledgment for anything where processing correctness matters**, the same defensive default that applies to manual offset commits in Kafka or explicit completion in Service Bus.

**Keep NATS's operational footprint light by not over-provisioning for scale you don't have.** Its appeal is partly that it doesn't need Kafka-scale operational investment - don't recreate that complexity unnecessarily if your actual throughput doesn't call for it.

**Evaluate the smaller .NET ecosystem honestly before committing.** Fewer examples and less abstraction-library support, compared to RabbitMQ or Kafka, mean more of the integration work falls on your team directly - factor that into the adoption decision, not just NATS's technical merits.

## Comparison with RabbitMQ

| | NATS | RabbitMQ |
| --- | --- | --- |
| Model | Subject-based pub/sub; JetStream for persistence | Queue/exchange-based broker |
| Default durability | None (core NATS) | Durable by default with persistent queues |
| Operational footprint | Very light | Moderate, more mature tooling |
| .NET ecosystem | Smaller | Larger, especially via MassTransit |
| Best fit | Lightweight, low-latency cloud-native messaging | General-purpose messaging with flexible routing |

NATS is the leaner choice when your priority is minimal operational overhead and low latency; RabbitMQ (especially via MassTransit) offers a more mature .NET ecosystem and durable-by-default behavior without needing a second mode (JetStream) layered on to get there.

## Frequently Asked Questions

### Does NATS guarantee message delivery like RabbitMQ or Kafka?

Not by default - core NATS is fire-and-forget: if no subscriber is connected when a message publishes, it's lost with no persistence to fall back on. JetStream, layered on top of core NATS, adds the durability, persistence, and redelivery guarantees comparable to what RabbitMQ or Kafka provide by default.

### When should I use JetStream instead of core NATS?

The moment message loss due to no active subscriber becomes unacceptable for that specific use case. Core NATS is appropriate for ephemeral signaling where a missed message just means slightly stale state; JetStream is appropriate wherever a message represents work that must eventually happen, not just a notification that can be safely missed.

### How do NATS subject wildcards work?

`*` matches exactly one token in a dot-separated subject hierarchy (`orders.submitted.*` matches `orders.submitted.us-west` but not `orders.submitted.us-west.priority`), while `>` matches one or more trailing tokens (`orders.>` matches everything under `orders.`). Designing your subject hierarchy with these patterns in mind from the start makes future wildcard subscriptions much more natural.

### Is NATS suitable for high-throughput streaming like Kafka?

JetStream can handle substantial throughput and does support persistence and replay conceptually similar to Kafka, but Kafka remains the more mature, battle-tested choice specifically for very high-volume event streaming and analytics pipelines. NATS's strength is closer to lightweight, low-latency messaging than Kafka-scale log processing, even with JetStream enabled.

### Can I do request-reply messaging with NATS?

Yes - it's a first-class, well-supported pattern in core NATS, arguably more natural than in RabbitMQ or Kafka, since NATS's request-reply is built directly into its core pub/sub model rather than requiring an additional pattern layered on top.

### How mature is the .NET client for NATS?

Solid and actively maintained, but with a meaningfully smaller community and fewer examples than Confluent.Kafka, RabbitMQ's client, or Azure Service Bus's SDK. Evaluate this honestly against your team's risk tolerance and need for community support, separate from NATS's technical capabilities.

### What's the most common mistake when adopting NATS?

Using core NATS for a scenario that actually needed JetStream's durability, and discovering message loss in production rather than as a deliberate, understood design decision made upfront. The second common mistake is underestimating the smaller ecosystem's impact on day-to-day development compared to more established brokers.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
