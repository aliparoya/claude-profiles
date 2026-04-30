# ccp

Profile-based launcher for [Claude Code](https://docs.claude.com/en/docs/claude-code), with starter profiles, a baseline system-prompt extractor, and tools for auditing what your sessions actually send over the wire.

Designed for Claude Code on AWS Bedrock, but works just as well against the Anthropic API. Single account or multiple AWS SSO profiles, no special handling required.

## Install

```bash
npm install -g @your-org/ccp
ccp init
```

> **Package name is a placeholder.** Replace `@your-org/ccp` in `package.json`, this README, and your install commands with the npm name you publish under.

`ccp init` copies starter profiles, a `settings.json`, and an `mcp.json` skeleton to `~/.claude-shared/`, then captures a per-machine baseline of the system prompt Claude Code ships with.

```bash
ccp init --to ~/.config/ccp     # custom location
ccp init --force                # overwrite existing files
ccp init --skip-baseline        # don't run the prompt capture during init
```

After init, make sure `claude` is on your PATH and your AWS credentials are configured for Bedrock (`AWS_REGION`, `aws sso login --profile <name>`, etc).

## Use

```bash
ccp                              # default profile
ccp max                          # max-effort profile
ccp cody                         # focused implementer profile
ccp fast -- -p "summarize"       # anything after `--` is forwarded to claude
ccp list                         # show profiles + descriptions
```

The first positional arg, if it matches a profile name, is consumed as the profile selector. Anything else (a quoted prompt, a flag) passes through to claude untouched.

### Multiple AWS SSO profiles

`ccp` doesn't manage AWS auth. Wrap it with shell aliases or your favourite credential helper:

```bash
# plain aliases
alias ccp-prod='AWS_PROFILE=anvil-prod ccp'
alias ccp-dev='AWS_PROFILE=anvil-dev  ccp'

# aws-vault / granted / aws-sso-cli
alias ccp-prod='aws-vault exec anvil-prod -- ccp'
```

## Subcommands

|command|what it does|
|-|-|
|`ccp`|run the default profile|
|`ccp <profile>`|run a named profile|
|`ccp list`|list profiles and descriptions|
|`ccp init`|bootstrap `~/.claude-shared` from packaged templates|
|`ccp extract-baseline -o <file>`|capture the baseline system prompt for this machine (no plugins, MCP, or user CLAUDE.md)|
|`ccp capture-active -o <file>`|capture the full request body Claude Code sends with your real config|
|`ccp prompt-diff A B`|compare two captures (token deltas, tool list, system prompt diff)|
|`ccp tools-audit <file>`|break down per-tool token cost in a captured request body|

## Profile file format

A profile is `~/.claude-shared/profiles/<name>.md`:

```markdown
---
description: One-line summary shown in `ccp list`.
model: claude-sonnet-4-7
system_prompt_file: ~/.claude-shared/baseline-prompt.txt
env:
  CLAUDE_CODE_EFFORT_LEVEL: max
---

Free-form markdown body. Sent as `--append-system-prompt`, layered on top of
the base system prompt above.
```

The launcher maps frontmatter to claude flags:

|key|claude flag|
|-|-|
|`model`|`--model`|
|`system_prompt_file`|`--system-prompt-file`|
|body (after the second `---`)|`--append-system-prompt`|
|`env:` block|exported into the process before exec|

## Configuration

Override these via env if you don't want the defaults under `~/.claude-shared/`:

|env var|default|purpose|
|-|-|-|
|`PROFILES_DIR`|`~/.claude-shared/profiles`|where profile files live|
|`MCP_CONFIG`|`~/.claude-shared/mcp.json`|shared MCP config (only used if file exists)|
|`CLAUDE_CONFIG_DIR`|claude's own default|per-config state|

## Requirements

- bash (macOS, Linux, or Windows under WSL)
- python3 (only for the `prompt-diff` and `tools-audit` subcommands)
- [Claude Code](https://docs.claude.com/en/docs/claude-code) on PATH
- AWS credentials if using Bedrock

## License

MIT
