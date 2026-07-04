# Alpine Asset website

The Alpine Asset Research Group website — an [Astro](https://astro.build) static
site deployed to GitHub Pages at [alpine-asset.com](https://alpine-asset.com).

> **Publishing a report?** See **[AUTHORING.md](./AUTHORING.md)** — you only need
> to write one Markdown file, no code.

## Why Astro

The site was originally exported from Claude Design as HTML with all styling
inlined on every element and rendered in the browser at runtime. That made it
hard to keep consistent, bad for SEO, and dependent on an external runtime.

This project replaces that with a conventional static site:

- **One source of truth for the design** — every colour, font, and layout
  constant lives in `src/styles/tokens.css`. Change it once, it changes
  everywhere. No page hard-codes a hex colour.
- **Reports are content, not code** — each research report is a single Markdown
  file in `src/content/reports/` with a validated set of fields at the top. The
  tear sheet, research index, and home-page card are all generated from those
  fields. A non-technical author never touches HTML.
- **Plain static HTML out** — great SEO, no client-side runtime, no external CDN
  dependency.

## Project layout

```
src/
  content.config.ts       Schema for the "reports" collection (validates frontmatter)
  content/reports/*.md     One Markdown file per research report  ← authors edit here
  styles/
    tokens.css             Design tokens: the single source of truth for the brand
    global.css             Base styles + the .prose rules that style report Markdown
  layouts/BaseLayout.astro The page shell (head, fonts, Nav, Footer)
  components/              Nav, Footer, ReportRail (reusable pieces)
  lib/reports.ts           Helpers: load/sort reports, format prices/percents/dates
  pages/
    index.astro            Home
    about.astro            About
    contact.astro          Contact (interactive mailto form)
    research/index.astro   Research listing (auto-lists every report)
    research/[...slug].astro  One page per report
public/                    Static files served as-is: CNAME, PDFs, images, favicon
.github/workflows/deploy.yml  Builds and deploys to GitHub Pages on push to main
```

## Local development

```bash
npm install     # once
npm run dev      # local preview at http://localhost:4321
npm run build    # production build into dist/
npm run check    # type-check + validate all report frontmatter
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes it to GitHub Pages. To enable it, set the repository's **Pages
source** to **GitHub Actions** (Settings → Pages). The custom domain is kept in
`public/CNAME`.

> The legacy Claude Design site still lives in `docs/` for reference during the
> migration. Once this site is live, that folder and the old Pages
> "deploy-from-branch" setting can be removed.
