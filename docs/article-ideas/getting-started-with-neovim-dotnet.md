# Getting Started with Neovim for .NET Development

Every other editor in this series gives you IntelliSense and debugging the moment you install it. Neovim gives you neither -- you assemble both yourself, from a language server, a completion plugin, and a debug adapter, each configured explicitly. That's the honest trade the whole editor makes: nothing works until you wire it up, and once you have, it's exactly the setup you wanted, running exactly as fast as your hardware allows, with none of a GUI IDE's overhead.

This guide covers installing Neovim and the pieces that make C# development genuinely functional -- a language server, completion, and debugging -- bootstrapping a configuration that stays maintainable as it grows, the core navigation and debugging workflow once everything's connected, and the best practices for keeping a from-scratch .NET setup working reliably. By the end you'll have a lightweight, fully keyboard-driven .NET environment built entirely to your own specification.

If you're deciding between .NET IDEs and editors first, a comparison of the top .NET IDEs and editors covers where Neovim fits relative to Visual Studio, Rider, VS Code, and Cursor.

## What You'll Need

- Neovim 0.9 or later
- .NET 8 SDK or later
- A plugin manager (lazy.nvim is the current standard choice for new configurations)
- Comfort editing Lua, since modern Neovim configuration is written in it

## Installing Neovim and Core Dependencies

```bash
# macOS
brew install neovim

# Linux (via package manager, or download a release binary)
# Windows: via winget or Scoop
winget install Neovim.Neovim
```

Install a C# language server -- `csharp-ls` is a lighter-weight option; OmniSharp is the more established, heavier alternative with broader feature coverage:

```bash
dotnet tool install --global csharp-ls
```

## Bootstrapping the Ideal Environment

### Set up a plugin manager

```lua
-- ~/.config/nvim/lua/config/lazy.lua
require("lazy").setup({
  { "neovim/nvim-lspconfig" },
  { "hrsh7th/nvim-cmp" },
  { "hrsh7th/cmp-nvim-lsp" },
  { "mfussenegger/nvim-dap" },
  { "rcarriga/nvim-dap-ui" },
})
```

### Configure the C# language server

```lua
-- ~/.config/nvim/lua/config/lsp.lua
local lspconfig = require("lspconfig")

lspconfig.csharp_ls.setup({
  capabilities = require("cmp_nvim_lsp").default_capabilities(),
})
```

This gives you the core IDE-like features -- go-to-definition, hover documentation, diagnostics, and completion -- driven by the language server rather than a purpose-built extension the way VS Code or Rider provide out of the box.

### Configure completion

```lua
-- ~/.config/nvim/lua/config/completion.lua
local cmp = require("cmp")

cmp.setup({
  sources = {
    { name = "nvim_lsp" },
  },
  mapping = cmp.mapping.preset.insert({
    ["<Tab>"] = cmp.mapping.select_next_item(),
    ["<CR>"] = cmp.mapping.confirm({ select = true }),
  }),
})
```

### Configure debugging with nvim-dap

Debugging is the piece that requires the most deliberate setup -- Neovim has no built-in debug adapter for .NET, so you configure `nvim-dap` against `netcoredbg`:

```bash
# Install netcoredbg (the .NET debug adapter), platform-specific instructions vary
```

```lua
-- ~/.config/nvim/lua/config/dap.lua
local dap = require("dap")

dap.adapters.coreclr = {
  type = "executable",
  command = "/path/to/netcoredbg/netcoredbg",
  args = { "--interpreter=vscode" },
}

dap.configurations.cs = {
  {
    type = "coreclr",
    name = "Launch API",
    request = "launch",
    program = function()
      return vim.fn.input("Path to dll: ", vim.fn.getcwd() .. "/bin/Debug/net8.0/", "file")
    end,
  },
}
```

This is meaningfully more setup than any other editor in this comparison requires, and it's exactly the trade-off Neovim asks you to accept -- full control over the configuration, in exchange for none of it being automatic.

### Set up EditorConfig support

```lua
{ "editorconfig/editorconfig-vim" }
```

The same `.editorconfig` mechanism every other editor in this series respects works here too, once the plugin is installed -- keeping formatting consistent with teammates using Visual Studio, Rider, VS Code, or Cursor.

## Core Workflow

- **Use LSP-provided navigation (`gd` for go-to-definition, `gr` for references) once the language server is configured.** These map to the same underlying capability IDEs provide, just triggered by keybindings you define yourself.
- **Use `nvim-dap-ui` to get a visual debugging panel** (variables, call stack, breakpoints) rather than working with `nvim-dap`'s commands alone -- it closes much of the usability gap with a GUI debugger.
- **Build your configuration incrementally, adding plugins as you hit real friction**, rather than trying to replicate every IDE feature on day one. A working, minimal setup is more valuable than an ambitious, half-finished one.

## Verifying Your Setup

1. **The language server attaches correctly** -- confirm `:LspInfo` shows `csharp_ls` (or OmniSharp) active and attached to your buffer
2. **Completion and navigation work** -- confirm autocomplete suggestions, hover documentation, and go-to-definition all function correctly
3. **Debugging connects and hits breakpoints** -- confirm `nvim-dap` launches your application and breakpoints pause execution as expected
4. **`.editorconfig` is respected** -- confirm formatting matches your committed configuration

## Best Practices

**Start with a minimal, working configuration and add capability incrementally.** Trying to replicate every IDE feature before writing any real code is a common way to lose momentum on a from-scratch Neovim setup.

**Use `csharp-ls` for a lighter footprint, or OmniSharp if you need its broader feature coverage.** Neither is strictly better -- `csharp-ls` is faster to set up and lighter-weight; OmniSharp has a longer track record and more comprehensive feature support in some areas.

**Invest specifically in `nvim-dap-ui`, not just `nvim-dap` alone.** Bare `nvim-dap` works but is meaningfully less usable day-to-day than having a proper visual panel for variables, breakpoints, and the call stack.

**Keep your configuration in version control.** A Neovim setup this customized is worth treating as a real, versioned artifact -- both for your own history and so you can restore it on a new machine without rebuilding from memory.

**Be realistic about the setup investment before committing.** Neovim's .NET experience can be genuinely excellent, but it requires meaningfully more upfront work than any other option in this comparison -- worth it specifically for developers who value that level of control and a terminal-first workflow.

## Comparison with VS Code

| | Neovim | VS Code |
| --- | --- | --- |
| Setup effort | High -- assemble LSP, completion, debugging yourself | Low -- install C# Dev Kit and go |
| Resource usage | Lightest of any option in this comparison | Light, but heavier than Neovim |
| Customization | Complete -- every piece is yours to configure | Substantial, via settings and extensions |
| Debugging | Possible via nvim-dap, more manual | Native, works out of the box |
| Best fit | Terminal-first developers wanting full control | Developers wanting a working setup with minimal configuration |

Neovim's advantage is total control and minimal resource footprint; VS Code's is a working .NET experience in minutes rather than hours -- the trade-off is genuinely about how much setup investment you're willing to make for that control.

## Frequently Asked Questions

### Is Neovim actually viable for professional .NET development, or is it mostly a novelty?

It's genuinely viable and used productively by real .NET developers, particularly those already comfortable in a terminal-first, keyboard-driven workflow. It requires substantially more setup than any GUI option in this comparison, so it fits a specific kind of developer rather than being a universal recommendation.

### Should I use csharp-ls or OmniSharp?

`csharp-ls` is lighter-weight and faster to set up; OmniSharp has a longer track record and broader feature coverage in some areas, at the cost of being heavier. Try `csharp-ls` first for a simpler setup, and move to OmniSharp if you hit a specific feature gap it doesn't cover.

### How do I get a debugger working for .NET in Neovim?

Install `netcoredbg` as the debug adapter, configure `nvim-dap` to use it (specifying the adapter command and a launch configuration), and add `nvim-dap-ui` for a usable visual debugging panel. This is the most setup-intensive piece of a Neovim .NET configuration, with no equivalent to a GUI IDE's out-of-the-box debugging.

### Can I use .editorconfig with Neovim the same way I would with Visual Studio or Rider?

Yes, via the `editorconfig-vim` plugin (or Neovim's growing native support in recent versions) -- this keeps formatting conventions consistent with teammates using any other editor in this comparison, since `.editorconfig` isn't tied to any specific tool.

### How much time should I budget for setting up a working .NET environment in Neovim?

Meaningfully more than any other editor here -- expect real, hands-on configuration time rather than an install-and-go experience. Budget for this honestly before committing, especially if you're doing it for the first time rather than reusing an existing configuration.

### Does Neovim support refactoring tools comparable to Rider's or Visual Studio's?

To a degree, depending on your language server's capabilities and any additional plugins you configure, but generally not to the same depth as Rider's ReSharper-powered refactoring engine. This is a real capability gap worth knowing about if deep, semantically-aware refactoring is central to your workflow.

### What's the most common mistake in a first Neovim .NET setup?

Trying to replicate every feature of a full IDE before writing any real code, losing momentum on configuration rather than getting to a minimal, working setup quickly and building from there. The second common mistake is skipping `nvim-dap-ui`, ending up with a functional but genuinely unpleasant debugging experience compared to what a small amount of additional configuration would provide.
