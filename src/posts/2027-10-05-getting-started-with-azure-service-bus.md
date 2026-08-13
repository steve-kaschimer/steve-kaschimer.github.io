---
author: Steve Kaschimer
date: 2027-10-05
image: /images/posts/2027-10-05-hero.webp
image_alt: "A cloud-bounded topic/subscription glyph with two identical output lines fanning to separate independent boxes, each stamped with a small completion checkmark."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small cloud-bounded topic shape at the center, with two identical thin teal lines fanning outward to two independent rectangular boxes, each stamped with a small amber completion checkmark, implying each subscriber gets its own copy and its own explicit acknowledgment. A faint lock-shaped icon sits beside one box, implying session-based ordering. Mood is polished, native, and dependable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic cloud clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The Azure.Messaging.ServiceBus SDK feels designed by people who write ASP.NET Core applications, not adapted from a cross-language client. A setup guide for queues vs. topics/subscriptions, MessageId-based duplicate detection, and explicit message completion instead of relying on AutoCompleteMessages."
tags: ["dotnet", "messaging", "cloud", "architecture", "devops"]
title: "Getting Started with Azure Service Bus in .NET"
---

Azure Service Bus's reputation as the best .NET developer experience among message brokers isn't marketing - the `Azure.Messaging.ServiceBus` SDK genuinely feels like it was designed by people who write ASP.NET Core applications, not adapted from a cross-language client. That smoothness can hide a couple of decisions worth making deliberately rather than by default: whether you need queues or topics, and how you handle message locking for longer-running processing.

This guide covers installing and connecting to Azure Service Bus from .NET, bootstrapping queues and topic/subscription pub-sub, the core send/receive workflow including message locking, and the best practices that keep a Service Bus-backed system reliable under real failure conditions. By the end you'll have a working setup using either pattern, and a clear sense of which one fits a given scenario.

If you're deciding between message brokers first, [a comparison of the top .NET message brokers](/posts/2027-09-14-top-5-dotnet-message-brokers-compared/) covers where Azure Service Bus fits relative to RabbitMQ, Kafka, Amazon SQS, and NATS.

## What You'll Need

- .NET 8 SDK or later
- An Azure subscription and a Service Bus namespace (Standard tier supports topics; Basic tier is queues-only)

```bash
az servicebus namespace create --name my-app-servicebus --resource-group my-rg --sku Standard
az servicebus queue create --name orders --namespace-name my-app-servicebus --resource-group my-rg
```

## Installing the Azure Service Bus SDK

```bash
dotnet add package Azure.Messaging.ServiceBus
```

## Bootstrapping the Ideal Environment

### Queues: point-to-point delivery

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(_ =>
    new ServiceBusClient(builder.Configuration.GetConnectionString("ServiceBus")));

var app = builder.Build();
```

`ServiceBusClient` is designed to be a long-lived singleton, the same discipline that applies to Redis's connection multiplexer - create it once, share it across your application.

### Sending a message

```csharp
public class OrderService(ServiceBusClient client)
{
    public async Task SubmitOrderAsync(Order order)
    {
        await using var sender = client.CreateSender("orders");

        var message = new ServiceBusMessage(JsonSerializer.Serialize(order))
        {
            ContentType = "application/json",
            MessageId = order.Id.ToString() // enables duplicate detection if configured on the queue
        };

        await sender.SendMessageAsync(message);
    }
}
```

`MessageId` combined with duplicate detection (configured on the queue itself) gives you a straightforward way to guard against accidental re-sends without building your own idempotency key tracking.

### Receiving messages with a background processor

```csharp
public class OrderQueueProcessor(ServiceBusClient client, IOrderService orderService, ILogger<OrderQueueProcessor> logger)
    : BackgroundService
{
    private ServiceBusProcessor? _processor;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _processor = client.CreateProcessor("orders", new ServiceBusProcessorOptions
        {
            MaxConcurrentCalls = 8,
            AutoCompleteMessages = false // complete manually after successful processing
        });

        _processor.ProcessMessageAsync += async args =>
        {
            var order = JsonSerializer.Deserialize<Order>(args.Message.Body.ToString());
            try
            {
                await orderService.ProcessAsync(order!.Id);
                await args.CompleteMessageAsync(args.Message);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process order {OrderId}", order?.Id);
                await args.AbandonMessageAsync(args.Message); // returns to queue for redelivery
            }
        };

        _processor.ProcessErrorAsync += args =>
        {
            logger.LogError(args.Exception, "Service Bus processor error");
            return Task.CompletedTask;
        };

        await _processor.StartProcessingAsync(stoppingToken);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_processor is not null)
            await _processor.StopProcessingAsync(cancellationToken);
        await base.StopAsync(cancellationToken);
    }
}
```

`AutoCompleteMessages = false` paired with explicit `CompleteMessageAsync` after successful processing is the safer pattern - the same principle that applies to manual offset commits in Kafka, ensuring a message isn't marked done until your handler actually finishes with it.

### Topics and subscriptions, for pub/sub

```bash
az servicebus topic create --name order-events --namespace-name my-app-servicebus --resource-group my-rg
az servicebus topic subscription create --name notifications --topic-name order-events --namespace-name my-app-servicebus --resource-group my-rg
```

```csharp
await using var sender = client.CreateSender("order-events");
await sender.SendMessageAsync(new ServiceBusMessage(JsonSerializer.Serialize(orderPlacedEvent)));
```

Each subscription on a topic receives its own copy of every message published to that topic - this is Service Bus's equivalent of RabbitMQ's fanout exchange, letting multiple independent consumers react to the same event without competing for the same messages.

## Core Workflow

- **Use queues for point-to-point work distribution, topics for pub/sub.** This mirrors the same architectural decision you'd make with RabbitMQ's queues vs. exchanges - pick based on whether one consumer or many independent consumers should see each message.
- **Complete messages manually after successful processing**, abandoning (for retry) or dead-lettering (for messages that will never succeed) explicitly rather than relying on auto-complete.
- **Use message sessions for scenarios requiring strict ordering per logical group.** Sessions let you process related messages (like all events for one order) in order, similar in spirit to Kafka's partition-key ordering guarantee.

```csharp
if (retryCount >= maxRetries)
{
    await args.DeadLetterMessageAsync(args.Message, "MaxRetriesExceeded");
}
else
{
    await args.AbandonMessageAsync(args.Message);
}
```

## Verifying Your Setup

1. **Messages send and receive correctly** - confirm a message sent to a queue is received and completed by your processor
2. **Duplicate detection works, if configured** - send the same `MessageId` twice within the detection window and confirm only one is delivered
3. **Failed messages end up in the dead-letter queue after exhausting retries**, not looping indefinitely - confirm your abandon/dead-letter logic actually terminates
4. **Topic subscriptions each receive their own copy** - confirm multiple subscriptions on the same topic each independently receive every published message

## Best Practices

**Register `ServiceBusClient` as a singleton and share it.** It manages its own connection pooling internally - creating new clients per operation is unnecessary overhead.

**Set `AutoCompleteMessages = false` and complete messages explicitly after successful processing.** This avoids the same class of "marked done before actually done" risk that applies to Kafka's auto-commit.

**Use `MessageId` and duplicate detection for anything where accidental re-sends are a real risk.** It's a low-effort way to get idempotency protection without building your own deduplication logic.

**Choose queues vs. topics deliberately based on consumer cardinality**, not habit - a queue where you actually need pub/sub means you're missing fan-out to other interested consumers; a topic for pure point-to-point work adds unnecessary structure.

**Move messages to the dead-letter queue explicitly once retries are exhausted, rather than abandoning indefinitely.** An abandon loop with no termination condition just means a message cycling forever without ever being resolved or flagged for attention.

## Comparison with Amazon SQS

| | Azure Service Bus | Amazon SQS |
| --- | --- | --- |
| Model | Queues and topics/subscriptions | Queues (standard and FIFO); pub/sub via SNS+SQS |
| .NET SDK experience | Excellent, idiomatic and async-first | Good, straightforward |
| Duplicate detection | Built in via `MessageId` | Built in for FIFO queues |
| Ordering | Via message sessions | Via FIFO queues |
| Best fit | Azure-native teams wanting managed pub/sub built in | AWS-native teams wanting the cheapest, simplest queueing |

Both are fully managed and both integrate cleanly with .NET, but the choice is really about which cloud platform you're already committed to - Service Bus's built-in topic/subscription model is a genuine convenience over pairing SNS with SQS for the equivalent pub/sub pattern on AWS.

## Frequently Asked Questions

### Should I use a queue or a topic for a given scenario?

Use a queue when exactly one consumer should process each message (work distribution). Use a topic with subscriptions when multiple independent consumers each need their own copy of every message (pub/sub) - the same distinction that applies to point-to-point vs. broadcast messaging in any broker.

### How do I prevent duplicate messages from being processed twice?

Set a `MessageId` on outgoing messages and enable duplicate detection on the queue or topic (with a configured detection time window). Service Bus will recognize and discard duplicate `MessageId`s sent within that window, giving you idempotency protection without building your own deduplication tracking.

### What's the difference between abandoning and dead-lettering a message?

Abandoning returns a message to the queue for redelivery, appropriate for transient failures you expect to succeed on retry. Dead-lettering moves a message to a separate dead-letter queue permanently, appropriate once you've determined a message will never successfully process (after exhausting retries, or on a clearly invalid message) - it stops the message from cycling indefinitely while preserving it for inspection.

### How do I guarantee message ordering in Azure Service Bus?

Use message sessions, which group related messages (via a session ID you assign) and guarantee they're processed in order by a single consumer at a time. This is Service Bus's equivalent of Kafka's partition-key ordering guarantee, scoped to a logical group rather than the entire queue or topic.

### Is Azure Service Bus expensive at high volume?

It can become costly relative to self-hosted RabbitMQ or Kafka at very high message volumes, since Service Bus pricing scales with usage (operations and, on Premium tier, throughput units). For moderate volumes, especially weighed against the operational cost of self-hosting an alternative, it's often still cost-competitive - model your actual expected volume against current pricing rather than assuming either direction by default.

### Can I use Azure Service Bus with MassTransit instead of the native SDK directly?

Yes - MassTransit supports Azure Service Bus as a transport, giving you the same consumer/publish abstraction you'd use with RabbitMQ, at the cost of an additional abstraction layer over Service Bus's already strong native SDK. Many teams use the native SDK directly specifically because Service Bus's own client is already idiomatic enough that MassTransit's abstraction adds less relative value than it does over RabbitMQ's lower-level client.

### What's the most common mistake in a first Azure Service Bus setup?

Leaving `AutoCompleteMessages` at its default and not explicitly completing messages after successful processing, risking the same "marked done before actually done" class of bug that applies to auto-commit in Kafka. The second common mistake is choosing a queue for a scenario that actually needs a topic's fan-out to multiple independent consumers.
