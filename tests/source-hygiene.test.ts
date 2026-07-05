import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * Repo-guard tests. These close two gaps the existing gates can't see:
 *
 *  1. Stylelint's `color-no-hex` runs `postcss-html`, which parses <style>
 *     blocks but NOT SVG presentation attributes (fill="#…" / stroke="#…") in
 *     markup. That's exactly where the logo and icon colours had been
 *     hard-coded, bypassing tokens. This test fails the build if a hex colour
 *     reappears in an SVG attribute.
 *  2. Shared strings (the contact email) had been re-typed in several files.
 *     This test fails the build if the raw email literal reappears in a page or
 *     component instead of importing SITE_EMAIL from src/lib/site.ts.
 */

const SRC = fileURLToPath(new URL('../src', import.meta.url));

const astroFiles = readdirSync(SRC, { recursive: true })
  .map(String)
  .filter((f) => f.endsWith('.astro'))
  .map((f) => join(SRC, f));

// Hex in an SVG colour attribute, e.g. fill="#233C43" or stroke="#fff".
const HEX_IN_SVG_ATTR = /(?:fill|stroke|stop-color)\s*=\s*"#[0-9a-fA-F]{3,8}"/g;

const SITE_EMAIL = 'eric.liu@alpine-asset.com';

describe('source hygiene', () => {
  it('found some .astro files to scan', () => {
    // A guard on the guard: if the walk breaks, don't pass vacuously.
    expect(astroFiles.length).toBeGreaterThan(0);
  });

  it('has no hard-coded hex colours in SVG attributes (use a token / currentColor)', () => {
    const offenders = astroFiles
      .map((file) => ({
        file,
        hits: readFileSync(file, 'utf8').match(HEX_IN_SVG_ATTR) ?? [],
      }))
      .filter(({ hits }) => hits.length > 0)
      .map(({ file, hits }) => `${file}: ${hits.join(', ')}`);

    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('does not re-type the site email (import SITE_EMAIL from src/lib/site.ts)', () => {
    const offenders = astroFiles.filter((file) =>
      readFileSync(file, 'utf8').includes(SITE_EMAIL),
    );

    expect(offenders, `hard-coded email in:\n${offenders.join('\n')}`).toEqual(
      [],
    );
  });
});
