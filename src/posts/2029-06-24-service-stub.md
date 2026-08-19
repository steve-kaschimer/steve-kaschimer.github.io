---
author: Steve Kaschimer
date: 2029-06-24
image: /images/posts/2029-06-24-hero.webp
image_alt: "A dashed, silhouette outline shape standing in the exact position of a solid shape rendered faintly behind it, implying a placeholder deliberately substituted for a real dependency."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a dashed amber silhouette outline shape in the foreground, standing in the exact position of a faint solid teal shape rendered behind it, implying a controllable placeholder deliberately substituted for a real, inconvenient dependency. Mood is controlled and deliberate. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "External services are often slow, unreliable, rate-limited, or hard to force into edge cases - Service Stub replaces them with a controllable implementation so tests get deterministic behavior instead. Covers hand-written stubs, HttpMessageHandler-level fakes, and the essential caveat: a stub proves your code, not that the real service still matches your assumptions."
tags: ["dotnet", "architecture", "design-patterns", "testing"]
title: "Service Stub in Modern .NET"
---



Service Stub replaces a service that is difficult to use during testing with a controllable implementation. External services are often:
-   slow,
-   unreliable,
-   rate limited,
-   costly,
-   unavailable offline,
-   difficult to force into edge cases.

A stub gives tests deterministic behavior.

## The Boundary

Suppose the application depends on:
``` csharp
public interface ICreditCheckGateway
{
    Task<CreditCheckResult> CheckAsync(
        Customer customer,
        CancellationToken cancellationToken);
}
```

Production uses a remote provider. Tests can use:
``` csharp
public sealed class ApprovedCreditCheckStub
    : ICreditCheckGateway
{
    public Task<CreditCheckResult> CheckAsync(
        Customer customer,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(
            CreditCheckResult.Approved(
                score: 780));
    }
}
```

No network call occurs.

## Configurable Stub

A reusable stub can be configured:
``` csharp
public sealed class CreditCheckStub(
    CreditCheckResult result)
    : ICreditCheckGateway
{
    public Task<CreditCheckResult> CheckAsync(
        Customer customer,
        CancellationToken cancellationToken)
        => Task.FromResult(result);
}
```

A test chooses the scenario:
``` csharp
var gateway =
    new CreditCheckStub(
        CreditCheckResult.Declined(
            "Insufficient history"));
```

## Stub vs. Mock

The terms are often used loosely, but the distinction is useful. A **stub** supplies canned behavior:
``` csharp
gateway returns Approved
```

A **mock** commonly verifies interaction:
``` text
gateway must be called exactly once
with this amount
```

Many mocking libraries can do both. The pattern's emphasis is replacing the inconvenient service, not the testing-library terminology.

## Hand-Written Stubs

Hand-written stubs are often underrated.
``` csharp
public sealed class PaymentGatewayStub
    : IPaymentGateway
{
    public PaymentAuthorizationResult Result { get; set; }
        = PaymentAuthorizationResult.Approved();

    public Task<PaymentAuthorizationResult>
        AuthorizeAsync(
            Money amount,
            PaymentMethodToken token,
            CancellationToken cancellationToken)
        => Task.FromResult(Result);
}
```

Advantages:
-   easy to understand,
-   reusable,
-   debugger-friendly,
-   independent of a mocking framework.

## Failure Scenarios

A good Service Stub can simulate more than success.
``` csharp
public sealed class FailingShippingStub
    : IShippingGateway
{
    public Task<ShippingQuote> GetQuoteAsync(
        Shipment shipment,
        CancellationToken cancellationToken)
    {
        throw new ShippingProviderUnavailableException();
    }
}
```

Tests can exercise behavior that is difficult to trigger reliably against a real service.

## Latency and Cancellation

You may need to test timeout or cancellation behavior:
``` csharp
public sealed class SlowGatewayStub
    : IExternalGateway
{
    public async Task<Result> ExecuteAsync(
        CancellationToken cancellationToken)
    {
        await Task.Delay(
            TimeSpan.FromMinutes(10),
            cancellationToken);

        return Result.Success();
    }
}
```

For most tests, injecting controllable timing abstractions is preferable to making the test actually wait.

## HttpMessageHandler Stubs

Sometimes the code under test owns an HTTP Gateway and you want to stub below it. `HttpClient` can use a custom `HttpMessageHandler`:
``` csharp
public sealed class StubHttpMessageHandler(
    HttpResponseMessage response)
    : HttpMessageHandler
{
    protected override Task<HttpResponseMessage>
        SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
    {
        return Task.FromResult(response);
    }
}
```

Now the real Gateway mapping code can run against deterministic HTTP responses. This is useful for testing protocol translation without calling the real provider.

## Test Servers

For more realistic HTTP integration, run a local stub server. The application sends real HTTP requests to:
``` text
http://localhost:<port>
```

and the stub server returns controlled responses. This tests:
-   serialization,
-   headers,
-   HTTP methods,
-   status handling,
-   retries,
-   timeouts.

It is heavier than a direct interface stub but exercises more of the integration stack.

## Wire-Level Stubs

A wire-level stub can define:
``` text
When:
POST /payments
body matches ...

Return:
503 Service Unavailable
```

This is valuable when testing a Gateway rather than the application service above it. Choose the stub level based on what the test needs to prove.

## Contract Drift

The biggest danger is a stub that no longer behaves like the real service. Suppose the provider changes:
``` json
{
  "status": "approved"
}
```

to:
``` json
{
  "decision": "approved"
}
```

Your in-memory `IPaymentGateway` stub still passes because it bypasses serialization entirely. That is why Service Stub should not replace all real integration testing.

## Contract Tests

Run a smaller suite against the actual provider's sandbox or contract when possible. The goal is:
``` text
Fast tests -> stub
Integration confidence -> contract/sandbox tests
```

Both are useful.

## Consumer-Driven Contracts

In service-to-service architectures, contract testing can verify that a provider continues to satisfy assumptions encoded by consumers. This complements stubs by detecting drift between the fake behavior and the real boundary.

## ASP.NET Core Integration Tests

An application test can override a production dependency:
``` csharp
services.RemoveAll<IPaymentGateway>();

services.AddSingleton<IPaymentGateway>(
    new PaymentGatewayStub
    {
        Result =
            PaymentAuthorizationResult.Approved()
    });
```

Then the test sends an actual HTTP request to the application. This gives a useful middle ground:
``` text
Real ASP.NET Core pipeline
Real application behavior
Stubbed external dependency
```

## Determinism

The main value of a stub is control. Tests should not randomly fail because:
-   the internet is slow,
-   a vendor sandbox is down,
-   rate limits were exceeded,
-   external test data changed.

A stub makes the dependency deterministic.

## Do Not Reimplement the Vendor

A stub should model the scenarios your application needs. Do not build a complete clone of a third-party service. The more elaborate the fake becomes, the more likely you are maintaining a second implementation that can itself be wrong.

## Record/Replay

Some teams record real provider responses and replay them in tests. This can create realistic fixtures, but review recordings for:
-   secrets,
-   personal data,
-   expiration,
-   nondeterministic fields,
-   licensing or policy constraints.

Sanitize fixtures before committing them.

## Testing Retries

A stateful stub can return a sequence:
``` text
Call 1 -> 503
Call 2 -> 503
Call 3 -> 200
```

That allows deterministic testing of retry behavior. Likewise:
``` text
Call 1 -> timeout
Call 2 -> success
```

can verify resilience policies.

## When to Use It

Use Service Stub when an external dependency makes tests slow, fragile, expensive, or difficult to control.

## When Not to Stop There

A stub proves how your code behaves against the stub. It does not prove the real service matches your assumptions. Keep some level of real contract or integration verification for important dependencies.

## Related Patterns

-   Gateway
-   Plugin
-   Separated Interface
-   Remote Facade

## Summary

Service Stub replaces an inconvenient external dependency with deterministic behavior during testing. Modern .NET makes stubbing possible at several levels: application interfaces, `HttpMessageHandler`, local HTTP servers, or protocol-level fixtures. The best test suites combine fast stubs with enough real integration testing to detect contract drift.
