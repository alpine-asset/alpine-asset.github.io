#!/usr/bin/env node
/*
 * Post-build integrity check for the Alpine Asset site.
 *
 * The Astro build guarantees the report frontmatter is well-formed, but it does
 * NOT check that the things the pages LINK TO actually exist. This script does.
 * It reads the finished website in dist/ and fails — with a plain-English list
 * of problems — if anything a visitor could click is broken:
 *
 *   • a "Download PDF" button that points at a file nobody uploaded,
 *   • an <img> whose picture is missing,
 *   • a navigation link to a page that was renamed or deleted,
 *   • an expected page (Home, Research, About, Contact) that vanished.
 *
 * It has NO dependencies and runs on plain Node, so it can never itself break
 * the build for an unrelated reason. Run it with `npm run verify:build` (which
 * builds first), or as part of `npm run verify`.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const SITE_ORIGIN = 'https://alpine-asset.com';

// Pages that must always exist. If AI accidentally deletes one of these, the
// site is broken in a way no visitor should ever see — so we fail loudly.
const REQUIRED_PAGES = [
  'index.html',
  'about/index.html',
  'contact/index.html',
  'research/index.html',
];

const problems = [];
const note = (msg) => problems.push(msg);

if (!existsSync(DIST)) {
  console.error(
    '\n✖ No dist/ folder found. Run `npm run build` first (or use `npm run verify:build`).\n',
  );
  process.exit(1);
}

/** Every file that exists in the built site, as root-relative URLs ("/about/index.html"). */
function listFiles(dir, base = '') {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    const rel = posix.join(base, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(abs, rel));
    else out.push(rel);
  }
  return out;
}

const allFiles = new Set(listFiles(DIST));

/** Does a root-relative URL path resolve to a real file in dist? */
function resolves(urlPath) {
  // Strip the query string / hash — they don't change which file is served.
  let p = urlPath.split('#')[0].split('?')[0];
  if (p === '') return true; // pure "#anchor" — same page
  p = decodeURIComponent(p);
  const clean = p.replace(/^\/+/, ''); // drop leading slash
  if (allFiles.has(clean)) return true; // e.g. /reports/x.pdf, /favicon.svg
  // Directory-style route: "/about/" (or "/about") is served by about/index.html.
  const asIndex = posix.join(clean, 'index.html').replace(/^\/+/, '');
  return allFiles.has(asIndex);
}

// --- 1. Required pages ------------------------------------------------------
for (const page of REQUIRED_PAGES) {
  if (!allFiles.has(page)) {
    note(`Expected page is missing from the built site: /${page}`);
  }
}

// --- 2. Every internal link and asset must resolve --------------------------
const htmlFiles = [...allFiles].filter((f) => f.endsWith('.html'));
// Grab href="..." and src="..." (single or double quoted).
const ATTR = /(?:href|src)\s*=\s*("([^"]*)"|'([^']*)')/gi;

for (const file of htmlFiles) {
  const html = readFileSync(join(DIST, file), 'utf8');
  const prettyPage = '/' + file.replace(/index\.html$/, '');
  const seen = new Set();

  for (const match of html.matchAll(ATTR)) {
    const url = (match[2] ?? match[3] ?? '').trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);

    // Skip things that aren't a link to a file we ship.
    if (/^(mailto:|tel:|javascript:|data:)/i.test(url)) continue;
    if (url.startsWith('#')) continue;

    let pathToCheck = null;
    if (url.startsWith('/')) {
      pathToCheck = url; // root-relative internal link/asset
    } else if (url.startsWith(SITE_ORIGIN)) {
      pathToCheck = url.slice(SITE_ORIGIN.length) || '/'; // our own canonical URL
    } else if (/^https?:\/\//i.test(url)) {
      continue; // genuinely external — not our job to verify
    } else {
      pathToCheck = '/' + url; // relative path
    }

    if (!resolves(pathToCheck)) {
      note(`Broken link on page ${prettyPage} → "${url}" (no such file in the built site).`);
    }
  }
}

// --- 3. Sanity: the site must actually have content -------------------------
const reportPages = [...allFiles].filter(
  (f) =>
    f.startsWith('research/') &&
    f.endsWith('/index.html') &&
    f !== 'research/index.html', // the listing page itself is not a report
);
if (reportPages.length === 0) {
  note(
    'No research report pages were built. Every report in src/content/reports/ ' +
      'may be marked `draft: true`, or the collection is empty.',
  );
}

// --- Report -----------------------------------------------------------------
if (problems.length > 0) {
  console.error(`\n✖ Build verification failed — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`   • ${p}`);
  console.error(
    '\nNothing was published. Fix the items above and run the check again.\n',
  );
  process.exit(1);
}

const pageCount = htmlFiles.length;
console.log(
  `\n✓ Build verified: ${pageCount} page(s), ${reportPages.length} report(s), ` +
    `all internal links and assets resolve.\n`,
);
