# Getting Started with gRPC in .NET

gRPC asks you to think about API design differently before you write any C# at all -- the contract lives in a `.proto` file, not in your controller or handler code, and both client and server generate their types from that single source of truth. That inversion is where gRPC's real value comes from (compile-time contract safety across services, even across languages), and it's also where most of the initial friction sits if you're used to REST's "just write a handler" workflow.

This guide covers setting up a gRPC service and client in .NET, bootstrapping the `.proto`-first workflow and Kestrel's HTTP/2 requirements, the core patterns for unary calls and streaming, and the best practices that keep a gRPC service maintainable as your contract evolves. By the end you'll have a working service-to-service setup and a clear sense of what gRPC needs that REST doesn't.

If you're deciding between API styles first, a comparison of the top .NET API styles covers where gRPC fits relative to Minimal APIs, Controllers, GraphQL, and SignalR -- including why it's usually the wrong choice for anything browser-facing.

## What You'll Need

- .NET 8 SDK or later
- Awareness that gRPC requires HTTP/2, which has implications for hosting and local development certificates
- A second project (or service) to act as the client, since gRPC's value is specifically in service-to-service communication

## Installing and Scaffolding

```bash
dotnet new grpc -o MyApp.GrpcService
cd MyApp.GrpcService
```

This scaffolds a complete gRPC server project, including a sample `.proto` file, a generated service base class, and Kestrel already configured for HTTP/2 with TLS.

For a client project:

```bash
dotnet new console -o MyApp.GrpcClient
cd MyApp.GrpcClient
dotnet add package Grpc.Net.Client
dotnet add package Google.Protobuf
dotnet add package Grpc.Tools
```

## Bootstrapping the Ideal Environment

### Define your contract in a .proto file

```protobuf
// Protos/order.proto
syntax = "proto3";

option csharp_namespace = "MyApp.GrpcService";

package order;

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (OrderReply);
  rpc ProcessOrder (ProcessOrderRequest) returns (ProcessOrderReply);
}

message GetOrderRequest {
  int32 order_id = 1;
}

message OrderReply {
  int32 id = 1;
  string status = 2;
}

message ProcessOrderRequest {
  int32 order_id = 1;
}

message ProcessOrderReply {
  bool success = 1;
}
```

Reference it in your `.csproj` so the C# types get generated at build time:

```xml
<ItemGroup>
  <Protobuf Include="Protos\order.proto" GrpcServices="Server" />
</ItemGroup>
```

Building the project generates `OrderServiceBase`, request/response message classes, and all the serialization code -- none of it hand-written.

### Implement the service

```csharp
public class OrderGrpcService(IOrderService orderService) : OrderService.OrderServiceBase
{
    public override async Task<OrderReply> GetOrder(GetOrderRequest request, ServerCallContext context)
    {
        var order = await orderService.GetByIdAsync(request.OrderId);
        if (order is null)
            throw new RpcException(new Status(StatusCode.NotFound, $"Order {request.OrderId} not found"));

        return new OrderReply { Id = order.Id, Status = order.Status.ToString() };
    }

    public override async Task<ProcessOrderReply> ProcessOrder(ProcessOrderRequest request, ServerCallContext context)
    {
        await orderService.ProcessAsync(request.OrderId);
        return new ProcessOrderReply { Success = true };
    }
}
```

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddGrpc();
builder.Services.AddScoped<IOrderService, OrderService>();

var app = builder.Build();
app.MapGrpcService<OrderGrpcService>();
app.Run();
```

### Kestrel needs HTTP/2, and locally that means TLS

The gRPC template configures this correctly out of the box, but it's worth understanding why: gRPC requires HTTP/2, and an endpoint serving multiple protocols (`Http1AndHttp2`) can't negotiate correctly without TLS -- there's no clear-text protocol negotiation the way there is with a single-protocol setup. In production, ensure your hosting environment terminates TLS in a way that preserves HTTP/2 through to Kestrel, or configure Kestrel to handle it directly.

### The client side, sharing the same .proto file

```xml
<ItemGroup>
  <Protobuf Include="Protos\order.proto" GrpcServices="Client" />
</ItemGroup>
```

```csharp
using var channel = GrpcChannel.ForAddress("https://localhost:5001");
var client = new OrderService.OrderServiceClient(channel);

var reply = await client.GetOrderAsync(new GetOrderRequest { OrderId = 42 });
Console.WriteLine($"Order {reply.Id}: {reply.Status}");
```

Copying (or better, sharing via a common project reference) the same `.proto` file between client and server is what guarantees the contract stays in sync -- if they drift, you'll get a build-time or runtime mismatch rather than a silent bug, which is one of gRPC's real advantages over hand-maintained REST client code.

## Core Workflow

- **Change the contract first, in the .proto file, then implement.** This is the opposite order from REST, where you typically write the handler and the "contract" is whatever it happens to accept and return.
- **Use streaming RPCs for scenarios REST has no clean answer for.** Server streaming (one request, a stream of responses), client streaming (a stream of requests, one response), and bidirectional streaming are all natively supported.
- **Return `RpcException` with an appropriate `StatusCode` for errors**, the gRPC equivalent of HTTP status codes -- `NotFound`, `InvalidArgument`, `PermissionDenied`, and others map conceptually to their REST counterparts.

```protobuf
service OrderService {
  rpc StreamOrderUpdates (StreamOrderUpdatesRequest) returns (stream OrderUpdate);
}
```

```csharp
public override async Task StreamOrderUpdates(
    StreamOrderUpdatesRequest request,
    IServerStreamWriter<OrderUpdate> responseStream,
    ServerCallContext context)
{
    await foreach (var update in orderService.WatchUpdatesAsync(request.OrderId, context.CancellationToken))
    {
        await responseStream.WriteAsync(new OrderUpdate { Status = update.Status });
    }
}
```

## Verifying Your Setup

1. **The service starts and negotiates HTTP/2 correctly** -- confirm Kestrel logs show HTTP/2 being used, not a silent fallback to HTTP/1.1
2. **Client and server share an identical .proto contract** -- confirm both projects reference the same file (ideally via a shared project, not copy-pasted) to avoid drift
3. **Errors surface as proper RpcExceptions with status codes** -- confirm a not-found scenario returns `StatusCode.NotFound`, not an unhandled exception
4. **Streaming endpoints behave correctly under cancellation** -- confirm a client disconnecting mid-stream is handled gracefully server-side via `context.CancellationToken`

## Best Practices

**Treat the .proto file as the source of truth, and design it deliberately.** Changes to message fields need to consider backward compatibility (adding fields is safe; renumbering or removing them isn't) the same way a public REST contract does.

**Share the .proto file via a common project reference rather than copying it between client and server.** Copy-pasted `.proto` files drift silently over time; a shared reference makes drift a build error instead.

**Use gRPC specifically for internal service-to-service calls, not public or browser-facing APIs.** This is the single most important scoping decision -- gRPC's strengths (binary performance, strict typing) come with real costs (no native browser support, harder ad hoc exploration) that aren't worth paying for a public API REST would serve better.

**Map errors to appropriate `StatusCode` values consistently.** A consistent error-status convention across your services makes client-side error handling predictable, the same value REST's HTTP status codes provide.

**Don't reach for gRPC purely for performance if your bottleneck isn't actually serialization or network overhead.** Profile first -- for many services, the database or business logic is the actual bottleneck, and gRPC's added complexity doesn't address that.

## Comparison with GraphQL

| | gRPC | GraphQL |
| --- | --- | --- |
| Contract | Strict, `.proto`-defined, compile-time generated | Schema-defined, but clients choose fields per request |
| Transport | HTTP/2, binary Protobuf | HTTP, typically JSON |
| Best fit | High-volume internal service-to-service calls | Front ends needing flexible, nested data |
| Browser support | Requires gRPC-Web and a proxy | Native |
| Streaming | Native (client, server, bidirectional) | Possible via subscriptions, less central to the model |

They solve different problems well -- gRPC optimizes for performance and contract strictness between services you control; GraphQL optimizes for client-driven data flexibility, typically for front ends. It's common for a system to use both: gRPC internally between services, GraphQL or REST at the edge facing clients.

## Frequently Asked Questions

### Why does my gRPC service need TLS even in local development?

Kestrel endpoints serving both HTTP/1.1 and HTTP/2 can't negotiate protocols without TLS -- there's no clear-text mechanism to determine which protocol a given connection should use. The gRPC project template configures this correctly by default using the ASP.NET Core development certificate, which is why it usually works out of the box without you needing to think about it.

### Can browsers call a gRPC service directly?

No -- browsers don't expose the low-level HTTP/2 trailer support the gRPC protocol depends on. gRPC-Web is a JavaScript-compatible variant that requires an intermediary proxy (commonly Envoy) to translate between gRPC-Web and native gRPC. This is a major reason gRPC is typically used for internal service-to-service communication rather than public, browser-facing APIs.

### How do I keep my client and server contracts in sync?

Share the `.proto` file through a common project (referenced by both client and server projects) rather than copying it manually into each. This turns a contract mismatch into a build-time problem you catch immediately, rather than a runtime surprise from silently drifted definitions.

### How do I version a gRPC API as it evolves?

Protobuf is designed for backward-compatible evolution -- adding new fields with new field numbers is safe, since older clients simply ignore fields they don't recognize. Avoid reusing or renumbering existing field numbers, and avoid removing fields that older clients might still send or expect; deprecate them instead if they're no longer needed.

### Does gRPC support the equivalent of REST's GET/POST/PUT/DELETE semantics?

Not directly -- gRPC is RPC-based, so you define named methods (`GetOrder`, `ProcessOrder`) rather than mapping to HTTP verbs against resources. Error handling uses `RpcException` with a `StatusCode` conceptually similar to HTTP status codes, but the overall model is closer to calling a remote method than manipulating a resource.

### Is gRPC worth the added complexity for a small project?

Usually not, unless you specifically need high-throughput internal service communication or cross-language strongly-typed contracts. For a small project or a public-facing API, REST (via Minimal APIs or Controllers) is simpler to build, debug, and consume, without gRPC's browser limitations and tooling overhead.

### What's the most common mistake in a first gRPC setup?

Trying to use gRPC for a browser-facing API without accounting for gRPC-Web's proxy requirement, and copy-pasting `.proto` files between client and server instead of sharing them via a common reference -- both lead to friction that's avoidable by understanding gRPC's actual intended use case (internal service-to-service communication) before adopting it.
