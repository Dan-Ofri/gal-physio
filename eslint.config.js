import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import pluginAstro from 'eslint-plugin-astro';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...pluginAstro.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['playwright.config.ts', 'e2e/**/*.ts'],
    languageOptions: {
      // Node for the test runner itself, browser for the callbacks handed to
      // `page.evaluate()` — those are serialised and run in the page, so they
      // legitimately reach for `window`/`document`.
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['screenshots/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['**/*.astro'],
    plugins: { 'jsx-a11y': pluginJsxA11y },
    settings: {
      'jsx-a11y': {
        attributes: { for: ['for', 'htmlFor'] },
      },
    },
    rules: {
      ...pluginJsxA11y.configs.recommended.rules,
      // role="group" is allowed to carry tabindex: the one legitimate case is a
      // scrollable container (WCAG 2.1.1 / axe "scrollable-region-focusable"),
      // which has no interactive ARIA role of its own.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['group'] }],
    },
  },
  {
    // `playwright-report/` and `test-results/` hold generated artifacts —
    // bundled trace viewer JS, error contexts — that lint as thousands of
    // browser-global errors. CI never sees them, because lint runs before the
    // Playwright step creates them; locally they turn `npm run lint` red after
    // the first test run.
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      '.claude/',
      '.agents/',
      'playwright-report/',
      'test-results/',
    ],
  },
];
