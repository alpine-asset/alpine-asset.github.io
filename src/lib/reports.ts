import { getCollection, type CollectionEntry } from 'astro:content';

export type Report = CollectionEntry<'reports'>;

/** Published reports, newest first. Drafts are hidden in production builds. */
export async function getPublishedReports(): Promise<Report[]> {
  const reports = await getCollection('reports', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  return reports.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

/** The most recent report — drives the "Latest Coverage" card on the home page. */
export async function getLatestReport(): Promise<Report | undefined> {
  return (await getPublishedReports())[0];
}

/** Implied 12-month return from current price to target, as a fraction. */
export function impliedReturn(data: Report['data']): number {
  return (data.targetPrice - data.marketPrice) / data.marketPrice;
}

/** e.g. 0.023 -> "+2.3%", -0.034 -> "−2.3%" (true minus sign). */
export function formatPercent(fraction: number): string {
  const pct = fraction * 100;
  const sign = pct > 0 ? '+' : pct < 0 ? '−' : '';
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

/** e.g. 83.17 -> "$83.17". */
export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

/** e.g. Date -> "JUN 2026" / "JUN 22 2026". */
export function formatDate(date: Date, withDay = false): string {
  const month = date
    .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
    .toUpperCase();
  const year = date.getUTCFullYear();
  return withDay ? `${month} ${date.getUTCDate()} ${year}` : `${month} ${year}`;
}
