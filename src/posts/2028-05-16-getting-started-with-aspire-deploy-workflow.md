---
author: Steve Kaschimer
date: 2028-05-16
image: /images/posts/2028-05-16-hero.webp
image_alt: "A funnel glyph narrowing from a single application model at the top into three distinct small output shapes at the bottom, implying one source model generating multiple different deployment targets."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single funnel glyph, wide at the top and narrowing downward, feeding into three small distinctly-shaped output icons arranged side by side beneath it: a cloud outline, a stacked-node cluster outline, and a simple box outline, implying one source application model generating several different deployment targets. Mood is consistent, generative, and target-agnostic. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Aspire's local development story is well covered elsewhere - less widely known is that Aspire 9.2+ ships a real deployment workflow on top of the same application model. A setup guide for aspire publish, aspire deploy, azd up, and customizing generated output from the AppHost."
tags: ["dotnet", "deployment", "aspire", "azure", "devops"]
title: "Getting Started with .NET Aspire's Deploy Workflow"
---

Aspire's local development story - the AppHost, service discovery, the dashboard - is well covered elsewhere in this series. What's less widely known is that Aspire 9.2 and later ships a genuine deployment workflow on top of that same application model: `aspire publish` and `aspire deploy` commands that generate real deployment artifacts - Docker Compose files, Kubernetes manifests, Bicep templates - from the exact same AppHost definition you've already been using for local development. This guide is about that second half, the part that gets less attention than the local dev experience but closes a real gap between "works on my machine" and "deployed to production."

This guide covers using Aspire's publish and deploy commands, bootstrapping the configuration that determines which target your application deploys to, the core workflow for both Azure (via `azd`) and other targets, and the best practices for treating Aspire's deploy tooling as what it actually is - a consistency layer, not a deployment platform of its own. By the end you'll have a deployment pipeline that stays in sync with your local development model instead of drifting from it.

If you're deciding between deployment options first, [a comparison of the top ways to deploy .NET apps](/posts/2028-04-11-top-5-dotnet-deployment-options-compared/) covers where Aspire's deploy workflow fits relative to Docker + Kubernetes, Azure Container Apps, AWS ECS/Fargate, and IIS directly.

## What You'll Need

- .NET 8 SDK or later, with Aspire 9.2 or later
- An existing Aspire AppHost project
- For Azure targets: the Azure Developer CLI (`azd`)

## Installing azd (for Azure Targets)

```bash
curl -fsSL https://aka.ms/install-azd.sh | bash  # Linux/macOS
winget install microsoft.azd  # Windows
```

## Understanding the Two Commands

`aspire publish` generates deployment artifacts (Bicep, Kubernetes manifests, Docker Compose files) from your AppHost without actually deploying anything - useful for reviewing what would be deployed, or for handing artifacts to a separate deployment pipeline. `aspire deploy` goes further, generating and actually applying those artifacts to your chosen target.

## Bootstrapping the Ideal Environment

### Deploying to Azure via azd

```bash
cd MyApp.AppHost
azd init
```

`azd init` detects your Aspire AppHost and scaffolds the necessary Azure configuration (`azure.yaml`, Bicep templates under `infra/`) automatically, based on what your AppHost defines - services, databases, and their relationships all carry over from the same model you use locally.

```bash
azd up
```

This single command provisions the necessary Azure resources (a Container Apps environment, any databases your AppHost references, networking) and deploys your services - the entire workflow from provisioning through deployment in one coherent path, which is `azd`'s specific value over assembling the same steps manually via Azure CLI.

### Reviewing generated artifacts before deploying

```bash
aspire publish --output-path ./deploy-artifacts
```

This generates the deployment manifests without applying them, letting you review exactly what would be provisioned and deployed - worth doing at least once for a new application, so you understand what Aspire's tooling is actually generating on your behalf rather than treating it as an opaque black box.

### Targeting Kubernetes instead of Azure Container Apps

```bash
aspire publish --publisher kubernetes --output-path ./k8s-manifests
```

Aspire's publisher model is extensible - Kubernetes manifests generated this way can then be applied with `kubectl` the same way any hand-written manifest would be, giving you Aspire's consistent local-to-cloud model without being tied to Azure specifically.

### Customizing the generated output for non-default scenarios

```csharp
// In your AppHost's Program.cs
var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithHttpEndpoint(port: 8080)
    .PublishAsAzureContainerApp((infra, app) =>
    {
        app.Template.Scale.MinReplicas = 1; // override default scale-to-zero behavior
    });

builder.Build().Run();
```

`PublishAsAzureContainerApp` (and equivalents for other targets) lets you customize the generated deployment configuration directly from the AppHost, keeping deployment-specific overrides in the same source-controlled model as everything else rather than hand-editing generated Bicep after the fact.

## Core Workflow

- **Use `aspire publish` to review generated artifacts before your first real deployment**, understanding what's actually being provisioned rather than trusting it blindly.
- **Use `azd up` for the full Azure provision-and-deploy workflow**, and `aspire deploy` with a different publisher for non-Azure targets.
- **Customize generated output from the AppHost itself** (via `PublishAsAzureContainerApp` and similar APIs) rather than hand-editing generated Bicep or manifests, which would drift out of sync on the next publish.

## Verifying Your Setup

1. **`azd init` correctly detects your AppHost's services and dependencies** - confirm the generated `azure.yaml` and Bicep templates reflect your actual application topology
2. **`azd up` successfully provisions and deploys** - confirm all services and their dependencies (databases, caches) come up correctly in the target environment
3. **Customizations via the AppHost persist across re-publishes** - confirm scale settings or other overrides configured in code survive a fresh `aspire publish`/`azd up` cycle
4. **Non-Azure targets generate correctly, if used** - confirm `aspire publish --publisher kubernetes` (or your chosen alternative) produces manifests that apply cleanly

## Best Practices

**Review generated artifacts with `aspire publish` before your first production deployment.** Understanding what's actually being provisioned is worth the time, rather than trusting `azd up` to do the right thing without ever inspecting its output.

**Make deployment-specific customizations in the AppHost itself**, using the publisher-specific configuration APIs, rather than hand-editing generated Bicep or Kubernetes manifests after the fact. Hand-edited output drifts out of sync the next time you publish.

**Use `azd` specifically for Azure deployments**, since it has the deepest, most first-class Aspire integration of any target. For other clouds or platforms, `aspire publish` with the appropriate publisher gives you the artifacts, but the surrounding provisioning workflow is more manual.

**Don't adopt Aspire's deploy workflow purely for its own sake if you're not already using Aspire for local development.** Its value is specifically in keeping local development and cloud deployment models consistent - if you're not using Aspire locally, there's less reason to adopt just its deployment tooling.

**Remember this is a tooling layer, not a deployment target.** You still need to understand and choose the actual target underneath - Azure Container Apps, AKS, or another Kubernetes cluster - the same operational considerations documented in this series' guides for those specific platforms still apply.

## Comparison with Manual Azure Container Apps Deployment

| | Aspire Deploy Workflow (azd) | Manual Azure Container Apps (Azure CLI) |
| --- | --- | --- |
| Source of truth | The AppHost application model | Individual Azure CLI commands or Bicep files |
| Multi-service coordination | Automatic, derived from AppHost | Manual, orchestrated yourself |
| Local/cloud consistency | High - same model for both | Requires separate maintenance of each |
| Flexibility | Extensible via publishers, but Azure-first | Full manual control |
| Best fit | Teams already using Aspire locally | Teams wanting granular, manual control |

The Aspire deploy workflow's real value is consistency between what you run locally and what gets deployed - for a single, simple service, manual Azure CLI deployment is perfectly reasonable and arguably simpler; the gap widens in Aspire's favor as service count grows.

## Frequently Asked Questions

### What's the difference between aspire publish and aspire deploy?

`aspire publish` generates deployment artifacts (Bicep, Kubernetes manifests, Docker Compose) without applying them - useful for review or handing off to a separate pipeline. `aspire deploy` (or `azd up` for Azure specifically) generates and actually applies those artifacts, completing the deployment.

### Do I need to use Azure to benefit from Aspire's deploy workflow?

No - while `azd` has the deepest, most first-class integration and is Azure-specific, Aspire's publisher model is extensible to other targets, including generating Kubernetes manifests or Docker Compose files usable with any Kubernetes cluster or Docker environment.

### How do I customize the deployment configuration Aspire generates?

Use target-specific configuration APIs directly in your AppHost's `Program.cs`, such as `PublishAsAzureContainerApp(...)` for Azure Container Apps targets, rather than hand-editing the generated Bicep or manifests afterward. Customizations made in the AppHost persist across future publishes; hand-edited generated files don't.

### Is Aspire's deploy workflow a replacement for understanding Azure Container Apps or Kubernetes?

No - it's a consistency and automation layer on top of whichever target you choose, not a replacement for understanding that target's actual operational characteristics. The concepts covered in this series' Azure Container Apps and Docker + Kubernetes guides still apply to whatever Aspire ultimately deploys to.

### Should I adopt Aspire's deploy workflow if I'm not using Aspire for local development?

Probably not as your primary motivation - its value is specifically in keeping local development and cloud deployment models consistent. If you're not already using Aspire locally, adopting it purely for deployment tooling is less compelling than a more direct deployment path to your chosen target.

### What happens if I need a deployment target Aspire doesn't have a built-in publisher for?

Aspire's publisher model is extensible, meaning custom publishers can be built for targets without first-class support. This is more involved than using an existing publisher, but it means you're not fundamentally locked out of a target just because Aspire doesn't ship default support for it.

### What's the most common mistake when using Aspire's deploy workflow?

Hand-editing generated Bicep or Kubernetes manifests directly instead of making customizations through the AppHost's configuration APIs, causing those changes to be lost or drift out of sync on the next publish. The second common mistake is treating the deploy workflow as a full deployment platform rather than understanding it's a tooling layer sitting on top of an actual target you still need to operationally understand.
