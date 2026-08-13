---
author: Steve Kaschimer
date: 2028-05-09
image: /images/posts/2028-05-09-hero.webp
image_alt: "A traditional server-tower glyph standing apart from any cloud or container shape, with no connecting lines to the rest of the composition, emphasizing infrastructure that lives entirely on its own."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single traditional server-tower glyph rendered as a tall rectangle with three horizontal drive-bay lines, standing deliberately apart from any cloud, container, or network shape, with no connecting lines to anything else in the frame. A small amber warning-triangle glyph sits faintly in the background, implying a missing prerequisite waiting to be discovered. Mood is established, self-contained, and slightly cautionary. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A completely correct application that returns a 500 error the moment it hits the server, because the .NET Core Hosting Bundle wasn't installed on the Windows Server itself - IIS's most common failure mode. A setup guide for out-of-process hosting, application pool configuration, and stdout logging for troubleshooting."
tags: ["dotnet", "deployment", "iis", "windows", "devops"]
title: "Getting Started with IIS for .NET Deployment"
---

IIS deployments have one failure mode that shows up more often than any other in this series: a completely correct application that returns a 500 error the moment it hits the server, because a single prerequisite - the .NET Core Hosting Bundle - wasn't installed on the Windows Server itself. It's a five-minute fix once you know to look for it, and a genuinely confusing debugging session if you don't. Getting the handful of Windows-Server-specific setup steps right up front is most of what separates a smooth IIS deployment from a frustrating one.

This guide covers deploying an ASP.NET Core application to IIS, bootstrapping the server prerequisites and application pool configuration correctly, the core out-of-process hosting model IIS uses for modern .NET, and the best practices that prevent the most common first-deployment failures. By the end you'll have a working IIS deployment and a clear understanding of what's actually happening between IIS and your application underneath it.

If you're deciding between deployment options first, [a comparison of the top ways to deploy .NET apps](/posts/2028-04-11-top-5-dotnet-deployment-options-compared/) covers where IIS fits relative to Docker + Kubernetes, Azure Container Apps, AWS ECS/Fargate, and .NET Aspire's deploy workflow.

## What You'll Need

- A Windows Server (or Windows with IIS enabled for development/testing) with IIS installed
- Administrator access to the server

## Installing Prerequisites

### Enable IIS with the necessary features

```powershell
Install-WindowsFeature -Name Web-Server, Web-Asp-Net45, Web-Net-Ext45, Web-ISAPI-Ext, Web-ISAPI-Filter
```

### Install the .NET Core Hosting Bundle - the step most commonly missed

Download and install the ASP.NET Core Hosting Bundle from Microsoft's .NET download page directly on the Windows Server. This is a separate installer from the SDK or runtime you might already have for development - it specifically registers the ASP.NET Core Module (ANCM) with IIS, which is what allows IIS to act as a reverse proxy in front of Kestrel.

```powershell
# After installing, restart IIS to ensure it picks up the new module
net stop was /y
net start w3svc
```

Skipping this step is the single most common cause of a 500 Internal Server Error immediately after a first IIS deployment - the application code is correct, but IIS has no way to actually host it without this component installed.

## Bootstrapping the Ideal Environment

### Publish your application

```bash
dotnet publish -c Release -o C:\inetpub\wwwroot\myapp
```

### Understand the out-of-process hosting model

IIS acts as a reverse proxy in front of Kestrel - your ASP.NET Core application runs as a separate process, and IIS forwards requests to it over the loopback adapter. This is the standard, recommended hosting model for modern ASP.NET Core on IIS:

```xml
<!-- web.config, generated automatically by dotnet publish -->
<configuration>
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
    </handlers>
    <aspNetCore processPath="dotnet" arguments=".\MyApp.dll" stdoutLogEnabled="false" hostingModel="outofprocess" />
  </system.webServer>
</configuration>
```

`dotnet publish` generates this `web.config` automatically - you generally shouldn't need to hand-write it, but understanding what it configures is useful for troubleshooting.

### Create the application pool and site in IIS

```powershell
Import-Module WebAdministration

New-WebAppPool -Name "MyAppPool"
Set-ItemProperty IIS:\AppPools\MyAppPool -Name managedRuntimeVersion -Value ""

New-Website -Name "MyApp" -PhysicalPath "C:\inetpub\wwwroot\myapp" -ApplicationPool "MyAppPool" -Port 80
```

Setting `managedRuntimeVersion` to an empty string is important - ASP.NET Core doesn't use the traditional .NET Framework CLR that IIS's application pools were originally designed around, so the "No Managed Code" setting is correct here.

### Enable logging for troubleshooting

```xml
<aspNetCore processPath="dotnet" arguments=".\MyApp.dll" stdoutLogEnabled="true" stdoutLogFile=".\logs\stdout" hostingModel="outofprocess" />
```

Enable `stdoutLogEnabled` temporarily during initial deployment troubleshooting - it captures startup errors that would otherwise only be visible as a generic 500 error in the browser, then disable it again once the deployment is confirmed working, since it adds overhead you don't want running continuously in production.

## Core Workflow

- **Publish a fresh build for every deployment**, and stop the application pool before overwriting files to avoid file-lock conflicts with the running process.
- **Check `stdoutLogEnabled` output first when troubleshooting a failed deployment**, before assuming the application code itself is broken - most first-deployment failures are environmental (missing Hosting Bundle, incorrect application pool settings), not code issues.
- **Use IIS's built-in request tracing and Failed Request Tracing (FREB) for deeper diagnostics** when stdout logging alone doesn't reveal the issue.

## Verifying Your Setup

1. **The Hosting Bundle is installed and IIS was restarted afterward** - confirm the ASP.NET Core Module is registered (`%windir%\System32\inetsrv\config\applicationHost.config` should reference `AspNetCoreModuleV2`)
2. **The application pool is set to "No Managed Code"** - confirm `managedRuntimeVersion` is empty for the app pool
3. **The site responds correctly** - confirm a request to the configured port returns your application's expected response, not a 500 error
4. **Stdout logging captures useful diagnostics if something's wrong** - confirm enabling it surfaces actionable startup error details rather than a generic failure

## Best Practices

**Always install the .NET Core Hosting Bundle on the Windows Server, separately from any SDK you used for development.** This is the most consistently reported first-deployment failure across ASP.NET Core + IIS setups - validate this prerequisite before assuming anything else is wrong.

**Set the application pool's `managedRuntimeVersion` to empty ("No Managed Code").** ASP.NET Core doesn't use the CLR that IIS application pools traditionally manage - this setting reflects that correctly.

**Enable stdout logging temporarily during initial troubleshooting, and disable it once the deployment is confirmed working.** It's genuinely useful for diagnosing startup failures, and genuinely unnecessary overhead to leave running indefinitely in production.

**Stop the application pool before overwriting deployed files.** Attempting to overwrite files for a running process can fail or leave the deployment in an inconsistent state - stop, deploy, restart.

**Use Windows Authentication or Active Directory integration where it's actually needed, rather than by default.** This is one of IIS's genuine strengths over cloud-native deployment options, but only worth the added configuration complexity where your application genuinely requires that integration.

## Comparison with Docker + Kubernetes

| | IIS | Docker + Kubernetes |
| --- | --- | --- |
| Platform | Windows Server only | Runs anywhere Kubernetes runs |
| Scaling | Manual - provision another server | Automatic, on-demand |
| Windows-specific integration | Deep (Active Directory, Windows Auth) | Requires additional configuration |
| Setup complexity | Lower for teams already on Windows Server | Higher, but more portable |
| Best fit | Existing Windows Server infrastructure | Cloud-native, portable deployments |

IIS remains the right choice specifically for organizations already invested in Windows Server infrastructure and needing its specific integration points - for new, cloud-native projects without that constraint, container-based options generally offer more operational flexibility.

## Frequently Asked Questions

### Why does my application return a 500 error immediately after deploying to IIS?

The most common cause by far is a missing .NET Core Hosting Bundle installation on the Windows Server - this is a separate installer from any SDK or runtime used during development, and without it, IIS has no way to actually host an ASP.NET Core application. Install it directly on the server and restart IIS.

### What's the difference between in-process and out-of-process hosting?

Out-of-process hosting (the current recommended default) runs your application as a separate process, with IIS acting as a reverse proxy forwarding requests to Kestrel over the loopback adapter. In-process hosting runs the application inside the IIS worker process itself, which can offer a modest performance benefit but is less commonly used today - `dotnet publish`'s generated `web.config` defaults to out-of-process unless configured otherwise.

### Why do I need to set managedRuntimeVersion to empty for my application pool?

ASP.NET Core doesn't use the traditional .NET Framework CLR that IIS application pools were originally built around - setting `managedRuntimeVersion` to an empty string tells IIS "No Managed Code," which is the correct setting for hosting ASP.NET Core applications through the ASP.NET Core Module.

### How do I troubleshoot a deployment that isn't working correctly?

Enable `stdoutLogEnabled` in your `web.config` temporarily - it captures startup errors and diagnostic output that would otherwise only appear as a generic 500 error in the browser. Check the resulting log file for the actual underlying error, then disable stdout logging again once the issue is resolved.

### Can I run multiple ASP.NET Core applications on the same IIS server?

Yes - create a separate application pool and site (or application under an existing site) for each, giving each application process isolation from the others. This is standard practice for hosting multiple applications on shared Windows Server infrastructure.

### Does IIS support HTTPS and modern TLS configuration?

Yes, fully - IIS has mature, well-established tooling for certificate binding and TLS configuration, including integration with tools like Let's Encrypt via community modules for automated certificate management.

### What's the most common mistake in a first IIS deployment?

Forgetting to install the .NET Core Hosting Bundle on the Windows Server, resulting in a confusing 500 error despite correct application code. The second common mistake is leaving `managedRuntimeVersion` at its default (rather than empty), which can cause IIS to attempt to load an incorrect runtime context for the application pool.
