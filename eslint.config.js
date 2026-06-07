const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*/*-repository', '@/*/*-helper'],
              message:
                'Cross-module access goes through the module service (facade). Repositories and helpers are module-private — re-export what you need from the service.',
            },
          ],
        },
      ],
    },
  },
]);
