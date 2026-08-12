# The Top 5 Auth & Identity Solutions for .NET Compared: Which One Should You Choose?

Authentication decisions in .NET have gone through the same pattern this whole series keeps running into: a widely-used free tool goes commercial, and the ecosystem scrambles to figure out what's next. Duende IdentityServer -- the direct successor to the beloved, free IdentityServer4 -- now requires a commercial license for production use above a revenue threshold. That single change reshaped how .NET teams think about self-hosted identity, and it's directly responsible for OpenIddict's rise as the free, .NET-native alternative worth knowing about even though it isn't one of this article's five named entries.

This guide compares five ways .NET applications handle authentication and identity: ASP.NET Core Identity, Duende IdentityServer, Auth0, Keycloak, and Microsoft Entra External ID. They split into genuinely different categories worth understanding before comparing feature lists -- ASP.NET Core Identity is a user-management library you embed directly in your app, Duende and Keycloak are protocol frameworks/servers you self-host, and Auth0 and Entra External ID are fully managed identity platforms you configure rather than operate. Picking between them is less about which has more checkboxes and more about how much of the identity stack you want to own.

If you want hands-on setup guides after deciding, this series includes dedicated getting-started walkthroughs for each solution in .NET.

## Quick Comparison

| | ASP.NET Core Identity | Duende IdentityServer | Auth0 | Keycloak | Microsoft Entra External ID |
| --- | --- | --- | --- | --- | --- |
| **Category** | Embedded user-management library | Self-hosted OIDC/OAuth framework | Managed identity platform | Self-hosted, full-featured IdP | Managed CIAM platform (Microsoft) |
| **Hosting** | In-process with your app | You host it | Fully managed by Auth0 | You host it | Fully managed by Microsoft |
| **Cost model** | Free | Free under a revenue threshold, commercial license above it | Usage-based, scales with MAUs | Free, open source | Usage-based, scales with MAUs |
| **SSO across multiple apps** | No, without adding a protocol layer | Yes, that's its purpose | Yes | Yes | Yes |
| **Operational burden** | Low -- it's a library | High -- you own uptime, scaling, security patching | None -- Auth0 operates it | High -- you own uptime, scaling, security patching | None -- Microsoft operates it |
| **Best for** | Single monolithic apps needing basic user accounts | .NET-native teams building their own IdP with specific requirements | B2C apps prioritizing developer experience and fast setup | Cost-constrained teams with infrastructure capacity | Microsoft/Azure-ecosystem teams wanting managed CIAM |

## ASP.NET Core Identity

ASP.NET Core Identity is the built-in, free membership system for storing user accounts, hashing passwords, managing roles, and handling flows like email confirmation -- directly inside your application, with no separate service or protocol layer required.

**Strengths:**

- Free, built into the framework, with no separate infrastructure or service to operate
- Handles the fundamentals well: password hashing, role management, email confirmation tokens, two-factor authentication support
- The right, sufficient choice for a genuinely common scenario -- a single monolithic web application that manages its own users and doesn't need to issue tokens to external consumers or provide SSO across multiple applications
- Deep, native integration with the rest of ASP.NET Core, since it's designed as part of the same framework rather than bolted on

**Weaknesses:**

- Not designed for SSO across multiple applications, or issuing OAuth access tokens for APIs, without adding a protocol layer (commonly Duende, Keycloak, or OpenIddict) on top
- No federation with external identity providers (Google, Microsoft, enterprise SAML/OIDC providers) without additional configuration and packages
- Scales poorly as a standalone solution once requirements grow beyond "one app, its own users" -- this is exactly the point where teams commonly pair it with a protocol framework rather than replace it

**Choose this when:** you're building a single monolithic application (MVC or Razor Pages) that manages its own users, doesn't need to issue API tokens to external consumers, and doesn't require SSO across multiple applications or services.

## Duende IdentityServer

Duende IdentityServer is the commercial successor to the beloved, free IdentityServer4 -- a comprehensive, standards-compliant OpenID Connect and OAuth 2.0 framework you embed into an ASP.NET Core application to build your own identity provider. It's a framework, not a turnkey product: you write the host, own the UI, and supply the user store (commonly ASP.NET Core Identity underneath it).

**Strengths:**

- Full, standards-compliant OIDC/OAuth 2.0 implementation with deep, native ASP.NET Core integration and a highly extensible architecture
- Genuinely the right choice for organizations that need to build their own OAuth2/OIDC identity provider for internal or customer-facing applications, with specific technical requirements a managed platform can't meet
- Built-in EF Core support for storing configuration and operational data, fitting naturally into an existing .NET data stack
- A community edition exists for smaller companies under a revenue threshold, meaning it's not automatically a paid product for every team

**Weaknesses:**

- Requires a commercial license for production use above that revenue threshold -- a real, ongoing cost that didn't exist with IdentityServer4, and the change that pushed a meaningful share of the ecosystem toward alternatives
- Not turnkey -- no built-in user management UI, no pre-built registration or password-reset flows, no pre-built integrations with enterprise identity providers; you're building the scaffolding around the protocol core yourself
- Steep learning curve, requiring real understanding of OAuth flows, token types, grant types, and OIDC specifications before you can use it correctly
- Self-hosted, meaning full operational overhead -- deployment, scaling, monitoring, backup, and disaster recovery are all your responsibility, on top of the licensing cost

**Choose this when:** you have specific technical requirements that push you toward building your own .NET-native identity provider, and either fall under the community edition's revenue threshold or the commercial license is a reasonable cost against those requirements -- otherwise, Keycloak or OpenIddict are worth serious comparison first.

## Auth0

Auth0 is a fully managed identity platform -- authentication, user management, MFA, social login, and enterprise federation, all operated by Auth0 rather than you. It's consistently cited as having the best documentation and fastest path to working authentication of any option in this comparison.

**Strengths:**

- Genuinely the best developer experience and fastest time-to-working-auth among managed platforms, with documentation that's widely regarded as best-in-class
- Zero operational burden -- Auth0 handles security patching, uptime, MFA implementation, and compliance certifications, letting your team focus entirely on your application
- Broad, mature support for social login, enterprise SSO, and a wide range of pre-built integrations, reducing custom implementation work significantly
- A strong default choice specifically for B2C or consumer-facing applications where getting to market quickly matters more than owning every layer of the identity stack

**Weaknesses:**

- Usage-based pricing that scales with monthly active users -- a real, growing cost as your application succeeds, unlike the fixed infrastructure cost of a self-hosted option
- Dependency on a third-party vendor's availability, pricing decisions, and roadmap -- a genuine trade-off against the control a self-hosted identity provider gives you
- Less natural fit if your organization is already deeply invested in a different cloud ecosystem (Azure specifically), where Entra External ID may integrate more seamlessly

**Choose this when:** you're building a B2C or consumer-facing application, developer experience and speed to market are priorities, and your budget comfortably accommodates usage-based pricing that scales with your user base.

## Keycloak

Keycloak, from Red Hat, is a robust, fully open-source identity provider with a Java-based backend, offering OIDC, SAML, and LDAP support -- the most complete free, self-hosted option in this comparison, and increasingly the community's recommended first stop for cost-constrained teams needing real infrastructure capacity.

**Strengths:**

- Free and genuinely production-ready, with mature enterprise features (SAML, LDAP, fine-grained authorization) that go beyond what OIDC-only alternatives offer
- No per-user licensing cost and no revenue-threshold licensing cliff the way Duende has -- cost stays fixed to infrastructure regardless of user count
- The community consensus is clear: given Keycloak is free and production-ready, choosing a commercially-licensed alternative like Duende means either specific technical requirements Keycloak doesn't meet, or a preference for staying entirely within the .NET stack
- Complete control over user data and infrastructure, appealing to teams with data residency or compliance requirements a managed platform can't satisfy

**Weaknesses:**

- Real operational overhead -- you own deployment, scaling, monitoring, backup, and disaster recovery, the same infrastructure responsibility as Duende or any self-hosted option
- A Java-based backend, which is a genuine mismatch for a purely .NET team's operational expertise and tooling, even though the OIDC/OAuth protocol layer works identically regardless of implementation language
- Deep protocol customization is more complex here than in a .NET-native framework like Duende or OpenIddict, since you're working within Keycloak's own extension model rather than directly in familiar ASP.NET Core code

**Choose this when:** you're cost-constrained but have real infrastructure capacity and operational expertise, need Keycloak's more complete enterprise feature set (SAML, LDAP) beyond pure OIDC, or need full control over user data that a managed platform can't provide.

## Microsoft Entra External ID

Microsoft Entra External ID is Microsoft's current, recommended customer identity and access management (CIAM) platform for new ASP.NET Core applications -- explicitly positioned as the successor to Azure AD B2C, supporting both consumer authentication and B2B collaboration in a single product.

**Strengths:**

- The officially recommended path for new ASP.NET Core applications needing managed CIAM, per Microsoft's own current documentation -- Azure AD B2C remains supported for existing applications but isn't the recommended starting point for new ones
- Fully managed, with Microsoft operating security, scaling, and availability -- the same zero-operational-burden value proposition Auth0 offers, specifically within the Microsoft ecosystem
- Genuinely broader scope than its B2C predecessor -- supports both consumer-facing authentication and B2B collaboration scenarios in the same product, useful for applications serving both external customers and internal or partner organization users
- Deep, natural integration with the rest of Microsoft Entra ID and the broader Azure ecosystem, appealing to teams already operating there

**Weaknesses:**

- Newer than Azure AD B2C, meaning a smaller body of community examples and battle-tested guidance compared to the more established predecessor, though this gap is closing as Microsoft's own documentation continues to be updated
- Some real-world scenarios -- like unifying internal workforce sign-in with external customer sign-in in a single seamless flow -- still require careful architecture decisions and aren't fully turnkey
- Usage-based pricing that scales with active users, the same cost trade-off Auth0 carries relative to self-hosted options
- Community sentiment on Azure AD B2C specifically (the predecessor) has historically flagged real configuration complexity and a learning curve worth being aware of, even as Entra External ID aims to improve on it

**Choose this when:** you're building a new ASP.NET Core application needing managed CIAM, are already invested in the Microsoft/Azure ecosystem, or need to support both external customers and B2B/partner organization users within a single platform.

## How to Decide

A few heuristics that cover most real-world decisions:

**Single monolithic app, managing its own users, no SSO or external API tokens needed?** ASP.NET Core Identity alone is genuinely sufficient -- don't add a protocol layer or managed service you don't need yet.

**Need SSO or API token issuance and want to stay .NET-native, with specific technical requirements a managed platform can't meet?** Duende IdentityServer is purpose-built for this, but confirm whether you fall under its community edition's revenue threshold, and seriously evaluate OpenIddict (the free, .NET-native alternative that emerged specifically in response to Duende's licensing) before committing to a paid license.

**Cost-constrained but have real infrastructure and operational capacity?** Keycloak is free, production-ready, and the community's clear recommendation over a paid Duende license for teams in this position.

**Building B2C/consumer-facing, want the best developer experience and fastest path to working auth, budget allows?** Auth0 remains the standard recommendation here.

**Already deep in the Microsoft/Azure ecosystem, need managed CIAM for a new application?** Microsoft Entra External ID is Microsoft's own current recommended path, particularly if you also need to support B2B/partner scenarios alongside consumer authentication.

A pattern worth knowing across several of these: ASP.NET Core Identity is frequently paired with a protocol framework rather than replaced by one -- Identity handles user storage, password hashing, and account management, while Duende, Keycloak, or OpenIddict sits on top handling the OIDC/OAuth protocol layer. This combination shows up often enough that it's worth considering directly rather than treating the five options here as mutually exclusive.

## Frequently Asked Questions

### Is ASP.NET Core Identity enough for my application, or do I need something more?

It's genuinely sufficient if you're building a single monolithic application that manages its own users, doesn't need to issue OAuth tokens to external API consumers, and doesn't require single sign-on across multiple applications. The moment any of those three things becomes true, you need a protocol layer (Duende, Keycloak, OpenIddict) on top of or instead of Identity alone.

### Why did Duende IdentityServer become a paid product?

Duende IdentityServer is the commercial successor to the free, open-source IdentityServer4. The maintainers transitioned to a commercial licensing model requiring payment for production use above a revenue threshold, which is what prompted a meaningful share of the .NET community to evaluate free alternatives like Keycloak and OpenIddict rather than accepting the new licensing terms by default.

### What's OpenIddict, and why does it come up in Duende comparisons?

OpenIddict is a free, .NET-native OIDC/OAuth framework that emerged as a direct response to Duende's commercial licensing -- it handles the protocol layer (token issuance, validation, introspection, revocation) with tight ASP.NET Core integration and EF Core support, at zero licensing cost. It's not one of this article's five named solutions, but it's genuinely relevant to anyone evaluating Duende specifically for licensing reasons, since it fills a similar .NET-native niche without the commercial cost.

### Should I choose a self-hosted or a managed identity solution?

It depends on your operational capacity and priorities. Managed platforms (Auth0, Entra External ID) eliminate security patching, scaling, and availability concerns at the cost of usage-based pricing and vendor dependency. Self-hosted options (Duende, Keycloak) give you complete control and, for Keycloak specifically, no per-user cost, at the cost of owning deployment, scaling, monitoring, and disaster recovery yourself.

### Is Keycloak a good fit for a purely .NET team?

It's a reasonable choice specifically when cost matters more than staying entirely within the .NET stack -- Keycloak's Java-based backend is a genuine operational mismatch for a purely .NET team's tooling and expertise, even though the OIDC/OAuth protocol it exposes works identically regardless of implementation language. If staying .NET-native matters more than avoiding licensing cost, Duende (if within budget) or OpenIddict are more natural fits.

### What's the difference between Azure AD B2C and Microsoft Entra External ID?

Microsoft Entra External ID is Microsoft's current, officially recommended CIAM platform for new ASP.NET Core applications, explicitly positioned as the successor to Azure AD B2C with broader scope -- supporting both consumer authentication and B2B collaboration in one product. Azure AD B2C remains supported for existing applications, but Microsoft's own documentation directs new projects toward Entra External ID instead.

### Can I combine ASP.NET Core Identity with one of the other four options?

Yes, and it's a common, well-supported architecture -- ASP.NET Core Identity handles the user-management layer (storing accounts, hashing passwords, managing roles), while a protocol framework like Duende IdentityServer or OpenIddict sits on top handling OIDC/OAuth flows and token issuance. This lets you keep Identity's familiar user-management model while adding the SSO and API token capabilities it doesn't provide alone.
