# Getting Started with SignalR in .NET

SignalR's basic setup is genuinely simple -- a Hub class, a handful of client-side JavaScript, and you have real-time updates flowing. The part that catches people off guard is everything that happens the moment you deploy more than one instance of your app: connections that were reliably reaching every client in a single-server dev environment suddenly only reach whichever instance a given client happens to be connected to, unless you've set up a backplane to fix that. That gap between "works on my machine" and "works in production" is exactly what this guide is aimed at closing early.

This guide covers setting up SignalR in .NET, bootstrapping a Hub with proper connection and group management, the core patterns for server-to-client and client-to-server communication, and the best practices -- including backplane setup -- that keep real-time features working correctly once you're running more than one server. By the end you'll have a real-time setup that scales the same way the rest of your application does.

If you're deciding between API styles first, a comparison of the top .NET API styles covers where SignalR fits relative to Minimal APIs, Controllers, gRPC, and GraphQL -- including why it's meant to complement your main API, not replace it.

## What You'll Need

- .NET 8 SDK or later
- No special packages for the server side -- SignalR is included in the ASP.NET Core shared framework
- A Redis instance if you plan to run more than one server instance in production

## Installing and Scaffolding

SignalR's server components are already part of ASP.NET Core -- no NuGet package needed for the basics:

```bash
dotnet new web -n MyApp.RealTime
cd MyApp.RealTime
```

For the client side in a browser app, install the JavaScript client:

```bash
npm install @microsoft/signalr
```

.NET clients (for server-to-server or desktop app scenarios) use a NuGet package instead:

```bash
dotnet add package Microsoft.AspNetCore.SignalR.Client
```

## Bootstrapping the Ideal Environment

### Define a Hub

A Hub is the central point clients connect to and the server uses to push messages:

```csharp
public class OrderHub(IOrderService orderService) : Hub
{
    public async Task JoinOrderGroup(int orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"order-{orderId}");
    }

    public async Task LeaveOrderGroup(int orderId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"order-{orderId}");
    }
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

### Pushing updates from application code, not just from within the Hub

The more common real-world pattern is pushing updates from elsewhere in your application -- a service that processes an order needs to notify connected clients, not wait for a client to ask:

```csharp
public class OrderService(IHubContext<OrderHub> hubContext, AppDbContext db) : IOrderService
{
    public async Task ProcessAsync(int orderId)
    {
        var order = await db.Orders.FindAsync(orderId);
        order!.Status = OrderStatus.Processing;
        await db.SaveChangesAsync();

        await hubContext.Clients.Group($"order-{orderId}")
            .SendAsync("OrderStatusChanged", new { orderId, status = order.Status.ToString() });
    }
}
```

`IHubContext<T>` lets any service push to connected clients without needing to be a Hub method itself -- this is the pattern you'll use far more often than client-initiated Hub methods for most real-time notification scenarios.

### The client side

```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/orders")
    .withAutomaticReconnect()
    .build();

connection.on("OrderStatusChanged", (data) => {
    console.log(`Order ${data.orderId} is now ${data.status}`);
});

await connection.start();
await connection.invoke("JoinOrderGroup", 42);
```

`.withAutomaticReconnect()` is worth enabling by default -- without it, a dropped connection (a brief network blip, a server restart) requires the client to manually detect and reconnect, which most applications need anyway.

### The backplane: required the moment you scale past one instance

In a single-server setup, everything above works correctly on its own. The moment you run multiple instances behind a load balancer, a client connected to Instance A won't receive a message sent from Instance B unless a backplane relays it:

```bash
dotnet add package Microsoft.AspNetCore.SignalR.StackExchangeRedis
```

```csharp
builder.Services.AddSignalR()
    .AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis")!);
```

This single line is the entire fix -- SignalR handles routing messages across instances via Redis pub/sub once configured, with no change needed to your Hub or client code. Skipping this in a multi-instance deployment doesn't cause an error; it causes a confusing bug where some clients mysteriously don't receive updates depending on which instance they happen to be connected to.

## Core Workflow

- **Use groups to scope broadcasts, not individual connection IDs, unless you specifically need to target one connection.** Groups (like `order-{orderId}` above) let you broadcast to "everyone watching this order" without tracking connection IDs manually.
- **Push from application services via `IHubContext<T>`, not exclusively from Hub methods.** Most real-time notifications originate from business logic elsewhere in your app, not from a client request.
- **Handle reconnection and connection state on the client deliberately.** `.withAutomaticReconnect()` handles the mechanics, but your UI still needs to reflect connection state (reconnecting, disconnected) to the user.

## Verifying Your Setup

1. **Groups scope broadcasts correctly** -- confirm a message sent to `order-42`'s group only reaches clients that joined that specific group, not all connected clients
2. **The backplane is actually working, if you have one** -- with two local instances running behind a simple load balancer, confirm a message sent from a request handled by Instance A reaches a client connected to Instance B
3. **Reconnection works as expected** -- kill and restart the server while a client is connected and confirm the client automatically reconnects
4. **Authentication flows through correctly** -- if your Hub requires authorization, confirm `Context.User` reflects the authenticated user's identity, not an anonymous context

## Best Practices

**Set up a Redis backplane before you scale to multiple instances, not after noticing clients randomly miss updates.** This bug is easy to prevent and confusing to diagnose after the fact, since it doesn't manifest as an error -- just silently missing messages for some clients.

**Use `IHubContext<T>` from application services for most real-time pushes.** Hub methods are for client-initiated actions (joining a group, sending a chat message); most "notify clients something changed" scenarios originate elsewhere in your code.

**Scope broadcasts with groups rather than tracking connection IDs manually.** Groups handle the bookkeeping of "which connections care about this update" far more cleanly than maintaining your own connection-ID-to-interest mapping.

**Enable automatic reconnection on the client, and reflect connection state in your UI.** Users should know when a real-time feature has temporarily lost its connection, not silently stop receiving updates with no indication why.

**Don't use SignalR as a general-purpose API replacement.** It solves real-time, server-push scenarios specifically -- pair it with a REST, GraphQL, or gRPC API for the request/response interactions that make up the rest of your application.

## Comparison with GraphQL

| | SignalR | GraphQL (subscriptions) |
| --- | --- | --- |
| Primary purpose | Real-time, bidirectional push | Query language, with subscriptions as an add-on for real-time |
| Transport | WebSockets (with fallbacks) | Typically WebSockets for subscriptions specifically |
| Best fit | Chat, live dashboards, notifications | Real-time updates to specific GraphQL query results |
| Scaling | Requires a backplane (Redis) across instances | Similar scaling considerations, less standardized tooling |

GraphQL subscriptions (which Hot Chocolate also supports) offer a real-time option scoped to GraphQL's query model specifically. SignalR is the more general-purpose real-time tool in the .NET ecosystem and is more commonly reached for when real-time isn't specifically tied to a GraphQL API's data model.

## Frequently Asked Questions

### Do I need a backplane if I only run one server instance?

No -- a backplane is only necessary once you're running multiple instances that need to relay messages to each other's connected clients. A single-instance deployment works correctly without one, though it's worth setting one up proactively if you know horizontal scaling is coming, since retrofitting it later is simple but easy to forget under deployment pressure.

### What happens if I forget to configure a backplane in a multi-instance deployment?

Clients connected to different instances silently stop receiving messages sent from requests handled by other instances -- there's no error, just missing updates for some subset of users depending on load balancing. This is a genuinely confusing bug to diagnose without knowing to look for it, which is why it's worth setting up deliberately rather than discovering the hard way.

### Should I push updates from Hub methods or from application services?

From application services, via `IHubContext<T>`, for most real-time notification scenarios -- the event triggering a push (an order status changing, a new message arriving) usually originates in business logic, not from a client request to a Hub method. Hub methods are more appropriate for client-initiated actions like joining a group or sending a message.

### Can SignalR work without WebSockets?

Yes -- SignalR automatically falls back to Server-Sent Events or long polling if WebSockets aren't available in a given client environment, without requiring different code on your part. This is one of its practical advantages over hand-rolling WebSocket handling yourself.

### How do I authenticate SignalR connections?

The same ASP.NET Core authentication and authorization system used elsewhere applies -- decorate your Hub with `[Authorize]`, and `Context.User` reflects the authenticated user inside Hub methods, the same way `HttpContext.User` works in a controller or Minimal API handler.

### Is SignalR a replacement for my REST or GraphQL API?

No -- SignalR solves real-time, server-initiated push specifically, not general request/response API needs. Almost every real-world SignalR usage sits alongside a REST, GraphQL, or gRPC API handling the majority of interactions, with SignalR layered in for the specific features that need live updates.

### What's the most common mistake in a first SignalR setup?

Not configuring a Redis backplane before scaling to multiple server instances, leading to a confusing bug where updates only reach some connected clients. The second most common is pushing every update to all connected clients instead of using groups to scope broadcasts to only the clients that actually care about a given update.
