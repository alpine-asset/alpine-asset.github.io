import { getCollection, type CollectionEntry } from 'astro:content';
import { selectVisible, sortByDateDesc } from './reports-core';

export type Report = CollectionEntry<'reports'>;

// The presentation helpers live in ./format (pure, unit-tested) and the
// ordering/visibility logic in ./reports-core (also unit-tested). They are
// re-exported here so pages can keep importing everything from one place.
export {
  impliedReturn,
  formatPercent,
  formatPrice,
  formatDate,
  formatMonthYear,
} from './format';
export { tearSheetRows } from './tear-sheet';
export { sortByDateDesc, selectVisible } from './reports-core';

/** Published reports, newest first. Drafts are hidden in production builds. */
export async function getPublishedReports(): Promise<Report[]> {
  const reports = await getCollection('reports');
  return sortByDateDesc(selectVisible(reports, import.meta.env.PROD));
}

/** The most recent report — drives the "Latest Coverage" card on the home page. */
export async function getLatestReport(): Promise<Report | undefined> {
  return (await getPublishedReports())[0];
}
