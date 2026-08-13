---
author: Steve Kaschimer
date: 2027-10-12
image: /images/posts/2027-10-12-hero.webp
image_alt: "A minimal single-lane queue glyph with a clean start and end, a small visibility-timeout clock hovering above the midpoint instead of any explicit acknowledgment marker."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single flat horizontal lane with a clear entry point on the left and exit point on the right, representing a plain queue with no branching or exchange logic. A small amber clock icon hovers above the lane's midpoint, implying a visibility timeout governs redelivery rather than an explicit acknowledgment step. Mood is simple, direct, and zero-ops. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic cloud clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "SQS's simplicity is genuinely refreshing after RabbitMQ's exchange model or Kafka's partition mechanics - a queue, messages go in, messages come out, AWS handles the rest. A setup guide for standard vs. FIFO queues, long polling, and deletion as SQS's genuinely different completion model."
tags: ["dotnet", "messaging", "cloud", "architecture", "devops"]
title: "Getting Started with Amazon SQS in .NET"
---

Amazon SQS's simplicity is its whole pitch, and that simplicity is genuinely refreshing after RabbitMQ's exchange model or Kafka's partition mechanics - a queue, messages go in, messages come out, AWS handles the rest. The part worth understanding upfront isn't complexity so much as a set of binary decisions SQS asks you to make explicitly: standard or FIFO, short or long polling, and how deletion (not "completion" - SQS's model is genuinely different here) fits into your processing logic.

This guide covers installing and connecting to SQS from .NET, bootstrapping standard and FIFO queues, the core send/receive/delete workflow, and the best practices that keep an SQS-backed system correct under real failure and retry conditions. By the end you'll have a working setup and a clear sense of when FIFO's added guarantees are actually worth their throughput cost.

If you're deciding between message brokers first, [a comparison of the top .NET message brokers](/posts/2027-09-14-top-5-dotnet-message-brokers-compared/) covers where Amazon SQS fits relative to RabbitMQ, Kafka, Azure Service Bus, and NATS.

## What You'll Need

- .NET 8 SDK or later
- An AWS account and credentials configured (via the AWS CLI, environment variables, or an IAM role if running on AWS infrastructure)

```bash
aws sqs create-queue --queue-name orders
```

## Installing the AWS SDK for SQS

```bash
dotnet add package AWSSDK.SQS
dotnet add package AWSSDK.Extensions.NETCore.Setup
```

## Bootstrapping the Ideal Environment

### Registering the SQS client

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAWSService<IAmazonSQS>();
builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());

var app = builder.Build();
```

`AddAWSService<T>` handles registering a properly configured client using your application's AWS configuration (credentials, region) - no manual client construction needed in most cases.

### Sending a message

```csharp
public class OrderService(IAmazonSQS sqs, IConfiguration config)
{
    public async Task SubmitOrderAsync(Order order)
    {
        var queueUrl = config["Sqs:OrdersQueueUrl"];

        await sqs.SendMessageAsync(new SendMessageRequest
        {
            QueueUrl = queueUrl,
            MessageBody = JsonSerializer.Serialize(order),
            MessageAttributes = new Dictionary<string, MessageAttributeValue>
            {
                ["OrderId"] = new() { DataType = "String", StringValue = order.Id.ToString() }
            }
        });
    }
}
```

SQS identifies queues by URL, not just name - fetch and cache the queue URL (via `GetQueueUrlAsync`, or store it directly in configuration) rather than re-resolving it on every send.

### Receiving and deleting messages

```csharp
public class OrderQueueProcessor(IAmazonSQS sqs, IOrderService orderService, IConfiguration config, ILogger<OrderQueueProcessor> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var queueUrl = config["Sqs:OrdersQueueUrl"];

        while (!stoppingToken.IsCancellationRequested)
        {
            var response = await sqs.ReceiveMessageAsync(new ReceiveMessageRequest
            {
                QueueUrl = queueUrl,
                MaxNumberOfMessages = 10,
                WaitTimeSeconds = 20, // long polling
                VisibilityTimeout = 30
            }, stoppingToken);

            foreach (var message in response.Messages)
            {
                try
                {
                    var order = JsonSerializer.Deserialize<Order>(message.Body);
                    await orderService.ProcessAsync(order!.Id);

                    // Deletion is the SQS equivalent of "acknowledgment" -- without it, the message reappears
                    await sqs.DeleteMessageAsync(queueUrl, message.ReceiptHandle, stoppingToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to process message {MessageId}", message.MessageId);
                    // Don't delete -- the message becomes visible again after VisibilityTimeout expires
                }
            }
        }
    }
}
```

`WaitTimeSeconds = 20` enables long polling - SQS holds the request open waiting for a message to arrive, rather than returning immediately with an empty result. This meaningfully reduces both latency and the number of (billed) empty API calls compared to short polling.

### FIFO queues, when strict ordering matters

```bash
aws sqs create-queue --queue-name orders.fifo --attributes FifoQueue=true,ContentBasedDeduplication=true
```

```csharp
await sqs.SendMessageAsync(new SendMessageRequest
{
    QueueUrl = fifoQueueUrl,
    MessageBody = JsonSerializer.Serialize(order),
    MessageGroupId = order.CustomerId.ToString(), // ordering scope, similar to a Kafka partition key
    MessageDeduplicationId = order.Id.ToString()   // required unless ContentBasedDeduplication is enabled
});
```

`MessageGroupId` scopes ordering the same way a Kafka partition key does - messages within the same group are delivered in order, while different groups can be processed independently and in parallel.

## Core Workflow

- **Delete messages only after successful processing.** SQS's visibility timeout, not an explicit acknowledgment call, is what governs redelivery - an undeleted message simply becomes visible again once the timeout expires, whether that's intentional (a crash) or accidental (forgetting to delete).
- **Use long polling (`WaitTimeSeconds`) by default.** It reduces both latency and the number of billed empty receive calls compared to short polling.
- **Choose standard queues by default, FIFO only when you specifically need strict ordering or exactly-once processing.** FIFO's guarantees come with a real throughput ceiling compared to standard queues.

## Verifying Your Setup

1. **Messages send and are received correctly** - confirm a sent message appears in a subsequent receive call
2. **Deletion behaves as expected** - confirm an undeleted message becomes visible again after the visibility timeout, and a deleted one doesn't reappear
3. **Long polling is actually reducing empty calls** - confirm `WaitTimeSeconds` is set and observe reduced polling frequency compared to short polling
4. **FIFO ordering holds, if used** - for a FIFO queue, confirm messages within the same `MessageGroupId` are consistently delivered in send order

## Best Practices

**Only delete a message after your handler has fully and successfully processed it.** This is the SQS equivalent of manual offset commits in Kafka or explicit message completion in Service Bus - deleting too early risks losing work if a crash happens between deletion and actual completion.

**Set `VisibilityTimeout` based on your actual processing time, with margin.** Too short, and a message becomes visible again (and gets redelivered to another consumer) while still being processed; too long, and a genuinely failed message takes longer than necessary to become available for retry.

**Use long polling by default.** There's little reason to use short polling (`WaitTimeSeconds = 0`) for typical application workloads - long polling reduces cost and latency with no meaningful downside for most use cases.

**Reach for FIFO queues only when you specifically need strict ordering or exactly-once processing.** Standard queues have meaningfully higher throughput and are the right default unless your use case genuinely requires FIFO's guarantees.

**Design consumers to be idempotent regardless of queue type.** Standard queues are explicitly at-least-once delivery, and even FIFO's "exactly-once processing" has edge cases worth defending against with idempotent handler logic.

## Comparison with Azure Service Bus

| | Amazon SQS | Azure Service Bus |
| --- | --- | --- |
| Model | Queues (standard and FIFO) | Queues and topics/subscriptions |
| Pub/sub | Requires pairing with SNS | Built in via topics |
| Acknowledgment model | Explicit delete; visibility timeout governs redelivery | Explicit complete; lock duration governs redelivery |
| Ordering | FIFO queues with MessageGroupId | Message sessions |
| Best fit | AWS-native teams wanting the cheapest, simplest queueing | Azure-native teams wanting managed pub/sub built in |

The core mental models are similar (visibility timeout vs. lock duration, message group vs. session for ordering), but SQS's simpler model doesn't include topic-based pub/sub natively - that's SNS's job, paired with SQS as the delivery mechanism, whereas Service Bus bundles both under one service.

## Frequently Asked Questions

### What happens if I forget to delete a message after processing it?

It becomes visible again once the visibility timeout expires and gets redelivered to another (or the same) consumer - SQS has no separate "acknowledgment" call distinct from deletion. This is exactly why deleting only after successful processing matters: forgetting to delete an already-processed message just means unnecessary reprocessing, but deleting before processing completes risks losing work entirely if a crash happens in between.

### Should I use standard or FIFO queues?

Standard queues by default - they have meaningfully higher throughput and are sufficient for the majority of use cases, since most applications can tolerate the (rare, but possible) out-of-order or duplicate delivery standard queues allow. Reach for FIFO specifically when strict ordering or exactly-once processing within a message group is a real requirement, not a nice-to-have.

### How does SQS handle pub/sub, since there's no topic concept like Service Bus?

Pair SQS with Amazon SNS - SNS handles the pub/sub fan-out, publishing to multiple SQS queues (or other subscribers) from a single topic, with each queue then consumed independently. This is architecturally similar to Service Bus's topic/subscription model, just split across two AWS services rather than bundled into one.

### What's the difference between short polling and long polling?

Short polling returns immediately, even if no messages are available, which wastes API calls (and their associated cost) when the queue is often empty. Long polling (`WaitTimeSeconds` greater than zero) holds the request open until a message arrives or the wait time elapses, reducing both latency to receive new messages and the number of empty, billed calls - there's little reason not to default to it.

### How do I prevent duplicate message processing?

For FIFO queues, enable `ContentBasedDeduplication` or provide an explicit `MessageDeduplicationId` to prevent the same logical message from being enqueued twice within the deduplication window. For standard queues, which don't offer this, design your consumer logic to be idempotent instead, since at-least-once delivery means occasional duplicates are expected by design.

### What does MessageGroupId do in a FIFO queue?

It scopes ordering - messages with the same `MessageGroupId` are delivered strictly in send order, while different groups can be processed independently and in parallel. This is conceptually the same role a partition key plays in Kafka: the mechanism that lets you get both ordering where you need it and parallelism where you don't.

### What's the most common mistake in a first SQS setup?

Deleting a message immediately upon receipt rather than after successful processing, which risks losing work if a crash happens in between. The second common mistake is defaulting to FIFO queues out of an abundance of caution about ordering, without actually needing the ordering guarantee - unnecessarily giving up standard queues' higher throughput for a requirement that wasn't real.
