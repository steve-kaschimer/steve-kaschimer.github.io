# Getting Started with Docker + Kubernetes for .NET Deployment

Containerizing a .NET application is the easy part -- a Dockerfile, a build command, and you have an image. Running that image well in Kubernetes is where most of the real work lives, and it's also where .NET-specific details matter more than generic Kubernetes advice accounts for: how Kestrel should bind inside a pod, why graceful shutdown needs deliberate handling, and why the hosting model inside a container is actually simpler than what IIS or a VM would require, not more complex.

This guide covers containerizing a .NET application correctly, bootstrapping Kubernetes manifests with the settings that matter for .NET workloads specifically, the core deployment workflow, and the best practices that prevent the most common production issues teams hit running .NET in Kubernetes for the first time. By the end you'll have a deployment that scales correctly and shuts down cleanly.

If you're deciding between deployment options first, a comparison of the top ways to deploy .NET apps covers where Docker + Kubernetes fits relative to Azure Container Apps, AWS ECS/Fargate, .NET Aspire's deploy workflow, and IIS.

## What You'll Need

- Docker installed locally
- A Kubernetes cluster -- local (minikube, kind, Docker Desktop's built-in Kubernetes) for development, a managed offering (AKS, EKS, GKE) for production
- `kubectl` configured against your target cluster

## Containerizing Your Application

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
```

The two-stage build (SDK image for building, the smaller ASP.NET runtime image for the final container) is standard practice -- it keeps the deployed image significantly smaller than shipping the full SDK.

```bash
docker build -t myapp-api:latest .
docker run -p 8080:8080 myapp-api:latest
```

## Bootstrapping the Ideal Environment

### Configure Kestrel for the container/Kubernetes context

Inside a Kubernetes pod, your app typically only needs Kestrel bound to a non-privileged port -- no IIS, no in-process hosting complexity:

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseKestrel(options => options.ListenAnyIP(8080));
```

TLS terminates at the cluster's ingress layer, not inside your pod -- this is the simplest hosting model in this entire deployment series, genuinely less to configure than IIS out-of-process hosting requires.

### Add health check endpoints

```csharp
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy())
    .AddDbContextCheck<AppDbContext>();

var app = builder.Build();
app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready");
```

Kubernetes uses these to determine whether your pod is alive (liveness) and ready to receive traffic (readiness) -- without them, Kubernetes has no way to know your application is actually healthy versus just running.

### Write the Kubernetes deployment manifest

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp-api
  template:
    metadata:
      labels:
        app: myapp-api
    spec:
      containers:
        - name: myapp-api
          image: myregistry.azurecr.io/myapp-api:latest
          ports:
            - containerPort: 8080
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

Setting `resources.requests` and `resources.limits` explicitly is not optional in any real production deployment -- without them, a single misbehaving pod can consume disproportionate cluster resources and destabilize other workloads.

### Handle graceful shutdown

```csharp
var app = builder.Build();

var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(() =>
{
    // Allow in-flight requests to complete before the pod terminates
});

app.Run();
```

Kubernetes sends a `SIGTERM` to your pod before terminating it, and .NET's `IHostApplicationLifetime` gives you a hook to respond -- this is consistently the thing teams get wrong first in Kubernetes deployments: not configuring graceful shutdown correctly, resulting in dropped requests during rolling deploys or scale-down events.

## Core Workflow

- **Build and push images through your CI pipeline**, tagging with a meaningful version (commit SHA, semantic version) rather than only `latest`, which makes rollback and debugging much harder.
- **Apply manifests via `kubectl apply -f` or a templating tool (Helm, Kustomize)** for anything beyond a trivial single-service deployment.
- **Use rolling updates (Kubernetes' default deployment strategy) and confirm readiness probes are configured correctly**, so traffic only routes to pods that are actually ready.

```bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment/myapp-api
```

## Verifying Your Setup

1. **Health checks respond correctly** -- confirm `/health/live` and `/health/ready` return expected results, and that Kubernetes correctly reflects pod readiness
2. **Graceful shutdown actually works** -- confirm in-flight requests complete during a rolling update rather than being abruptly dropped
3. **Resource limits are appropriately sized** -- monitor actual CPU/memory usage against configured requests/limits and adjust if they're consistently under- or over-provisioned
4. **Rolling updates deploy without downtime** -- confirm a new version rolls out with zero dropped requests, assuming readiness probes and graceful shutdown are both correctly configured

## Best Practices

**Always configure both liveness and readiness probes, and understand the difference.** Liveness determines if a pod should be restarted; readiness determines if it should receive traffic -- conflating the two or omitting either is a common source of subtle production issues.

**Set resource requests and limits explicitly for every container.** This isn't optional tuning -- it's the mechanism that prevents one workload from destabilizing the rest of the cluster.

**Implement graceful shutdown deliberately, don't assume it's automatic.** This is consistently the single most commonly mishandled aspect of running .NET in Kubernetes, according to teams who've been through it.

**Use a two-stage Dockerfile to keep production images minimal.** Shipping the full SDK image in production is unnecessary bloat -- the ASP.NET runtime image is what should actually run in your cluster.

**Forward logs to centralized observability (Azure Monitor, Application Insights, or an open-source equivalent) rather than relying on `kubectl logs` for anything beyond local debugging.** Container logs are ephemeral by nature; production troubleshooting needs persistent, searchable log aggregation.

## Comparison with Azure Container Apps

| | Docker + Kubernetes | Azure Container Apps |
| --- | --- | --- |
| Operational overhead | High -- you manage the cluster | Low -- no cluster to manage |
| Control | Full -- networking, node config, advanced patterns | Limited -- no DaemonSets, no privileged containers |
| Portability | Highest -- runs on any Kubernetes distribution | Azure-specific |
| Best fit | Complex, multi-tenant, or stateful workloads | Azure-first teams wanting cloud-native without cluster ops |

Kubernetes is the right choice specifically when you need its control surface -- the same container images can migrate to Azure Container Apps or back without a rewrite, just a different orchestration layer around them.

## Frequently Asked Questions

### Do I need IIS inside my container?

No -- Kestrel bound directly to a non-privileged port (typically 8080) is the correct hosting model inside a Kubernetes pod. TLS terminates at the cluster's ingress, not inside your container, making this genuinely simpler than IIS-based hosting models.

### Why is my rolling deployment dropping requests?

The most common cause is missing or incorrectly configured graceful shutdown -- Kubernetes sends `SIGTERM` before terminating a pod, and without handling it via `IHostApplicationLifetime`, in-flight requests can be abruptly cut off. Confirm readiness probes are also configured correctly, so traffic isn't routed to a pod that isn't actually ready yet.

### What's the difference between a liveness probe and a readiness probe?

A liveness probe determines whether Kubernetes should restart a pod (it's checking "is this process still functioning"). A readiness probe determines whether the pod should receive traffic (it's checking "is this instance ready to serve requests right now"). A pod can be alive but not ready -- for instance, during startup while it's still connecting to a database.

### How do I decide resource requests and limits for a .NET container?

Start with reasonable estimates based on your application's typical memory and CPU usage, then monitor actual usage in a realistic environment and adjust. Setting limits too low causes throttling or out-of-memory kills; setting them too high wastes cluster capacity that could serve other workloads.

### Should I run Kubernetes myself or use a managed offering like AKS or EKS?

For production, a managed offering is almost always the right call -- self-hosting the Kubernetes control plane itself is a substantial additional operational burden on top of everything else in this guide. AKS, EKS, and similar managed services handle the control plane for you, leaving you to manage just your workloads.

### Can I migrate from Kubernetes to Azure Container Apps later, or vice versa?

Yes, relatively cleanly -- your container images themselves don't change, only the orchestration and deployment configuration around them. This is one of the real advantages of the container-based approach across this entire comparison: the portability exists at the image level, regardless of which orchestrator you're using.

### What's the most common mistake in a first Kubernetes deployment for .NET?

Not configuring graceful shutdown, leading to dropped requests during routine rolling deployments and scale-down events. The second most common mistake is omitting resource requests/limits entirely, which risks one misbehaving pod destabilizing the rest of the cluster.
