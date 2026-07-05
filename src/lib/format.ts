/*
 * Pure presentation helpers — the maths and formatting behind every tear sheet,
 * research card, and home-page figure. They take plain values in and return
 * plain strings/numbers out, with no dependency on Astro or the file system, so
 * they can be exercised directly by the unit tests in tests/format.test.ts.
 *
 * If you change how a price, percentage, or date is displayed, a test will tell
 * you if the change is wrong.
 */

/** The shape these helpers need from a report — the numeric fields only. */
export interface ReturnInput {
  targetPrice: number;
  marketPrice: number;
}

/**
 * Implied 12-month return from current price to target, as a fraction.
 * The schema guarantees `marketPrice` is positive, so this never divides by
 * zero; if it somehow receives a non-positive price it throws rather than
 * quietly producing "Infinity%" on the live page.
 */
export function impliedReturn(data: ReturnInput): number {
  if (!(data.marketPrice > 0)) {
    throw new Error(
      `marketPrice must be a positive number to compute the implied return (got ${data.marketPrice}).`,
    );
  }
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

/** Long-form month + year, e.g. Date -> "June 2026". Used in the report byline. */
export function formatMonthYear(date: Date): string {
  const month = date.toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });
  return `${month} ${date.getUTCFullYear()}`;
}
