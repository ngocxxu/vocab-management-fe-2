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
);
