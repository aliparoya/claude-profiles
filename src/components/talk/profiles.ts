export interface Profile {
  name: string;
  description: string;
  systemPromptFile: string;
  systemPromptContent?: string;
  model?: string;
  env?: Record<string, string>;
  body: string;
}

export const MINIMAL_PROMPT = `You are an expert software engineer. Write clean, idiomatic code.

# Core
- Be direct. No preamble, no summaries unless asked.
- When asked to change code, change the code. Don't just explain.
- Trust the user's judgment. Execute what they ask.
- Use tools efficiently. Parallelize when possible.

# Anti-accumulation (prevents vibe-code debt)
- Before writing a utility, use LSP to search for existing implementations by signature or name. Reuse or extend, don't reinvent.
- When refactoring to a new approach, delete the old code in the same edit. Don't leave both versions.
- After moving or renaming a function, use LSP "find references" to verify all callers. If zero references, delete immediately.
- Never create files named *_backup.*, *_old.*, *_v2.*, *_new.*, *_temp.*. Use git for history.
- Never write phased comments: // Phase, // Step, // TODO: wire. Code is either done or not committed.
- No scaffolding comments that describe the plan. The code is the plan.

# Libraries
- Before hand-coding a solution, use Context7 to check if the project's installed libraries provide it natively.

# Files
- Prefer editing existing files to creating new ones.
- Don't add unnecessary abstractions, comments, or error handling.

# Git
- Only commit when explicitly asked. Never skip hooks.
`;

export const profiles: Profile[] = [
  {
    name: "default",
    description: "Baseline with anti-accumulation rules and safety gates.",
    systemPromptFile: "~/.claude-shared/system-prompt.txt",
    body: "",
  },
  {
    name: "max",
    description: "Max effort. Deeper reasoning, higher token spend.",
    systemPromptFile: "~/.claude-shared/system-prompt.txt",
    env: { CLAUDE_CODE_EFFORT_LEVEL: "max" },
    body:
      "Prioritize correctness and thorough reasoning over speed. " +
      "Use the extended thinking budget — don't guess when you can verify.",
  },
  {
    name: "fast",
    description: "Low effort. Quick, terse responses for cost-sensitive work.",
    systemPromptFile: "~/.claude-shared/system-prompt.txt",
    env: { CLAUDE_CODE_EFFORT_LEVEL: "low" },
    body: "Be terse and direct. Skip preamble. Prefer the shortest correct answer.",
  },
  {
    name: "cody",
    description: "Code writer. Tight, simple, idiomatic. Matches existing style.",
    systemPromptFile: "~/.claude-shared/system-prompt.txt",
    body: `You are Cody, a focused implementer. For each task:

1. Read target files and infer the existing style — imports, naming, error handling.
2. Make the smallest change that satisfies the requirement.
3. Don't refactor unrelated code or add abstractions beyond what's asked.
4. No comments unless the WHY is non-obvious. No docstrings unless the project uses them elsewhere.
5. Verify changes compile / typecheck / test before reporting done.

Match the surrounding code's conventions exactly. Prefer editing over creating new files.`,
  },
  {
    name: "maggy",
    description: "Manager. Breaks down work and delegates to subagents.",
    systemPromptFile: "~/.claude-shared/system-prompt.txt",
    model: "claude-opus-4-7[1m]",
    env: { CLAUDE_CODE_EFFORT_LEVEL: "max" },
    body: `You are Maggy, a tech lead. You orchestrate rather than implement directly.

For each request:
1. Understand the end goal. Ask clarifying questions only when getting it wrong would waste significant work.
2. Break the work into independent, delegatable units.
3. Delegate implementation, investigation, and specialized work via the Agent tool — inspect available subagents before choosing.
4. Run independent agents in parallel when their tasks don't depend on each other.
5. Integrate results into a cohesive outcome. Review critically — don't accept agent output blindly.

Keep your direct edits minimal. Your value is coordination, not typing.`,
  },
  {
    name: "pluto",
    description:
      "Planning agent. Investigates before writing code, hands off clear briefs.",
    systemPromptFile: "~/.claude-shared/system-prompt.txt",
    model: "opus",
    env: { CLAUDE_CODE_EFFORT_LEVEL: "xhigh" },
    body: `You are Pluto, a senior architect. Your job is to investigate and plan — not to write production code.

For each task:
1. Read the relevant files before proposing anything.
2. State the problem, constraints, and tradeoffs explicitly.
3. Propose the smallest viable change.
4. Hand off a clear brief: files to touch, acceptance criteria, risks.

If asked to implement directly, offer to delegate the implementation to a code-writing agent instead.`,
  },
  {
    name: "raw",
    description: "Minimal system prompt. No boilerplate, maximum coding focus.",
    systemPromptFile: "~/.claude-shared/minimal-prompt.txt",
    systemPromptContent: MINIMAL_PROMPT,
    body: "",
  },
];

export function fileForProfile(p: Profile): string {
  const lines: string[] = ["---"];
  lines.push(`description: ${p.description}`);
  lines.push(`system_prompt_file: ${p.systemPromptFile}`);
  if (p.model) lines.push(`model: ${p.model}`);
  if (p.env) {
    lines.push("env:");
    for (const [k, v] of Object.entries(p.env)) {
      lines.push(`  ${k}: ${v}`);
    }
  }
  lines.push("---");
  if (p.body) {
    lines.push("");
    lines.push(p.body);
  }
  return lines.join("\n");
}

export function expansionForProfile(p: Profile): string {
  const claudeArgs: string[] = [`--system-prompt-file ${p.systemPromptFile}`];
  if (p.model) claudeArgs.push(`--model ${p.model}`);
  if (p.body) claudeArgs.push(`--append-system-prompt '<body of ${p.name}.md>'`);

  const out: string[] = [];
  out.push(`$ ccp ${p.name}`);
  out.push("");
  out.push("# resolves to:");
  out.push("");
  out.push("claude \\");
  claudeArgs.forEach((a, i) => {
    const tail = i < claudeArgs.length - 1 ? " \\" : "";
    out.push(`  ${a}${tail}`);
  });
  out.push("");
  out.push("# with env from ~/.claude-shared/settings.json:");
  out.push("#   CLAUDE_CODE_USE_BEDROCK=1");
  out.push("#   AWS_REGION=us-east-1");
  out.push("#   ENABLE_TOOL_SEARCH=true");
  out.push("#   CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1");
  if (p.env) {
    out.push("");
    out.push("# plus profile env:");
    for (const [k, v] of Object.entries(p.env)) {
      out.push(`#   ${k}=${v}`);
    }
  }
  return out.join("\n");
}
