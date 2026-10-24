const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

const moduleFacadePattern = {
  group: ['@/*/*-repository', '@/*/*-helper'],
  message:
    'Cross-module access goes through the module service (facade). Repositories and helpers are module-private — re-export what you need from the service.',
};

const uiNeverReachesData = {
  group: ['**/*-repository', '**/*-helper', '@/config/db', '@/config/db/**'],
  message:
    'ui/ talks to the module service and DTOs only. Repositories, helpers and the db are data-layer code, also via a relative path.',
};

// ui/ may own a store (pending-undo-store), so a relative path only counts when
// it climbs out of ui/ into the module root.
const uiNeverReachesStores = (moduleRootPath) => ({
  group: ['@/*/*-store', moduleRootPath],
  message:
    'ui/ talks to the module service only. A module store is data-layer code, also via a relative path - re-export what you need from the service.',
});

const nothingImportsUi = {
  group: ['@/*/ui', '@/*/ui/**', '**/ui', '**/ui/**'],
  message:
    'ui/ is the presentation layer: only other ui/ code and the routes in src/app may import from it.',
};

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [moduleFacadePattern] },
      ],
    },
  },
  {
    files: ['src/*/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            moduleFacadePattern,
            uiNeverReachesData,
            uiNeverReachesStores('../*-store'),
          ],
        },
      ],
    },
  },
  {
    files: ['src/*/ui/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            moduleFacadePattern,
            uiNeverReachesData,
            uiNeverReachesStores('../../*-store'),
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/*/ui/**', 'src/app/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [moduleFacadePattern, nothingImportsUi] },
      ],
    },
  },
]);
