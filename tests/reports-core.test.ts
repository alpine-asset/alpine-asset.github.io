import { describe, it, expect } from 'vitest';
import { sortByDateDesc, selectVisible } from '../src/lib/reports-core';

/** Minimal report stubs — only the fields the ordering/visibility logic reads. */
const make = (id: string, date: string, draft = false) => ({
  id,
  data: { date: new Date(date), draft },
});

describe('sortByDateDesc', () => {
  it('orders reports newest first', () => {
    const out = sortByDateDesc([
      make('older', '2026-01-01'),
      make('newest', '2026-06-01'),
      make('middle', '2026-03-01'),
    ]);
    expect(out.map((r) => r.id)).toEqual(['newest', 'middle', 'older']);
  });

  it('does not mutate the input array', () => {
    const input = [make('a', '2026-01-01'), make('b', '2026-02-01')];
    const before = input.map((r) => r.id);
    sortByDateDesc(input);
    expect(input.map((r) => r.id)).toEqual(before);
  });
});

describe('selectVisible', () => {
  const reports = [
    make('published', '2026-01-01', false),
    make('draft', '2026-02-01', true),
  ];

  it('hides drafts in production', () => {
    expect(selectVisible(reports, true).map((r) => r.id)).toEqual([
      'published',
    ]);
  });

  it('shows drafts in development (preview)', () => {
    expect(selectVisible(reports, false).map((r) => r.id)).toEqual([
      'published',
      'draft',
    ]);
  });

  it('does not mutate the input array', () => {
    const input = [make('a', '2026-01-01', true)];
    selectVisible(input, true);
    expect(input).toHaveLength(1);
  });
});
