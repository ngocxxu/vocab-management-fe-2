import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import antfu from '@antfu/eslint-config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tailwind from 'eslint-plugin-tailwindcss';

export default antfu(
  {
    react: true,
    nextjs: true,
    typescript: true,

    // Configuration preferences
    lessOpinionated: true,
    isInEditor: false,

    // Code style
    stylistic: {
      semi: true,
    },

    // Format settings
    formatters: {
      css: true,
    },

    // Ignored paths
    ignores: [
      'migrations/**/*',
      '.pnpm-store/**/*',
      'node_modules/**/*',
      '.next/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
    ],
  },
  // --- Accessibility Rules ---
  jsxA11y.flatConfigs.recommended,
  // --- Tailwind CSS Rules ---
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: `${dirname(fileURLToPath(import.meta.url))}/src/styles/global.css`,
      },
    },
  },

  // --- Custom Rule Overrides ---
  {
    rules: {
      'antfu/no-top-level-await': 'off',
      'style/brace-style': ['error', '1tbs'],
      'ts/consistent-type-definitions': ['error', 'type'],
      'react/prefer-destructuring-assignment': 'off',
      'node/prefer-global/process': 'off',
      'perfectionist/sort-imports': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: String.raw`Literal[value=/\b(bg|text|border|ring|outline|from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/]`,
          message: 'Do not use Tailwind default palette colors. Use semantic tokens (e.g. bg-primary, text-foreground, border-border) backed by CSS variables.',
        },
        {
          selector: String.raw`TemplateElement[value.raw=/\b(bg|text|border|ring|outline|from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/]`,
          message: 'Do not use Tailwind default palette colors in template strings. Use semantic tokens backed by CSS variables.',
        },
        {
          selector: String.raw`Literal[value=/\b(bg|text|border)-(white|black)\b/]`,
          message: 'Do not use Tailwind white/black utilities. Use semantic tokens (e.g. bg-background/bg-card, text-foreground, border-border).',
        },
        {
          selector: String.raw`TemplateElement[value.raw=/\b(bg|text|border)-(white|black)\b/]`,
          message: 'Do not use Tailwind white/black utilities in template strings. Use semantic tokens.',
        },
      ],
    },
  },
  // --- Architecture Enforcement (feature-based modular) ---
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/features/**/ui/**/*.{ts,tsx}',
      'src/shared/ui/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/utils/server-api',
              message: 'UI must not call APIs. Use feature services (server/client) and hooks.',
            },
            {
              name: '@/utils/client-api',
              message: 'UI must not call APIs. Use feature services (server/client) and hooks.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'UI must not call APIs. Use feature services and hooks.',
        },
      ],
    },
  },
  {
    files: [
      'src/app/(app)/**/*.{ts,tsx}',
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
    ],
    ignores: [
      'src/app/api/**/*',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/utils/server-api',
              message: 'Routes should call feature server services (src/features/**/services/server/*) or server actions, not the raw API client.',
            },
            {
              name: '@/utils/client-api',
              message: 'Routes should call feature services/actions, not the raw API client.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/features/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: 'Do not deep-import feature internals via alias. Use relative imports within a feature; use `@/features/<feature>` (feature root) for cross-feature access.',
            },
          ],
        },
      ],
    },
  },
);
