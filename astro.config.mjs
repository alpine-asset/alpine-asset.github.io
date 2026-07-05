// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The site is served from the custom domain (see public/CNAME), so the base
// path is the root. `site` is used to generate absolute URLs (sitemaps, canonical, etc.).
export default defineConfig({
  site: 'https://alpine-asset.com',
  // Every internal link is written with a trailing slash and the build emits
  // directory-style pages (/about/index.html). Pin both so a future default
  // change or a hand-written non-slashed link can't silently break routing or
  // the post-build link check.
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    // Generates /sitemap-index.xml + /sitemap-0.xml from `site` at build time.
    sitemap(),
  ],
});
