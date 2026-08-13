---
author: Steve Kaschimer
date: 2027-04-27
image: /images/posts/2027-04-27-hero.webp
image_alt: "A pulsing broadcast-wave glyph radiating from a small central hub icon, with a second faint hub silhouette in the background connected by a thin backplane line to keep both in sync."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a solid central hub-shaped glyph emitting concentric broadcast-wave rings outward in teal. A second, fainter hub silhouette sits in the background at a slight offset, connected to the first by a thin amber line labeled subtly as a backplane, implying two coordinated instances. A small automatic-reconnect loop icon sits near the base. Mood is live, connected, and slightly urgent. Avoid: vendor logos, brand colors, circuit-board textures, gears, or literal radio-tower clip art."
layout: post.njk
site_title: Tech Notes
summary: "SignalR isn't a REST replacement, it's for real-time push - and the moment you scale past one server instance without a Redis backplane, some clients silently stop getting updates. A setup guide for Hubs, IHubContext pushes, and the backplane fix."
tags: ["dotnet", "api-design", "real-time", "architecture", "devops"]
title: "Getting Started with SignalR in .NET"
---

SignalR solves a different problem than every other API style in this series: not "how does a client request data," but "how does a client find out the moment something changed, without asking." That distinction matters because SignalR is additive to your API surface, not a replacement for it - and it has exactly one setup mistake that's both extremely common and completely silent: skip the Redis backplane past one server instance, and some clients will simply stop receiving updates, with no error anywhere in your logs telling you why.

This guide covers installing SignalR on both server and client, building a Hub, the more common pattern of pushing updates from application services rather than only from Hub methods, client-side automatic reconnection, and the Redis backplane that becomes mandatory the moment you run more than one instance. By the end you'll have a real-time setup that keeps working after your first horizontal scale-out, not one that quietly breaks.

If you're deciding between API styles first, [a comparison of the top .NET API styles](/posts/2027-03-30-top-5-dotnet-api-styles-compared/) covers where SignalR fits relative to Minimal APIs, Controllers, gRPC, and GraphQL - including why it isn't really a competitor to any of them.

## What You'll Need

- .NET 8 SDK or later
- A JavaScript or .NET client application to receive pushed updates
- Redis (or an equivalent) available before scaling past a single server instance - budget for this now, not after

## Installing SignalR

```bash
dotnet new web
```

SignalR ships as part of ASP.NET Core - no separate server package needed. For clients:

```bash
npm install @microsoft/signalr
```

```bash
dotnet add package Microsoft.AspNetCore.SignalR.Client
```

## Bootstrapping the Ideal Environment

### Define a Hub

```csharp
public class OrderHub : Hub
{
    public async Task JoinOrderGroup(int orderId) =>
        await Groups.AddToGroupAsync(Context.ConnectionId, $"order-{orderId}");
}
```

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();

var app = builder.Build();
app.MapHub<OrderHub>("/hubs/orders");
app.Run();
```

`Groups.AddToGroupAsync` is how you scope pushes to interested clients - here, clients that care about a specific order join a group named for that order, rather than every connected client receiving every update.

### Push updates from application services, not just Hub methods

The tutorial-friendly pattern - a Hub method that immediately messages back to the caller - is less common in real applications than pushing updates from wherever the actual state change happens, which is often nowhere near the Hub itself:

```csharp
public class OrderService(IHubContext<OrderHub> hubContext, AppDbContext db)
{
    public async Task UpdateOrderStatusAsync(int orderId, OrderStatus status)
    {
        var order = await db.Orders.FindAsync(orderId);
        order!.Status = status;
        await db.SaveChangesAsync();

        await hubContext.Clients.Group($"order-{orderId}")
            .SendAsync("OrderStatusChanged", new { orderId, status });
    }
}
```

`IHubContext<OrderHub>` lets any service - not just code running inside a Hub - push messages to connected clients. This is the pattern most production SignalR usage actually follows: an order status changes somewhere in application logic, and that's where the push originates, not from a client-initiated Hub call.

### Client-side connection with automatic reconnection

```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/orders")
    .withAutomaticReconnect()
    .build();

connection.on("OrderStatusChanged", (update) => {
    console.log(`Order ${update.orderId} is now ${update.status}`);
});

await connection.start();
await connection.invoke("JoinOrderGroup", orderId);
```

`.withAutomaticReconnect()` handles transient network drops without you writing reconnection logic by hand - without it, a dropped connection stays dropped until the client explicitly reconnects.

## Core Workflow

### The Redis backplane - mandatory past one instance

A single SignalR server instance tracks its own connections in memory, which is fine until you run more than one instance behind a load balancer. At that point, a message sent from one instance only reaches clients connected to *that* instance - clients connected to a different instance never receive it, with no error or exception anywhere:

```bash
dotnet add package Microsoft.AspNetCore.SignalR.StackExchangeRedis
```

```csharp
builder.Services.AddSignalR()
    .AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis")!);
```

This one line is the entire fix - it fans messages out across all connected instances via Redis pub/sub instead of relying on any single instance's in-memory connection state. Add it as part of your initial setup if there's any chance of scaling past one instance, not as a reactive fix once someone reports "some users aren't getting updates."

## Verifying Your Setup

1. **Connections join the right groups** - confirm `JoinOrderGroup` (or your equivalent) actually scopes a client's connection ID to the intended group
2. **IHubContext pushes reach connected clients** - trigger the application-service code path that calls `hubContext.Clients...SendAsync` and confirm the connected client receives it
3. **Automatic reconnection actually reconnects** - simulate a network interruption and confirm the client reconnects and resumes receiving updates without a manual page reload
4. **The backplane works across instances** - this is the one to specifically test before production if you're running more than one instance: connect two clients to different instances (or simulate it locally with two processes sharing the same Redis backplane) and confirm both receive a push originating from either instance

## Best Practices

**Add the Redis backplane as part of initial setup if there's any chance you'll scale past one instance, not after.** The failure mode without it - some clients silently missing updates - is hard to diagnose after the fact because nothing throws an error; it just looks like flaky client behavior.

**Push updates via `IHubContext<T>` from wherever the actual state change happens, not exclusively from Hub methods.** Most real-world SignalR usage is server-initiated push triggered by application logic, not a client asking the Hub for something and getting an immediate reply.

**Use groups to scope pushes to interested clients, not a global broadcast to everyone connected.** Broadcasting to all clients when only a subset care about a given update wastes bandwidth and forces every client to filter messages it should never have received.

**Always enable `.withAutomaticReconnect()` on the client.** Real networks drop connections regularly - mobile clients, sleeping laptops, flaky Wi-Fi - and without automatic reconnection, a dropped connection requires a manual page reload to recover.

**Remember SignalR is additive, not a REST/GraphQL/gRPC replacement.** Don't reach for it to solve request-response problems just because it's already in the project for a real-time feature - it solves a genuinely different problem and forcing request-response patterns through it fights the tool.

## Comparison with GraphQL Subscriptions

| | SignalR | GraphQL Subscriptions |
| --- | --- | --- |
| Purpose | Dedicated real-time push library | Real-time updates integrated into a GraphQL schema |
| Setup | Standalone, own connection model | Requires an existing GraphQL server (e.g., Hot Chocolate) |
| Scaling | Redis backplane past one instance | Depends on the underlying GraphQL server's subscription transport |
| Best for | Pure real-time push use cases | Teams already using GraphQL who want events in the same schema |

If you're not already running a GraphQL API, SignalR is the more direct, purpose-built choice for real-time push. If you are, GraphQL subscriptions may be a more natural fit since events flow through the same schema and client tooling you're already using.

## Frequently Asked Questions

### Why did some of my users stop receiving SignalR updates after I scaled to multiple instances?

Almost certainly a missing Redis backplane. Each SignalR server instance tracks its own connections in memory by default, so a message sent from one instance only reaches clients connected to that same instance - clients on other instances silently miss it, with no exception or error logged anywhere. `AddStackExchangeRedis(...)` fixes this by fanning messages across all instances via Redis pub/sub.

### Should I push messages from inside Hub methods or from application services?

Application services, in most real-world cases - via `IHubContext<T>` injected wherever the actual state change happens. Hub methods responding directly to the client that called them is the simpler tutorial pattern, but production systems more often need to push updates triggered by something that has nothing to do with a client-initiated Hub call, like a background job or another service completing work.

### Is SignalR a replacement for REST or GraphQL?

No - it solves a fundamentally different problem (real-time push vs. request-response) and is meant to be additive to an existing API, not a replacement for it. A typical application uses REST or GraphQL for its request-response surface and SignalR specifically for the subset of features that need live updates.

### What transports does SignalR use besides WebSockets?

WebSockets is the preferred transport, with automatic fallback to Server-Sent Events and then long polling if WebSockets aren't available in a given client/network environment. This fallback happens transparently - your application code doesn't need to handle each transport differently.

### How do groups work, and why use them instead of broadcasting to everyone?

Groups let you scope a push to a subset of connected clients (e.g., everyone viewing a specific order) instead of every connected client. Broadcasting everything to everyone wastes bandwidth and forces clients to filter out irrelevant messages - groups push the filtering to the server, where it belongs.

### What's the most common mistake in a first SignalR setup?

Deploying to more than one server instance without a Redis backplane, which fails silently rather than with an obvious error - some clients simply stop getting updates, and it's easy to mistake for a flaky client issue rather than a missing backplane. Add the backplane during initial setup if scaling is even a possibility, not after the symptom shows up.
