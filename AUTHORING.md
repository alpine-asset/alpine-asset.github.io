# Publishing a research report

This is the only file you need to touch to publish a report. You write a plain
text file — no HTML, no code. The website builds the tear sheet, the research
listing, and the home-page card for you automatically.

## Steps

1. In the folder `src/content/reports/`, make a copy of an existing report file
   (for example `nextera-energy-2026.md`). Give the copy a simple lowercase name
   ending in `.md`, e.g. `duke-energy-2026.md`. **The file name becomes the web
   address**, so keep it short and use hyphens instead of spaces.

2. Put the report's PDF in `public/reports/` and note its file name.

3. Open your new `.md` file and fill in the details between the two `---` lines
   at the top (the "front matter"), then write the report body underneath.

4. Save. That's it — the site rebuilds and the report appears everywhere.

## What the top block looks like

```markdown
---
company: Duke Energy               # Full company name
ticker: DUK                        # Stock ticker
exchange: NYSE                     # Exchange
sector: Utilities / Renewable      # Short sector description
coverageType: Initiation of Coverage

rating: Buy                        # One of: Buy, Overweight, Neutral, Hold, Underweight, Sell
targetPrice: 128.40                # Numbers only — no "$"
marketPrice: 115.02                # Numbers only — no "$"
marketCap: $179.8B                 # Free text (optional)
method: SOTP                       # Valuation method

date: 2026-08-15                   # Year-Month-Day
pdf: /reports/duke-energy-2026.pdf # Must match the file you put in public/reports/
pdfPages: 18

summary: >
  One or two sentences that appear as the lead paragraph. You can make a word
  **bold** by wrapping it in two stars.

thesis:                            # The numbered points. Add or remove as needed.
  - title: First point headline
    body: >
      A sentence or two explaining the first point.
  - title: Second point headline
    body: >
      Explanation of the second point.

catalysts:                         # Bullet points in the green box
  - Something that could push the stock up.
  - Another positive driver.

risks:                             # Bullet points in the red box
  - Something that could push the stock down.
  - Another risk.
---
```

## Writing the report body

Everything below the second `---` line is the report body. Write it in
**Markdown**, which is just plain text with a few simple marks:

```markdown
## A section heading

A normal paragraph. Make text **bold** with two stars, or *italic* with one.

- A bullet
- Another bullet

> A quote or callout sits inside a nice orange bar.
```

## Things to know

- **The numbers are checked for you.** If you forget the target price or misspell
  the rating (e.g. `Buyy`), or leave a `$` in a price, the site won't publish and
  will tell you exactly what's wrong — it can't silently ship a broken page.
- **The PDF is checked too.** If the `pdf:` line points at a file that isn't in
  `public/reports/` (a typo, or you forgot to add it), the checks fail before the
  site publishes — so the "Download PDF" button can never lead to a dead link.
- **"Implied 12M" is calculated automatically** from the target and market
  prices. You never type it, so it can never disagree with the prices shown.
- **The newest report** (by `date`) automatically becomes the "Latest Coverage"
  card on the home page.
- **Not ready to publish?** Add a line `draft: true` to the top block. It will
  show while you preview locally but stay hidden from the live site until you
  remove that line.
