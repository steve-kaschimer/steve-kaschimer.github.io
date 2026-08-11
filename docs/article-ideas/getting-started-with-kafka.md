# Getting Started with Kafka in .NET

Kafka's .NET story is deliberately more hands-on than RabbitMQ's -- Confluent.Kafka is a capable, well-maintained client, but it's a thinner wrapper around Kafka's actual concepts (partitions, consumer groups, offsets, delivery semantics) than MassTransit gives you over RabbitMQ. That's not a gap in the tooling; it's a reflection of Kafka being a fundamentally different thing than a traditional message broker. Getting comfortable with partitions and consumer groups before writing much code will save you from a class of subtle bugs that only show up under real concurrent consumption.

This guide covers installing the Kafka .NET client, bootstrapping producers and consumers with the configuration that actually matters, the core patterns for partitioning and consumer groups, and the best practices for using Kafka's log-based model correctly rather than treating it like a queue with extra steps. By the end you'll understand not just how to produce and consume messages, but why Kafka's guarantees work the way they do.

If you're deciding between message brokers first, a comparison of the top .NET message brokers covers where Kafka fits relative to RabbitMQ, Azure Service Bus, Amazon SQS, and NATS.

## What You'll Need

- .NET 8 SDK or later
- Docker, for running Kafka locally

```bash
docker run -d --name kafka -p 9092:9092 apache/kafka:latest
```

## Installing the Kafka Client

```bash
dotnet add package Confluent.Kafka
```

This is the official, actively maintained .NET client, built on `librdkafka` (a native C library) for performance -- worth knowing since it means platform-specific native dependencies are involved, generally handled transparently by the NuGet package.

## Bootstrapping the Ideal Environment

### Producing messages

```csharp
public class OrderEventProducer : IDisposable
{
    private readonly IProducer<string, string> _producer;

    public OrderEventProducer(IConfiguration config)
    {
        var producerConfig = new ProducerConfig
        {
            BootstrapServers = config["Kafka:BootstrapServers"],
            Acks = Acks.All,          // wait for all in-sync replicas to acknowledge
            EnableIdempotence = true  // prevents duplicate messages on retry
        };
        _producer = new ProducerBuilder<string, string>(producerConfig).Build();
    }

    public async Task PublishOrderSubmittedAsync(int orderId, OrderSubmitted evt)
    {
        var json = JsonSerializer.Serialize(evt);
        await _producer.ProduceAsync("order-events", new Message<string, string>
        {
            Key = orderId.ToString(), // determines partition assignment
            Value = json
        });
    }

    public void Dispose() => _producer.Dispose();
}
```

`Acks.All` combined with `EnableIdempotence = true` is the combination worth defaulting to for anything where message loss or duplication matters -- it trades a small amount of latency for meaningfully stronger delivery guarantees. The `Key` matters more than it might look: Kafka uses it to determine which partition a message lands in, and messages with the same key are guaranteed to stay in order within that partition.

### Consuming messages

```csharp
public class OrderEventConsumer(IConfiguration config, ILogger<OrderEventConsumer> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = config["Kafka:BootstrapServers"],
            GroupId = "order-processing-service",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false // commit manually after successful processing
        };

        using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
        consumer.Subscribe("order-events");

        while (!stoppingToken.IsCancellationRequested)
        {
            var result = consumer.Consume(stoppingToken);
            try
            {
                var evt = JsonSerializer.Deserialize<OrderSubmitted>(result.Message.Value);
                await ProcessOrderEventAsync(evt!);
                consumer.Commit(result); // only commit after successful processing
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process message at offset {Offset}", result.Offset);
                // Decide: retry, dead-letter, or skip -- Kafka won't decide this for you
            }
        }
    }
}
```

`EnableAutoCommit = false` paired with manual `Commit` after successful processing is the safer default -- auto-commit can mark a message as processed before your handler actually finishes with it, which risks silently losing work if the process crashes mid-handling.

## Core Workflow

- **Choose partition keys deliberately.** Messages with the same key land in the same partition and preserve order relative to each other -- this is your main lever for both ordering guarantees and parallelism, since consumers within a group each own a subset of partitions.
- **Use consumer groups to scale horizontally.** Multiple consumer instances sharing a `GroupId` each get assigned a subset of the topic's partitions automatically -- adding instances increases parallel consumption up to the partition count.
- **Understand that Kafka doesn't remove messages on consumption.** Retention (time-based or size-based) determines how long messages stick around regardless of whether anyone's consumed them -- this is fundamentally different from a queue, where consumption implies removal.

## Verifying Your Setup

1. **Messages produce and land in the expected partition** -- confirm messages with the same key consistently land in the same partition
2. **Consumer groups scale as expected** -- run multiple consumer instances with the same `GroupId` and confirm partitions distribute across them, not all processed by one instance
3. **Manual commit behavior is correct** -- deliberately throw an exception mid-processing and confirm the offset isn't committed, so the message is redelivered on restart
4. **Idempotent production is working** -- confirm `EnableIdempotence` prevents duplicate messages even under retry conditions

## Best Practices

**Default to `Acks.All` and `EnableIdempotence = true` for anything where correctness matters.** The latency cost is small relative to the guarantee it buys you -- avoid weaker settings without a specific, understood reason.

**Commit offsets manually after successful processing, not automatically.** Auto-commit risks marking work as done before it's actually finished, which becomes a real data-loss risk if your process crashes mid-handling.

**Choose partition keys based on what needs ordering relative to what.** A poor key choice (or none at all, resulting in round-robin distribution) loses ordering guarantees you might actually need -- think about this deliberately rather than defaulting.

**Design consumers to handle redelivery, since Kafka's guarantees are at-least-once by default.** A message can be redelivered after a crash between processing and committing -- consumer logic needs to be idempotent, the same defensive principle that applies to retriable work in any messaging system.

**Don't reach for Kafka if you don't actually need replay or high-volume streaming.** Its operational complexity (partitioning, consumer group rebalancing, retention tuning) isn't worth taking on for a workload a simpler queue would serve just as well.

## Comparison with RabbitMQ

| | Kafka | RabbitMQ |
| --- | --- | --- |
| Model | Distributed, partitioned, append-only log | Traditional queue-based broker |
| Message retention | Configurable, independent of consumption | Removed on consumption/acknowledgment |
| Replay | Native, core feature | Not supported |
| .NET client experience | More low-level (Confluent.Kafka) | Higher-level via MassTransit |
| Best fit | High-volume event streaming, replay, analytics | Flexible routing, general-purpose messaging |

They solve fundamentally different problems -- reaching for Kafka because it's associated with "high performance" when your actual need is a general-purpose queue with flexible routing usually means taking on unnecessary operational complexity that RabbitMQ (via MassTransit) would handle more simply.

## Frequently Asked Questions

### Does Kafka guarantee messages are processed exactly once?

By default, Kafka's consumer model is at-least-once -- a message can be redelivered if a crash happens between processing and committing the offset. Exactly-once semantics are achievable with Kafka's transactional APIs, but they add real complexity; for most applications, designing idempotent consumers to safely handle at-least-once delivery is the more practical approach.

### How do I choose a good partition key?

Base it on what needs to stay ordered relative to what else -- for example, using an order ID as the key ensures all events for a given order land in the same partition and process in order relative to each other, while different orders can be processed in parallel across partitions. A poor or missing key choice loses ordering guarantees you might actually need.

### What happens if I add more consumer instances than partitions?

Extra instances beyond the partition count sit idle for that topic -- Kafka can't assign more than one consumer per partition within the same consumer group, since ordering and exclusive processing within a partition depend on that constraint. Partition count is effectively your parallelism ceiling for a given topic and consumer group.

### Should I use auto-commit or manual commit for consumer offsets?

Manual commit, for anything where correctness matters. Auto-commit risks marking a message as processed before your handler has actually finished with it -- if the process crashes in that window, you can silently lose the in-flight message's processing without Kafka being able to tell you anything went wrong.

### How long does Kafka retain messages?

Configurable per topic, based on time (e.g., seven days) or size, independent of whether any consumer has actually read a given message. This is fundamentally different from a traditional queue, where a message is typically removed once consumed -- Kafka's retention is what makes replay possible.

### Is Kafka overkill for a typical microservices application?

Often, yes, if your actual need is general-purpose messaging between services rather than high-volume event streaming or replay. RabbitMQ (via MassTransit) or a managed queue like Azure Service Bus or Amazon SQS typically fits typical microservice communication with meaningfully less operational overhead than running or managing a Kafka cluster.

### What's the most common mistake in a first Kafka setup?

Using Kafka for a workload that's really just a queue, taking on partitioning and consumer group complexity without needing replay or high throughput. The second most common is leaving auto-commit enabled without understanding the data-loss risk it introduces if a consumer crashes mid-processing.
