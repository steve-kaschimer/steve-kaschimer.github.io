---
category: Session State Patterns
csharp: 14
description: Store small amounts of session-specific state on the client
  using cookies, query strings, hidden fields, and protected ASP.NET
  Core data.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/clientSessionState.html"
order: 42
pattern: Client Session State
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: client-session-state
status: draft
title: Client Session State in Modern ASP.NET Core
---

# Client Session State in Modern ASP.NET Core

Client Session State stores session-specific state on the client rather
than keeping it in server memory or a server-side session store.

In web applications, the client might carry state through:

-   cookies,
-   query strings,
-   hidden form fields,
-   route values,
-   browser storage,
-   protected tokens.

The server receives the state again on a later request.

## HTTP Is Stateless

A request does not inherently remember the previous request.

Suppose a user is moving through a product search:

``` text
Category = Laptops
Sort = Price
Page = 3
```

One approach is to store that state on the client:

``` text
/products?category=laptops&sort=price&page=3
```

No server-side session is required.

## Query Strings

Query strings are excellent for state that should be:

-   bookmarkable,
-   shareable,
-   visible,
-   naturally part of navigation.

For example:

``` csharp
app.MapGet(
    "/products",
    (
        string? category,
        string? sort,
        int page = 1) =>
    {
        // Query based on client-supplied state.
    });
```

This is Client Session State in a very simple form.

## Hidden Fields

A multi-step form can carry state forward:

``` html
<input
    type="hidden"
    name="CartId"
    value="..." />
```

The next request returns that value to the server.

Hidden does not mean trusted.

A user can modify hidden fields.

Validate all client-supplied state.

## Cookies

Cookies persist small values across requests:

``` csharp
Response.Cookies.Append(
    "preferred-currency",
    "USD",
    new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Lax
    });
```

Later:

``` csharp
var currency =
    Request.Cookies["preferred-currency"];
```

Cookies are automatically sent with matching requests, so their size
should remain small.

## Do Not Trust Client State

This is the central security rule.

If the client sends:

``` text
DiscountPercent = 90
```

the server cannot treat it as authoritative merely because the server
originally generated it.

Client-side state can be:

-   modified,
-   replayed,
-   deleted,
-   copied,
-   expired.

Important business state must be validated against trusted server-side
rules.

## Protecting Client State

ASP.NET Core Data Protection can protect values that must round-trip
through an untrusted client.

Conceptually:

``` csharp
var protector =
    dataProtectionProvider.CreateProtector(
        "CheckoutState.v1");

var protectedValue =
    protector.Protect(serializedState);
```

On return:

``` csharp
var serializedState =
    protector.Unprotect(protectedValue);
```

Protection can provide confidentiality and integrity depending on how
the API is used.

It does not make every kind of client-side storage appropriate for
sensitive or long-lived business data.

## Authentication Cookies Are a Specialized Example

ASP.NET Core cookie authentication can store a protected authentication
ticket in a cookie.

That is a sophisticated client-carried state mechanism.

But application session state and authentication state have different
responsibilities and security requirements.

Do not build custom authentication by placing an unprotected user ID in
a cookie.

## Signed or Protected Tokens

A client can also carry a compact workflow token:

``` text
checkout-state=<protected payload>
```

The server validates and decodes it on the next request.

This can eliminate server-side session storage for small workflows.

But token size, revocation, expiration, privacy, and replay behavior all
need deliberate design.

## URL State Is Public State

Do not put secrets in query strings.

URLs may appear in:

-   browser history,
-   server logs,
-   analytics,
-   referrer headers,
-   screenshots,
-   copied links.

Use query strings for navigational state, not confidential data.

## Browser Storage

JavaScript applications can use mechanisms such as `sessionStorage` or
`localStorage`.

Those are client-side persistence mechanisms, but they have different
security characteristics from `HttpOnly` cookies because JavaScript can
access them.

Do not place secrets or bearer credentials into browser storage without
understanding the threat model.

## Client Session State and Scale-Out

One advantage is that the server does not need a shared session store
merely to reconstruct the state.

Any application instance can process the request if the client supplies
everything required.

That can simplify horizontal scaling.

The cost is that every relevant request may carry additional state.

## Payload Size

Client Session State works best when the state is small.

Sending a 50 KB serialized shopping cart with every request is usually a
poor trade.

At some point, storing an identifier on the client and keeping the
actual data server-side becomes more efficient.

## Stale State

Client state can become stale.

Suppose a client carries:

``` text
ShippingPrice = 4.99
```

but shipping prices change.

The server must recalculate authoritative business values rather than
trusting the old client representation.

Client state is often best treated as a request or hint, not a source of
truth.

## Client Session State vs. Server Session State

Client state:

``` text
Client carries the state
Server can remain stateless
```

Server session state:

``` text
Client carries an identifier
Server retrieves the state
```

Neither is universally superior.

The right choice depends on size, sensitivity, lifecycle, scalability,
and consistency requirements.

## ASP.NET Core Session Is Not Client Session State

ASP.NET Core's `HttpContext.Session` uses a cookie containing a session
identifier, but the actual session data is stored server-side in an
`IDistributedCache`-backed store.

That is Server Session State, not Client Session State.

The distinction is important.

## Testing

Test client-carried state as untrusted input.

Include:

-   tampered values,
-   missing values,
-   expired protected values,
-   malformed payloads,
-   replayed values,
-   oversized values,
-   stale business data.

## When to Use It

Client Session State is useful for:

-   search/filter state,
-   pagination,
-   UI preferences,
-   small workflow state,
-   identifiers that point to server resources,
-   protected short-lived state.

## When Not to Use It

Avoid putting authoritative, sensitive, large, or frequently changing
business data on the client.

In those cases, Server Session State or Database Session State may be a
better fit.

## Related Patterns

-   Server Session State
-   Database Session State
-   Data Transfer Object
-   Remote Facade

## Summary

Client Session State makes the client carry information needed across
requests.

Modern ASP.NET Core applications can use query strings, cookies, hidden
fields, and protected tokens to implement the pattern.

Its scaling benefits are attractive, but the server must always remember
one rule: anything returned by the client is untrusted until validated.
