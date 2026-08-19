---
author: Steve Kaschimer
date: 2030-02-24
image: /images/posts/2030-02-24-hero.webp
image_alt: "A small quarantine box positioned off the main queue line, holding one flagged item apart from the flowing stream."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a horizontal teal queue line flowing left to right, with one small amber quarantine box positioned just off the line holding a single flagged item marked with a small warning notch, implying a message set apart from healthy flow rather than blocking it. Mood is isolating and diagnostic. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Quarantine permanently failing messages after bounded retries, preserve diagnostics and replayability, and avoid turning dead-letter queues into invisible data graveyards."
tags: ["dotnet", "architecture", "design-patterns", "messaging"]
title: "Dead Letter Queue: What To Do With Messages That Never Succeed"
---



Retries assume failure may be temporary. Some failures are not.
```text
Malformed payload
Unknown contract version
Missing required reference
Permanent business rejection
Poison data
```

Retrying forever wastes capacity and can block healthier work. A Dead Letter Queue isolates messages that cannot currently be processed.

## The Pattern

```text
Main Queue
   |
Consumer
   |
retry N times
   |
still failing?
   |
   v
Dead Letter Queue
```

The message is removed from the normal processing path and preserved for investigation.

## Bounded Retry

Dead-letter handling depends on a bounded retry policy.
```text
Attempt 1
Attempt 2
Attempt 3
Dead-letter
```

The exact number should reflect:
- failure type;
- retry delay;
- business urgency;
- downstream recovery expectations.

Do not use "10 retries" because it sounds robust.

## Preserve Context

A dead-lettered message should retain:
```text
original message ID
payload
headers
correlation ID
failure reason
attempt count
first failure time
last failure time
```

Without context, operators cannot diagnose or replay safely.

## Classify Failures

Useful categories:
```text
Transient
Permanent
Contract
Data
Authorization
Unknown
```

Some failures should dead-letter immediately. For example:
```text
unsupported schema version
```

may never succeed through retry.

## Do Not Swallow Poison Messages

This is dangerous:
```csharp
catch (Exception ex)
{
    logger.LogError(ex, "Failed");
    return;
}
```

If the broker interprets that as success, the message disappears. Failure semantics must match the transport.

## Dead Letter Is Not Success

Moving a message to a DLQ means:
```text
normal processing gave up
```

not:
```text
business process succeeded
```

Alerting and workflow state may need to reflect that distinction.

## Operational Workflow

A DLQ needs a human or automated recovery process.
```text
Detect
Diagnose
Fix root cause
Replay or discard
Verify outcome
```

If no one owns that workflow, the DLQ becomes a quiet data graveyard.

## Replay

Replay can be dangerous. If the original consumer is not idempotent:
```text
replay
```

may duplicate effects. Inbox / Idempotent Consumer makes replay much safer.

## Replay After Contract Fix

A common scenario:
```text
new event version arrives
consumer cannot parse
message dead-letters
consumer updated
messages replayed
```

This is one reason preserving the original payload and metadata matters.

## DLQ Metrics

Measure:
```text
dead-letter count
rate of new dead letters
oldest dead-letter age
top failure reason
top message type
replay success/failure
```

Alert on growth, not just total size.

## Automated Reprocessing

Some failures can be retried later automatically. For example:
```text
dependency unavailable for hours
```

A scheduled replay process may requeue selected messages after the dependency recovers. Be careful to avoid endless loops between main queue and DLQ.

## Security and Privacy

Dead-letter payloads may contain sensitive data. Apply:
- access controls;
- retention policies;
- encryption;
- redaction in logs.

Do not dump complete message payloads into general-purpose logging.

## Testing

Test:
```text
transient failure retries
permanent failure dead-letters
dead-letter preserves metadata
replay succeeds after fix
replayed duplicate remains safe
```

## When It Helps

Use a DLQ when asynchronous work must continue even when individual messages are unprocessable.

## When It Hurts

It hurts when it becomes:
```text
catch-all error bucket
no alerts
no ownership
no replay plan
```

A DLQ without operations is delayed data loss.

## Summary

Dead Letter Queue protects the healthy message stream from poison work while preserving failed messages for diagnosis and recovery. The pattern is only complete when someone owns the dead-letter lifecycle. Quarantine is not resolution.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
