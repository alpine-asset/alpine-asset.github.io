/*
 * Pure ordering/visibility logic for the report collection — extracted from
 * reports.ts so it can be unit-tested without importing `astro:content`.
 *
 * These two functions decide WHAT appears on the live site and in WHAT order,
 * so a regression here (drafts leaking to production, or the newest report no
 * longer landing first) would ship silently. They take plain arrays in and
 * return new arrays out, with no Astro or filesystem dependency.
 */

/** The minimum shape these helpers need from a report entry. */
export interface DatedReport {
  data: { date: Date; draft?: boolean };
}

/** Newest first, by frontmatter `date`. Returns a new array (never mutates). */
export function sortByDateDesc<T extends DatedReport>(
  reports: readonly T[],
): T[] {
  return [...reports].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

/**
 * Which reports a build should show. In production drafts are hidden; in dev
 * (preview) everything is visible so an author can see work in progress.
 * Returns a new array (never mutates).
 */
export function selectVisible<T extends DatedReport>(
  reports: readonly T[],
  isProd: boolean,
): T[] {
  return isProd ? reports.filter((r) => !r.data.draft) : [...reports];
}
