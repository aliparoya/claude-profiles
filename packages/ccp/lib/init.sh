#!/usr/bin/env bash
# ccp init — bootstrap a profile system at ~/.claude-shared (or --to <dir>).
#
# Copies the packaged templates (profiles, settings.json, mcp.json example),
# captures the baseline system prompt for this machine, and prints next-step
# guidance. Re-running with --force overwrites existing files.

set -euo pipefail

TARGET="$HOME/.claude-shared"
TEMPLATES=""
FORCE=0
SKIP_BASELINE=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        --templates)     TEMPLATES="${2:?}";    shift 2 ;;
        --to)            TARGET="${2:?}";       shift 2 ;;
        --force)         FORCE=1;               shift   ;;
        --skip-baseline) SKIP_BASELINE=1;       shift   ;;
        -h|--help)
            cat <<EOF
Usage: ccp init [--to DIR] [--force] [--skip-baseline]

Options:
  --to DIR          install to DIR instead of ~/.claude-shared
  --force           overwrite existing files
  --skip-baseline   don't run extract-baseline (skip the ~30s prompt capture)
EOF
            exit 0
            ;;
        *) echo "ccp init: unknown arg: $1" >&2; exit 2 ;;
    esac
done

if [[ -z "$TEMPLATES" ]]; then
    echo "ccp init: --templates required (set automatically when invoked via the ccp wrapper)" >&2
    exit 2
fi

if [[ ! -d "$TEMPLATES" ]]; then
    echo "ccp init: template dir not found at $TEMPLATES" >&2
    exit 1
fi

# Pre-check: if target exists and we're not forcing, bail before touching anything.
if [[ -e "$TARGET" && "$FORCE" -eq 0 ]]; then
    if [[ -d "$TARGET" ]] && [[ -z "$(ls -A "$TARGET" 2>/dev/null)" ]]; then
        :  # empty dir is fine, fall through
    else
        echo "ccp init: $TARGET already exists with content."
        echo "  pass --force to overwrite, or --to <dir> for a different location."
        exit 1
    fi
fi

mkdir -p "$TARGET/profiles"

# Copy profile templates
for src in "$TEMPLATES/profiles/"*.md; do
    [[ -f "$src" ]] || continue
    dst="$TARGET/profiles/$(basename "$src")"
    if [[ -e "$dst" && "$FORCE" -eq 0 ]]; then
        echo "  skip $dst (exists; --force to overwrite)"
    else
        cp "$src" "$dst"
        echo "  wrote $dst"
    fi
done

# Copy settings.json
if [[ -e "$TARGET/settings.json" && "$FORCE" -eq 0 ]]; then
    echo "  skip $TARGET/settings.json (exists; --force to overwrite)"
else
    cp "$TEMPLATES/settings.json" "$TARGET/settings.json"
    echo "  wrote $TARGET/settings.json"
fi

# Copy mcp.json from .example only if it doesn't exist (don't clobber user's MCP config on --force)
if [[ ! -e "$TARGET/mcp.json" ]]; then
    cp "$TEMPLATES/mcp.json.example" "$TARGET/mcp.json"
    echo "  wrote $TARGET/mcp.json (copied from mcp.json.example; safe to edit)"
else
    echo "  keep $TARGET/mcp.json (already exists; never overwritten)"
fi

# Capture baseline prompt for this machine
if [[ "$SKIP_BASELINE" -eq 1 ]]; then
    echo "  skip baseline-prompt.txt (--skip-baseline)"
elif command -v claude >/dev/null && command -v python3 >/dev/null; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    echo "  capturing baseline prompt for this machine (~30s)..."
    if "$SCRIPT_DIR/extract-baseline.sh" -o "$TARGET/baseline-prompt.txt" 2>/dev/null; then
        SIZE="$(wc -c < "$TARGET/baseline-prompt.txt")"
        echo "  wrote $TARGET/baseline-prompt.txt ($SIZE bytes)"
    else
        echo "  warning: baseline capture failed. Run 'ccp extract-baseline -o $TARGET/baseline-prompt.txt' manually after fixing claude / python3 / AWS credentials." >&2
    fi
else
    echo "  warning: 'claude' or 'python3' not on PATH. Skipping baseline capture." >&2
    echo "  install claude code, then run 'ccp extract-baseline -o $TARGET/baseline-prompt.txt'" >&2
fi

cat <<EOF

ccp init: done. Profile system installed at $TARGET

Next steps
  1. Make sure 'claude' (Claude Code CLI) is on your PATH.
  2. For Bedrock: ensure AWS credentials are configured.
       export AWS_REGION=us-west-2
       aws sso login --profile <your-profile>
  3. (Optional) If you installed to a non-default location, point ccp at it:
       export PROFILES_DIR=$TARGET/profiles
       export MCP_CONFIG=$TARGET/mcp.json
  4. Try it out:
       ccp list                  # see available profiles
       ccp max                   # launch with the max profile
       ccp cody -- -p "hi"       # launch and pass a prompt

Multiple AWS profiles: wrap ccp with aliases in your shell rc:
  alias ccp-prod='AWS_PROFILE=anvil-prod ccp'
  alias ccp-dev='AWS_PROFILE=anvil-dev  ccp'
EOF
