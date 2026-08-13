---
author: Steve Kaschimer
date: 2028-06-27
image: /images/posts/2028-06-27-hero.webp
image_alt: "A padlock glyph floating cleanly inside a plain cloud outline with no additional accents, implying a fully managed, vendor-neutral identity platform reachable in minutes."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single padlock glyph floating cleanly inside a soft, plain cloud outline with no additional accents or attachments, implying a fully managed, vendor-neutral platform reachable quickly with minimal setup. A small stopwatch glyph sits faintly beneath the cloud, implying speed to a working result. Mood is fast, polished, and turnkey. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic lock clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The value proposition shows up in the first ten minutes - register an application, install one SDK package, working login without hand-writing an OAuth flow. A setup guide for web app vs. API integration patterns, namespaced custom claims, and clearing both local and vendor sessions on logout."
tags: ["dotnet", "security", "identity", "oidc", "tooling"]
title: "Getting Started with Auth0 for .NET"
---

Auth0's whole value proposition shows up in the first ten minutes - register an application in the dashboard, install one SDK package, and you have working login, without writing an OAuth flow by hand or standing up any infrastructure. The setup work that actually matters happens after that quick win: configuring token validation correctly for your API, deciding how roles and permissions map to Auth0's model, and understanding what you're paying for as your user base grows.

This guide covers registering an application with Auth0, bootstrapping authentication in an ASP.NET Core app and API, the core patterns for roles and permissions, and the best practices for using a managed platform well rather than fighting its opinions. By the end you'll have working authentication with minimal infrastructure, and a clear sense of how Auth0's pricing scales as you grow.

If you're deciding between auth/identity solutions first, [a comparison of the top auth and identity solutions for .NET](/posts/2028-05-23-top-5-auth-identity-solutions-dotnet-compared/) covers where Auth0 fits relative to ASP.NET Core Identity, Duende IdentityServer, Keycloak, and Microsoft Entra External ID.

## What You'll Need

- An Auth0 account and tenant
- .NET 8 SDK or later
- An ASP.NET Core application (MVC, Razor Pages, or an API)

## Registering Your Application

In the Auth0 dashboard: **Applications → Create Application**, choosing "Regular Web Application" for a server-rendered app or "Machine to Machine"/"API" for a backend service. Note the **Domain**, **Client ID**, and **Client Secret** - these are what your application uses to talk to Auth0.

## Installing and Bootstrapping

### For an ASP.NET Core web application

```bash
dotnet add package Auth0.AspNetCore.Authentication
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuth0WebAppAuthentication(options =>
{
    options.Domain = builder.Configuration["Auth0:Domain"]!;
    options.ClientId = builder.Configuration["Auth0:ClientId"]!;
});

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
```

```csharp
[Authorize]
public class ProfileController : Controller
{
    public IActionResult Index() => View();
}
```

Configuring the domain and client ID is genuinely most of what's required - the SDK handles the OIDC flow, token validation, and cookie management for you.

### For an ASP.NET Core Web API validating Auth0-issued tokens

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{builder.Configuration["Auth0:Domain"]}/";
        options.Audience = builder.Configuration["Auth0:Audience"];
    });
```

`Audience` must match the API identifier you configured for this API in the Auth0 dashboard (**Applications → APIs**) - a mismatch here is a common source of "token is valid but access is denied" confusion, since the token was issued correctly but for a different intended audience.

## Bootstrapping the Ideal Environment

### Configure login/logout URLs correctly

```csharp
builder.Services.AddAuth0WebAppAuthentication(options =>
{
    options.Domain = builder.Configuration["Auth0:Domain"]!;
    options.ClientId = builder.Configuration["Auth0:ClientId"]!;
});
```

In the Auth0 dashboard, configure **Allowed Callback URLs** and **Allowed Logout URLs** to match your application's actual URLs exactly - a mismatch here is the most common cause of a login flow that appears to work but fails at the redirect step.

### Add roles and permissions

In the Auth0 dashboard: **User Management → Roles**, define roles and assign permissions, then attach roles to users. Configure your API's Auth0 settings to include roles as a custom claim in issued tokens (via an Auth0 Action or Rule), since roles aren't included in a token by default without explicit configuration.

```csharp
[Authorize(Policy = "AdminOnly")]
public class AdminController : Controller { }
```

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("https://myapp.com/roles", "admin"));
});
```

Auth0 recommends namespacing custom claims with a URL-like prefix (`https://myapp.com/roles`) to avoid collisions with standard OIDC claims - worth following this convention rather than using a bare claim name.

### Handle logout correctly

```csharp
[HttpGet("/logout")]
public async Task Logout()
{
    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    await HttpContext.SignOutAsync(Auth0Constants.AuthenticationScheme);
}
```

Logout needs to clear both your application's local cookie session and Auth0's own session - signing out of only one leaves the user in a confusing partially-logged-out state.

## Core Workflow

- **Use the Auth0.AspNetCore.Authentication SDK for web applications, JWT Bearer authentication for APIs** - these are two different integration patterns for two different application types, don't conflate them.
- **Configure custom claims (roles, permissions) via Auth0 Actions**, since they're not included in issued tokens by default.
- **Test callback and logout URLs against your actual deployed URLs**, not just localhost, before considering a deployment complete - these need explicit configuration per environment.

## Verifying Your Setup

1. **Login and logout flows work end to end** - confirm a user can log in, access a protected resource, and log out cleanly with both local and Auth0 sessions cleared
2. **API token validation works correctly** - confirm `Audience` matches your configured API identifier and tokens are correctly validated
3. **Custom claims (roles) appear in issued tokens** - confirm your Auth0 Action correctly adds role claims, and your authorization policies correctly evaluate them
4. **Callback and logout URLs are correctly configured for every environment** - confirm production URLs are added to Auth0's allowed lists, not just development ones

## Best Practices

**Configure Allowed Callback URLs and Allowed Logout URLs precisely, for every environment.** A mismatch here is the most common cause of a login flow that seems configured correctly but fails at the redirect step.

**Namespace custom claims to avoid collisions with standard OIDC claims.** Auth0's recommended URL-like prefix convention (`https://myapp.com/roles`) is worth following consistently.

**Clear both the local application session and the Auth0 session on logout.** Signing out of only one leaves users in a confusing, partially-authenticated state.

**Monitor your monthly active user count against Auth0's pricing tiers.** Usage-based pricing means cost scales with your application's success - know where you sit relative to tier boundaries rather than being surprised by a bill.

**Use Auth0 Actions for anything that needs to modify tokens or enforce additional logic during authentication**, rather than trying to replicate that logic in your application after the fact.

## Comparison with Microsoft Entra External ID

| | Auth0 | Microsoft Entra External ID |
| --- | --- | --- |
| Ecosystem fit | Vendor-neutral, broad cross-platform support | Deepest for Microsoft/Azure-invested teams |
| Developer experience | Widely regarded as best-in-class documentation | Strong, improving, newer product |
| B2B + consumer in one product | Requires more configuration | Native support for both |
| Pricing model | Usage-based, scales with MAUs | Usage-based, scales with MAUs |

Both are managed platforms with a comparable zero-operational-burden value proposition - the choice largely comes down to whether your organization is already invested in Azure specifically, or values Auth0's cross-platform neutrality and documentation quality.

## Frequently Asked Questions

### Why does my API return "unauthorized" even though the token looks valid?

The most common cause is an `Audience` mismatch - your API's JWT Bearer configuration needs to match the API identifier configured in Auth0's dashboard exactly. A token issued for a different audience will fail validation even if it's otherwise correctly signed and unexpired.

### How do I add custom claims like roles to Auth0-issued tokens?

Use an Auth0 Action (configured in the dashboard under **Actions → Flows → Login**) to add custom claims during the login flow - roles and permissions aren't included in issued tokens by default without this explicit configuration step.

### Why does my login redirect fail even though my Client ID and Domain are correct?

Check your Allowed Callback URLs in the Auth0 dashboard - they need to match your application's actual redirect URL exactly, for every environment (development, staging, production) you're testing against. This is the most common cause of an otherwise-correctly-configured login flow failing at the final redirect step.

### How do I properly log a user out of both my application and Auth0?

Call `SignOutAsync` for both your application's local cookie authentication scheme and the Auth0 authentication scheme - clearing only one leaves the user in a confusing state where they appear logged out locally but Auth0 still considers them authenticated (or vice versa).

### Is Auth0 expensive at scale?

It's usage-based, scaling with monthly active users - cost grows as your application succeeds, which is different from a self-hosted option's fixed infrastructure cost. Monitor your usage against Auth0's pricing tiers so growth in users translates to an expected, not surprising, cost increase.

### Can I use Auth0 for both a web application and its backing API?

Yes - use the `Auth0.AspNetCore.Authentication` SDK for the web application's login flow (cookie-based session), and JWT Bearer authentication configured with your API's audience for the API itself, which validates the access tokens the web application (or other clients) send with requests.

### What's the most common mistake in a first Auth0 setup?

Misconfigured Allowed Callback/Logout URLs, causing a login or logout flow that appears correctly set up to fail at the redirect step. The second common mistake is not configuring an Auth0 Action to include custom claims like roles, leading to confusing "the user is authenticated but my authorization policy still rejects them" issues.
