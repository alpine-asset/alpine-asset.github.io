import { describe, it, expect } from 'vitest';
import { tearSheetRows } from '../src/lib/tear-sheet';

// The canonical tear-sheet field list. Both the report rail and the home
// "Latest Coverage" card render from this, so the test pins the order, the
// formatting of each field, and the conditional Market Cap row.
const base = {
  rating: 'Buy',
  targetPrice: 110,
  marketPrice: 100,
  method: 'SOTP',
};

describe('tearSheetRows', () => {
  it('emits the fields in canonical order, each formatted once', () => {
    const rows = tearSheetRows(base);
    expect(rows.map((r) => r.key)).toEqual([
      'rating',
      'targetPrice',
      'marketPrice',
      'impliedReturn',
      'method',
    ]);
    // Prices/percentages come from the shared format helpers, not re-implemented.
    expect(rows.find((r) => r.key === 'targetPrice')?.value).toBe('$110.00');
    expect(rows.find((r) => r.key === 'marketPrice')?.value).toBe('$100.00');
    expect(rows.find((r) => r.key === 'impliedReturn')?.value).toBe('+10.0%');
    expect(rows.find((r) => r.key === 'rating')?.value).toBe('Buy');
  });

  it('includes Market Cap only when the report provides it', () => {
    expect(tearSheetRows(base).some((r) => r.key === 'marketCap')).toBe(false);

    const withCap = tearSheetRows({ ...base, marketCap: '$210B' });
    expect(withCap.find((r) => r.key === 'marketCap')?.value).toBe('$210B');
    // …and it sits between Implied 12M and Method.
    expect(withCap.map((r) => r.key)).toEqual([
      'rating',
      'targetPrice',
      'marketPrice',
      'impliedReturn',
      'marketCap',
      'method',
    ]);
  });
});
