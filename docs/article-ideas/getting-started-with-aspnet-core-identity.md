# Getting Started with ASP.NET Core Identity

ASP.NET Core Identity's scaffolding gets you a working login page in minutes, which is exactly why it's easy to stop there and miss the configuration that actually matters for a real application: password and lockout policies tuned to your actual risk tolerance, email confirmation wired to a real sender, and a clear-eyed sense of when you've outgrown what Identity alone can do. None of these show up as errors if you skip them -- they show up as security gaps or awkward workarounds months later.

This guide covers installing and scaffolding ASP.NET Core Identity, bootstrapping the configuration that matters beyond the defaults, the core patterns for roles and claims-based authorization, and the best practices -- including recognizing the point where you need to pair Identity with a protocol framework rather than stretch it further. By the end you'll have a genuinely production-ready user management layer, not just a working demo.

If you're deciding between auth/identity solutions first, a comparison of the top auth and identity solutions for .NET covers where ASP.NET Core Identity fits relative to Duende IdentityServer, Auth0, Keycloak, and Microsoft Entra External ID.

## What You'll Need

- .NET 8 SDK or later
- A database for user storage -- SQL Server is the default via EF Core, though any EF Core-supported provider works

## Installing and Scaffolding

```bash
dotnet new webapp -n MyApp -au Individual
```

The `-au Individual` flag scaffolds a new project with ASP.NET Core Identity already wired in -- registration, login, and account management pages included. For adding Identity to an existing project instead:

```bash
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet tool install --global dotnet-aspnet-codegenerator
dotnet aspnet-codegenerator identity -dc MyApp.Data.ApplicationDbContext
```

## Bootstrapping the Ideal Environment

### Configure password and lockout policies deliberately

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDefaultIdentity<IdentityUser>(options =>
{
    options.Password.RequiredLength = 12;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;

    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);

    options.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>();
```

The scaffolded defaults are reasonable but generic -- review password length, lockout thresholds, and whether email confirmation should be required before your first real user signs up, rather than accepting whatever the template chose.

### Wire up a real email sender for confirmation and password reset

```csharp
public class EmailSender(IConfiguration config) : IEmailSender
{
    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        // Integrate with a real provider (SendGrid, Azure Communication Services, etc.)
        // The scaffolded template's default IEmailSender does nothing -- it's a stub
    }
}
```

```csharp
builder.Services.AddTransient<IEmailSender, EmailSender>();
```

The default scaffolded `IEmailSender` implementation is a no-op stub -- email confirmation and password reset links are generated correctly, but never actually sent, unless you implement this yourself against a real provider.

### Add roles

```csharp
builder.Services.AddDefaultIdentity<IdentityUser>(options => { /* ... */ })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();
```

```csharp
[Authorize(Roles = "Admin")]
public class AdminController : Controller { }
```

`AddRoles<IdentityRole>()` isn't included by the default scaffolding -- add it explicitly if your application needs role-based authorization beyond simple authenticated/not-authenticated checks.

### Use claims for more granular authorization than roles alone provide

```csharp
var claims = new List<Claim> { new(ClaimTypes.Email, user.Email!), new("department", "engineering") };
await userManager.AddClaimsAsync(user, claims);
```

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("EngineeringOnly", policy =>
        policy.RequireClaim("department", "engineering"));
});
```

Claims-based policies handle authorization scenarios roles alone can't express cleanly -- attribute-based access (department, subscription tier, feature flags) rather than a fixed set of named roles.

## Core Workflow

- **Review and tune every default configuration option before your first real deployment**, not just the ones that produce an obvious error if wrong.
- **Implement a real `IEmailSender`** before assuming email confirmation or password reset actually works -- the scaffolded stub silently does nothing.
- **Use roles for coarse-grained authorization and claims for anything more granular**, rather than trying to encode fine details into an ever-growing list of role names.

## Verifying Your Setup

1. **Password and lockout policies match your intended security posture** -- confirm the configured values, not the scaffolded defaults, are actually what's enforced
2. **Email confirmation and password reset emails are actually delivered** -- confirm your real `IEmailSender` implementation works against your chosen provider, not just that the stub compiles
3. **Role-based authorization correctly restricts access** -- confirm `[Authorize(Roles = "Admin")]` actually blocks non-admin users
4. **Claims-based policies evaluate correctly** -- confirm a policy requiring a specific claim value correctly allows and denies access as expected

## Best Practices

**Never leave the default scaffolded `IEmailSender` stub in a production application.** It silently does nothing -- confirming email delivery actually works before launch is not optional if your flows depend on it.

**Tune password and lockout policies to your actual risk tolerance**, rather than accepting scaffolded defaults uncritically. The right values depend on your application's specific threat model.

**Recognize the point where Identity alone isn't enough.** The moment you need SSO across multiple applications, need to issue OAuth access tokens for an API, or need federation with external identity providers, that's the signal to pair Identity with a protocol framework (Duende, Keycloak, OpenIddict) rather than trying to stretch Identity to cover those needs itself.

**Use claims for genuinely granular authorization**, reserving roles for broad, stable categories of user. Mixing fine-grained permission logic into an ever-growing list of role names becomes unwieldy fast.

**Keep the Identity database schema under migration control the same as any other EF Core-managed schema.** It's ordinary EF Core underneath the scaffolding -- treat it with the same discipline as the rest of your data model.

## Comparison with Duende IdentityServer

| | ASP.NET Core Identity | Duende IdentityServer |
| --- | --- | --- |
| Scope | User storage, password management, roles | Full OIDC/OAuth protocol layer, SSO, API tokens |
| SSO across apps | No, without an added protocol layer | Yes, that's its core purpose |
| Cost | Free | Free under a revenue threshold, commercial above it |
| Setup complexity | Low -- scaffolded, works immediately | High -- you build the host, UI, and token logic |

They're frequently used together rather than as alternatives -- Identity handles the user-management layer, Duende (or another protocol framework) sits on top handling OIDC/OAuth flows, SSO, and token issuance that Identity alone doesn't provide.

## Frequently Asked Questions

### Does ASP.NET Core Identity support single sign-on across multiple applications?

Not on its own -- it's designed for a single application managing its own users. SSO across multiple applications requires adding a protocol layer (Duende IdentityServer, Keycloak, or OpenIddict) that issues and validates tokens across applications, commonly using ASP.NET Core Identity underneath as the actual user store.

### Why isn't my email confirmation or password reset email being sent?

The default scaffolded `IEmailSender` implementation is a stub that does nothing -- it generates the confirmation link correctly but never actually sends an email. You need to implement `IEmailSender` yourself against a real provider (SendGrid, Azure Communication Services, or similar) before these flows work in practice.

### What's the difference between roles and claims in ASP.NET Core Identity?

Roles are a named, typically coarse-grained categorization of users (Admin, Member) checked via `[Authorize(Roles = "...")]`. Claims are more granular, arbitrary key-value pairs attached to a user (department, subscription tier) checked via authorization policies. Use roles for broad, stable categories and claims for anything requiring finer-grained or more dynamic authorization logic.

### Can ASP.NET Core Identity issue OAuth access tokens for an API?

Not natively -- Identity handles user accounts and cookie-based authentication for the application it's embedded in, not OAuth token issuance for external API consumers. That requires a protocol framework like Duende IdentityServer or OpenIddict layered on top.

### How do I customize the scaffolded Identity UI?

The scaffolded pages (login, registration, account management) are Razor Pages you can override by scaffolding them explicitly into your project (`dotnet aspnet-codegenerator identity`) and then editing the generated files directly, rather than being limited to the default UI that ships hidden inside the Identity package.

### Is ASP.NET Core Identity secure by default?

The core mechanisms (password hashing, lockout, anti-forgery tokens) are solid and secure by design, but several important behaviors -- like actually requiring confirmed email before sign-in, or having sensible password/lockout policies -- need to be explicitly configured rather than assumed from scaffolded defaults. Review your configuration deliberately rather than trusting the template's choices are automatically appropriate for your application.

### What's the most common mistake in a first ASP.NET Core Identity setup?

Leaving the default `IEmailSender` stub in place and assuming email confirmation or password reset works, when it silently does nothing until a real implementation is added. The second common mistake is trying to stretch Identity to cover SSO or API token issuance instead of recognizing that's the signal to add a protocol framework on top.
