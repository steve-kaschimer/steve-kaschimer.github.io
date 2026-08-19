---
author: Steve Kaschimer
date: 2028-05-23
image: /images/posts/2028-05-23-hero.webp
image_alt: "Five columns of abstract identity glyphs positioned along a horizontal axis running from a single embedded library on the left to fully managed, hands-off identity platforms on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: a small padlock nested directly inside a rounded application-window outline implying an embedded library, a padlock connected by a thin line to a small building-shaped server icon implying a self-hosted framework you build around, a padlock floating cleanly inside a cloud outline implying a fully managed vendor platform, a padlock beside a small stacked-brick icon implying an open-source self-hosted server, and a padlock inside a cloud outline bearing a small four-pane window accent implying a Microsoft-ecosystem managed platform. Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'embedded library' on the left to 'fully managed' on the right, with a small glowing teal dot positioned at a different point under each column. Mood is comparative, security-conscious, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic lock clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Duende IdentityServer - the direct successor to the free, widely-loved IdentityServer4 - now requires a commercial license for production use above a revenue threshold, the same commercial-shift pattern the mapping and mocking tracks both hit. A practical breakdown of five ways .NET applications handle authentication and identity."
tags: ["dotnet", "security", "identity", "oidc", "architecture"]
title: "The Top 5 Auth & Identity Solutions for .NET Compared: Which One Should You Choose?"
---



Authentication decisions in .NET have gone through the same pattern this whole series keeps running into: a widely-used free tool goes commercial, and the ecosystem scrambles to figure out what's next. Duende IdentityServer - the direct successor to the beloved, free IdentityServer4 - now requires a commercial license for production use above a revenue threshold. That single change reshaped how .NET teams think about self-hosted identity, and it's directly responsible for OpenIddict's rise as the free, .NET-native alternative worth knowing about even though it isn't one of this article's five named entries.

This guide compares five ways .NET applications handle authentication and identity: ASP.NET Core Identity, Duende IdentityServer, Auth0, Keycloak, and Microsoft Entra External ID. They split into genuinely different categories worth understanding before comparing feature lists - ASP.NET Core Identity is a user-management library you embed directly in your app, Duende and Keycloak are protocol frameworks/servers you self-host, and Auth0 and Entra External ID are fully managed identity platforms you configure rather than operate. Picking between them is less about which has more checkboxes and more about how much of the identity stack you want to own. This series continues with dedicated getting-started walkthroughs for each solution.

## Quick Comparison

| | ASP.NET Core Identity | Duende IdentityServer | Auth0 | Keycloak | Microsoft Entra External ID |
| --- | --- | --- | --- | --- | --- |
| **Category** | Embedded user-management library | Self-hosted OIDC/OAuth framework | Managed identity platform | Self-hosted, full-featured IdP | Managed CIAM platform (Microsoft) |
| **Hosting** | In-process with your app | You host it | Fully managed by Auth0 | You host it | Fully managed by Microsoft |
| **Cost model** | Free | Free under a revenue threshold, commercial license above it | Usage-based, scales with MAUs | Free, open source | Usage-based, scales with MAUs |
| **SSO across multiple apps** | No, without adding a protocol layer | Yes, that's its purpose | Yes | Yes | Yes |
| **Operational burden** | Low - it's a library | High - you own uptime, scaling, security patching | None - Auth0 operates it | High - you own uptime, scaling, security patching | None - Microsoft operates it |
| **Best for** | Single monolithic apps needing basic user accounts | .NET-native teams building their own IdP with specific requirements | B2C apps prioritizing developer experience and fast setup | Cost-constrained teams with infrastructure capacity | Microsoft/Azure-ecosystem teams wanting managed CIAM |

## ASP.NET Core Identity

Built-in, free user management for a single app. Password hashing, role management, email confirmation, 2FA. Lives in your application, no separate service.

Sufficient for one monolithic app managing its own users with no SSO or external API tokens needed. Integrates natively with ASP.NET Core.

Can't handle SSO across multiple apps or OAuth token issuance without adding a protocol layer on top. No built-in federation with Google, Microsoft, or enterprise SAML/OIDC. Stops scaling once you need more than one app or service-to-service auth.

## Duende IdentityServer

Standards-compliant OIDC/OAuth 2.0 framework, built on ASP.NET Core, for building your own identity provider. You own the host, the UI, the user store. Not turnkey, you're building the protocol layer from scratch.

Full OIDC/OAuth support, native ASP.NET Core integration, EF Core for configuration and operational data. Genuinely the right fit if you need to build your own .NET-native IdP with specific requirements a managed platform can't meet.

Commercial license required above a revenue threshold (free for companies below it). No built-in UI, registration flows, or enterprise provider integrations, you build all of that. Steep learning curve for OAuth flows and OIDC specs. Full operational overhead: deployment, scaling, monitoring, backup, disaster recovery all your responsibility.

## Auth0

Fully managed identity platform. Auth0 handles everything, auth, user management, MFA, social login, enterprise SSO. Best documentation and fastest time-to-working-auth in this comparison.

Zero operational overhead. Auth0 manages patching, uptime, compliance. Mature social login and enterprise SSO with pre-built integrations. Best for B2C/consumer apps where speed to market beats owning every layer.

Usage-based pricing scales with active users (grows as you succeed). Vendor dependency, you're betting on their roadmap and pricing. Less natural if you're deep in Azure ecosystem.

## Keycloak

Free, open-source, production-ready. Red Hat's identity provider with OIDC, SAML, LDAP support. Most complete free option here. Community consensus: if Keycloak meets your needs, paying for Duende means you need .NET-native features or budget to spare.

Free, no per-user cost. Enterprise features (SAML, LDAP, fine-grained authz) built in. Full control over user data and infrastructure. Full operational overhead yours.

Java backend, mismatch for purely .NET teams' tooling and expertise (though OIDC/OAuth protocol works identically). Deep customization is more complex in Keycloak's extension model than in .NET-native frameworks like Duende or OpenIddict.

## Microsoft Entra External ID

Microsoft's current CIAM platform for new ASP.NET Core applications. Successor to Azure AD B2C, supporting both consumer auth and B2B collaboration in one product. Microsoft's own recommended path.

Fully managed (Microsoft operates security, scaling, availability). Broader scope than B2C, handles consumer and B2B/partner scenarios together. Deep integration with Azure ecosystem.

Newer than B2C, smaller community knowledge base (gap closing). Some scenarios (unifying internal + external sign-in seamlessly) still require architectural choices, not turnkey. Usage-based pricing scales with active users. B2C historically had configuration complexity; Entra External ID aims to improve on it.

## How to Decide

A few heuristics that cover most real-world decisions:

**Single monolithic app, managing its own users, no SSO or external API tokens needed?** ASP.NET Core Identity alone is genuinely sufficient - don't add a protocol layer or managed service you don't need yet.

**Need SSO or API token issuance and want to stay .NET-native, with specific technical requirements a managed platform can't meet?** Duende IdentityServer is purpose-built for this, but confirm whether you fall under its community edition's revenue threshold, and seriously evaluate OpenIddict (the free, .NET-native alternative that emerged specifically in response to Duende's licensing) before committing to a paid license.

**Cost-constrained but have real infrastructure and operational capacity?** Keycloak is free, production-ready, and the community's clear recommendation over a paid Duende license for teams in this position.

**Building B2C/consumer-facing, want the best developer experience and fastest path to working auth, budget allows?** Auth0 remains the standard recommendation here.

**Already deep in the Microsoft/Azure ecosystem, need managed CIAM for a new application?** Microsoft Entra External ID is Microsoft's own current recommended path, particularly if you also need to support B2B/partner scenarios alongside consumer authentication.

A pattern worth knowing across several of these: ASP.NET Core Identity is frequently paired with a protocol framework rather than replaced by one - Identity handles user storage, password hashing, and account management, while Duende, Keycloak, or OpenIddict sits on top handling the OIDC/OAuth protocol layer. This combination shows up often enough that it's worth considering directly rather than treating the five options here as mutually exclusive.

## Frequently Asked Questions

### Is ASP.NET Core Identity enough for my application, or do I need something more?

It's genuinely sufficient if you're building a single monolithic application that manages its own users, doesn't need to issue OAuth tokens to external API consumers, and doesn't require single sign-on across multiple applications. The moment any of those three things becomes true, you need a protocol layer (Duende, Keycloak, OpenIddict) on top of or instead of Identity alone.

### Why did Duende IdentityServer become a paid product?

Duende IdentityServer is the commercial successor to the free, open-source IdentityServer4. The maintainers transitioned to a commercial licensing model requiring payment for production use above a revenue threshold, which is what prompted a meaningful share of the .NET community to evaluate free alternatives like Keycloak and OpenIddict rather than accepting the new licensing terms by default.

### What's OpenIddict, and why does it come up in Duende comparisons?

OpenIddict is a free, .NET-native OIDC/OAuth framework that emerged as a direct response to Duende's commercial licensing - it handles the protocol layer (token issuance, validation, introspection, revocation) with tight ASP.NET Core integration and EF Core support, at zero licensing cost. It's not one of this article's five named solutions, but it's genuinely relevant to anyone evaluating Duende specifically for licensing reasons, since it fills a similar .NET-native niche without the commercial cost.

### Should I choose a self-hosted or a managed identity solution?

It depends on your operational capacity and priorities. Managed platforms (Auth0, Entra External ID) eliminate security patching, scaling, and availability concerns at the cost of usage-based pricing and vendor dependency. Self-hosted options (Duende, Keycloak) give you complete control and, for Keycloak specifically, no per-user cost, at the cost of owning deployment, scaling, monitoring, and disaster recovery yourself.

### Is Keycloak a good fit for a purely .NET team?

It's a reasonable choice specifically when cost matters more than staying entirely within the .NET stack - Keycloak's Java-based backend is a genuine operational mismatch for a purely .NET team's tooling and expertise, even though the OIDC/OAuth protocol it exposes works identically regardless of implementation language. If staying .NET-native matters more than avoiding licensing cost, Duende (if within budget) or OpenIddict are more natural fits.

### What's the difference between Azure AD B2C and Microsoft Entra External ID?

Microsoft Entra External ID is Microsoft's current, officially recommended CIAM platform for new ASP.NET Core applications, explicitly positioned as the successor to Azure AD B2C with broader scope - supporting both consumer authentication and B2B collaboration in one product. Azure AD B2C remains supported for existing applications, but Microsoft's own documentation directs new projects toward Entra External ID instead.

### Can I combine ASP.NET Core Identity with one of the other four options?

Yes, and it's a common, well-supported architecture - ASP.NET Core Identity handles the user-management layer (storing accounts, hashing passwords, managing roles), while a protocol framework like Duende IdentityServer or OpenIddict sits on top handling OIDC/OAuth flows and token issuance. This lets you keep Identity's familiar user-management model while adding the SSO and API token capabilities it doesn't provide alone.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
