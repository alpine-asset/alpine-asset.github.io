import { describe, it, expect } from 'vitest';
import {
  impliedReturn,
  formatPercent,
  formatPrice,
  formatDate,
} from '../src/lib/format';

describe('impliedReturn', () => {
  it('computes the fractional return from market price to target', () => {
    expect(impliedReturn({ targetPrice: 110, marketPrice: 100 })).toBeCloseTo(
      0.1,
    );
    expect(
      impliedReturn({ targetPrice: 83.17, marketPrice: 86.12 }),
    ).toBeCloseTo(-0.03425, 4);
  });

  it('refuses a non-positive market price instead of returning Infinity/NaN', () => {
    // A zero market price would divide by zero and render "Infinity%" on the
    // live page — the schema blocks this, and so does the helper as a backstop.
    expect(() => impliedReturn({ targetPrice: 100, marketPrice: 0 })).toThrow();
    expect(() =>
      impliedReturn({ targetPrice: 100, marketPrice: -5 }),
    ).toThrow();
  });
});

describe('formatPercent', () => {
  it('prefixes a real plus/minus sign and one decimal', () => {
    expect(formatPercent(0.023)).toBe('+2.3%');
    expect(formatPercent(-0.034)).toBe('−3.4%'); // U+2212 minus, not hyphen
    expect(formatPercent(0)).toBe('0.0%');
  });
});

describe('formatPrice', () => {
  it('formats a dollar amount to two decimals', () => {
    expect(formatPrice(83.17)).toBe('$83.17');
    expect(formatPrice(115)).toBe('$115.00');
  });
});

describe('formatDate', () => {
  // Use UTC noon so the date is stable regardless of the test machine's zone.
  const june = new Date('2026-06-22T12:00:00Z');

  it('formats month + year by default', () => {
    expect(formatDate(june)).toBe('JUN 2026');
  });

  it('includes the day when asked', () => {
    expect(formatDate(june, true)).toBe('JUN 22 2026');
  });
});
