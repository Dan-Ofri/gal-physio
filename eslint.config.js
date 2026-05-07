import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import pluginAstro from 'eslint-plugin-astro';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';

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
    files: ['**/*.astro'],
    plugins: { 'jsx-a11y': pluginJsxA11y },
    rules: {
      ...pluginJsxA11y.configs.recommended.rules,
    },
  },
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
];
