import { getCollection, type CollectionEntry } from 'astro:content';

export type Report = CollectionEntry<'reports'>;

// The presentation helpers live in ./format (pure, unit-tested). They are
// re-exported here so pages can keep importing everything from one place.
export { impliedReturn, formatPercent, formatPrice, formatDate } from './format';

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
