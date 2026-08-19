---
author: Steve Kaschimer
date: 2028-07-25
image: /images/posts/2028-07-25-hero.webp
image_alt: "A minimal outlined window glyph with no additional accents, implying a lightweight, general-purpose editor made genuinely capable through one well-integrated extension."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single minimal outlined window glyph, thin-lined and uncluttered, implying a lightweight, general-purpose editor. A small amber puzzle-piece accent sits snugly fitted into the window's lower corner, implying one well-integrated extension rather than a full built-in IDE. Mood is fast, extensible, and unpretentious. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic laptop clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The C# story used to require manual extension-hunting to get something resembling IntelliSense and a working debugger. That's not the situation anymore - the C# Dev Kit bundles the pieces that matter into one coherent extension. A setup guide for workspace loading, debugging config, and the license restriction that excludes Cursor."
tags: ["dotnet", "tooling", "developer-productivity"]
title: "Getting Started with VS Code for .NET Development"
---



VS Code's C# story used to require a fair amount of manual extension-hunting to get something resembling IntelliSense and a working debugger. That's not the situation anymore - Microsoft's C# Dev Kit bundles the pieces that matter into one coherent extension, and the setup is now genuinely a few clicks rather than a scavenger hunt. The part still worth knowing deliberately: that extension is licensed specifically for genuine VS Code, not for Cursor or other VS Code-compatible forks, which matters if you're choosing between editors in this family.

This guide covers installing VS Code and the C# Dev Kit, bootstrapping a project with the settings that keep a growing solution fast and consistent, the core debugging and testing workflow, and the best practices for getting a genuinely solid .NET experience out of what's still a lightweight, general-purpose editor at heart. By the end you'll have a fast, capable C# setup that doesn't carry a full IDE's resource footprint.

If you're deciding between .NET IDEs and editors first, [a comparison of the top .NET IDEs and editors](/posts/2028-07-04-top-5-dotnet-ides-editors-compared/) covers where VS Code fits relative to Visual Studio, Rider, Cursor, and Neovim.

## What You'll Need

- Windows, macOS, or Linux
- .NET 8 SDK or later, installed separately from VS Code itself

## Installing VS Code and the C# Dev Kit

Download VS Code from code.visualstudio.com, then install the extension from the Extensions view (Ctrl+Shift+X / ⌘⇧X):

- **C# Dev Kit** - the primary extension, bundling IntelliSense, debugging, project management, and test integration
- **C#** (base language extension, installed automatically as a dependency of C# Dev Kit)

Confirm the .NET SDK is installed and discoverable:

```bash
dotnet --version
```

## Bootstrapping the Ideal Environment

### Open a folder or workspace, not just individual files

C# Dev Kit's project awareness (Solution Explorer-equivalent view, build integration, test discovery) activates properly when you open a folder containing a `.sln` or `.csproj` file, rather than opening loose `.cs` files individually - this is the single most common reason IntelliSense or the test explorer doesn't seem to be working as expected.

### Configure workspace settings for the project

```json
// .vscode/settings.json
{
  "dotnet.defaultSolution": "MyApp.sln",
  "omnisharp.enableEditorConfigSupport": true,
  "editor.formatOnSave": true
}
```

Committing `.vscode/settings.json` to source control (where appropriate for your team) ensures every developer's VS Code instance points at the right solution file and respects the same formatting behavior, rather than each person configuring it individually.

### Set up launch and debugging configuration

C# Dev Kit typically generates a `.vscode/launch.json` automatically the first time you start debugging, but reviewing and adjusting it is worth doing for non-default scenarios:

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Launch API",
      "type": "coreclr",
      "request": "launch",
      "program": "${workspaceFolder}/bin/Debug/net8.0/MyApp.Api.dll",
      "args": [],
      "cwd": "${workspaceFolder}",
      "stopAtEntry": false
    }
  ]
}
```

### Commit .editorconfig for consistent formatting

```ini
# .editorconfig
[*.cs]
indent_style = space
indent_size = 4
dotnet_sort_system_directives_first = true
```

The same `.editorconfig` mechanism used by Visual Studio and Rider works here too - this is what keeps formatting consistent across a team regardless of which of these editors each developer prefers.

## Core Workflow

- **Use the built-in Test Explorer (visible once C# Dev Kit detects test projects) rather than running `dotnet test` manually for iterative work.** It surfaces individual test results directly in the editor gutter.
- **Set breakpoints and use the Debug panel (F5) the same way you would in a full IDE.** C# Dev Kit's debugging integration is genuinely solid for the majority of everyday debugging needs.
- **Use "Go to Definition" and "Find All References" (F12 / Shift+F12) for navigation**, which work correctly once the project is properly loaded as a folder/workspace.

## Verifying Your Setup

1. **IntelliSense is working** - confirm autocomplete, hover documentation, and error squiggles appear correctly for your project's types
2. **The project loaded as a workspace, not loose files** - confirm a Solution Explorer-equivalent panel shows your actual project structure
3. **Debugging works end to end** - confirm F5 builds, launches, and correctly hits breakpoints
4. **Tests are discovered** - confirm your test projects appear in the Test Explorer and can be run individually or as a full suite

## Best Practices

**Always open the folder containing your `.sln` or `.csproj`, never individual loose files.** This is the root cause of the vast majority of "IntelliSense isn't working" issues in VS Code for C#.

**Commit `.vscode/settings.json` and `.editorconfig` where appropriate for your team.** This keeps every developer's environment configured consistently without individual setup effort, the same discipline that applies across every IDE in this comparison.

**Use the C# Dev Kit specifically - confirm it's genuine VS Code, not a compatible fork.** Its license restricts it to official VS Code; if you're using Cursor or another fork, you'll need a different C# tooling path (see this series' Cursor guide).

**Don't expect VS Code to match Visual Studio's or Rider's most advanced refactoring and analysis depth.** It's a genuinely capable, lightweight option - not a full IDE replacement for every scenario, particularly very large solutions or the deepest diagnostic tooling.

**Take advantage of VS Code's broader extension ecosystem alongside C# Dev Kit.** Docker, Kubernetes, and cloud tooling extensions integrate naturally in the same editor, which is a real advantage for full-stack or infrastructure-adjacent .NET work.

## Comparison with Cursor

| | VS Code | Cursor |
| --- | --- | --- |
| C# tooling | C# Dev Kit, first-party Microsoft | ReSharper extension (2026.2+), JetBrains |
| License restriction | None for its own extension | C# Dev Kit specifically doesn't run here; use ReSharper's extension instead |
| AI agent capabilities | Via GitHub Copilot or other extensions | Native, agent-centric by design |
| Foundation | The original VS Code codebase | A fork of VS Code |
| Best fit | Teams wanting official Microsoft tooling with broad extension support | Teams wanting AI-agent-centric workflows with genuine C# tooling |

Both share the same core editing experience since Cursor is built on VS Code's foundation - the meaningful difference is which C# extension path is actually available to you, and how central AI-agent workflows are to your day-to-day development.

## Frequently Asked Questions

### Why isn't IntelliSense working even though I installed C# Dev Kit?

The most common cause is opening individual `.cs` files rather than opening the folder containing your `.sln` or `.csproj` file - C# Dev Kit needs project context to provide full IntelliSense, and that context only loads when you open the project as a workspace.

### Can I use the C# Dev Kit in Cursor?

No - its license restricts it to genuine Visual Studio Code specifically. If you're using Cursor, JetBrains' ReSharper extension (available as of their 2026.2 release) is the path to full C# tooling, including debugging, in that editor instead.

### Is VS Code good enough to replace Visual Studio for real .NET work?

For a genuinely large share of workflows, yes - the C# Dev Kit provides strong IntelliSense, debugging, and test integration. For the most advanced refactoring, diagnostic, and large-solution scenarios, Visual Studio or Rider still have an edge, so the right answer depends on how deep your specific needs go.

### How do I configure which solution VS Code should use if I have multiple in my workspace?

Set `"dotnet.defaultSolution"` in `.vscode/settings.json` to point at the specific `.sln` file you want C# Dev Kit to use as the active solution, avoiding ambiguity if your workspace folder contains more than one.

### Does VS Code support debugging Blazor or ASP.NET Core applications?

Yes - C# Dev Kit's debugging integration handles ASP.NET Core (including Minimal APIs, MVC, and Blazor) the same way it handles any other .NET project type, with breakpoints, variable inspection, and the standard debugging toolbar.

### Is VS Code free to use for commercial .NET development?

Yes - both VS Code itself and the C# Dev Kit extension are free to use, including for commercial development, without the licensing considerations that apply to Visual Studio Professional/Enterprise or Rider's subscription.

### What's the most common mistake in a first VS Code setup for .NET?

Opening loose `.cs` files instead of the project folder, leading to confusing IntelliSense and navigation failures that look like a broken installation but are actually a workspace-loading issue. The second common mistake is expecting Cursor to work identically to VS Code for C# tooling, when the C# Dev Kit's licensing specifically excludes that fork.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
