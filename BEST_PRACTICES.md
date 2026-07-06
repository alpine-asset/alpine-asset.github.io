# Best practices & tech-debt audit

A standing review of the Alpine Asset site against software and Astro best
practices, and a log of what has been addressed. It exists so the gap between
the conventions the project *declares* (in [AGENTS.md](./AGENTS.md) /
[README.md](./README.md)) and what is actually *enforced* stays visible and
closed.

**Status key:** ✅ done · 🟡 partial · ⏭️ deferred (with reason).

The repository was already in good shape (strict TypeScript, a validated content
schema, pure unit-tested helpers, a layered `npm run verify` gate, CI on every
PR). Most items below are now enforced by tooling rather than left to
discipline. Priorities: **P1** real correctness/security/SEO/a11y gap · **P2**
maintainability · **P3** polish.

---

## 1. Enforce the conventions the project already claims

### 1.1 — P1 · ✅ Hard-coded colours now caught by Stylelint

The headline promise — *"Never hard-code a colour"* (AGENTS.md) — had drifted:
**12 hex colours lived outside `tokens.css`** (`Nav.astro` even used `#4a5257`,
which *is* `--color-text`).

- All 12 replaced with tokens; new tokens added where none existed
  (`--color-white`, `--color-border-strong`, `--color-footer-soft`,
  `--color-footer-tag`, `--color-orange-wash`).
- Added a **Stylelint** gate (`.stylelintrc.json`, `npm run lint:css`) with
  `color-no-hex` enabled everywhere except `tokens.css`, running over both
  `.css` files and `.astro` `<style>` blocks (via `postcss-html`). A hex value
  anywhere else now fails the build with a message pointing at the tokens file.
  The rule turns the project's core value proposition into an automatic gate.

### 1.2 — P2 · ✅ ESLint added

`astro check` only covers types/frontmatter. Added `eslint` +
`typescript-eslint` + `eslint-plugin-astro` (`eslint.config.js`, `npm run
lint`). Its first run already found a dead `let pathToCheck = null` assignment in
`scripts/verify-build.mjs`, now fixed.

### 1.3 — P2 · ✅ Prettier added (scoped deliberately)

Added `prettier` with `format` / `format:check` scripts. **`.astro` and `.css`
are intentionally excluded** (`.prettierignore`): those files use a compact,
several-declarations-per-line style that Prettier would explode to one line each,
fighting the maintainers' layout. Markdown is likewise excluded to preserve the
hand-aligned author docs. Colour discipline in the excluded files is covered by
Stylelint instead.

---

## 2. Astro & SEO

### 2.1 — P1 · ✅ Sitemap + robots.txt

Added `@astrojs/sitemap` (emits `/sitemap-index.xml` at build) and
`public/robots.txt` pointing at it. `astro.config.mjs` also now pins
`trailingSlash: 'always'` and `build.format: 'directory'` (§2.5) so routing
matches the trailing-slash links and the post-build link check.

### 2.2 — P1 · ✅ Fonts self-hosted (README claim now true)

`global.css` loaded three families from Google Fonts via a render-blocking CSS
`@import` — contradicting README's "no external CDN dependency". Replaced with
self-hosted `@fontsource` weight imports in `BaseLayout.astro`; Astro now bundles
and fingerprints the woff2 files from our own origin. The built site contains
**zero** `fonts.googleapis.com` references.

### 2.3 — P2 · ✅ Open Graph / Twitter metadata

`BaseLayout` now emits `og:*` and `twitter:*` tags (title, description, url,
image) with a `summary_large_image` card and an optional per-page `image` prop. A
branded 1200×630 default card ships at `public/og-default.png`.

### 2.4 — P3 · 🟡 Structured data (JSON-LD)

Site-wide `Organization` JSON-LD is emitted from `BaseLayout`. **Remaining:** a
per-report `Article`/`Report` block on the tear-sheet page (`[...slug].astro`).

### 2.5 — P3 · ✅ Routing made explicit

`trailingSlash: 'always'` + `build.format: 'directory'` pinned in config — see
§2.1.

---

## 3. Accessibility

### 3.1 — P1 · ✅ Visible keyboard focus

There was no `:focus-visible` style anywhere and `contact.astro` stripped the
input outline entirely. Added a global `:focus-visible` ring in `global.css` and
removed the `outline: none` from the contact inputs (they keep the orange border
accent; the ring is now global).

### 3.2 — P2 · ✅ Skip-to-content link

`BaseLayout` now renders a visually-hidden "Skip to content" link (first
focusable element) targeting `<main id="main">`, styled in `global.css`.

### 3.3 — P3 · ⏭️ Colour contrast of muted greys

`--color-muted-soft` (`#a6adb0`) on white is ~2.3:1 and likely fails WCAG AA for
small text. **Deferred:** darkening a brand token is a design decision, not a
mechanical fix. Tracked here for a designer to weigh in; restrict it to large
text or darken the token when addressed.

---

## 4. CI/CD & supply chain

### 4.1 — P1 · ✅ Dependabot covers GitHub Actions

Added the `github-actions` ecosystem to `dependabot.yml` (was npm-only), so the
action pins receive security updates.

### 4.2 — P2 · ✅ Least-privilege CI token

Added explicit `permissions: contents: read` to `ci.yml` (`deploy.yml` already
scoped its token).

### 4.3 — P2 · ⏭️ Pin actions to commit SHAs

Actions are still pinned to floating tags (`actions/checkout@v4`). **Deferred:**
pinning to a hand-typed SHA risks a wrong pin that breaks CI, and Dependabot
(now enabled for Actions, §4.1) can bump SHAs safely once switched. Do the switch
as its own commit.

### 4.4 — P2 · ⏭️ `engine-strict` intentionally NOT added

`package.json` requires Node `>=24.18.0`, but the web/dev container runs Node 22.
Adding `engine-strict=true` would make `npm install` (and the SessionStart hook)
**fail here**, so it was deliberately left off. The three declarations (`.nvmrc`,
`engines`, CI `node-version-file`) are kept in sync manually instead.

### 4.5 — P2 · ✅ CI/deploy de-duplicated

Both workflows now run the single `npm run verify` script instead of repeating
check/test/build steps, so the gate is defined once (in `package.json`) and the
new lint/format/stylelint layers run in CI and pre-deploy automatically.

---

## 5. Testing

### 5.1 — P2 · ✅ `reports.ts` logic now tested

The sort (newest-first) and draft-visibility logic — which decide *what* ships —
were untested and mixed with `astro:content`. Extracted into pure
`src/lib/reports-core.ts` (`sortByDateDesc`, `selectVisible`, both non-mutating)
and covered by `tests/reports-core.test.ts`.

### 5.2 — P3 · ⏭️ Component-render tests

Astro's Container API could smoke-test the tear sheet / report template.
**Deferred** as lower-value; the highest-risk logic (the inline-Markdown
escaper) was extracted and unit-tested instead — see §5.3.

### 5.3 — P2 · ✅ Inline-Markdown escaper extracted + tested

The `renderInline` escaper in `[...slug].astro` writes HTML via `set:html`, so
its escape order is a security boundary. Moved to `src/lib/markdown.ts`
(`renderInlineBold`) with `tests/markdown.test.ts` asserting `<`/`&` are escaped
*before* bolding, and a comment documenting the trust boundary.

---

## 6. Repo hygiene

- **P2 · ✅ `LICENSE`** — added a proprietary "all rights reserved" notice,
  matching `"private": true`, so the licensing status is explicit.
- **P3 · ✅ PR template** — `.github/pull_request_template.md` with a
  "ran `npm run verify` / no hard-coded colours" checklist.
- **P3 · ✅ `.editorconfig`** — consistent whitespace/encoding.
- **P3 · ✅ `dataSource` documented** — now shown in AUTHORING.md's frontmatter
  example as an optional field.

---

## 7. Duplication in markup & content

A follow-up audit for *repeated code* (not just tooling gaps) found the remaining
copy-paste had migrated into `.astro` markup — below the reach of the CSS/format
gates above. All addressed:

### 7.1 — P2 · ✅ SVG logo + icons extracted; hex in markup eliminated

The mountain mark was triplicated (`Nav`, `Footer`, `favicon.svg`) and the
download icon duplicated (`ReportRail`, report template) — each copy with a
**hard-coded hex fill/stroke** (`#233C43`, `#E97132`, `#E4E9EA`, `#fff`,
`#E8601C`). These slipped past §1.1 because Stylelint's `color-no-hex` runs
`postcss-html`, which sees `<style>` blocks but **not SVG presentation
attributes**. Extracted `BrandMark.astro` and `DownloadIcon.astro`; colour now
routes through tokens — the base facet inherits `currentColor` (nav navy / new
`--color-footer-mark`), the accent and icon strokes use `var(--color-orange)` /
the button's `currentColor`. The shared `.brand-name` wordmark style moved to
`components.css`.

### 7.2 — P2 · ✅ Tear-sheet field list unified

The "which fields make a tear sheet, and how each is formatted" mapping was
written twice — `ReportRail` built one array, `index.astro` hand-coded a
four-cell subset — and had drifted. Extracted `src/lib/tear-sheet.ts`
(`tearSheetRows`, pure, unit-tested); both surfaces now render from it. The
inline `monthYear()` in the report template moved to `format.ts`
(`formatMonthYear`) with a test, per the "derived values stay derived" rule.

### 7.3 — P2 · ✅ Shared strings centralized

The contact email appeared five times across four files (and the site
description twice inside `BaseLayout`). Moved to `src/lib/site.ts`
(`SITE_NAME` / `SITE_EMAIL` / `SITE_DESCRIPTION`). The contact page's dropdown
options and "Reach out about" bullets now derive from one `topics` array.

### 7.4 — P2 · ✅ Guard tests close the gate blind spots

`tests/source-hygiene.test.ts` fails the build if a hex colour reappears in an
SVG attribute, or if the raw email literal reappears in a page/component —
catching §7.1/§7.3 regressions that Stylelint and types can't. One documented
exception remains: the `<select>` chevron colour is baked into a `url()` data
URI, where CSS custom properties can't resolve (commented in `contact.astro`).

## Still open (short list)

1. **§2.4** — per-report `Article` JSON-LD.
2. **§3.3** — contrast of `--color-muted-soft` (design call).
3. **§4.3** — pin actions to SHAs (let Dependabot drive it).
4. **§5.2** — Container-API component tests.
5. **§7.4** — the select-chevron data-URI colour can't reference a token
   (CSS limitation); revisit if the chevron moves to a masked pseudo-element.

Everything else in this audit is implemented and enforced by `npm run verify`,
which CI and the deploy workflow both run.
