# Hero images are a manual ChatGPT handoff, not an automated/API integration

## Date
2026-07-12

## Context
Post hero images are generated from a prompt (`image_prompt` front matter) using an AI image model. The question: can this be automated from inside a Claude Code session working on this repo?

Two approaches were tried and both failed the same way:
1. Direct `curl` to `api.openai.com` - `403`, proxy-level policy denial (`gateway answered 403 to CONNECT`).
2. Installing and registering an MCP server (`openai-gpt-image-mcp`) with the user's own OpenAI API key - once properly connected (required a session reconnect to load the new tool), calling `create-image` returned `403 Host not in allowlist: api.openai.com` - same underlying network policy, just a cleaner error message.

## Decision
Image generation happens outside the Claude Code session entirely. The maintainer runs the `image_prompt` text through ChatGPT manually and sends the resulting image back into the session. Claude's job starts *after* that: convert to the standard asset set (`.png` source, full-size `.webp`, `-400w`/`-600w`/`-800w` responsive variants at quality 95) and wire up the post's `image` front-matter field.

The MCP server was removed after confirming it couldn't work (`claude mcp remove openai-gpt-image`) rather than left registered and unusable.

## Rationale
The blocker is this environment's egress allowlist, not the MCP integration itself - the MCP server would work identically to a direct API call if `api.openai.com` were allowlisted. There was no remaining technical path to try; per this environment's proxy documentation, a `403` policy denial should be reported, not retried or routed around.

## Consequences
- Every new post needs an explicit reminder to the maintainer when it's ready for a hero image - now codified in `CLAUDE.md` so future sessions don't have to rediscover this.
- Posts can ship, build, and even go live without a hero image - `post.njk`/`index.njk` both have a gradient fallback for exactly this case.
- If this environment's network policy ever allowlists `api.openai.com`, the MCP path is fully validated and ready to re-enable (setup steps recorded in this session's history, not duplicated here since they'd need to be re-verified against the policy change anyway).

## Related
- `CLAUDE.md` "Hero images" note
- `docs/patterns/blog-post-authoring.md`
