# Best practices & tech-debt audit

A standing review of the Alpine Asset site against software and Astro best
practices. It records the gaps between the conventions the project *declares*
(in [AGENTS.md](./AGENTS.md) / [README.md](./README.md)) and what is actually
enforced, plus the Astro/SEO/accessibility gaps a static content site of this
kind should close.

The repository is already in good shape: strict TypeScript, a validated content
schema, pure unit-tested helpers, a layered `npm run verify` gate, and CI on
every PR. This document is not a rewrite — it is a prioritized backlog for
keeping that quality bar from eroding as the site grows.

**How to read it.** Each item has a priority, the evidence (`file:line`), why it
matters, and a concrete fix. A short set of zero-risk items has already been
applied in this change — see [What was done here](#what-was-done-in-this-change).
Everything else is proposed as a follow-up so no gate is added that would turn
the build red on existing code without a deliberate cleanup commit.

Priorities:

- **P1** — a real correctness, security, SEO, or accessibility gap; do soon.
- **P2** — meaningful quality/maintainability improvement.
- **P3** — polish / nice-to-have.

---

## 1. Enforce the conventions the project already claims

The project's central promise is design-token discipline: *"Never hard-code a
colour, font, or spacing value"* (AGENTS.md), *"No page hard-codes a hex colour"*
(README.md). Nothing checks this, and it has **already drifted**.

### 1.1 — P1 · Hard-coded colours violate the stated rule

There are **12 hard-coded hex colours outside `tokens.css`**, several of which
are not white and are not tokens at all:

| File | Line | Value |
| --- | --- | --- |
| `src/components/Nav.astro` | 76 | `color: #4a5257` |
| `src/components/Nav.astro` | 83 | `border: 1px solid #d3d6d8` |
| `src/components/Footer.astro` | 83, 97 | `#939ea1` |
| `src/components/Footer.astro` | 111 | `#5a6669` |
| `src/pages/contact.astro` | 182 | `background: #fbefe7` |
| `src/styles/global.css`, `components.css`, `contact.astro` | — | multiple `#fff` |

`#4a5257` is actually already a token (`--color-text`), and `#fff` should be a
`--color-bg` / surface token. These are precisely the drift the token system
exists to prevent.

**Fix.** Replace each with the matching token (add `--color-surface-white`,
`--color-footer-body`, etc. where one doesn't exist), then add a **Stylelint**
gate so the rule is machine-enforced instead of aspirational:

```jsonc
// .stylelintrc.json
{
  "rules": {
    // Disallow hex colours everywhere; the one file allowed to define them
    // (tokens.css) is listed in .stylelintignore or an override.
    "color-no-hex": true
  },
  "overrides": [
    { "files": ["src/styles/tokens.css"], "rules": { "color-no-hex": null } }
  ]
}
```

Wire `stylelint "src/**/*.{css,astro}"` into `npm run verify`. This turns the
headline convention into a gate — the highest-leverage single change here,
because it protects the project's core value proposition automatically.

### 1.2 — P2 · No linter for JS/TS/Astro

`astro check` validates **types and content frontmatter only**. There is no
ESLint, so nothing catches unused vars, floating promises, accidental `any`,
missing `await`, or Astro-specific foot-guns (e.g. unescaped `set:html`, missing
`alt`). Add `eslint` + `eslint-plugin-astro` + `typescript-eslint` with a lean
config and an `npm run lint` step in `verify` and CI.

### 1.3 — P2 · No formatter

No Prettier config exists, so formatting is by hand and will drift across
contributors and AI edits. Add `prettier` + `prettier-plugin-astro` and a
`format:check` step. (First adoption commit reformats the tree once; do it as a
standalone commit so it doesn't obscure real diffs.)

---

## 2. Astro & SEO

The README sells the migration on SEO ("great SEO", "no external CDN
dependency"). Two of those claims are currently not backed by the code.

### 2.1 — P1 · No sitemap or robots.txt

`astro.config.mjs` sets `site: 'https://alpine-asset.com'` — everything a
sitemap needs — but `@astrojs/sitemap` is not installed and there is no
`public/robots.txt`. A research firm that wants to be found by search engines
should ship both.

**Fix.**
```bash
npx astro add sitemap
```
```
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://alpine-asset.com/sitemap-index.xml
```
> Note: verify `@astrojs/sitemap` resolves cleanly against the pinned Astro
> major before merging; add it in its own commit so a peer-dependency issue is
> easy to isolate. (Left as a follow-up here rather than bundled with the audit
> so this change can't affect the build.)

### 2.2 — P1 · "No external CDN dependency" is contradicted by the fonts

`src/styles/global.css:9` loads three font families from Google Fonts at
runtime via CSS `@import`:

```css
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4...');
```

This contradicts README's stated architecture ("no client-side runtime, no
external CDN dependency") and is the **worst-performing** way to load fonts: a
CSS `@import` is render-blocking *and* serialized (the browser must download and
parse `global.css` before it even discovers the font request), delaying first
paint. It is also a third-party request on every visit (a privacy/GDPR
consideration for EU visitors).

**Fix (best → simplest):**
- **Self-host** with [`@fontsource`](https://fontsource.org) (or Astro 5's
  experimental Fonts API). Fonts ship from your own origin, honouring the "no
  CDN" promise and enabling `font-display: swap` + preloading.
- **Minimum**: move the request into `<link>` tags in `BaseLayout`'s `<head>`
  with `rel="preconnect"` to `fonts.gstatic.com`, so it isn't chained behind
  CSS parsing.

Either way, update the README claim or the code so they agree.

### 2.3 — P2 · No social-share (Open Graph / Twitter) metadata

`BaseLayout.astro`'s `<head>` has title, description, and canonical, but no
`og:*` or `twitter:*` tags and no share image. Links to reports pasted into
Slack/LinkedIn/X will render as bare URLs. For a firm whose distribution *is*
sharing report links, this is a real miss.

**Fix.** Extend `BaseLayout` props with an optional `image` and emit:
```astro
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={new URL(image ?? '/og-default.png', Astro.site)} />
<meta name="twitter:card" content="summary_large_image" />
```
Add a default OG image to `public/`. Optionally generate per-report OG images at
build time.

### 2.4 — P3 · No structured data (JSON-LD)

An `Organization` block site-wide and an `Article`/`Report` block per tear sheet
would improve how search engines and LLMs represent Alpine Asset. Emit from
`BaseLayout` (org) and `[...slug].astro` (per-report) via a `<script
type="application/ld+json">`.

### 2.5 — P3 · Make routing conventions explicit in config

Every internal link is written with a trailing slash (`/research/`) and
`verify-build.mjs` assumes directory-style output. This works because it matches
Astro's defaults, but it is implicit. Set `trailingSlash: 'always'` (and
`build.format: 'directory'`) in `astro.config.mjs` so a future default change or
a hand-written non-slashed link can't silently break link resolution.

---

## 3. Accessibility

### 3.1 — P1 · Focus is removed with no visible replacement

`src/pages/contact.astro:167` does `outline: none` on inputs, changing only the
border colour — a low-contrast cue that fails keyboard users. No element in the
site defines a `:focus-visible` style (confirmed: zero matches). Keyboard users
can lose track of where they are entirely.

**Fix.** Add a global `:focus-visible` treatment in `global.css` and never
strip the outline without an equivalent:
```css
:where(a, button, input, select, textarea):focus-visible {
  outline: 2px solid var(--color-orange-strong);
  outline-offset: 2px;
}
```

### 3.2 — P2 · No skip-to-content link

`BaseLayout` renders Nav → `<main>` with no skip link, so keyboard/screen-reader
users must tab through the nav on every page. Add a visually-hidden
"Skip to content" anchor targeting `<main id="main">` as the first focusable
element.

### 3.3 — P3 · Verify colour contrast of muted greys

Several muted greys on white (`--color-muted #8a9296`, `--color-muted-soft
#a6adb0`) are used at small sizes (9.5–13px). Check them against WCAG AA (4.5:1
for normal text); `#a6adb0` on white is ~2.3:1 and likely fails. Darken the
token or restrict it to large text.

---

## 4. CI/CD & supply chain

### 4.1 — P1 · Dependabot didn't cover GitHub Actions *(fixed here)*

`dependabot.yml` tracked only `npm`, so the pinned actions
(`checkout`, `setup-node`, `deploy-pages`) never received updates. Added the
`github-actions` ecosystem.

### 4.2 — P2 · Workflow token permissions *(CI fixed here)*

`deploy.yml` scopes permissions correctly; `ci.yml` had none, inheriting the
repository default. Added an explicit least-privilege `permissions: contents:
read` to `ci.yml`.

### 4.3 — P2 · Pin actions to commit SHAs

Actions are pinned to floating tags (`actions/checkout@v4`). A tag can be moved;
best practice for supply-chain integrity is to pin to a full commit SHA with the
version in a trailing comment. Dependabot (now enabled for Actions) will bump
the SHAs for you.

### 4.4 — P2 · Node version is declared in three places that can disagree

`.nvmrc` (`24.18.0`), `package.json` `engines` (`>=24.18.0`), and CI
(`node-version-file: .nvmrc`) currently agree, but three sources drift over
time. (Note: this container runs Node 22, below the declared floor — a reminder
that nothing *enforces* the engine locally.) Consider adding `engine-strict=true`
via `.npmrc` so `npm install` fails fast on the wrong Node, keeping all three in
lockstep.

### 4.5 — P3 · CI and deploy duplicate the same three verify steps

`ci.yml` and the build job in `deploy.yml` repeat checkout → setup-node → install
→ check → test → verify:build. Extract a composite action or reusable workflow so
the gate is defined once and can't drift between "pre-merge" and "pre-deploy".

---

## 5. Testing

### 5.1 — P2 · `src/lib/reports.ts` is untested

`format.ts` is well covered, but the sort order (newest-first) and the
draft-filtering logic in `reports.ts` — which decide what actually appears on the
live site — have no unit test. A regression here (e.g. reversing the sort, or a
draft leaking into prod) would ship silently. Add tests using Astro's content
mocking or by refactoring the pure sort/filter into a testable helper.

### 5.2 — P3 · No component-render tests

The tear sheet and report template have real logic (conditional thesis/catalyst
blocks, the `renderInline` mini-Markdown escaper in `[...slug].astro`). Astro's
**Container API** can render a component to a string in a Vitest test — worth a
smoke test that `renderInline` escapes `<`/`&` and bolds `**text**` correctly,
since it writes HTML via `set:html`.

### 5.3 — P3 · `renderInline` writes HTML via `set:html`

`src/pages/research/[...slug].astro:24` hand-rolls escaping before `set:html`.
The escaping looks correct (`&` and `<` are handled before the `**` replace),
but this is exactly the code that most benefits from a unit test guarding the
escape order, since a regression is an XSS-shaped bug. Input is trusted
(author frontmatter) today, so this is low-risk — but test it and add a comment
noting the trust boundary.

---

## 6. Repo hygiene

- **P2 · No `LICENSE`.** `package.json` sets `"private": true`, so this may be
  intentional. If the code is meant to stay proprietary, add a short
  `LICENSE`/`UNLICENSED` note to make that explicit rather than ambiguous.
- **P3 · No PR/issue templates or `CODEOWNERS`.** A minimal
  `.github/pull_request_template.md` ("what changed / ran `npm run verify`?")
  reinforces the verify gate at review time.
- **P3 · `.editorconfig`** *(added here)* — consistent whitespace/encoding
  across editors and AI tools.
- **P3 · Document `dataSource`.** The schema has a `dataSource` field
  (`content.config.ts:62`) with a default that AUTHORING.md never mentions;
  document it or drop it.

---

## What was done in this change

Only zero-risk items that cannot turn the existing green build red were applied
here; everything else is left as a reviewed, prioritized follow-up above.

- **`.editorconfig`** added (§6).
- **Dependabot** now also tracks the `github-actions` ecosystem (§4.1).
- **`ci.yml`** given an explicit least-privilege `permissions: contents: read`
  block (§4.2).
- This document, linked from README and AGENTS.

## Suggested adoption order

1. **§1.1 Stylelint + fix the 12 hard-coded colours** — protects the core value
   proposition; highest leverage.
2. **§2.2 fonts** and **§2.1 sitemap/robots** — make the README's SEO/CDN claims
   true.
3. **§3.1 / §3.2 accessibility** — focus-visible + skip link.
4. **§1.2 / §1.3 ESLint + Prettier** — adopt each in its own commit.
5. **§5.1 reports.ts tests**, then the remaining P2/P3 polish.
