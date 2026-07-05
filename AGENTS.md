# AGENTS.md

Orientation for AI agents working on the Alpine Asset website. Keep changes
small and consistent with what's here. Human-facing docs already exist — this
file points to them instead of repeating them:

- **[README.md](./README.md)** — what the project is, why Astro, full project
  layout, local dev, deployment.
- **[AUTHORING.md](./AUTHORING.md)** — how a non-technical author publishes a
  report (the common request). Read this before touching `src/content/reports/`.

## What this is

A static [Astro](https://astro.build) site deployed to GitHub Pages at
`alpine-asset.com`. No client-side runtime, no backend, no database. Content
(research reports) is Markdown; design is CSS tokens; pages are `.astro`.

## Commands

Node **24.18.0** (`.nvmrc`, enforced in CI). Run `npm install` once.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local preview at http://localhost:4321 |
| `npm run build` | Production build into `dist/` |
| `npm run check` | Type-check **and** validate every report's frontmatter — this is the gate that CI relies on. Run it after any change to content, schema, or `.astro` files. |

There is no separate unit-test suite or ESLint config; `astro check` is the
check that must pass. Deploy is automatic on push to `main`
(`.github/workflows/deploy.yml`) — do not build or deploy by hand.

## Where things live

```
src/
  content.config.ts          Zod schema for report frontmatter (single source of validation)
  content/reports/*.md       One Markdown file per report  ← content lives here
  lib/reports.ts             Sorting + price/percent/date formatting helpers
  styles/tokens.css          Design tokens: the ONE source for colours, fonts, spacing
  styles/global.css          Base styles + .prose rules for report Markdown
  styles/components.css       Shared component styles (extracted to avoid duplication)
  layouts/BaseLayout.astro   Page shell (head, fonts, Nav, Footer)
  components/                 Nav, Footer, ReportRail
  pages/                     index, about, contact, research/ (listing + [...slug] per report)
public/                      Served as-is: CNAME, favicon, PDFs under reports/
```

## Conventions (please keep)

- **Never hard-code a colour, font, or spacing value in a page or component.**
  Add or reuse a token in `src/styles/tokens.css`. Shared rules belong in
  `styles/components.css`, not copied per page.
- **Reports are data, not code.** Adding/editing a report means editing one
  `.md` file under `src/content/reports/` plus its PDF in `public/reports/`.
  Don't build report HTML by hand — the tear sheet, listing, and home card are
  all generated from frontmatter.
- **Derived values stay derived.** Implied return, formatted prices/dates, and
  sorting come from `src/lib/reports.ts`. Don't recompute or hard-code them.
- **Frontmatter is validated.** If you add a field, add it to the schema in
  `src/content.config.ts`; if you change the schema, run `npm run check` and fix
  any existing reports it flags.
- **Drafts:** `draft: true` hides a report from production but shows it in local
  dev.

## Before you finish

Run `npm run check`. If it passes, the content and types are valid. Deployment
happens automatically once merged to `main`.
