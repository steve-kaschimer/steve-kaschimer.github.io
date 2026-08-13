---
author: Steve Kaschimer
date: 2028-06-06
image: /images/posts/2028-06-06-hero.webp
image_alt: "A padlock glyph floating inside a cloud outline with a small four-pane window accent beside it, implying a fully managed identity platform tied specifically to the Microsoft ecosystem."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single padlock glyph floating cleanly inside a soft cloud outline, with a small four-pane window accent positioned just beside the cloud's edge, implying a fully managed platform tied specifically to the Microsoft ecosystem. A faint amber under-construction diagonal stripe pattern sits subtly along the cloud's lower edge, implying a still-maturing product. Mood is managed, evolving, and ecosystem-native. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic lock clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The newest name in this track's comparison - Microsoft's current, officially recommended replacement for Azure AD B2C - which means double-checking any setup step against Microsoft's own docs before production. A setup guide for Microsoft.Identity.Web, user flows, and consumer/B2B scenarios."
tags: ["dotnet", "security", "identity", "azure", "oidc"]
title: "Getting Started with Microsoft Entra External ID for .NET"
---

Microsoft Entra External ID is genuinely the newest name in this entire series' auth comparison - Microsoft's current, officially recommended replacement for Azure AD B2C - which means the setup steps below are worth double-checking against Microsoft's own documentation before a production deployment, since this is an actively evolving product rather than a long-settled one. What's already clear is the integration path: `Microsoft.Identity.Web` remains the library ASP.NET Core applications use, the same package that's underpinned Azure AD and Azure AD B2C integration for years.

This guide covers registering an application with Microsoft Entra External ID, bootstrapping authentication in an ASP.NET Core application using `Microsoft.Identity.Web`, the core patterns for consumer and B2B scenarios, and the best practices for a product that's still actively maturing. By the end you'll have working authentication integrated with Microsoft's current recommended CIAM platform.

If you're deciding between auth/identity solutions first, [a comparison of the top auth and identity solutions for .NET](/posts/2028-05-23-top-5-auth-identity-solutions-dotnet-compared/) covers where Microsoft Entra External ID fits relative to ASP.NET Core Identity, Duende IdentityServer, Auth0, and Keycloak.

## What You'll Need

- An Azure subscription and a Microsoft Entra External ID tenant (created via the Azure portal)
- .NET 8 SDK or later
- An ASP.NET Core application

## Setting Up Your Tenant and App Registration

In the Azure portal: create a Microsoft Entra External ID tenant if you don't already have one, then register your application under **App registrations → New registration**, noting the **Application (client) ID**, **Directory (tenant) ID**, and configuring a **Redirect URI** matching your application's callback endpoint.

## Installing and Bootstrapping

```bash
dotnet add package Microsoft.Identity.Web
dotnet add package Microsoft.Identity.Web.UI
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("EntraExternalId"));

builder.Services.AddControllersWithViews()
    .AddMicrosoftIdentityUI();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
```

```json
// appsettings.json
{
  "EntraExternalId": {
    "Instance": "https://myapp.ciamlogin.com/",
    "ClientId": "<your-client-id>",
    "TenantId": "<your-tenant-id>",
    "CallbackPath": "/signin-oidc"
  }
}
```

`Microsoft.Identity.Web` handles the OIDC flow, token acquisition, and cookie management - the same library and pattern used for Azure AD and Azure AD B2C integration, extended to support Entra External ID's configuration model.

## Bootstrapping the Ideal Environment

### Protect controllers and pages

```csharp
[Authorize]
public class ProfileController : Controller
{
    public IActionResult Index() => View();
}
```

```csharp
// Or for Razor Pages
builder.Services.AddRazorPages()
    .AddMicrosoftIdentityUI();
```

### Configure user flows for sign-up and sign-in

In the Entra admin center, configure user flows defining what happens during sign-up and sign-in - which identity providers are available (local accounts, social providers), what user attributes are collected, and branding for the experience. This is conceptually similar to Auth0's dashboard-configured flows or Keycloak's realm settings, expressed through Microsoft's own admin experience.

### Handle both consumer and B2B scenarios

```csharp
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(options =>
    {
        builder.Configuration.GetSection("EntraExternalId").Bind(options);
        options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    });
```

If your application needs to serve both external customers and internal/partner organization users, review Microsoft's current guidance carefully - this is one of the scenarios where Entra External ID's broader scope over its Azure AD B2C predecessor matters, but the exact configuration pattern for unifying both flows cleanly is still an area worth checking against the latest documentation rather than assuming a settled best practice.

### Secure a Web API validating Entra External ID tokens

```bash
dotnet add package Microsoft.Identity.Web
```

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("EntraExternalId"));
```

## Core Workflow

- **Use `Microsoft.Identity.Web` consistently for both web app and API scenarios**, since it's the maintained, first-party library across Microsoft's identity platform generally, not just Entra External ID specifically.
- **Configure user flows in the admin center to define sign-up/sign-in behavior**, rather than trying to implement that logic in application code.
- **Check current Microsoft documentation before finalizing configuration**, given how actively this specific product is still evolving relative to more settled options in this comparison.

## Verifying Your Setup

1. **Sign-up and sign-in flows work correctly end to end** - confirm a new user can complete a user flow and an existing user can sign back in
2. **Redirect URIs are correctly configured for every environment** - confirm your app registration's redirect URIs match actual deployed URLs, not just localhost
3. **API token validation works correctly** - confirm `AddMicrosoftIdentityWebApi` correctly validates tokens issued for your registered application
4. **Both consumer and B2B flows work as intended, if both are in use** - confirm the specific pattern you implemented for unifying (or separating) these flows behaves as expected

## Best Practices

**Check current Microsoft documentation before a production deployment**, given this product's relative newness and continued active development. Configuration patterns and recommended approaches may have evolved since any specific guide (including this one) was written.

**Use `Microsoft.Identity.Web` rather than raw OIDC middleware.** It's Microsoft's maintained, first-party integration library specifically designed for their identity platform, handling nuances the generic middleware doesn't account for.

**Configure user flows deliberately in the admin center**, rather than trying to replicate sign-up/sign-in logic in application code - this is the intended configuration surface for that behavior.

**If migrating from Azure AD B2C, follow Microsoft's official migration guidance closely**, since this is a real, documented migration path (not a from-scratch reimplementation), including specific guidance on password migration strategies.

**Evaluate whether your organization's existing Azure/Microsoft investment justifies this choice over a more platform-neutral option like Auth0.** Entra External ID's strongest case is specifically for teams already operating in that ecosystem.

## Comparison with Auth0

| | Microsoft Entra External ID | Auth0 |
| --- | --- | --- |
| Ecosystem fit | Deepest for Microsoft/Azure-invested teams | Vendor-neutral, broad cross-platform support |
| Product maturity | Newer, actively evolving | More established, longer track record |
| B2B + consumer in one product | Native support | Requires more configuration |
| .NET integration library | Microsoft.Identity.Web (first-party) | Auth0.AspNetCore.Authentication (Auth0-maintained) |
| Pricing model | Usage-based, scales with MAUs | Usage-based, scales with MAUs |

Both are managed platforms with a comparable zero-operational-burden proposition - Entra External ID's advantage is deep Microsoft ecosystem integration and native B2B support; Auth0's advantage is a longer track record and platform neutrality if you're not committed to Azure specifically.

## Frequently Asked Questions

### Should I use Microsoft Entra External ID or Azure AD B2C for a new project?

Microsoft Entra External ID - it's the officially recommended CIAM platform for new ASP.NET Core applications per Microsoft's current documentation. Azure AD B2C remains supported for existing applications, but isn't the recommended starting point for new ones.

### What library should I use to integrate Entra External ID with ASP.NET Core?

`Microsoft.Identity.Web` (and `Microsoft.Identity.Web.UI` for web applications with a UI) - this is Microsoft's first-party, maintained integration library used across their identity platform generally, not just for Entra External ID specifically.

### Can Entra External ID support both external customers and internal employees in one application?

Yes, this is one of its genuine advantages over Azure AD B2C - native support for both consumer authentication and B2B collaboration. The exact configuration pattern for unifying both flows cleanly in a single application is worth checking against Microsoft's current documentation, since specific guidance in this area continues to evolve.

### How do I migrate an existing Azure AD B2C application to Entra External ID?

Microsoft provides official migration guidance covering the process, including specific strategies for migrating user accounts and passwords - follow that documented path rather than attempting a from-scratch reimplementation, since it's designed as a genuine migration process, not a rewrite.

### Is Microsoft Entra External ID mature enough for production use?

It's Microsoft's actively recommended, supported platform for new applications, but it's genuinely newer than Azure AD B2C with a correspondingly smaller body of community examples and battle-tested patterns. Check current Microsoft documentation closely for any scenario beyond straightforward sign-up/sign-in, since guidance in more complex areas continues to be refined.

### How do I configure sign-up and sign-in behavior?

Through user flows configured in the Entra admin center - defining available identity providers, collected user attributes, and UI branding - rather than implementing this logic directly in your application code. This is the intended configuration surface, similar in spirit to Auth0's dashboard-based flow configuration.

### What's the most common mistake in a first Entra External ID setup?

Following outdated guidance, given how actively this specific product is evolving relative to more settled options in this comparison - confirm any configuration pattern against current Microsoft documentation rather than an older tutorial. The second common mistake is not carefully planning the consumer/B2B unification pattern upfront if an application needs to serve both user types, since that specific configuration is more nuanced than a pure consumer-only or pure B2B-only setup.
