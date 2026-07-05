/*
 * The canonical tear-sheet field list — which report fields make up a tear
 * sheet, in what order, and how each is formatted. This was defined twice and
 * had already drifted: the report rail (ReportRail.astro) built one array while
 * the home "Latest Coverage" card (index.astro) hand-coded a four-cell subset
 * with the same field→formatter mapping inline.
 *
 * Pure (imports only ./format), so it is unit-tested in tests/tear-sheet.test.ts
 * with no Astro or filesystem dependency — consistent with the other lib helpers.
 */
import { impliedReturn, formatPercent, formatPrice } from './format';

/** The report fields a tear sheet needs — the display subset of the schema. */
export interface TearSheetData {
  rating: string;
  targetPrice: number;
  marketPrice: number;
  marketCap?: string;
  method: string;
}

/** A single label/value pair, tagged with a stable `key` for selection. */
export interface TearSheetRow {
  key: string;
  label: string;
  value: string;
}

/**
 * The full, ordered tear-sheet rows for a report. The report rail renders all
 * of them; the home card selects the four it shows by `key` (see index.astro).
 * `marketCap` only appears when the report provides it.
 */
export function tearSheetRows(data: TearSheetData): TearSheetRow[] {
  const rows: TearSheetRow[] = [
    { key: 'rating', label: 'Rating', value: data.rating },
    {
      key: 'targetPrice',
      label: 'Target Price',
      value: formatPrice(data.targetPrice),
    },
    {
      key: 'marketPrice',
      label: 'Market Price',
      value: formatPrice(data.marketPrice),
    },
    {
      key: 'impliedReturn',
      label: 'Implied 12M',
      value: formatPercent(impliedReturn(data)),
    },
  ];
  if (data.marketCap) {
    rows.push({ key: 'marketCap', label: 'Market Cap', value: data.marketCap });
  }
  rows.push({ key: 'method', label: 'Method', value: data.method });
  return rows;
}
