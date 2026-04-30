#!/usr/bin/env bash
# ccp — Claude Code launcher with profile support.
#
# Reads a named profile (a single Markdown file with frontmatter), maps the
# fields onto claude's CLI flags, exports any env vars the profile declares,
# then exec's `claude`. The first positional arg, if it matches a profile
# name, is consumed as the profile selector; everything else is forwarded
# to claude as-is.
#
# Single account
#   ccp                          default profile
#   ccp max                      named profile
#   ccp fast -- -p "summarize"   anything after `--` is passed to claude
#   ccp list                     show profiles + descriptions
#
# Multiple AWS SSO profiles
#   The launcher itself doesn't manage AWS auth; it just inherits whatever's
#   in the environment. Wrap it however you'd normally wrap a Bedrock CLI:
#
#     alias ccp-prod='AWS_PROFILE=anvil-prod ccp'
#     alias ccp-dev='AWS_PROFILE=anvil-dev  ccp'
#
#   Or use aws-vault, aws-sso-cli, granted, etc.:
#
#     alias ccp-prod='aws-vault exec anvil-prod -- ccp'
#
# Conventions (override via env)
#   PROFILES_DIR    where profiles live          (default: ~/.claude-shared/profiles)
#   MCP_CONFIG      shared MCP config (optional) (default: ~/.claude-shared/mcp.json)
#   CLAUDE_CONFIG_DIR  per-config state          (default: claude's own default, ~/.claude)
#
# The profile file is YAML-frontmatter + Markdown body:
#
#   ---
#   description: One-line summary shown in `ccp list`.
#   model: claude-sonnet-4-7              # optional
#   system_prompt_file: ~/.claude-shared/baseline-prompt.txt  # optional
#   env:
#     CLAUDE_CODE_EFFORT_LEVEL: max
#   ---
#
#   Free-form markdown body. Sent as `--append-system-prompt`.

set -euo pipefail

PROFILES_DIR="${PROFILES_DIR:-$HOME/.claude-shared/profiles}"
MCP_CONFIG="${MCP_CONFIG:-$HOME/.claude-shared/mcp.json}"

list_profiles() {
    if [[ ! -d "$PROFILES_DIR" ]]; then
        echo "ccp: no profiles dir at $PROFILES_DIR" >&2
        exit 1
    fi
    printf "Available profiles (%s):\n" "$PROFILES_DIR"
    for p in "$PROFILES_DIR"/*.md; do
        [[ -f "$p" ]] || continue
        name=$(basename "$p" .md)
        desc=$(awk '/^description:/{sub(/^description:[[:space:]]*/,""); print; exit}' "$p")
        printf "  %-12s  %s\n" "$name" "$desc"
    done
}

if [[ "${1:-}" == "list" ]]; then list_profiles; exit 0; fi
if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then sed -n '2,40p' "$0"; exit 0; fi

# Resolve profile. The first arg is treated as a profile selector ONLY if it
# looks like a bare lowercase identifier AND a matching profile file exists.
# Anything else (a quoted prompt, a flag) passes through to claude untouched.
profile="default"
if [[ $# -ge 1 && "$1" =~ ^[a-z][a-z0-9_-]*$ ]]; then
    if [[ -f "$PROFILES_DIR/${1}.md" ]]; then
        profile="$1"
        shift
    else
        echo "ccp: profile '$1' not found in $PROFILES_DIR" >&2
        echo "    run 'ccp list' to see available profiles." >&2
        exit 2
    fi
fi

profile_file="$PROFILES_DIR/$profile.md"
if [[ ! -f "$profile_file" ]]; then
    echo "ccp: default profile '$profile.md' missing in $PROFILES_DIR" >&2
    exit 1
fi

# Parse frontmatter + body. The format is strictly:
#   ---
#   key: value (top-level scalars)
#   env:
#     KEY: value (2-space indent under env:)
#   ---
#   markdown body
fm=$(awk '/^---[[:space:]]*$/{fm++; next} fm==1' "$profile_file")
body=$(awk '/^---[[:space:]]*$/{fm++; next} fm>=2' "$profile_file")

CC_MODEL=""
CC_SYSTEM_PROMPT_FILE=""
while IFS= read -r line; do
    [[ "$line" =~ ^([a-z][a-z_]*):[[:space:]]*(.*)$ ]] || continue
    k="${BASH_REMATCH[1]}"; v="${BASH_REMATCH[2]}"
    v="${v#\"}"; v="${v%\"}"; v="${v#\'}"; v="${v%\'}"
    v="${v/#\~/$HOME}"
    case "$k" in
        model)              CC_MODEL="$v" ;;
        system_prompt_file) CC_SYSTEM_PROMPT_FILE="$v" ;;
    esac
done <<<"$fm"

# Export env block entries
while IFS= read -r line; do
    [[ "$line" =~ ^\ \ ([A-Z_][A-Z0-9_]*):[[:space:]]*(.*)$ ]] || continue
    k="${BASH_REMATCH[1]}"; v="${BASH_REMATCH[2]}"
    v="${v#\"}"; v="${v%\"}"; v="${v#\'}"; v="${v%\'}"
    export "$k=$v"
done < <(awk '/^env:/{in_env=1; next} /^[^[:space:]]/{in_env=0} in_env' <<<"$fm")

export CLAUDE_PROFILE="$profile"

# An ANTHROPIC_API_KEY in the shell takes precedence over Bedrock auth in
# Claude Code. Unset for this launch only so the configured Bedrock path
# (AWS creds + CLAUDE_CODE_USE_BEDROCK=1) is used.
unset ANTHROPIC_API_KEY

args=(--dangerously-skip-permissions)
[[ -f "$MCP_CONFIG" ]] && args+=(--mcp-config "$MCP_CONFIG")

# system_prompt_file = base prompt; profile body = appended on top.
if [[ -n "$CC_SYSTEM_PROMPT_FILE" ]]; then
    if [[ -f "$CC_SYSTEM_PROMPT_FILE" ]]; then
        args+=(--system-prompt-file "$CC_SYSTEM_PROMPT_FILE")
    else
        echo "ccp: system_prompt_file '$CC_SYSTEM_PROMPT_FILE' not found" >&2
        exit 2
    fi
fi
if [[ -n "$body" ]] && [[ "$body" =~ [^[:space:]] ]]; then
    args+=(--append-system-prompt "$body")
fi
[[ -n "$CC_MODEL" ]] && args+=(--model "$CC_MODEL")

exec claude "${args[@]}" "$@"
