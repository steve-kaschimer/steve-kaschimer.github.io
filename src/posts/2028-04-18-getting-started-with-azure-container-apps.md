---
author: Steve Kaschimer
date: 2028-04-18
image: /images/posts/2028-04-18-hero.webp
image_alt: "A light container glyph fading gently at its edges against the dark background, implying a workload that scales down to nothing when idle rather than a container that's always running."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single container glyph rendered as a simple rounded rectangle outline, its edges deliberately fading into the background at the top and bottom corners, implying a workload that scales down to zero when idle rather than something permanently running. A small amber dot sits just outside the container's edge, isolated, implying a referenced secret rather than an embedded value. Mood is serverless, elastic, and quietly efficient. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic cloud clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Azure Container Apps' pitch is containerized deployment without ever touching a Kubernetes manifest - the part worth understanding upfront is where that simplicity has real edges. A setup guide for scale-to-zero, KEDA-backed autoscaling rules, and secretref: configuration."
tags: ["dotnet", "deployment", "azure", "containers", "devops"]
title: "Getting Started with Azure Container Apps for .NET Deployment"
---

Azure Container Apps' whole pitch is that you get containerized, cloud-native deployment without ever touching a Kubernetes manifest or provisioning a cluster - and for a genuinely large share of .NET applications, that trade is exactly right. The part worth understanding before committing is where its simplicity has real edges: no DaemonSets, no privileged containers, no GPU node selection. Knowing those limits upfront means you're choosing ACA deliberately, not discovering its ceiling mid-project.

This guide covers deploying a .NET application to Azure Container Apps, bootstrapping scaling and configuration correctly, the core deployment workflow via the Azure CLI or `azd`, and the best practices that take advantage of what ACA does well without running into its known limitations unexpectedly. By the end you'll have a serverless container deployment that scales automatically, including down to zero for idle workloads.

If you're deciding between deployment options first, [a comparison of the top ways to deploy .NET apps](/posts/2028-04-11-top-5-dotnet-deployment-options-compared/) covers where Azure Container Apps fits relative to Docker + Kubernetes, AWS ECS/Fargate, .NET Aspire's deploy workflow, and IIS.

## What You'll Need

- An Azure subscription
- Azure CLI installed, or the Azure Developer CLI (`azd`) for a more opinionated, integrated workflow
- A containerized .NET application (see this series' [Docker + Kubernetes guide](/posts/2028-05-02-getting-started-with-docker-kubernetes-dotnet/) for containerization basics)

## Installing the Tooling

```bash
# Azure CLI
curl -L https://aka.ms/InstallAzureCLIDeb | sudo bash  # Linux example; see docs for macOS/Windows

az login
az extension add --name containerapp
```

## Deploying to Azure Container Apps

### Create the environment and container app

```bash
az group create --name myapp-rg --location eastus

az containerapp env create \
  --name myapp-env \
  --resource-group myapp-rg \
  --location eastus

az containerapp create \
  --name myapp-api \
  --resource-group myapp-rg \
  --environment myapp-env \
  --image myregistry.azurecr.io/myapp-api:latest \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 10
```

`--min-replicas 0` is what enables scale-to-zero - genuinely idle services cost nothing in compute, a real advantage over always-on options for workloads with variable or low traffic.

## Bootstrapping the Ideal Environment

### Configure autoscaling rules

```bash
az containerapp update \
  --name myapp-api \
  --resource-group myapp-rg \
  --scale-rule-name http-scaling \
  --scale-rule-type http \
  --scale-rule-http-concurrency 50
```

This scales based on concurrent HTTP requests per replica - ACA also supports scaling rules based on CPU, memory, or custom metrics (via KEDA under the hood), letting you match scaling behavior to your actual workload characteristics.

### Configure secrets and environment variables

```bash
az containerapp secret set \
  --name myapp-api \
  --resource-group myapp-rg \
  --secrets "db-connection-string=Server=...;"

az containerapp update \
  --name myapp-api \
  --resource-group myapp-rg \
  --set-env-vars "ConnectionStrings__Default=secretref:db-connection-string"
```

Referencing secrets rather than embedding connection strings directly in environment variables keeps sensitive configuration out of plain-text app settings - worth doing from the start rather than retrofitting later.

### Set up health probes

```csharp
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy());

var app = builder.Build();
app.MapHealthChecks("/health");
```

```bash
az containerapp update \
  --name myapp-api \
  --resource-group myapp-rg \
  --readiness-probe-path /health \
  --liveness-probe-path /health
```

The same health check concepts from Kubernetes apply here - ACA uses them to determine whether a replica is ready for traffic and whether it needs to be restarted.

### Deploying via azd for a more integrated workflow

```bash
azd init
azd up
```

`azd` handles provisioning the resource group, container registry, and Container App environment together, and has particularly strong support for .NET Aspire-based applications if you're using Aspire for local development - worth using over raw Azure CLI commands once your setup involves more than a single service.

## Core Workflow

- **Deploy new revisions rather than modifying a running one in place.** ACA's revision model lets you roll out a new version, verify it, and shift traffic gradually - or roll back instantly if something's wrong.
- **Configure scaling rules matched to your actual traffic pattern**, not a one-size-fits-all default - HTTP concurrency, CPU, and custom metrics are all available depending on what actually drives your workload's load.
- **Use `azd` for multi-service or Aspire-based applications**, and raw Azure CLI or Bicep for simpler, single-service scenarios where the extra tooling isn't needed.

## Verifying Your Setup

1. **The application scales to zero when idle, and back up under load** - confirm this behavior matches your `--min-replicas`/`--max-replicas` configuration
2. **Secrets are referenced, not embedded directly** - confirm sensitive configuration uses `secretref:` rather than plain environment variable values
3. **Health probes correctly reflect application state** - confirm ACA restarts or avoids routing traffic to unhealthy replicas appropriately
4. **Revisions roll out and can be rolled back** - confirm a new deployment creates a new revision, and that reverting to a previous one works cleanly

## Best Practices

**Understand ACA's real limitations before committing to it for a complex workload.** No DaemonSets, no privileged containers, limited networking control - if your requirements need these, Kubernetes (AKS) is the more honest choice, not something to discover mid-project.

**Use scale-to-zero deliberately for genuinely variable or low-traffic services.** It's a real cost advantage, but confirm your application's cold-start time is acceptable for your use case, since scaling from zero isn't instantaneous.

**Reference secrets rather than embedding sensitive values directly in environment variables.** This is a small amount of extra setup for a meaningful security improvement.

**Use `azd` for anything beyond a single simple service, especially Aspire-based applications.** It meaningfully reduces the amount of manual Azure CLI orchestration needed for multi-resource deployments.

**Know the migration path to AKS exists, and don't treat ACA as a permanent ceiling.** If you outgrow ACA's limitations, your container images carry over directly - only the orchestration layer changes.

## Comparison with AWS ECS/Fargate

| | Azure Container Apps | AWS ECS/Fargate |
| --- | --- | --- |
| Cloud | Azure | AWS |
| Scale-to-zero | Yes, natively | Requires more manual configuration |
| .NET-specific tooling | Deep, especially via Aspire/azd | Solid, less .NET-centric |
| Ecosystem integration | Azure Monitor, Key Vault, Application Insights | CloudWatch, Secrets Manager, IAM |
| Best fit | Azure-first teams | AWS-first teams |

Both offer a comparable serverless-container value proposition - the deciding factor is almost always which cloud ecosystem the rest of your infrastructure and team expertise are already built around, not a meaningful capability gap between them.

## Frequently Asked Questions

### Does Azure Container Apps support scaling to zero?

Yes - setting `--min-replicas 0` allows a genuinely idle service to scale down to zero running instances, meaning no compute cost while there's no traffic. Confirm your application's cold-start time from zero is acceptable for your use case, since there's a real latency cost to the first request after scaling up from zero.

### What can't Azure Container Apps do that Kubernetes (AKS) can?

No DaemonSets, no privileged containers, no GPU node pool selection, and less granular networking control (no custom ingress controllers or advanced network policies). These are real, deliberate limitations of ACA's simpler, serverless model - if your workload needs any of them, AKS is the more appropriate choice.

### How do I keep sensitive configuration like connection strings secure in Azure Container Apps?

Use `az containerapp secret set` to store sensitive values as secrets, then reference them in environment variables via `secretref:secret-name` rather than embedding the actual value directly. This keeps secrets out of plain-text app configuration.

### What's the difference between using raw Azure CLI commands and azd?

Raw Azure CLI commands give you granular, step-by-step control over each resource. `azd` (Azure Developer CLI) provides a more integrated, opinionated workflow that provisions multiple related resources together, with particularly strong support for .NET Aspire applications - worth using once your deployment involves more than a single simple service.

### How does autoscaling work in Azure Container Apps?

Via configurable scaling rules based on HTTP concurrency, CPU/memory usage, or custom metrics (powered by KEDA underneath), each with a minimum and maximum replica count you define. Match the scaling rule type to what actually drives load in your specific application rather than defaulting to one without considering your traffic pattern.

### Can I migrate from Azure Container Apps to AKS later if I outgrow it?

Yes, and the migration path is well-defined - your container images don't change, only the orchestration and deployment configuration around them. This is a real, practical advantage of choosing a container-based deployment strategy from the start, regardless of which specific platform you begin with.

### What's the most common mistake when adopting Azure Container Apps?

Not understanding its real limitations (no DaemonSets, limited networking control, primarily stateless workloads) before committing, and discovering them mid-project rather than as an informed, upfront decision. The second common mistake is embedding secrets directly in environment variables instead of using ACA's secret reference mechanism.
