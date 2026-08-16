---
title: "Sidecar: Moving Cross-Cutting Runtime Capabilities Beside the Application"
slug: "sidecar"
description: "A Sidecar runs a supporting process beside an application instance."
series: "Modern Application Architecture Patterns in .NET"
volume: 2
category: "Architecture at Scale"
order: 48
dotnet: "10"
csharp: "14"
status: "draft"
---

A Sidecar runs a supporting process beside an application instance.

```text
Pod / Host
+----------------------+
| Application          |
| Sidecar              |
+----------------------+
```

The two share a lifecycle or local environment while remaining separate processes.

## Why Use One?

Some capabilities are useful across applications but do not belong in business code:

```text
proxying
telemetry collection
secret/config refresh
protocol adaptation
service-mesh networking
```

A sidecar can provide them without embedding the implementation into every application.

## Local Communication

The application may communicate with the sidecar through:

```text
localhost HTTP/gRPC
shared volume
local socket
```

Locality reduces some network complexity, but the sidecar is still another process that can fail.

## Example: Proxy Sidecar

```text
Application
   |
localhost
   |
Proxy Sidecar
   |
Remote Services
```

The proxy may handle transport-level concerns such as mutual TLS or telemetry.

The application remains focused on business behavior.

## Deployment Coupling

Sidecars are usually deployed with each application instance.

Scale from:

```text
10 application instances
```

to:

```text
10 application + 10 sidecar instances
```

Resource cost matters.

## Sidecar vs. Library

Library:

```text
same process
lower network overhead
language-specific
```

Sidecar:

```text
separate process
language-neutral
independent runtime
operational overhead
```

Use a sidecar when process isolation or language-neutral reuse provides real value.

## Sidecar vs. Service

A shared remote service scales independently and has one network endpoint.

A sidecar is local to each application instance.

Choose based on ownership, latency, isolation, and scaling requirements.

## Failure Semantics

Ask:

```text
What if sidecar is unavailable?
Can app start?
Can it stay ready?
Does traffic fail open or closed?
```

Do not accidentally make optional telemetry a hard availability dependency.

## Kubernetes

Sidecars are especially common in pod-based deployments because containers in a pod share networking and lifecycle context.

But the pattern is not Kubernetes-specific.

## Sidecar Explosion

If every concern becomes another container:

```text
app
proxy
telemetry
secrets
policy
adapter
```

operational cost and resource usage can become significant.

Use platform-native capabilities when they solve the problem more simply.

## When It Helps

Use Sidecar when a cross-cutting runtime capability benefits from process isolation, local proximity, or language-neutral reuse.

## When It Hurts

It hurts when a simple library or platform feature would do, or when critical application behavior becomes dependent on a fragile collection of helper processes.

## Summary

Sidecar moves selected infrastructure capabilities beside the application rather than inside it.

That can improve separation and reuse, but every sidecar is another runtime component with lifecycle, resource, security, and failure semantics.
