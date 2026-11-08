// @ts-check
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/', 'dist-artifact/', 'test-results/', 'playwright-report/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      // the canvas code uses short names on purpose (ctx, p, t); unused ones still fail
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**', '*.config.*', 'e2e/**', 'tests/**'],
    languageOptions: { globals: { ...globals.node } },
  },
)
