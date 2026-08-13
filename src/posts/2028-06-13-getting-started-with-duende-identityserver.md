---
author: Steve Kaschimer
date: 2028-06-13
image: /images/posts/2028-06-13-hero.webp
image_alt: "A padlock glyph connected by a thin line to a small building-shaped server icon, implying a self-hosted framework built around rather than a turnkey product."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single padlock glyph connected by a thin line to a small building-shaped server icon, implying a self-hosted framework you construct around rather than a turnkey product. A small amber price-tag glyph sits faintly near the connecting line's midpoint, implying a licensing decision that must be resolved early. Mood is deliberate, framework-first, and cost-conscious. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic lock clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The first real decision happens before writing any code: is the organization under the community edition's revenue threshold, or does it need a commercial license? A setup guide for clients and scopes, pairing with ASP.NET Core Identity, and the UI work Duende doesn't ship turnkey."
tags: ["dotnet", "security", "identity", "oidc", "architecture"]
title: "Getting Started with Duende IdentityServer"
---

Duende IdentityServer's first real decision happens before you write any code: are you actually under the community edition's revenue threshold, or does your organization need a commercial license? That question genuinely determines whether this is the right tool at all, and it's worth resolving explicitly rather than building an identity provider around a licensing assumption you haven't confirmed. Once that's settled, Duende asks you to build more than most teams expect - it's a protocol framework, not a turnkey identity server, and the UI, user store, and admin tooling are all yours to supply.

This guide covers installing Duende IdentityServer, bootstrapping clients, scopes, and a user store correctly, the core OIDC/OAuth flows you'll actually implement, and the best practices for building the scaffolding Duende deliberately doesn't provide. By the end you'll have a working identity provider and a realistic sense of the ongoing ownership that comes with it.

If you're deciding between auth/identity solutions first, [a comparison of the top auth and identity solutions for .NET](/posts/2028-05-23-top-5-auth-identity-solutions-dotnet-compared/) covers where Duende IdentityServer fits relative to ASP.NET Core Identity, Auth0, Keycloak, and Microsoft Entra External ID.

## What You'll Need

- .NET 8 SDK or later
- A resolved answer on licensing - confirm whether your organization qualifies for the community edition or needs a commercial license, before investing significant engineering time
- A database for configuration and operational data (SQL Server via EF Core is well-supported)

## Installing Duende IdentityServer

```bash
dotnet new install Duende.IdentityServer.Templates
dotnet new isaspid -n MyApp.IdentityServer
cd MyApp.IdentityServer
```

This scaffolds a host project with a starting configuration - clients, resources, and a basic UI you're expected to customize significantly, not use as-is in production.

## Bootstrapping the Ideal Environment

### Define clients and scopes

```csharp
// Config.cs
public static class Config
{
    public static IEnumerable<Client> Clients =>
        new[]
        {
            new Client
            {
                ClientId = "myapp-web",
                ClientSecrets = { new Secret("secret".Sha256()) },
                AllowedGrantTypes = GrantTypes.Code,
                RedirectUris = { "https://localhost:5002/signin-oidc" },
                AllowedScopes = { "openid", "profile", "myapp.api" }
            }
        };

    public static IEnumerable<ApiScope> ApiScopes =>
        new[] { new ApiScope("myapp.api", "My App API") };

    public static IEnumerable<IdentityResource> IdentityResources =>
        new IdentityResource[]
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile()
        };
}
```

Clients and scopes are the core of Duende's configuration model - each client represents an application that can request tokens, and scopes define what those tokens grant access to. Get comfortable with this vocabulary before configuring anything real, since it's the foundation everything else builds on.

### Register Duende with EF Core-backed configuration storage

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddIdentityServer()
    .AddConfigurationStore(options =>
    {
        options.ConfigureDbContext = b => b.UseSqlServer(connectionString);
    })
    .AddOperationalStore(options =>
    {
        options.ConfigureDbContext = b => b.UseSqlServer(connectionString);
    })
    .AddAspNetIdentity<IdentityUser>(); // pairing with ASP.NET Core Identity for the user store
```

Pairing Duende with ASP.NET Core Identity for the actual user store is the common, well-supported pattern - Duende handles the OIDC/OAuth protocol layer, Identity handles user accounts, password hashing, and account management underneath it.

### Build the login and consent UI

Duende's templates include a starting UI, but production use requires real customization - registration flows, password reset, MFA prompts, and consent screens are all things you build, not things Duende ships turnkey. Budget real time for this; it's a common source of underestimated setup effort.

### Configure token lifetimes deliberately

```csharp
new Client
{
    ClientId = "myapp-web",
    AccessTokenLifetime = 3600, // 1 hour
    IdentityTokenLifetime = 300, // 5 minutes
    RefreshTokenUsage = TokenUsage.ReUse,
    AbsoluteRefreshTokenLifetime = 2592000 // 30 days
}
```

Default token lifetimes are reasonable starting points, but review them against your application's actual security requirements - shorter-lived access tokens with refresh tokens is a common, more secure pattern than long-lived access tokens alone.

## Core Workflow

- **Model your applications as clients and your APIs as scopes**, the foundational configuration every Duende deployment builds from.
- **Pair Duende with ASP.NET Core Identity (or another user store) for actual user management**, since Duende itself doesn't provide one.
- **Build and thoroughly test your consent and login UI** before considering the deployment production-ready - this is real, non-trivial engineering work, not a configuration step.

## Verifying Your Setup

1. **Clients can successfully complete the authorization code flow** - confirm a test client redirects, authenticates, and receives valid tokens
2. **Scopes correctly restrict access** - confirm an access token only grants access to the scopes it was actually issued for
3. **Token lifetimes match your configured values** - confirm issued tokens expire and refresh according to your actual configuration, not defaults you didn't review
4. **The user store (Identity or otherwise) integrates correctly** - confirm user authentication genuinely flows through to token issuance

## Best Practices

**Confirm your licensing situation before investing significant engineering time.** This isn't a detail to resolve later - know whether you're within the community edition's threshold or need a commercial license before building meaningful architecture around Duende.

**Budget real time for the UI and supporting flows Duende doesn't provide.** Login, registration, consent, password reset - none of this is turnkey, and underestimating this work is a common cause of Duende implementations running over schedule.

**Pair with ASP.NET Core Identity for user storage rather than building your own from scratch**, unless you have a specific reason not to. This is the well-trodden, well-supported combination most Duende deployments use.

**Review token lifetimes and refresh token policies deliberately.** Defaults are reasonable but generic - your application's actual security posture should drive these values, not an unreviewed template default.

**Seriously evaluate OpenIddict or Keycloak before committing to a commercial Duende license**, if cost is a real factor. Both solve a similar problem without Duende's licensing cost, and the community's assessment is that a paid Duende license needs specific technical justification beyond just "we want to stay in .NET."

## Comparison with Keycloak

| | Duende IdentityServer | Keycloak |
| --- | --- | --- |
| Language/stack | .NET-native | Java-based backend |
| Cost | Free under a revenue threshold, commercial above it | Free, no licensing cliff |
| Turnkey UI/admin tooling | No - you build it | Yes - includes admin console and UI out of the box |
| Enterprise features (SAML, LDAP) | Requires custom work or extensions | Built in |
| .NET integration | Deepest, native ASP.NET Core | Standard OIDC/OAuth, works via middleware regardless of language |

If cost is the deciding factor and you don't have specific technical requirements only Duende meets, Keycloak's free, more turnkey feature set is worth serious comparison before committing to a commercial Duende license.

## Frequently Asked Questions

### Do I need to pay for Duende IdentityServer?

Not necessarily - a community edition exists for organizations under a specified revenue threshold. Organizations above that threshold need a commercial license for production use. Confirm which category applies to you before building significant architecture around Duende.

### Does Duende IdentityServer include a login page and user registration out of the box?

The project templates include a starting UI, but it's meant to be customized substantially, not used as-is in production. Registration flows, password reset, MFA, and consent screens are all things you build and own, not turnkey features Duende ships complete.

### What's the difference between a client and a scope in Duende?

A client represents an application requesting tokens (your web app, a mobile app, another service). A scope represents what a token grants access to (an API, specific claims). Configuring Duende means defining both - which applications can request tokens, and what those tokens actually authorize.

### Should I use ASP.NET Core Identity alongside Duende IdentityServer?

Yes, typically - this is the standard, well-supported pairing. Duende handles the OIDC/OAuth protocol layer (issuing and validating tokens, managing clients and scopes), while ASP.NET Core Identity handles the actual user store (accounts, password hashing, roles) underneath it.

### How do I decide on appropriate token lifetimes?

Balance security against user experience - shorter access token lifetimes with refresh tokens (reused or rotated) are generally more secure than long-lived access tokens, at the cost of more frequent token refresh overhead. Review Duende's default `Client` configuration values against your application's actual security requirements rather than accepting them unreviewed.

### Is Duende IdentityServer harder to set up than a managed service like Auth0?

Yes, meaningfully - Duende is a framework requiring you to understand OAuth flows, token types, and OIDC specifications, and to build the surrounding UI and user management flows yourself. Auth0 and similar managed platforms handle all of this for you, at the cost of usage-based pricing and less control over the implementation.

### What's the most common mistake in a first Duende IdentityServer setup?

Not confirming licensing status before investing significant engineering time, only to discover a commercial license is required partway through. The second common mistake is underestimating the UI and supporting-flow work Duende doesn't provide out of the box, leading to a much larger implementation effort than initially planned.
