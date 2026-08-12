# Getting Started with Keycloak for .NET

Keycloak's free, standards-compliant OIDC implementation means the .NET integration side is genuinely simple -- any OAuth2/OIDC-compliant provider works with the same `Microsoft.AspNetCore.Authentication.OpenIdConnect` middleware, so from ASP.NET Core's perspective, Keycloak looks like any other identity provider you point configuration at. The real work in a Keycloak setup lives on the other side: realms, clients, and the fact that you're now operating a Java-based service as part of your infrastructure, regardless of how comfortably .NET talks to it.

This guide covers installing and running Keycloak, bootstrapping a realm and client for a .NET application, the core OIDC integration pattern in ASP.NET Core, and the best practices for operating Keycloak well as infrastructure your team owns. By the end you'll have a free, production-capable identity provider integrated cleanly with .NET.

If you're deciding between auth/identity solutions first, a comparison of the top auth and identity solutions for .NET covers where Keycloak fits relative to ASP.NET Core Identity, Duende IdentityServer, Auth0, and Microsoft Entra External ID.

## What You'll Need

- Docker, for running Keycloak locally or as a starting point for production deployment
- .NET 8 SDK or later
- Real infrastructure and operational capacity if deploying to production -- Keycloak is self-hosted

## Installing and Running Keycloak

```bash
docker run -d --name keycloak -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

`start-dev` runs Keycloak in development mode -- convenient for local setup, but not the configuration you'd run in production, which needs a proper database, TLS, and hardened settings.

## Bootstrapping the Ideal Environment

### Create a realm

In the Keycloak admin console (`http://localhost:8080`): **Create Realm**, naming it for your application or organization. A realm is Keycloak's top-level isolation boundary -- users, clients, and roles all live within a specific realm, and realms don't share data with each other by default.

### Create a client for your .NET application

**Clients → Create client**, with:

- **Client type**: OpenID Connect
- **Client authentication**: On (for a confidential client like a server-rendered web app)
- **Valid redirect URIs**: `https://localhost:5001/signin-oidc`

Note the generated **Client Secret** under the Credentials tab -- your .NET application uses this alongside the Client ID to authenticate to Keycloak.

### Integrate with ASP.NET Core via standard OIDC middleware

```bash
dotnet add package Microsoft.AspNetCore.Authentication.OpenIdConnect
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie()
.AddOpenIdConnect(options =>
{
    options.Authority = "http://localhost:8080/realms/myapp-realm";
    options.ClientId = "myapp-web";
    options.ClientSecret = builder.Configuration["Keycloak:ClientSecret"];
    options.ResponseType = "code";
    options.SaveTokens = true;
});
```

This is exactly the standard `Microsoft.AspNetCore.Authentication.OpenIdConnect` middleware, pointed at Keycloak's realm-specific issuer URL -- there's no Keycloak-specific SDK required, since it's a fully standards-compliant OIDC provider and the generic middleware handles the protocol correctly.

### Configure roles and map them to claims

**Realm roles → Create role**, then assign roles to users under **Users → [user] → Role mapping**. To include roles as claims in the issued token, configure a client scope mapper under **Client scopes → roles → Mappers**.

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("realm_access.roles", "admin")); // exact claim structure depends on mapper config
});
```

Keycloak nests realm roles under a `realm_access` claim by default rather than a flat role claim -- worth confirming the actual token structure (via a tool like jwt.io during development) before writing authorization policies against assumed claim shapes.

## Core Workflow

- **Use realms to isolate different applications or environments**, rather than putting everything in Keycloak's default realm.
- **Use standard ASP.NET Core OIDC middleware, not a Keycloak-specific package**, since Keycloak's standards compliance means the generic middleware works correctly without special handling.
- **Confirm actual token claim structure before writing authorization policies against it**, since Keycloak's default claim nesting (`realm_access.roles`) differs from a flat claim structure other providers might use.

## Verifying Your Setup

1. **The OIDC flow completes correctly end to end** -- confirm login redirects to Keycloak, authenticates, and returns to your application with a valid session
2. **Realm and client configuration matches your application's actual URLs** -- confirm redirect URIs are correct for every environment
3. **Role claims appear in tokens with the expected structure** -- confirm your authorization policies correctly match the actual claim shape Keycloak issues
4. **Production deployment uses hardened configuration, not `start-dev`** -- confirm a real database, TLS, and production-appropriate settings before going live

## Best Practices

**Never run Keycloak in `start-dev` mode in production.** It's explicitly a development convenience -- production needs a real database backend, TLS, and hardened configuration.

**Use realms deliberately to isolate applications or environments.** Don't default everything into Keycloak's built-in realm; a dedicated realm per application (or per environment) keeps configuration and user data appropriately separated.

**Verify actual token claim structure rather than assuming a shape.** Keycloak's default nesting of roles under `realm_access` is a common source of "my authorization policy isn't matching" confusion if you assumed a flat claim structure.

**Budget real operational capacity for running Keycloak.** It's a genuine service you're responsible for -- uptime, scaling, backups, and security patching are all yours, the same commitment as any self-hosted option in this comparison.

**Take advantage of Keycloak's broader protocol support (SAML, LDAP) if you actually need it.** This is one of its real advantages over a purely OIDC-focused alternative like Duende or OpenIddict -- underusing it means missing part of why you chose Keycloak in the first place.

## Comparison with Duende IdentityServer

| | Keycloak | Duende IdentityServer |
| --- | --- | --- |
| Cost | Free, no licensing cliff | Free under a revenue threshold, commercial above it |
| Language/stack | Java-based backend | .NET-native |
| Turnkey UI/admin console | Yes, included | No -- you build it |
| Protocol support | OIDC, OAuth, SAML, LDAP | OIDC, OAuth (SAML/LDAP require extensions) |
| .NET integration | Standard OIDC middleware, no special SDK needed | Deepest, native ASP.NET Core |

Keycloak's turnkey admin console and broader protocol support make it the community's typical recommendation over a paid Duende license for cost-constrained teams -- the trade-off is operating a Java-based service rather than staying entirely within the .NET stack.

## Frequently Asked Questions

### Do I need a special Keycloak SDK for .NET, or does standard OIDC middleware work?

Standard `Microsoft.AspNetCore.Authentication.OpenIdConnect` middleware works correctly -- Keycloak is a fully standards-compliant OIDC/OAuth provider, so there's no Keycloak-specific package required from the .NET side. Point the standard middleware's `Authority` at your realm's issuer URL and it works the same as with any other compliant provider.

### What's a realm in Keycloak?

A realm is Keycloak's top-level isolation boundary -- a self-contained set of users, clients, roles, and configuration that doesn't share data with other realms. Use separate realms to isolate different applications or environments rather than putting everything into Keycloak's single default realm.

### Why isn't my role-based authorization policy matching?

Most commonly because Keycloak nests realm roles under a `realm_access.roles` claim structure by default, rather than a flat role claim some other providers use. Inspect an actual issued token (via jwt.io or similar during development) to confirm the real claim structure before writing authorization policies against an assumed shape.

### Is Keycloak actually free, with no hidden licensing cost?

Yes -- it's fully open source with no per-user licensing or revenue-threshold cliff, unlike Duende IdentityServer. Your only real cost is the infrastructure and operational time required to run it, the same as any self-hosted option.

### Should I use start-dev mode for a production Keycloak deployment?

No -- `start-dev` is explicitly a development convenience that uses an in-memory-adjacent configuration unsuitable for production. A real deployment needs a proper database, TLS, and hardened production configuration, following Keycloak's official production deployment guidance.

### Does Keycloak support SAML in addition to OIDC/OAuth?

Yes -- this is one of Keycloak's genuine advantages over OIDC-only alternatives like Duende or OpenIddict, useful if you need to integrate with enterprise identity providers or applications that specifically require SAML rather than OIDC.

### What's the most common mistake in a first Keycloak setup?

Running `start-dev` mode in production instead of a properly hardened configuration with a real database and TLS. The second common mistake is assuming a flat role claim structure without checking Keycloak's actual token output, leading to authorization policies that silently never match.
