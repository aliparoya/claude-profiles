---
name: create-doc
description: Grounding document for drafting a new doc page. Use whenever the user says /create-doc, asks to draft or write a page, or wants to add a new doc to docs/. The skill points at the style guide for voice and tone, names the components and plugins already wired into the site, and flags the operational gotchas that bite. It does not prescribe a structure for the page; that comes from the topic.
---

# create-doc

A grounding document for adding a doc page to this site. Read it once at the start of a drafting session, then write the page in whatever shape the topic actually wants.

## Where the rules live

- **Voice and tone**: `docs/style-guide/writing.mdx`. Hard rules: no em dashes, straight quotes, sentence case headings, code references take a file and line number. The full taxonomy of AI-writing patterns to avoid lives there. Run a draft past the patterns before handing it back.
- **Brand and imagery**: `docs/style-guide/brand.mdx` and `docs/style-guide/images.mdx`. Imagery is optional, not required.
- **MDX patterns**: `docs/style-guide/mdx-reference.mdx`. Copy-paste snippets for slide decks, mermaid, KaTeX, admonitions, and responsive images.
- **Image prompting**: `docs/style-guide/image-prompts.mdx`, plus the `dcli image generate` command for producing hero or inline images when one earns its space.
- **Diagrams**: `docs/style-guide/diagrams.mdx` for when a diagram is the right shape and what it should look like.

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
