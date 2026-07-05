import { defineConfig } from 'vitest/config';

// Unit tests live in tests/ and cover the pure helpers in src/lib/format.ts.
// (Whole-site integrity — that links, PDFs, and images resolve — is checked
// separately against the built output by scripts/verify-build.mjs.)
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
