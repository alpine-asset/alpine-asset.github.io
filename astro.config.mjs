// @ts-check
import { defineConfig } from 'astro/config';

// The site is served from the custom domain (see public/CNAME), so the base
// path is the root. `site` is used to generate absolute URLs (sitemaps, canonical, etc.).
export default defineConfig({
  site: 'https://alpine-asset.com',
});
