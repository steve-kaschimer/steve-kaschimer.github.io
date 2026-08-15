---
category: Web Presentation Patterns
csharp: 14
description: Centralize navigation and multi-step application flow
  outside individual controllers using explicit workflow coordinators
  and state machines.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/applicationController.html"
order: 35
pattern: Application Controller
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: application-controller
status: draft
title: Application Controller in Modern ASP.NET Core
---

# Application Controller in Modern ASP.NET Core

Application Controller centralizes decisions about screen navigation and
application flow.

Page Controller answers:

> What should happen for this request?

Application Controller answers:

> Given where the user is in the workflow, where should the application
> go next?

That distinction becomes valuable when navigation itself contains
meaningful logic.

## The Problem

Consider an onboarding flow:

``` text
Choose Plan
    |
Account Details
    |
Identity Verification
    |
Payment
    |
Review
    |
Complete
```

The next page may depend on:

-   selected plan,
-   account type,
-   verification status,
-   payment requirements,
-   previous steps.

If every controller independently decides where to redirect next, flow
logic becomes scattered.

## A Simple Flow Coordinator

``` csharp
public sealed class OnboardingFlow
{
    public OnboardingStep Next(
        OnboardingState state)
    {
        if (state.Plan is null)
            return OnboardingStep.ChoosePlan;

        if (!state.HasAccountDetails)
            return OnboardingStep.AccountDetails;

        if (state.RequiresVerification &&
            !state.IsVerified)
        {
            return OnboardingStep.IdentityVerification;
        }

        if (!state.HasPaymentMethod)
            return OnboardingStep.Payment;

        if (!state.IsReviewed)
            return OnboardingStep.Review;

        return OnboardingStep.Complete;
    }
}
```

The navigation rules now have one home.

## Controller Usage

A page-specific controller can delegate flow decisions:

``` csharp
[HttpPost("/onboarding/account")]
public async Task<IActionResult> SaveAccount(
    AccountDetailsRequest request,
    CancellationToken cancellationToken)
{
    var state = await onboarding.SaveAccountAsync(
        request,
        cancellationToken);

    var next = flow.Next(state);

    return RedirectToStep(next);
}
```

The Page Controller still handles HTTP.

The Application Controller owns workflow navigation.

## Why Not Put This in the Domain?

Sometimes workflow progression *is* domain behavior.

If the states represent an actual business process, a domain state
machine may be the right abstraction.

Application Controller is most useful when the concern is specifically
application or presentation flow:

-   which screen to display,
-   which route comes next,
-   which UI step should be skipped.

Do not move genuine business invariants into the presentation layer just
because they affect navigation.

## Explicit States

An enum can make flow logic clearer:

``` csharp
public enum OnboardingStep
{
    ChoosePlan,
    AccountDetails,
    IdentityVerification,
    Payment,
    Review,
    Complete
}
```

A richer state machine may be appropriate for complex workflows.

The important part is making navigation rules explicit rather than
distributing them across redirects.

## Application Controller and Front Controller

Front Controller centralizes common request processing.

Application Controller centralizes navigation and flow.

They solve different problems.

``` text
Request
   |
Front Controller pipeline
   |
Page Controller
   |
Application Controller
   |
Next page / action
```

## Application Controller and SPA Front Ends

In a single-page application, some navigation logic may live in the
browser.

The pattern still applies conceptually.

A client-side router, wizard coordinator, or workflow state machine may
act as an Application Controller.

The architectural question is where the navigation rules should live and
whether they should be centralized.

## Server-Driven Workflow

Some systems deliberately keep workflow state on the server.

For example:

``` csharp
public sealed record CheckoutState(
    bool HasShippingAddress,
    bool HasDeliveryMethod,
    bool HasPaymentMethod,
    bool IsConfirmed);
```

The server can determine the next valid step rather than trusting the
client to navigate correctly.

This can be useful when workflow order has security or consistency
implications.

## Avoid the God Controller

Centralization introduces its own danger.

A single class that knows every navigation rule for a huge application
becomes difficult to maintain.

Prefer focused controllers:

``` text
CheckoutFlow
OnboardingFlow
AccountRecoveryFlow
```

rather than:

``` text
ApplicationControllerForEverything
```

Centralize by coherent workflow.

## Deep Links

A robust flow coordinator should consider what happens when users
navigate directly to a later step.

For example:

``` text
/onboarding/review
```

may need to redirect to identity verification if required information is
missing.

Centralized flow rules make that consistency easier to enforce.

## Testing

Application Controller logic is often easy to unit-test:

``` csharp
[Fact]
public void Verification_is_next_when_required()
{
    var state = new OnboardingState(
        Plan: Plan.Business,
        HasAccountDetails: true,
        RequiresVerification: true,
        IsVerified: false);

    var next = flow.Next(state);

    Assert.Equal(
        OnboardingStep.IdentityVerification,
        next);
}
```

The tests describe the workflow without requiring HTTP infrastructure.

## When to Use It

Application Controller is valuable when:

-   several screens form one workflow,
-   navigation depends on state,
-   users may skip steps conditionally,
-   multiple Page Controllers repeat redirect logic,
-   navigation rules deserve direct tests.

## When to Skip It

Simple applications with straightforward links and redirects usually do
not need another layer.

A controller action that always redirects to one known page is not
evidence that you need an Application Controller.

## Related Patterns

-   Page Controller
-   Front Controller
-   Model View Controller
-   Service Layer

## Summary

Application Controller gives complex screen flow an explicit home.

In modern ASP.NET Core, it is especially useful for wizards, onboarding,
checkout, account recovery, and other multi-step experiences where
navigation rules would otherwise become scattered across endpoint
handlers.
