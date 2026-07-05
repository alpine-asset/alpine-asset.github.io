// Flat ESLint config. `astro check` covers types and content-schema validation;
// ESLint adds the lint layer on top — unused vars, unsafe patterns, and
// Astro-specific rules (e.g. component structure) that the type-checker misses.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  {
    // Build output, generated types, and vendored deps are not ours to lint.
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Node scripts and config files (the build verifier, config .mjs) run in
    // Node, so give them Node globals. The Astro <script> blocks get browser
    // globals from eslint-plugin-astro's recommended config.
    files: ['scripts/**/*.{js,mjs}', '*.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
  },
);
