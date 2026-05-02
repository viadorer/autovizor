import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'scripts/**', // Build/import scripts (.mjs) — node prostředí, mimo TS lint
    'src/lib/manufacturers.ts', // Generovaný soubor (4827 řádků dat)
    'navrh vzhledu moderni/**', // Design assets, nikoliv kód
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Strikter konzistence (best practice)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': ['warn', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'smart'],
      'prefer-const': 'warn',
    },
  },
  // Test files: less strict
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
])
