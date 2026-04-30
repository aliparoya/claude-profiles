# Claude Profiles

How to actually understand your agent harness.

Live: https://aliparoya.github.io/claude-profiles/

## What this is

A documentation hub arguing for opinionated profile management for Claude Code. Each context (work vs. personal, doc-authoring vs. code-review) gets its own shell alias that replaces Claude Code's system prompt instead of layering on top of it, and defers MCP and tool loading. The argument is structural: you can offload code work and even thinking to an agent, but you cannot offload understanding what's loaded into its context.

Audience: engineers ramping up on AI tooling who are starting to install plugins, skills, and MCPs without a clear model of what each one injects.

## Local development

```bash
pnpm install
pnpm start                    # http://localhost:3000
pnpm run build                # static build into ./build
just serve                    # detached dev server (logs in .local/logs)
just stop                     # stop it
```

Dev server hot-reloads from `docs/`, `blog/`, and `src/`.

## Stack

- Docusaurus 3 with TypeScript
- MUI 7 wired via `src/theme/Root.tsx`
- Mermaid, KaTeX, ideal-image, image-zoom, client-redirects via Docusaurus plugins
- GitHub Pages, deployed by `.github/workflows/deploy.yml` on push to main

## Layout

```
docs/                Published MDX content
blog/                Dated MDX posts
style-guide/         Internal authoring rules (not published, used by the create-doc skill)
src/components/      ComponentDemo, TokenDemo, SlideDeck, HomepageFeatures
src/theme/Root.tsx   MUI ThemeProvider wrapper
src/theme/mui/       MUI theme overrides
src/pages/           Custom React pages (homepage)
static/              Favicon, logo, social card
.claude/skills/      create-doc skill that drafts pages against style-guide/
.github/workflows/   CI, Pages deploy, security scans
```
