---
author: Steve Kaschimer
date: 2029-06-03
image: /images/posts/2029-06-03-hero.webp
image_alt: "A small token glyph anchored to a server-side shape, connected by only a thin identifier line reaching out toward a distant window-frame shape, implying the actual state stays put while only a reference travels."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small amber token glyph anchored inside a teal server-side rectangle on the left, connected by one thin off-white identifier line reaching across to a small window-frame shape on the right, implying the actual state stays server-side while only a lightweight reference travels to the client. Mood is anchored and coordinated. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Server Session State keeps session-specific data on the application side while the client carries only enough to identify the session - HttpContext.Session is the direct modern example. Covers why scale-out changes the design entirely, and the temptation, worth resisting, to store a live domain aggregate in session rather than just an identifier."
tags: ["dotnet", "architecture", "design-patterns", "aspnet-core"]
title: "Server Session State in Modern ASP.NET Core"
---

Server Session State keeps session-specific data on the application side
while the client carries only enough information to identify the
session.

In ASP.NET Core, `HttpContext.Session` is a direct modern example.

## The Core Idea

Instead of sending the whole state to the browser:

``` text
Client:
cart contents
wizard state
preferences
```

the client carries a session identifier:

``` text
Client -> session id -> server-side state
```

The server uses that identifier to retrieve the associated data.

## ASP.NET Core Session

Configure a backing cache:

``` csharp
builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(20);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
```

Then add session middleware:

``` csharp
app.UseSession();
```

Application code can write:

``` csharp
HttpContext.Session.SetString(
    "preferred-currency",
    "USD");
```

and later read:

``` csharp
var currency =
    HttpContext.Session.GetString(
        "preferred-currency");
```

The browser does not contain the actual value in the session cookie.

## Scale-Out Changes the Design

An in-memory cache works only when every request for a session reaches
the same application instance.

In a scaled-out deployment:

``` text
Browser
  |
Load Balancer
  |-------- App A
  |-------- App B
  |-------- App C
```

session state must either use sticky routing or live in a store
available to all instances.

A distributed cache is usually the more robust architecture.

## Keep Session Small

Server-side does not mean unlimited.

Large session objects increase:

-   memory or cache usage,
-   serialization cost,
-   network traffic to a distributed cache,
-   contention,
-   operational complexity.

Store the minimum state needed for the conversation.

## Do Not Store Domain Aggregates in Session

This is tempting:

``` csharp
session.Set("Order", order);
```

but problematic.

The object becomes a stale copy of business data, may be expensive to
serialize, and bypasses normal concurrency and persistence rules.

Prefer an identifier:

``` text
CurrentOrderId = 42
```

then load authoritative state through the normal persistence path.

## Session Is Ephemeral

Session data can disappear because of:

-   expiration,
-   cache eviction,
-   deployment,
-   infrastructure failure,
-   user cookie deletion.

Do not treat it as durable business storage.

A checkout that has legal or financial significance belongs in durable
persistence, even if session state helps drive the UI.

## Concurrency

Two requests from the same user can arrive concurrently.

Session state can therefore have race conditions just like other shared
state.

Avoid read-modify-write logic that assumes requests for one user are
always sequential.

## Security

The session identifier is security-sensitive because it associates a
request with server-side state.

Use secure cookie settings and the framework's session mechanisms rather
than inventing custom predictable session IDs.

Do not use session as a substitute for authentication or authorization.

## Server Session State vs. Client Session State

Client Session State sends the state itself back and forth.

Server Session State sends an identifier and keeps the state on the
application side.

The trade-off is straightforward:

``` text
Client state:
less server storage
more client payload and trust concerns

Server state:
smaller client payload
more server coordination
```

## Testing

Test:

-   missing session,
-   expired session,
-   concurrent requests,
-   scale-out behavior,
-   serialization,
-   failure of the backing cache.

Business operations should remain correct even when ephemeral session
data disappears.

## When to Use It

Server Session State is useful for small amounts of short-lived
conversational state that should not be exposed to or carried by the
client.

## Related Patterns

-   Client Session State
-   Database Session State
-   Data Transfer Object

## Summary

Server Session State keeps conversational data on the application side
and gives the client only a session identifier.

ASP.NET Core supports the pattern directly, but session should remain
small, ephemeral, and separate from durable domain state.
