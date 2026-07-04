import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/*
 * The "reports" collection is the whole point of the migration.
 *
 * Each research report is ONE Markdown file in src/content/reports/. The block
 * of fields at the top (the "frontmatter") is validated against the schema
 * below at build time — so if the author forgets the target price or misspells
 * the rating, the build fails with a clear message instead of shipping a broken
 * page. Everything the tear-sheet shows is derived from these fields; the prose
 * below the frontmatter is plain Markdown.
 */
const reports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reports' }),
  schema: z.object({
    // --- Identity ---
    company: z.string(),
    ticker: z.string(),
    exchange: z.string(),
    sector: z.string(),
    coverageType: z.string().default('Initiation of Coverage'),

    // --- The call ---
    rating: z.enum([
      'Buy',
      'Overweight',
      'Neutral',
      'Hold',
      'Underweight',
      'Sell',
    ]),
    targetPrice: z.number(),
    marketPrice: z.number(),
    marketCap: z.string().optional(),
    method: z.string().default('SOTP'),

    // --- Publishing ---
    date: z.date(),
    pdf: z.string(),
    pdfPages: z.number().optional(),
    dataSource: z.string().default('Bloomberg data · Alpine 3-statement model'),
    draft: z.boolean().default(false),

    // --- Structured body used by the tear sheet ---
    summary: z.string(),
    thesis: z
      .array(z.object({ title: z.string(), body: z.string() }))
      .default([]),
    catalysts: z.array(z.string()).default([]),
    risks: z.array(z.string()).default([]),
  }),
});

export const collections = { reports };
