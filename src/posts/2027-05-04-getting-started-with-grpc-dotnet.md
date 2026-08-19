---
author: Steve Kaschimer
date: 2027-05-04
image: /images/posts/2027-05-04-hero.webp
image_alt: "A solid amber lightning-bolt glyph channeled through a narrow binary duct into a locked TLS padlock, with a shared contract file icon bridging two identical endpoint shapes."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a solid amber lightning-bolt glyph on the left, funneled through a narrow rectangular duct into a small teal padlock shape, implying speed gated by required TLS. To the right, a single flat contract-file icon sits equidistant between two identical small endpoint rectangles, connected by matching thin lines to each, representing a shared .proto contract. Mood is fast, strict, and precise. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic database-cylinder clip art."
layout: post.njk
site_title: Tech Notes
summary: "gRPC is the fastest option in the .NET API landscape, but it demands TLS even locally and has zero direct browser support. A setup guide for shared .proto contracts, streaming RPCs, and RpcException error mapping."
tags: ["dotnet", "api-design", "grpc", "performance", "microservices"]
title: "Getting Started with gRPC in .NET"
---



gRPC is the fastest of the API styles covered in this series, and the least forgiving about it - binary Protobuf serialization and HTTP/2 multiplexing buy you real performance, but only if every caller is a service you control, since there's no direct browser support and Kestrel refuses to negotiate a gRPC connection without TLS, even on localhost. Understanding that trade-off upfront saves you from reaching for gRPC in the one place it structurally can't go: a public API a frontend calls directly.

This guide covers scaffolding a gRPC service, defining a `.proto` contract and sharing it across client and server through a common project reference, the core unary and streaming RPC patterns, and mapping errors through `RpcException`. By the end you'll have a service-to-service setup that's fast, strongly-typed, and won't drift out of sync between client and server.

If you're deciding between API styles first, [a comparison of the top .NET API styles](/posts/2027-03-30-top-5-dotnet-api-styles-compared/) covers where gRPC fits relative to Minimal APIs, Controllers, GraphQL, and SignalR - including exactly why it isn't the right choice for a public-facing API.

## What You'll Need

- .NET 8 SDK or later
- A clear sense that every caller of this service will be another service you control, not a browser - if that's not true, gRPC is the wrong tool here
- Comfort with TLS being a hard requirement, not an optional hardening step, even in local development

## Scaffolding a gRPC Project

```bash
dotnet new grpc
```

This scaffolds a gRPC service project with an example `.proto` file, generated code wiring, and Kestrel already configured for HTTP/2.

## Bootstrapping the Ideal Environment

### Define the contract in a .proto file

```protobuf
// order.proto
syntax = "proto3";

option csharp_namespace = "OrderService";

service OrderService {
    rpc GetOrder (GetOrderRequest) returns (OrderReply);
    rpc ProcessOrder (ProcessOrderRequest) returns (OrderReply);
}

message GetOrderRequest {
    int32 order_id = 1;
}

message ProcessOrderRequest {
    int32 order_id = 1;
}

message OrderReply {
    int32 order_id = 1;
    string status = 2;
}
```

### Wire the .proto file into the project

```xml
<ItemGroup>
    <Protobuf Include="Protos/order.proto" GrpcServices="Server" />
</ItemGroup>
```

`GrpcServices="Server"` generates the server-side base class to implement; a client project referencing the same `.proto` file uses `GrpcServices="Client"` instead to generate a strongly-typed client.

### Implement the service

```csharp
public class OrderServiceImpl(AppDbContext db) : OrderService.OrderServiceBase
{
    public override async Task<OrderReply> GetOrder(GetOrderRequest request, ServerCallContext context)
    {
        var order = await db.Orders.FindAsync(request.OrderId);
        return order is null
            ? throw new RpcException(new Status(StatusCode.NotFound, $"Order {request.OrderId} not found"))
            : new OrderReply { OrderId = order.Id, Status = order.Status.ToString() };
    }
}
```

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddGrpc();

var app = builder.Build();
app.MapGrpcService<OrderServiceImpl>();
app.Run();
```

### Why Kestrel needs HTTP/2 and TLS, even locally

gRPC requires HTTP/2, and browsers and most HTTP clients negotiate protocol version through TLS's ALPN extension during the TLS handshake itself - there's no clear-text (plain HTTP) mechanism for negotiating HTTP/2 on an endpoint that also needs to support other protocols. This is why a gRPC endpoint needs TLS configured even when you're just running it on your own machine during development; it's not optional hardening, it's how the protocol negotiation actually works.

## Core Workflow

### Calling the service from a client

```csharp
using var channel = GrpcChannel.ForAddress("https://localhost:5001");
var client = new OrderService.OrderServiceClient(channel);

var reply = await client.GetOrderAsync(new GetOrderRequest { OrderId = 123 });
```

### Share the .proto file via a common project reference

The single most important discipline in a multi-service gRPC setup: put the `.proto` file in a shared project both the server and every client reference, rather than copying it into each project individually.

```xml
<!-- In both the server project and each client project -->
<ItemGroup>
    <Protobuf Include="..\Contracts\Protos\order.proto" GrpcServices="Server" />
    <!-- or GrpcServices="Client" in the client project -->
</ItemGroup>
```

Copied `.proto` files drift - someone updates the server's copy, forgets the client's, and you get a runtime contract mismatch that the compiler had no way to catch. A shared reference makes that class of bug structurally impossible instead of a matter of remembering to keep two files in sync.

### Streaming RPCs

gRPC supports streaming in a way none of the request-response styles in this series do natively:

```protobuf
rpc StreamOrderUpdates (GetOrderRequest) returns (stream OrderReply);
```

```csharp
public override async Task StreamOrderUpdates(
    GetOrderRequest request, IServerStreamWriter<OrderReply> responseStream, ServerCallContext context)
{
    await foreach (var update in GetOrderUpdatesAsync(request.OrderId, context.CancellationToken))
    {
        await responseStream.WriteAsync(update);
    }
}
```

Server streaming, client streaming, and bidirectional streaming are all supported - useful for scenarios like live order status updates between services, without needing a separate real-time mechanism like SignalR for service-to-service communication specifically.

### Error handling with RpcException

```csharp
catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
{
    // handle not-found specifically
}
```

`RpcException`/`StatusCode` gives you a structured error model that maps cleanly across the wire - a `StatusCode.NotFound` thrown on the server surfaces as the same status code on the client, unlike hand-rolled error conventions that can drift between what the server sends and what the client expects.

## Verifying Your Setup

1. **TLS is actually configured, not skipped** - confirm the service is reachable over `https://`, not `http://`, and that the client trusts the certificate in use (a dev cert is fine for local development)
2. **The shared .proto reference actually eliminates drift** - confirm both server and client projects reference the same physical `.proto` file, not independently maintained copies
3. **Streaming RPCs deliver messages incrementally** - confirm a streaming call's messages arrive as they're written server-side, not buffered and delivered all at once
4. **RpcException status codes map correctly end-to-end** - throw a specific `StatusCode` server-side and confirm the client observes the same code, not a generic failure

## Best Practices

**Share the `.proto` file via a common project reference from the start, never copy it between projects.** This is the single highest-leverage practice in this guide - it converts a class of bug that's easy to introduce and hard to diagnose (contract drift) into something the build system prevents outright.

**Don't reach for gRPC for a public API a browser calls directly.** It's the wrong tool structurally, not just a style preference - browsers can't speak gRPC's native framing without gRPC-Web plus a compatible proxy, and even then it's a workaround, not a first-class use case.

**Use streaming RPCs for cases that are naturally continuous, not to avoid a service call you find inconvenient.** Streaming adds real complexity (backpressure, cancellation, connection lifetime) - reach for it when the data genuinely arrives over time, not as a general substitute for repeated unary calls.

**Map domain errors to `RpcException`/`StatusCode` deliberately, not just letting unhandled exceptions surface as generic failures.** A structured status code the client can branch on is far more useful than an opaque `Internal` error for every failure case.

**Keep Protobuf field numbers stable once a message ships.** Reusing or renumbering existing field numbers breaks binary compatibility for clients still running an older contract version - append new fields with new numbers instead of altering existing ones.

## Comparison with GraphQL

| | gRPC | GraphQL (Hot Chocolate) |
| --- | --- | --- |
| Transport | HTTP/2, Protobuf | HTTP, JSON |
| Browser support | None without gRPC-Web + proxy | Full |
| Client flexibility | Server dictates message shape | Client selects exact fields |
| Performance | Fastest - binary serialization | Good, resolver cost needs managing |
| Best for | Internal service-to-service calls | Client-driven, varied data needs |

The two rarely compete for the same use case in practice - gRPC's lack of direct browser support alone rules it out for most GraphQL scenarios, and GraphQL's flexibility overhead is unnecessary for tightly-controlled internal service calls where gRPC's speed and strict contracts are the priority.

## Frequently Asked Questions

### Why does gRPC require TLS even for local development?

Protocol negotiation between HTTP/1.1 and HTTP/2 on a shared endpoint happens through TLS's ALPN extension during the handshake - there's no clear-text equivalent for that negotiation. This means a gRPC endpoint needs TLS configured from the start, including locally, not as a production-only hardening step.

### Can I call a gRPC service directly from a browser?

Not natively - browsers can't produce gRPC's native HTTP/2 framing. gRPC-Web plus a compatible proxy (like Envoy) bridges the gap, but it's a workaround for a specific need, not a reason to treat gRPC as browser-ready by default. For a public API a frontend calls directly, REST or GraphQL are the more natural fit.

### How do I keep the client and server .proto contracts from drifting apart?

Reference the same physical `.proto` file from a shared project in both the server and every client project, rather than maintaining separate copies. This turns contract drift from an easy-to-miss manual synchronization problem into something the build system structurally prevents.

### What happens if I change a Protobuf message's field numbers after it's shipped?

You break binary compatibility for any client still running the older contract - Protobuf's wire format is positional by field number, not by name. Add new fields with new, unused numbers instead of renumbering or reusing existing ones; that's what keeps old and new clients compatible with the same service.

### When does gRPC's performance advantage actually matter?

Most noticeably in high-throughput, latency-sensitive service-to-service communication, where binary serialization and HTTP/2 multiplexing add up across many calls. For low-volume internal calls or anything a browser needs to reach directly, the performance gain is smaller in absolute terms and doesn't offset the browser-compatibility trade-off.

### Is gRPC worth adopting for a small internal system with just two or three services?

Often not the highest-priority choice at that scale - the setup cost (shared contracts, TLS, tooling) pays off more clearly as the number of services and call volume grows. For a small number of services, a simpler REST-based internal API may be less overhead for comparable practical performance, though gRPC remains a reasonable choice if the team already has the tooling in place.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
