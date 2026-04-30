# Docusaurus template

A pre-wired [Docusaurus 3](https://docusaurus.io/) starter with MUI components, a humanizer-grade style guide, and a `create-doc` skill that drafts pages to a fixed quality bar.

## What is in the box

- **Docusaurus 3** with TypeScript, Mermaid, KaTeX, ideal-image, image-zoom, and client-redirects.
- **MUI** (`@mui/material` 7, `@mui/x-*` 8) wired through `src/theme/Root.tsx` so any MDX page can import and render MUI components without extra setup. Theme overrides live in `src/theme/mui/`.
- **Style guide** at `docs/style-guide/` covering voice, brand, imagery, diagrams, presentations, and an MDX cheat sheet.
- **`create-doc` skill** at `.claude/skills/create-doc/SKILL.md` that drafts a doc against a fixed six-section template and applies the humanizer rules every time.
- **CI workflows** for build/typecheck and security scanning, plus `.coderabbit.yaml`, `.gitleaks.toml`, and a pre-commit config.

## Usage

```bash
pnpm install
pnpm start                    # dev server at http://localhost:3000
pnpm run build                # static build into ./build
just serve                    # dev detached
just stop                     # stop dev
```

Dev hot-reloads from `docs/` and `src/`.

## What to change after cloning

1. `package.json` — `name`.
2. `docusaurus.config.ts` — `title`, `tagline`, `url`, `baseUrl`, `organizationName`, `projectName`, navbar/footer GitHub URL.
3. `src/components/HomepageFeatures/index.tsx` and `src/pages/index.tsx` — the landing page copy and CTAs.
4. `blog/authors.yml` — replace the placeholder author entry, or delete the blog dir.
5. `static/img/logo.svg` and `favicon.ico` — your brand mark.
6. `CLAUDE.md` — adjust the project-specific bits at the top once you know what the project is.

## Layout

```
docs/                Authored MDX content
blog/                Dated MDX posts
src/components/      ComponentDemo, TokenDemo, SlideDeck, HomepageFeatures
src/theme/Root.tsx   Wraps the app in MUI ThemeProvider
src/theme/mui/       MUI theme overrides (palette, components, typography, shadows)
static/              Favicon, logo, social card, sample SVGs
.claude/skills/      create-doc skill for AI-assisted doc drafting
.github/workflows/   CI build + security scans
```

## Deployment

Static output drops into `build/`. Publish anywhere static (GitHub Pages, S3, Netlify, Cloudflare Pages, your own bucket). For GitHub Pages, set `url`, `baseUrl`, `organizationName`, and `projectName` in `docusaurus.config.ts` and run `pnpm run deploy` from a machine with push access.
