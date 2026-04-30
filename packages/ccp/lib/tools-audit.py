#!/usr/bin/env python3
"""tools-audit — break down the token cost of tool definitions in a capture.

Takes a captured /v1/messages request body (the JSON output of
capture-active-prompt.sh) and reports which tools are eating the most input
tokens. Useful for answering "where is my context window actually going?"
and for showing the impact of ENABLE_TOOL_SEARCH.

What it shows
  1. Total: tool count, schema bytes, approximate tokens
  2. Per-tool table: name, schema bytes, ~tokens, share of total, sorted desc
  3. Tool-search detection: whether the capture has the discovery tool
     installed, which means the rest of the surface is loaded on demand.

Usage
  tools-audit request.json
  tools-audit -n 20 request.json     # show top 20 only (default 30)
  tools-audit --json request.json    # emit machine-readable JSON
  tools-audit -o audit.md request.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


CHARS_PER_TOKEN = 4  # rough heuristic for relative comparison


def schema_bytes(tool: dict[str, Any]) -> int:
    """Return the size of the tool definition as it ships in the API request.
    Includes name, description, and input_schema. Closely matches what the
    model sees in its prompt for tool calling."""
    return len(json.dumps(tool, ensure_ascii=False, separators=(",", ":")))


def is_tool_search(tool: dict[str, Any]) -> bool:
    """True if this tool is the server-side tool-search / discovery tool that
    enables deferred loading of other tool schemas."""
    name = (tool.get("name") or "").lower()
    typ  = (tool.get("type") or "").lower()
    return ("toolsearch" in name) or ("tool_search" in typ) or ("toolsearchtool" in typ)


def fmt_table(rows: list[list[str]]) -> str:
    if not rows:
        return ""
    widths = [max(len(r[i]) for r in rows) for i in range(len(rows[0]))]
    out: list[str] = []
    for i, r in enumerate(rows):
        out.append("  ".join(c.ljust(widths[j]) for j, c in enumerate(r)).rstrip())
        if i == 0:
            out.append("  ".join("-" * w for w in widths))
    return "\n".join(out)


def render_text(body: dict[str, Any], top_n: int) -> str:
    tools = body.get("tools") or []
    if not isinstance(tools, list):
        return "tools field is not a list; nothing to audit\n"

    sized = [(t, schema_bytes(t)) for t in tools if isinstance(t, dict)]
    total = sum(b for _, b in sized) or 1
    sized.sort(key=lambda x: x[1], reverse=True)

    has_search = any(is_tool_search(t) for t, _ in sized)
    sys_field = body.get("system")
    sys_chars = (
        sum(len(b.get("text", "")) for b in sys_field if isinstance(b, dict))
        if isinstance(sys_field, list)
        else (len(sys_field) if isinstance(sys_field, str) else 0)
    )

    lines: list[str] = []
    lines.append("# tools-audit\n")
    lines.append("## Totals\n")
    lines.append("```")
    lines.append(fmt_table([
        ["metric",                "value"],
        ["model",                 str(body.get("model", "—"))],
        ["tools shipped upfront", f"{len(sized):,}"],
        ["schema bytes",          f"{total:,}"],
        ["schema ~tokens",        f"{total // CHARS_PER_TOKEN:,}"],
        ["system chars",          f"{sys_chars:,}"],
        ["system ~tokens",        f"{sys_chars // CHARS_PER_TOKEN:,}"],
        ["combined ~tokens",      f"{(total + sys_chars) // CHARS_PER_TOKEN:,}"],
        ["tool-search active",    "yes" if has_search else "no"],
    ]))
    lines.append("```\n")

    if has_search:
        lines.append(
            "ENABLE_TOOL_SEARCH appears active: the discovery tool is shipped "
            "upfront and the rest of the surface is loaded on demand. Tools "
            "below show only the upfront set.\n"
        )
    else:
        lines.append(
            "All tools shipped upfront. Set `ENABLE_TOOL_SEARCH=true` (or "
            "`auto`) to defer MCP tool schemas and reduce input tokens.\n"
        )

    lines.append(f"## Top {min(top_n, len(sized))} tools by schema cost\n")
    rows: list[list[str]] = [["#", "tool", "bytes", "~tokens", "share"]]
    for i, (t, b) in enumerate(sized[:top_n], 1):
        rows.append([
            str(i),
            (t.get("name") or t.get("type") or "?")[:60],
            f"{b:,}",
            f"{b // CHARS_PER_TOKEN:,}",
            f"{100 * b / total:5.1f}%",
        ])
    lines.append("```")
    lines.append(fmt_table(rows))
    lines.append("```")

    if len(sized) > top_n:
        rest_bytes = sum(b for _, b in sized[top_n:])
        lines.append("")
        lines.append(
            f"_+{len(sized) - top_n} more tools, {rest_bytes:,} bytes "
            f"(~{rest_bytes // CHARS_PER_TOKEN:,} tokens) not shown_"
        )

    return "\n".join(lines) + "\n"


def render_json(body: dict[str, Any]) -> str:
    tools = body.get("tools") or []
    sized = [(t, schema_bytes(t)) for t in tools if isinstance(t, dict)]
    total = sum(b for _, b in sized)
    out = {
        "model": body.get("model"),
        "total_tools": len(sized),
        "total_schema_bytes": total,
        "approx_total_tokens": total // CHARS_PER_TOKEN,
        "tool_search_active": any(is_tool_search(t) for t, _ in sized),
        "tools": [
            {
                "name":  t.get("name") or t.get("type"),
                "bytes": b,
                "approx_tokens": b // CHARS_PER_TOKEN,
                "share":  round(b / total, 4) if total else 0.0,
            }
            for t, b in sorted(sized, key=lambda x: x[1], reverse=True)
        ],
    }
    return json.dumps(out, indent=2, ensure_ascii=False) + "\n"


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0])
    p.add_argument("input", type=Path, help="captured request body JSON")
    p.add_argument("-n", "--top", type=int, default=30, help="number of top tools to show (default 30)")
    p.add_argument("--json", action="store_true", help="emit machine-readable JSON instead of markdown")
    p.add_argument("-o", "--output", type=Path, help="write report to file instead of stdout")
    args = p.parse_args()

    if not args.input.is_file():
        print(f"tools-audit: {args.input} not found", file=sys.stderr)
        return 1

    try:
        body = json.loads(args.input.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"tools-audit: failed to parse {args.input}: {e}", file=sys.stderr)
        return 1

    report = render_json(body) if args.json else render_text(body, args.top)

    if args.output:
        args.output.write_text(report, encoding="utf-8")
        print(f"tools-audit: wrote {args.output} ({len(report):,} chars)", file=sys.stderr)
    else:
        sys.stdout.write(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
