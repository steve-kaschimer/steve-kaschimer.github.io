---
author: Steve Kaschimer
date: 2029-12-16
image: /images/posts/2029-12-16-hero.webp
image_alt: "A wall glyph at a boundary line, translating an angular foreign shape on one side into a clean native shape on the other."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single amber wall glyph positioned on a vertical off-white boundary line, with a jagged angular teal shape approaching from the left and a clean, simple teal shape emerging on the right, implying foreign vocabulary translated before it reaches the protected side. Mood is protective and translating. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Protect a modern .NET domain from legacy systems, vendor APIs, and foreign bounded contexts by translating protocols, data, errors, and semantics at an explicit boundary."
tags: ["dotnet", "architecture", "design-patterns", "domain-driven-design"]
title: "Anti-Corruption Layer: Protecting Your Domain From Someone Else's Model"
---



Every integration tries to teach your application somebody else's language. A legacy ERP calls customers `ACCOUNT_MASTER`. A payment provider calls authorization a `PaymentIntent`. A shipping vendor has seven status codes that do not match your fulfillment lifecycle. If those concepts leak everywhere, the external model begins designing your application. An Anti-Corruption Layer stops that spread.

## The Problem

Without a translation boundary:
``` csharp
public sealed class Order
{
    public string SapCustomerNumber { get; set; }

    public VendorPaymentIntentStatus
        PaymentStatus { get; set; }

    public LegacyFulfillmentCode
        FulfillmentCode { get; set; }
}
```

The domain now speaks three foreign languages. Vendor changes become domain changes.

## Put Translation at the Boundary

``` text
Our Domain
    |
    v
Anti-Corruption Layer
    |
    +-- Gateway
    +-- Translator
    +-- DTOs
    +-- Error mapping
    |
    v
External System
```

Inside:
``` csharp
public interface ICreditService
{
    Task<CreditDecision> EvaluateAsync(
        Customer customer,
        CancellationToken cancellationToken);
}
```

The domain/application asks for a **credit decision**. It does not ask for `LegacyRiskResponseV4`.

## External DTO

The adapter may receive:
``` csharp
internal sealed record LegacyRiskResponse(
    string RiskCode,
    decimal ApprovedExposure,
    string AccountState);
```

That type stays inside the integration boundary. Translate it:
``` csharp
private static CreditDecision Translate(
    LegacyRiskResponse response)
    => response.RiskCode switch
    {
        "A1" => CreditDecision.Approved(
            Money.Usd(response.ApprovedExposure)),

        "D7" => CreditDecision.Declined(
            CreditDeclineReason.HighRisk),

        _ => CreditDecision.Unknown()
    };
```

The ugly vocabulary stops there.

## Semantic Translation

An ACL is more than object mapping. Suppose the external system says:
``` text
Status = 4
```

and its documentation means:
> payment accepted but subject to asynchronous fraud reversal for 24
> hours.

Mapping `4` to:
``` csharp
PaymentStatus.Paid
```

may be semantically wrong. The ACL must translate **meaning**, not just fields.

## Error Translation

External errors should also be translated. Vendor:
``` text
HTTP 409
code = ACCOUNT_FROZEN_X17
```

Our application:
``` csharp
CreditDecision.Unavailable(
    CreditUnavailableReason.AccountRestricted)
```

or an intentional application error. Do not make every caller understand vendor error catalogs.

## Protocol Translation

The boundary can translate more than models:
``` text
Our application
    |
HTTP/JSON adapter
    |
SOAP/XML legacy system
```

or:
``` text
Domain event
    |
ACL
    |
vendor-specific message
```

The goal is semantic isolation.

## ACL vs. Gateway

A Gateway provides a clean entry point to an external capability. An Anti-Corruption Layer is broader. It may contain:
-   one or more Gateways;
-   Mappers;
-   DTOs;
-   protocol adapters;
-   error translation;
-   semantic normalization.

A simple vendor integration may need only a Gateway. Use the ACL framing when protecting one model from another is the real architectural concern.

## ACL vs. API Gateway

They solve different problems.
``` text
API Gateway
  -> routing/security/aggregation at API edge

Anti-Corruption Layer
  -> semantic translation between models
```

An API gateway can participate in an ACL, but it does not automatically provide one.

## ACL and Legacy Modernization

The pattern is particularly valuable during incremental replacement:
``` text
New Ordering Domain
       |
       v
       ACL
       |
       v
Legacy Order System
```

As functionality moves into the new domain, the ACL contains the remaining legacy semantics. Eventually it may shrink or disappear.

## Third-Party SaaS Is "Legacy" Too

The external system does not need to be old. A modern vendor still owns:
-   its terminology;
-   its lifecycle;
-   its identifiers;
-   its release schedule.

Your domain should not be forced to adopt those decisions. Anti-corruption is about **model ownership**, not age.

## Placement

An ACL can be:
``` text
in-process adapter
```

or:
``` text
separate service
```

A separate process may be useful when:
-   several applications share the translation;
-   protocol isolation is substantial;
-   scaling differs;
-   security boundaries matter.

But it adds latency, deployment, monitoring, and another failure point. Do not create a service merely because the pattern has "layer" in its name.

## Resilience

Because the ACL sits on an external boundary, it is also where we often apply:
-   timeout;
-   Retry;
-   Circuit Breaker;
-   Bulkhead;
-   rate limiting.

These mechanisms protect availability. They do not replace semantic translation.

## Observability

Instrument the boundary. Useful signals include:
``` text
external operation
latency
translated error category
vendor status
retry count
correlation ID
translation failure
```

Do not leak secrets or sensitive payloads into logs. Translation failures are especially important because they often indicate contract drift.

## Contract Testing

The ACL is an ideal target for contract tests. Verify that real or representative external payloads still translate into the expected internal concepts. This catches the dangerous situation where:
``` text
our stub passes
vendor contract changed
production breaks
```

## When It Helps

Use an Anti-Corruption Layer when:
-   integrating a legacy system;
-   integrating a vendor with a foreign domain model;
-   bounded contexts use different semantics;
-   migration is incremental;
-   external concepts are contaminating internal code.

Current Azure architecture guidance describes the same core use: put a facade/adapter boundary between systems with different semantics so the outside system does not constrain the application's design.

## When It Hurts

It can become harmful when:
-   the systems already share compatible semantics;
-   the layer merely forwards every field;
-   business orchestration accumulates inside the translator;
-   a separate ACL service is created without operational justification.

## How It Relates to Fowler

This pattern is almost a composition of Volume I patterns:
``` text
Gateway
+ Mapper
+ DTO
+ Separated Interface
+ Service Layer concepts
```

DDD gives the composition a strategic purpose:
**protect the integrity of the model.**

## Summary

An Anti-Corruption Layer is a semantic firewall. It lets your application integrate with another system without allowing that system's language, errors, protocols, and assumptions to spread through your domain. At a meaningful external boundary, that protection can be worth far more than the mapping code it requires.
