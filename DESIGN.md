# Design System — Vocab Management Frontend

## Visual Direction

**Google-inspired productivity UI.** Clean surfaces, Material-adjacent color system, high information density. Not a generic shadcn template — tokens are custom-mapped to a blue-primary palette with semantic success/warning/destructive states.

Both light and dark modes are first-class. Color values are intentional, not auto-generated.

---

## Color Tokens

All colors live in `src/styles/global.css` as CSS custom properties. Never use Tailwind palette classes directly.

### Light Mode (`:root`)

| Token | Value | Usage |
|---|---|---|
| `--background` | `#f8f9fd` | Page background (off-white, not pure white) |
| `--foreground` | `#202124` | Body text (Google gray-900) |
| `--card` | `#ffffff` | Card surfaces |
| `--primary` | `#1a73e8` | Brand blue, primary actions, links |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--secondary` | `#f8f9fd` | Secondary surfaces |
| `--muted` | `#f8f9fd` | Subdued backgrounds |
| `--muted-foreground` | `#5f6368` | Placeholder text, secondary labels |
| `--accent` | `#e8f0fe` | Highlight backgrounds, selection states |
| `--accent-foreground` | `#202124` | Text on accent |
| `--destructive` | `#ea4335` | Errors, delete actions |
| `--success` | `#34a853` | Correct answers, mastery indicators |
| `--warning` | `#fbbc04` | Warnings, partial states |
| `--border` | `#e8eaed` | Dividers, input borders |
| `--ring` | `#1a73e8` | Focus rings |

### Dark Mode (`.dark`)

| Token | Value | Usage |
|---|---|---|
| `--background` | `#0b121e` | Deep navy base |
| `--card` | `#161d2d` | Card surfaces |
| `--secondary` / `--muted` / `--accent` | `#1f293a` | Elevated surfaces |
| `--muted-foreground` | `#94a3b8` | Secondary text |
| `--primary` | `#1e88e5` | Slightly lighter blue for dark contrast |
| `--border` / `--input` | `#1f293a` | Subtle borders |

### Chart Palette

| Token | Light | Dark |
|---|---|---|
| `--chart-1` | `#1a73e8` | `#3b82f6` |
| `--chart-2` | `#34a853` | `#34a853` |
| `--chart-3` | `#fbbc04` | `#fbbc04` |
| `--chart-4` | `#ea4335` | `#ea4335` |
| `--chart-5` | `#5f6368` | `#94a3b8` |

---

## Typography

**Font:** Lexend (Google Fonts, loaded via `next/font`)

```css
--font-sans: var(--font-lexend), 'Lexend', ui-sans-serif, system-ui, sans-serif;
```

Applied globally via `body { @apply font-sans antialiased; }`.

Lexend is chosen for reading efficiency and fatigue reduction — appropriate for vocabulary study workflows.

---

## Spacing & Radius

**Border radius** is token-driven with a `0.75rem` base:

| Token | Value |
|---|---|
| `--radius-sm` | `calc(0.75rem - 4px)` ≈ 8px |
| `--radius-md` | `calc(0.75rem - 2px)` ≈ 10px |
| `--radius-lg` | `0.75rem` = 12px |
| `--radius-xl` | `calc(0.75rem + 4px)` ≈ 16px |

Cards and dialogs use `--radius-lg` by default (shadcn New York style).

---

## Component Library

**shadcn/ui** (New York variant) — components in `src/components/ui/`.

Import via re-exports in `src/shared/ui/*` — never import `@/components/ui/*` directly in feature code.

### Available Primitives

`alert-dialog` · `alert` · `badge` · `breadcrumb` · `button` · `card` · `checkbox` · `color-picker` · `command` · `dialog` · `drawer` · `dropdown-menu` · `form` · `input` · `kbd` · `label` · `multi-select` · `popover` · `scroll-area` · `select` · `separator` · `skeleton` · `slider` · `sonner` · `table` · `tabs` · `textarea` · `tooltip`

### CVA Variants Pattern

Use `class-variance-authority` for variant-driven components. Use `cn()` from `src/libs/utils.ts` for conditional class merging.

```tsx
import { cn } from '@/libs/utils';
import { cva } from 'class-variance-authority';

const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
    },
  },
});
```

---

## Icons

**`@solar-icons/react`** — SSR variants preferred (`@solar-icons/react/ssr`).

Consistent icon family across all surfaces. Do not mix with other icon sets.

---

## Plan Badge System

```css
/* .plan-badge-free  { @apply bg-muted text-muted-foreground; }
.plan-badge-pro   { @apply bg-accent text-accent-foreground; }
.plan-badge-admin { @apply bg-primary text-primary-foreground; } */
```

Applied to user plan indicators in profile, sidebar, and settings surfaces.

---

## Animation

### Flip Card (Vocab Trainer)

3D card flip for flashcard interaction:

```css
/* .perspective-1000 { perspective: 1000px; }
.transform-gpu    { transform-style: preserve-3d; }
.backface-hidden  { backface-visibility: hidden; }
.rotate-y-180     { transform: rotateY(180deg); } */
```

Animates `transform` only — compositor-friendly, no layout reflow.

### General

`tw-animate-css` imported for utility animation classes. All motion stays on `transform` and `opacity`.

---

## Dark Mode

Toggled via `.dark` class on `<html>` (managed by `next-themes`). Accessed via `useTheme` hook (`src/hooks/useTheme.ts`).

Both palettes are fully specified — not auto-inverted. Dark mode uses navy base (`#0b121e`) with elevated surfaces at `#161d2d` and `#1f293a`.

---

## Shared Component Inventory

### Cross-Feature (`src/components/shared/`)

| Component | Purpose |
|---|---|
| `BulkDeleteDialog` | Confirmation dialog for bulk delete operations |
| `DeleteActionButton` | Destructive action button with guard |
| `ErrorState` | Generic error fallback UI |
| `ExamErrorState` | Exam-specific error state |
| `LoadingComponent` | Skeleton / spinner loading placeholder |

### Feature UI Modules

| Feature | Key Components |
|---|---|
| `vocab-list` | `VocabList`, `VocabListHeader`, `ExpandedRowContent`, `AddVocabDialog`, `ImportVocabDialog`, `WordRelationsDisplay`, `MasteryScoreCell`, `SubjectBadgeGroup` |
| `dashboard` | `DashboardChartsZone`, `DashboardHeatmapZone`, `DashboardCriticalZone`, `DashboardNextActionZone`, `DashboardProblematicZone` |
| `auth` | Sign-in, sign-up, OAuth flows |

---

## Notification & Feedback

**Toast:** `sonner` via `<Toaster />` in root layout. Use `toast.success()`, `toast.error()`, `toast.warning()`.

**Dialogs:** Radix-based via shadcn `dialog` and `alert-dialog`. Destructive confirmations always use `alert-dialog`.

---

## Responsive & Accessibility

- Semantic HTML structure enforced (no div-soup layouts)
- `suppressHydrationWarning` on `<html>` and `<body>` to prevent extension mismatch
- Focus management delegated to Radix UI primitives
- `font-display: swap` via Next.js font loading

---

## Tailwind Usage Rules

| Rule | Detail |
|---|---|
| Semantic tokens only | `bg-background`, `text-foreground`, `border-border`, etc. |
| No palette classes | `bg-red-500`, `text-white`, `border-gray-300` are ESLint errors |
| No bare white/black | `bg-white`, `text-black` are banned |
| Dark mode | `.dark` class variant via `@custom-variant dark (&:is(.dark *))` |
| Config precedence | `src/styles/global.css` `@theme inline` overrides `tailwind.config.js` |
