---
name: create-doc
description: Grounding document for drafting a new doc page. Use whenever the user says /create-doc, asks to draft or write a page, or wants to add a new doc to docs/. The skill names the site's editorial standard, points at the style guide for voice and tone, lists the components and plugins already wired in, names the four canonical evidence sources for argumentative claims, and flags the operational gotchas that bite. It does not prescribe a structure for the page; that comes from the topic.
---

# create-doc

A grounding document for adding a doc page to this site. Read it once at the start of a drafting session, then write the page in whatever shape the topic actually wants.

## What this site is doing

The site is an opinionated argument, not neutral reference docs. It argues that engineers ramping on Claude Code should use a small set of profile aliases that *replace* the harness system prompt and *defer* tool loading, instead of layering plugins, skills, and MCP servers on top of opaque defaults. Every page either makes that argument or shows the working setup that backs it.

Pages live under `docs/claude-profiles/` in this order: landing (the claim), context-stack (the diagnosis), measure (the proof), profile-structure (the prescription), build-your-own (the assembly guide), reference-setup (the working setup). New pages slot into that arc; if a page does not fit, ask the user where it belongs before writing.

## Editorial standard

Every argumentative page on this site needs four moves, in order:

1. **Claim**: the specific thing being asserted. State it; do not gesture at it.
2. **Measured artifact**: a number, a captured output, a diff. Numbers come from the four scripts named below. No vague cost claims ("a few thousand tokens", "the savings are real") without a captured number or a link to the page that has one.
3. **Interpretation**: what the number means and why it matters. The artifact does not speak for itself.
4. **Action**: what the reader does next. Run a command, read another page, change a config.

Pages that are pure reference (like `reference-setup`) can skip step 4 if there is nothing to do.

## Canonical evidence sources

Cost and behavior claims back onto one of four `ccp` subcommands:

|claim about|capture with|
|-|-|
|harness system prompt size and contents|`ccp extract-baseline -o baseline.txt`|
|the full first-turn request your real session sends|`ccp capture-active -o active.json`|
|what changed between two captures (sections, tools, total tokens)|`ccp prompt-diff A B`|
|per-tool schema cost and tool-search status|`ccp tools-audit active.json`|

The reference implementations live in `packages/ccp/lib/`. Outputs live in `.local/captures/` and are not committed; cite excerpts in pages, do not commit raw captures.

When tempted to write "thousands of tokens" or "the savings are real", run the relevant command and quote the output instead.

## Where the rules live

- **Voice and tone**: `style-guide/writing.mdx`. Hard rules: no em dashes, straight quotes, sentence case headings, code references take a file and line number. The full taxonomy of AI-writing patterns to avoid lives there. Run a draft past the patterns before handing it back.
- **Brand and imagery**: `style-guide/brand.mdx` and `style-guide/images.mdx`. Imagery is optional, not required.
- **MDX patterns**: `style-guide/mdx-reference.mdx`. Copy-paste snippets for slide decks, mermaid, KaTeX, admonitions, and responsive images.
- **Image prompting**: `style-guide/image-prompts.mdx`, plus the `dcli image generate` command for producing hero or inline images when one earns its space.
- **Diagrams**: `style-guide/diagrams.mdx` for when a diagram is the right shape and what it should look like.

When the user invokes `/humanizer`, that skill applies the rules from `writing.mdx` directly.

## What is already wired in

- **MUI** (`@mui/material` 7, `@mui/x-*` 8) is set up site-wide via `src/theme/Root.tsx`. Any MDX page can import and render MUI components without extra configuration. The theme overrides live in `src/theme/mui/`.
- **`<ComponentDemo>`** at `src/components/ComponentDemo` wraps a MUI demo in a framed `ScopedCssBaseline` block so it sits cleanly inside docs prose.
- **`<TokenDemo>`** at `src/components/TokenDemo` renders palette swatches, type specimens, and shadow specimens for design-system pages.
- **`<SlideDeck>`** at `src/components/SlideDeck` renders inline keyboard-navigable slides for pages that want a deck instead of a long doc.
- **Mermaid, KaTeX, ideal-image, image-zoom, client-redirects** are all installed via Docusaurus plugins. No extra setup to use them on a page.

When a topic naturally calls for one of these, reach for the existing component instead of recreating it.

## Frontmatter

Every page gets a title and description:

```yaml
---
title: Page title
description: One-sentence summary. Shown in listings and meta tags.
---
```

Optional fields when they help: `slug` (override the URL), `sidebar_position` (force ordering), `hide_table_of_contents` (slide decks, single-section pages), `status: drafting` or `status: closed` (if the project tracks doc lifecycle). `<slug>-TODO.mdx` is a useful at-a-glance marker for stubs; rename when the page is ready.

## Operational gotchas

- **Stale Docusaurus cache.** Renaming or changing extensions on a doc leaves stale entries in `.docusaurus/`. If a new doc 404s in the browser despite the file existing, run `pnpm docusaurus clear` (or `just stop && pnpm docusaurus clear && just serve`). Confirm with the user before stopping their dev server.
- **HTML comments break MDX.** Convert `<!-- ... -->` to `{/* ... */}` or strip the comment.
- **`format: "detect"`** is set in `docusaurus.config.ts`, so `.md` uses CommonMark and `.mdx` uses MDX. Use `.mdx` for anything that wants admonitions, JSX, or component imports.
- **dcli image collision.** `dcli image generate` errors if the slug already exists. Pass `--overwrite` to replace, or pick a new slug.
- **MUI X license watermark.** Premium MUI X components (DataGridPremium, etc.) render a corner watermark when `MUI_X_LICENSE_KEY` is unset. Use the non-Premium variant in docs unless the watermark is acceptable.

## Useful research entrypoints

- **MUI primitives**: `mcp__mui-mcp__useMuiDocs` then `mcp__mui-mcp__fetchDocs`. Authoritative for props, slots, variants, and theming hooks. Do not re-document MUI APIs in this repo; link to the upstream page.
- **Other libraries** (Docusaurus, React, anything else): `mcp__context7__resolve-library-id` then `mcp__context7__query-docs`. Cite the version in any snippets.
- **Web search** is the last resort when neither MCP has the answer.

## When the topic deserves a structured template

Some doc types travel with a known-good template (decision records, RFCs, ADRs, runbooks). When the project already uses one, follow it. When it does not, do not invent a template for a single page; pick the shape the topic actually wants and write it.
