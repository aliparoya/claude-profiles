const humanize = (tag: string): string =>
  tag
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function normalizePrompt(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  const stack: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const open = trimmed.match(/^<([a-z_][a-z0-9_]*)>$/i);
    const close = trimmed.match(/^<\/([a-z_][a-z0-9_]*)>$/i);

    if (open) {
      const tag = open[1];
      stack.push(tag);
      if (stack.length === 1) {
        continue;
      }
      const level = Math.min(stack.length, 4);
      out.push("");
      out.push(`${"#".repeat(level)} ${humanize(tag)}`);
      out.push("");
      continue;
    }

    if (close) {
      const idx = stack.lastIndexOf(close[1]);
      if (idx >= 0) stack.splice(idx, 1);
      continue;
    }

    out.push(line.replace(/[ \t]+$/, ""));
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "\n");
}
