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
    // Prices must be positive numbers with no "$". A zero or negative
    // marketPrice would make the "Implied 12M" figure meaningless (it divides
    // by the market price), so we reject it here with a clear message rather
    // than shipping "Infinity%" to the live page.
    targetPrice: z
      .number({
        message: 'targetPrice must be a number with no "$" or commas.',
      })
      .positive('targetPrice must be greater than 0.'),
    marketPrice: z
      .number({
        message: 'marketPrice must be a number with no "$" or commas.',
      })
      .positive('marketPrice must be greater than 0.'),
    marketCap: z.string().optional(),
    method: z.string().default('SOTP'),

    // --- Publishing ---
    date: z.date(),
    // The PDF path must point inside /reports/ and end in .pdf. This catches a
    // typo in the path shape at build time; that the file actually EXISTS is
    // checked after the build by scripts/verify-build.mjs.
    pdf: z
      .string()
      .regex(
        /^\/reports\/[^\s]+\.pdf$/i,
        'pdf must look like /reports/your-file-name.pdf (the file goes in public/reports/).',
      ),
    pdfPages: z
      .number()
      .int('pdfPages must be a whole number.')
      .positive('pdfPages must be greater than 0.')
      .optional(),
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
