# Claude Profiles

Documentation hub for opinionated profile management for Claude Code: shell-alias driven contexts that replace the system prompt instead of layering on top of it, with deferred tool loading. The site exists to argue the case (against plugin and skill sprawl) and to show the setup. Audience is engineers ramping up on AI usage who need to understand the harness before installing more of it.

All documentation is held to the `/humanizer` skill standards: no AI-flavoured prose, no em dashes ever. The full voice and tone reference lives in `docs/style-guide/writing.mdx`.

## What this repo is

- **Docusaurus 3** site (classic preset, TypeScript config).
- Authored content lives in `docs/` (MDX) and `blog/` (dated MDX posts).
- Navigation is in `sidebars.ts`; site metadata in `docusaurus.config.ts`.
- Custom React pages go in `src/pages/`; static assets in `static/`.
- MUI is already wired up. `src/theme/Root.tsx` provides a `ThemeProvider` to every page so you can drop MUI components straight into MDX. The theme overrides live in `src/theme/mui/`.
- Deploys as a static site (target: GitHub Pages, private repo, or any static host).

## Docusaurus in one paragraph

Markdown and MDX files in `docs/` become routed pages. The sidebar is auto-generated from the folder structure unless `sidebars.ts` overrides it. `docusaurus start` runs a dev server with hot reload for local editing. `docusaurus build` produces a static `build/` directory that can be served from anywhere, including GitHub Pages.

## Library docs workflow

For any library question, use the right MCP first, web search last.

1. **MUI primitives** (Material, X, system, lab, icons): use the MUI MCP. Call `mcp__mui-mcp__useMuiDocs` to identify the right `llms.txt` URL for the pinned versions, then `mcp__mui-mcp__fetchDocs` to pull pages. The MUI MCP is authoritative for props, slots, variants, and theming hooks. Do not re-document MUI APIs in this repo. Add a link to the upstream MUI page instead.
2. **Other libraries** (Docusaurus, Vite, React, Drizzle, Hono, Zod, etc.): use the Context7 MCP. Call `mcp__context7__resolve-library-id` first, then `mcp__context7__query-docs` with the returned ID. Cite the version in any snippets.
3. **Web search**: only when neither MCP has the answer.

## Tickets, commits, branches

If the project tracks work in Jira, every commit, branch, and PR title starts with the issue key, e.g. `PROJ-12: add standards page`. If it does not, write tight imperative subjects (`add standards page`) and skip the prefix.

## Docs conventions

- Docs are written in MDX. Code blocks specify language for syntax highlighting.
- Keep pages focused. One concept per page. Link between them instead of growing monoliths.
- Put standards and canonical guidance in `docs/`, not in this file. `CLAUDE.md` stays short and points to the docs site.

## Image generation

Generate images with `dcli image generate --prompt "..." --slug my-slug --model pro --aspect-ratio 16:9 --resolution 1K --output static/img/generated`. Defaults to the `flash` model for cheap iteration; pass `--model pro` for final renders. Pass `--overwrite` to replace an existing slug. Output is a JPG, PNG, or WebP under `static/img/generated/` based on the model's returned MIME type.

Credentials come from the active dcli profile (apiKey or 1Password reference), with `GEMINI_API_KEY` as a final fallback. No keys are stored on disk.

Prompt patterns live in `docs/style-guide/image-prompts.mdx`.

## TypeScript / React conventions

Any TypeScript or React code in this repo (`docusaurus.config.ts`, `sidebars.ts`, `src/components/`, `src/pages/`, custom plugins, scripts) should follow these rules:

- **TypeScript strict mode, ESM modules.** No `any`; use proper types or `unknown` with narrowing.
- **pnpm** for dependency management. Don't suggest `npm` or `yarn` commands.
- **Named interfaces** for component props and function signatures. No anonymous inline types for non-trivial shapes.
- **`??` (nullish coalescing)** instead of `||` for defaults.
- **Named constants** for magic numbers and magic strings.
- **Immutability**: `const`, spread operators, `Object.freeze`. Don't mutate arrays or objects in place.
- **Fail fast**: throw errors immediately. Only catch at boundaries (API endpoints, CLI entrypoints, script main functions) where the catch can handle the error meaningfully. Interior code lets exceptions propagate.
- **No silent fallbacks**: if something goes wrong, callers should know. Don't swallow errors or substitute defaults that mask failures.
- **Modular**: one responsibility per file. Break concerns into logical modules rather than growing a monolith.
- **Async for I/O**: use `async` for HTTP calls, file I/O, and any other I/O-bound work. Sync is fine for pure computation.
- **Prettier** formatting (line width 100, double quotes, semicolons, trailing commas). Don't fight the formatter.

## Standard libraries

When adding new dependencies, prefer:

- **zod** for schema validation at boundaries (config files, API responses, user input).
