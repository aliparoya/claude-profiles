#!/usr/bin/env python3
"""prompt-diff — compare two captured Claude Code request bodies.

Inputs are two JSON files produced by capture-active-prompt.sh (or any tool
that captures the same /v1/messages POST shape: an object with `system`,
`tools`, `model`, etc.). For convenience, raw text files of just the system
prompt also work — diff'ing the system text section only.

What it shows
  1. Per-field summary table (system chars, tool count, model, total bytes)
  2. Tool list diff (added in B, removed from A, in both)
  3. System prompt unified diff, optionally section-aware

Usage
  prompt-diff A.json B.json
  prompt-diff --label-a baseline --label-b active baseline.json active.json
  prompt-diff baseline.txt active.txt        # text-only diff
  prompt-diff --no-text A.json B.json        # skip the text diff (summary only)
  prompt-diff -o report.md A.json B.json     # write to file instead of stdout
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
from pathlib import Path
from typing import Any


def load(path: Path) -> tuple[dict[str, Any] | None, str]:
    """Return (parsed_body_or_None, system_text). For .json the body is parsed
    and system text extracted; for .txt the body is None and the file is
    treated as system text."""
    raw = path.read_text(encoding="utf-8", errors="replace")
    try:
        body = json.loads(raw)
    except json.JSONDecodeError:
        return None, raw
    sysf = body.get("system")
    if isinstance(sysf, str):
        text = sysf
    elif isinstance(sysf, list):
        text = "\n\n".join(b.get("text", "") if isinstance(b, dict) else str(b) for b in sysf)
    else:
        text = ""
    return body, text


def tool_names(body: dict[str, Any] | None) -> list[str]:
    if not body:
        return []
    return [t.get("name", t.get("type", "?")) for t in body.get("tools", []) if isinstance(t, dict)]


def fmt_table(rows: list[tuple[str, str, str, str]]) -> str:
    widths = [max(len(r[i]) for r in rows) for i in range(4)]
    lines = []
    for i, r in enumerate(rows):
        cells = [r[j].ljust(widths[j]) for j in range(4)]
        lines.append("  ".join(cells).rstrip())
        if i == 0:
            lines.append("  ".join("-" * widths[j] for j in range(4)))
    return "\n".join(lines)


def section_split(text: str) -> list[tuple[str, str]]:
    """Split a system prompt into (heading, body) pairs based on '#' headings."""
    sections: list[tuple[str, list[str]]] = [("(preamble)", [])]
    for line in text.splitlines():
        if re.match(r"^#{1,3}\s+", line):
            sections.append((line.strip(), []))
        else:
            sections[-1][1].append(line)
    return [(h, "\n".join(b).strip()) for h, b in sections]


def render(args: argparse.Namespace, out: list[str]) -> None:
    a_body, a_text = load(args.a)
    b_body, b_text = load(args.b)

    label_a = args.label_a or args.a.name
    label_b = args.label_b or args.b.name
    a_size = args.a.stat().st_size
    b_size = args.b.stat().st_size

    a_tools = tool_names(a_body)
    b_tools = tool_names(b_body)
    a_model = (a_body or {}).get("model", "—")
    b_model = (b_body or {}).get("model", "—")

    out.append(f"# prompt-diff: {label_a} vs {label_b}\n")
    out.append("## Summary\n")
    rows = [
        ("metric",            label_a,                    label_b,                     "delta"),
        ("file size (bytes)", f"{a_size:,}",              f"{b_size:,}",               f"{b_size - a_size:+,}"),
        ("model",             str(a_model),               str(b_model),                "—" if a_model == b_model else "changed"),
        ("system chars",      f"{len(a_text):,}",         f"{len(b_text):,}",          f"{len(b_text) - len(a_text):+,}"),
        ("system ~tokens",    f"{len(a_text)//4:,}",      f"{len(b_text)//4:,}",       f"{(len(b_text) - len(a_text))//4:+,}"),
        ("tool count",        f"{len(a_tools)}",          f"{len(b_tools)}",           f"{len(b_tools) - len(a_tools):+d}"),
    ]
    out.append("```")
    out.append(fmt_table(rows))
    out.append("```\n")
    out.append("Token estimates are 4 chars/token, accurate to ~10% for relative comparison.\n")

    if a_body or b_body:
        out.append("## Tools\n")
        only_a = sorted(set(a_tools) - set(b_tools))
        only_b = sorted(set(b_tools) - set(a_tools))
        both = sorted(set(a_tools) & set(b_tools))
        out.append(f"- only in `{label_a}`: " + (", ".join(f"`{t}`" for t in only_a) if only_a else "_(none)_"))
        out.append(f"- only in `{label_b}`: " + (", ".join(f"`{t}`" for t in only_b) if only_b else "_(none)_"))
        out.append(f"- in both ({len(both)}): " + (", ".join(f"`{t}`" for t in both) if both else "_(none)_"))
        out.append("")

    if args.no_text:
        return

    out.append("## System prompt diff\n")
    a_sects = {h: b for h, b in section_split(a_text)}
    b_sects = {h: b for h, b in section_split(b_text)}
    headings = list(dict.fromkeys(list(a_sects.keys()) + list(b_sects.keys())))

    if len(headings) > 1:
        rows = [("section", "A chars", "B chars", "delta")]
        for h in headings:
            ac, bc = len(a_sects.get(h, "")), len(b_sects.get(h, ""))
            rows.append((h[:60], f"{ac:,}", f"{bc:,}", f"{bc - ac:+,}"))
        out.append("### Section sizes\n")
        out.append("```")
        out.append(fmt_table(rows))
        out.append("```\n")

    out.append("### Unified diff\n")
    diff = difflib.unified_diff(
        a_text.splitlines(keepends=False),
        b_text.splitlines(keepends=False),
        fromfile=label_a,
        tofile=label_b,
        n=2,
        lineterm="",
    )
    diff_text = "\n".join(diff)
    if diff_text.strip():
        out.append("```diff")
        out.append(diff_text)
        out.append("```")
    else:
        out.append("_(system prompts are identical)_")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.strip().splitlines()[0])
    p.add_argument("a", type=Path, help="first capture (.json or .txt)")
    p.add_argument("b", type=Path, help="second capture (.json or .txt)")
    p.add_argument("--label-a", help="display label for first input")
    p.add_argument("--label-b", help="display label for second input")
    p.add_argument("--no-text", action="store_true", help="skip the system-prompt unified diff")
    p.add_argument("-o", "--output", type=Path, help="write report to file instead of stdout")
    args = p.parse_args()

    for path in (args.a, args.b):
        if not path.is_file():
            print(f"prompt-diff: {path} not found", file=sys.stderr)
            return 1

    out: list[str] = []
    render(args, out)
    report = "\n".join(out) + "\n"

    if args.output:
        args.output.write_text(report, encoding="utf-8")
        print(f"prompt-diff: wrote {args.output} ({len(report):,} chars)", file=sys.stderr)
    else:
        sys.stdout.write(report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
