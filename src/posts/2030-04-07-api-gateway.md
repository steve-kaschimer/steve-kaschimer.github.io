---
author: Steve Kaschimer
date: 2030-04-07
image: /images/posts/2030-04-07-hero.webp
image_alt: "A single gate glyph at a boundary line with several distinct lanes fanning out behind it to separate service shapes."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one amber gate glyph positioned on a vertical off-white boundary line, with three thin teal lanes fanning out behind it to three small distinct service shapes, implying one deliberate edge in front of many independently deployed services. Mood is centralized and thin. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Use an API Gateway as a shared edge for routing, authentication, rate limiting, policy, and selective aggregation while avoiding a centralized business-logic bottleneck."
tags: ["dotnet", "architecture", "design-patterns", "api-design"]
title: "API Gateway: A Deliberate Edge for Distributed APIs"
---

Once an application exposes many independently deployed services, clients face a messy question:

```text
Which service do I call?
Where do I authenticate?
How do rate limits work?
Which host is current?
```

An API Gateway creates a deliberate external edge.

```text
Clients
   |
   v
API Gateway
   |
   +--> Orders
   +--> Payments
   +--> Customers
```

## Reverse Proxy as the Foundation

At its simplest, the gateway routes:

```text
/api/orders/*   -> Orders service
/api/payments/* -> Payments service
```

In modern .NET, YARP can provide a highly customizable reverse-proxy foundation.

But routing alone is not the whole architectural pattern.

## Cross-Cutting Edge Concerns

A gateway is a natural location for concerns that apply consistently across external APIs:

- authentication enforcement;
- TLS termination;
- rate limiting;
- routing;
- request/response limits;
- header normalization;
- observability;
- API version routing.

Centralizing these can reduce duplication across services.

## Authentication vs. Authorization

The gateway can validate identity and coarse access.

But domain authorization often belongs deeper.

```text
Gateway:
Is this token valid?

Order service:
May this user refund Order 42?
```

Do not centralize every business permission in the gateway.

## Rate Limiting

The edge is an excellent place to protect systems from abusive or accidental load.

Policies might apply by:

```text
API key
tenant
user
IP
route
```

But downstream services may still need their own protection because internal traffic can bypass the external gateway.

## Aggregation

A gateway can aggregate a small number of downstream calls.

But if aggregation becomes heavily client-specific, a BFF may be a cleaner home.

```text
Gateway -> shared edge policy
BFF     -> client experience
```

Keep the distinction intentional.

## Gateway as Single Point of Failure

Every external request may pass through it.

Therefore:

```text
gateway unavailable
=
system appears unavailable
```

Design for:

- multiple instances;
- health checks;
- load balancing;
- safe configuration rollout;
- capacity headroom.

The gateway must be boringly reliable.

## Avoid Business Logic

This is the classic failure mode:

```text
API Gateway
  |
  + 20,000 lines of workflow logic
  + database access
  + pricing rules
  + customer policy
```

Now every service is "independent" except all business changes require redeploying the gateway.

The edge becomes a distributed monolith's central brain.

Keep it thin.

## Timeouts

The gateway should not wait forever for downstream services.

Define:

```text
connection timeout
request timeout
maximum body size
```

But be careful with retries at the gateway.

Retrying a non-idempotent POST can duplicate effects.

Retry policy must understand operation semantics.

## Circuit Breaking

A gateway may temporarily stop forwarding to a failing dependency.

That can reduce cascading failure.

But circuit breaking at the gateway does not remove the need for resilience inside service-to-service calls.

We will cover Circuit Breaker as its own pattern.

## Service Discovery

In dynamic environments, service locations change.

The gateway may integrate with:

- container orchestration;
- cloud routing;
- service discovery;
- configuration.

Clients should not need to know individual service topology.

## API Versioning

A gateway can route:

```text
/v1/orders -> old service/version
/v2/orders -> new service/version
```

This can support migrations.

Do not use routing tricks as a substitute for a deliberate compatibility strategy.

## Observability

The gateway is an excellent observation point.

Track:

```text
request rate
status code
latency
route
tenant/client
rate-limit rejection
downstream latency
gateway overhead
```

Propagate trace context downstream.

Avoid logging secrets or sensitive payloads.

## Security Boundary

Because the gateway is internet-facing, harden it aggressively.

Use:

- minimal exposed surface;
- request size limits;
- header sanitation;
- authentication;
- rate limiting;
- patched dependencies;
- strict administrative access.

Do not assume downstream services are safe merely because they sit behind the gateway.

Defense in depth still matters.

## Gateway vs. Service Mesh

Roughly:

```text
API Gateway
  north-south traffic
  external clients -> services

Service Mesh
  east-west traffic
  service -> service
```

There can be overlap, but the operational boundaries differ.

Do not deploy both merely to complete an architecture diagram.

## Gateway vs. BFF

A useful composition:

```text
Internet
   |
API Gateway
   |
   +--> Web BFF
   +--> Mobile BFF
   +--> Public API
```

Gateway handles shared edge policy.

BFFs handle client-specific behavior.

## Testing

Test:

```text
route correctness
authentication enforcement
rate limits
header propagation
timeouts
failure behavior
configuration rollout
```

Load-test the gateway itself.

It sits on the critical path.

## When It Helps

Use an API Gateway when:

- many services need one external entry point;
- edge policies should be consistent;
- internal topology should be hidden;
- routing and version migration need centralized control.

## When It Hurts

It hurts when:

- a simple monolith has one API anyway;
- business logic accumulates at the edge;
- every internal call is unnecessarily routed through it;
- gateway ownership becomes an organizational bottleneck.

## Summary

API Gateway gives a distributed API a deliberate external edge.

Centralize cross-cutting edge policy there.

Do not centralize the business.

The best gateway is powerful operationally and boring semantically.
