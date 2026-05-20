## Project Overview

- **App**: Vocabulary management & trainer SPA for language learning (vocab lists, flashcards, exams, statistics)
- **Stack**: Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4 · pnpm
- **Backend**: External NestJS API (separate repo). This repo is the frontend only.
- **Auth**: Cookie-based JWT (HttpOnly). Supabase for OAuth. Tokens never exposed to client JS.
- **Deployment**: Docker → DockerHub (standalone output). Also deployable to Vercel.
- **Observability**: Sentry (error tracking, session replay, logs), LogTape → Better Stack, PostHog (analytics)
- **Security**: Arcjet (bot detection, shield), middleware auth guards in `src/proxy.ts`

---

## Architecture Rules

### Directory Structure

```
src/
├── actions/          # Server Actions ('use server'). Barrel-exported via index.ts
├── app/              # Next.js App Router (pages, layouts, API routes)
│   ├── (app)/        # Authenticated route group (dashboard, library, vocab-list, etc.)
│   ├── api/auth/     # Next.js API routes (proxy to NestJS for auth)
│   ├── signin/       # Public auth pages
│   └── signup/
├── components/       # UI components organized by domain + shared + ui (shadcn)
│   ├── ui/           # shadcn/ui primitives (DO NOT edit directly for style)
│   └── shared/       # Cross-domain reusable components
├── constants/        # Static config values & enums mapped to UI labels
├── enum/             # TypeScript enums (e.g., EQuestionType, EVocabTrainerStatus)
├── features/         # Feature modules (auth, library, dashboard, etc.)
│   └── <feature>/
│       ├── hooks/    # Feature-specific hooks
│       ├── services/
│       │   ├── server/  # Server-side data fetching (called from layouts/pages)
│       │   └── client/  # Client-side service wrappers
│       ├── ui/       # Feature-specific UI components
│       └── utils/    # Feature-specific utilities
├── hooks/            # Global hooks (useAuth, useBulkDelete, useApiPagination, etc.)
├── libs/             # Core libraries (Axios, Env, Logger, Supabase, Arcjet, validations)
├── providers/        # React context providers (SocketProvider)
├── shared/           # Re-export layer for components/ui (import from @/shared/ui/*)
│   └── ui/           # Barrel re-exports of @/components/ui/* and @/components/shared/*
├── styles/           # global.css (CSS variables, design tokens, Tailwind v4 theme)
├── templates/        # Page template wrappers
├── types/            # TypeScript type definitions, barrel-exported via index.ts
└── utils/            # Utility modules (API clients, auth helpers, config)
```

### Layered Architecture — Strict Import Rules (ESLint-enforced)

1. **UI components** (`src/components/**`, `src/features/**/ui/**`, `src/shared/ui/**`):
   - ❌ MUST NOT import `@/utils/server-api` or `@/utils/client-api`
   - ❌ MUST NOT call `fetch()` directly
   - ✅ Consume data via props, hooks, or server actions

2. **Pages/Layouts** (`src/app/(app)/**`, `src/app/**/page.tsx`):
   - ❌ MUST NOT import raw API clients (`@/utils/server-api`, `@/utils/client-api`)
   - ✅ Call feature server services (`src/features/**/services/server/*`) or server actions (`src/actions/*`)

3. **Features** (`src/features/**`):
   - ❌ MUST NOT deep-import other features via alias (e.g., `@/features/auth/services/client/foo`)
   - ✅ Use `@/features/<feature>` (root) for cross-feature access
   - ✅ Use relative imports within the same feature

4. **API flow**:
   ```
   Page/Layout → Server Action (src/actions/) → serverApi (src/utils/server-api.ts) → NestJS backend
   Client Component → Server Action (via 'use server') → serverApi → NestJS backend
   Client Component → axiosInstance (src/libs/axios.ts) → Next.js API route → NestJS backend
   ```

### Shared UI Re-export Pattern

`src/shared/ui/` files are thin barrel re-exports of `src/components/ui/` and `src/components/shared/`:
```ts
// src/shared/ui/button.tsx
export * from '@/components/ui/button';
```
**Import UI primitives from `@/shared/ui/*`** in feature and domain components — not from `@/components/ui/` directly.

---

## Coding Standards

### TypeScript

- **Strict mode is ON** — all strict checks enabled including `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `useUnknownInCatchVariables`
- Prefer `type` over `interface` (enforced: `ts/consistent-type-definitions: ['error', 'type']`)
- Prefix type names with `T` (e.g., `TUser`, `TVocab`, `TCreateVocab`, `TVocabTrainer`)
- Prefix enum names with `E` (e.g., `EQuestionType`, `EVocabTrainerStatus`)
- Use `type`-only imports: `import type { TUser } from '@/types/auth'`
- Generic API responses use `ResponseAPI<T>` wrapper: `{ items: T } & TPagination`
- Never use `any` — use `unknown` and narrow
- All server actions have explicit return types

### Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Types | `T` prefix + PascalCase | `TVocab`, `TCreateVocab`, `TSessionDto` |
| Enums | `E` prefix + PascalCase | `EQuestionType`, `EVocabTrainerStatus` |
| Components | PascalCase | `VocabTrainerList.tsx`, `AddVocabTrainerDialog.tsx` |
| Hooks | `use` prefix + camelCase | `useAuth`, `useBulkDelete`, `useApiPagination` |
| Server actions | camelCase verbs | `createVocab()`, `deleteVocabTrainer()` |
| API objects | camelCase + `Api` suffix | `vocabApi`, `authApi`, `serverApi` |
| Constants | SCREAMING_SNAKE or camelCase | `API_ENDPOINTS`, `QUESTION_TYPE_OPTIONS` |
| CSS variables | kebab-case | `--background`, `--primary-foreground` |
| Files (utils/libs) | kebab-case or PascalCase | `auth-cookies.ts`, `Logger.ts`, `Env.ts` |

### Style & Formatting

- **Semicolons**: Always required (enforced by `stylistic.semi: true`)
- **Brace style**: `1tbs` (opening brace on same line)
- **Formatter**: ESLint-based via `@antfu/eslint-config` — no Prettier
- **CSS formatter**: ESLint `eslint-plugin-format` handles CSS
- **Import sorting**: `perfectionist/sort-imports` is OFF — no enforced import order

### Tailwind CSS — Mandatory Token Usage

- **NEVER** use Tailwind default palette colors (e.g., `bg-red-500`, `text-blue-200`, `border-gray-300`)
- **NEVER** use `bg-white`, `bg-black`, `text-white`, `text-black`, `border-white`, `border-black`
- **ALWAYS** use semantic tokens backed by CSS variables:
  - `bg-background`, `bg-card`, `bg-primary`, `bg-secondary`, `bg-muted`, `bg-accent`, `bg-destructive`, `bg-success`, `bg-warning`
  - `text-foreground`, `text-muted-foreground`, `text-primary`, `text-destructive`
  - `border-border`, `border-input`
- These are enforced via `no-restricted-syntax` ESLint rules — build will fail on violations
- Dark mode: `class`-based via `next-themes` (`.dark` class on `<html>`)
- Design tokens defined in `src/styles/global.css` (`:root` + `.dark`)

### Component UI Library

- **shadcn/ui** (New York style) — components in `src/components/ui/`
- Built on Radix UI primitives + `class-variance-authority` (CVA) + `clsx` + `tailwind-merge`
- `cn()` utility in `src/libs/utils.ts` for className merging
- Icons: `@solar-icons/react` (SSR variants preferred: `@solar-icons/react/ssr`)
- Font: Lexend (Google Fonts, loaded via `next/font`)
- Toast notifications: `sonner` (via `<Toaster />` in root layout)

---

## Data Flow & API Patterns

### Server Actions (`src/actions/`)

All data mutations go through server actions. Pattern:

```ts
'use server';

export async function createVocab(vocabData: TCreateVocab) {
  await requireAuth();// 1. Auth guard
  // ... input validation ...             // 2. Validate inputs
  try {
    const result = await vocabApi.create(vocabData);// 3. Call serverApi
    revalidatePath('/vocab-list');// 4. Invalidate cache
    return result;// 5. Return typed result
  } catch (error) {
    throw toActionError(error, 'Failed to create vocabulary');// 6. Normalize errors
  }
}
```

**Rules**:
- Every mutating action calls `requireAuth()` first
- Use `revalidatePath()` after mutations to refresh server components
- Wrap errors with `toActionError()` from `src/actions/utils.ts`
- Barrel export all actions from `src/actions/index.ts`

### Server-Side API Client (`src/utils/server-api.ts`)

- Singleton `ServerAPI` class with built-in token refresh (race-condition safe via `isRefreshing` promise)
- Directly calls NestJS backend using `NESTJS_API_URL` (server-only env var)
- Uses `BackendRequestError` for structured error responses
- Domain API objects exported: `vocabApi`, `authApi`, `vocabTrainerApi`, etc.

### Client-Side API Client (`src/utils/client-api.ts`)

- Static `ClientAPI` class wrapping the Axios instance (`src/libs/axios.ts`)
- Axios configured with `/api` baseURL (calls Next.js API routes, not backend directly)
- Axios interceptors handle: 401 → token refresh retry, 403 → token expiration redirect
- Client-side API calls should be rare — prefer server actions

### API Configuration (`src/utils/api-config.ts`)

- `API_ENDPOINTS`: Centralized endpoint strings (readonly const object)
- `API_METHODS`: Factory functions returning `{ endpoint, data }` configs
- `buildQueryString()`: Utility for query params (handles arrays, undefined, etc.)
- All new endpoints MUST be added to both `API_ENDPOINTS` and `API_METHODS`

### Environment Variables

- Validated at build time via `@t3-oss/env-nextjs` + Zod in `src/libs/Env.ts`
- All public vars prefixed `NEXT_PUBLIC_*`
- Server-only vars (e.g., `NESTJS_API_URL`, `ARCJET_KEY`) never exposed to client
- New env vars MUST be added to: `src/libs/Env.ts`, `.env.example`, and Dockerfile `ARG`/`ENV` if public

---

## State Management

- **No global state library** (no Redux, Zustand, Jotai)
- Server state: Next.js server components + `revalidatePath()` via server actions
- Client state: React `useState`/`useEffect` + custom hooks
- Form state: `react-hook-form` + `@hookform/resolvers` + Zod schemas
- Validation schemas live in `src/libs/validations/` (e.g., `auth.ts`)
- Real-time: Socket.IO via `SocketProvider` context (`src/providers/SocketProvider.tsx`)

---

## Authentication

- **Cookie-based JWT** — HttpOnly cookies (`accessToken`, `refreshToken`)
- Cookie management: `src/utils/auth-cookies.ts` (server-side read/write/clear)
- Auth verification: `verifyUser()` (cached via `React.cache()`) in `src/actions/auth.ts`
- Auth guard: `requireAuth()` — throws `Error('Unauthorized')` if no valid user
- Middleware: `src/proxy.ts` — Arcjet bot detection + route protection (redirect to `/signin`)
- OAuth: Supabase → `src/app/auth/` callback → NestJS sync
- Protected routes: `/dashboard`, `/library`, `/vocab-list`, `/vocab-trainer`, `/profile`, `/subjects`, `/notifications`

---

## Testing

- **No test suite currently exists** in this repo (test files excluded in `tsconfig.json`)
- Type checking serves as primary safety: `npm run check:types` (`tsc --noEmit`)
- Dead code detection: `npm run check:deps` (Knip)
- Lint checks on pre-commit (Lefthook)
- Playwright config exists (`playwright-report/`, `test-results/`) but no active test files

---

## CI/CD & Deployment

### Pipeline (`.github/workflows/deploy.yml`)

1. **Trigger**: Push to `main` (tags ignored to avoid loops)
2. **Version bump**: Commit-message analysis → semver bump (major/minor/patch)
3. **Docker build**: Multi-stage (deps → builder → runner), pushed to DockerHub
4. **Cache**: GitHub Actions cache for Docker layers (`type=gha`)
5. **Failure notification**: Discord webhook with embedded error details
6. **Release**: `[skip ci]` commit prevents infinite loops

### Versioning

- **Conventional Commits** enforced by `commitlint` + `@commitlint/config-conventional`
- Commit types: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`, `perf:`, `ci:`
- Breaking changes: `feat!:`, `fix!:`, or `BREAKING CHANGE:` in body → major bump
- `chore: bump` commits auto-ignored by commitlint
- Semantic release configured for `main` branch only

### Git Hooks (Lefthook)

- **commit-msg**: Validates conventional commit format
- **pre-commit**:
  1. `eslint --fix` on staged files (auto-stages fixes) — priority 1
  2. `tsc --noEmit` type checking — priority 2

### Docker

- Base: `node:20-alpine`
- Multi-stage: `deps` → `builder` → `runner`
- Standalone output (`output: 'standalone'` in next.config)
- Non-root user (`nextjs:nodejs`, UID 1001)
- Build args for `NEXT_PUBLIC_*` vars injected at build time

---

## Observability

| Tool | Purpose | Config |
|---|---|---|
| Sentry | Error tracking, session replay, logs | `sentry.*.config.ts`, `instrumentation.ts`, `instrumentation-client.ts` |
| Spotlight | Dev-only Sentry UI | `dev:spotlight` script, enabled when `NODE_ENV=development` |
| LogTape | Structured logging (JSON Lines) | `src/libs/Logger.ts` → console + Better Stack |
| Better Stack | Log ingestion | Via LogTape async sink |
| PostHog | Product analytics | `PostHogProvider` in root layout |
| Codecov | Coverage tracking | `codecov.yml` (patch status: off) |

### Logging

- Use `logger` from `@/libs/Logger` — **never** `console.log` in production code
- Log levels: `debug` (dev only), `warn` (client errors 4xx), `error` (server errors 5xx+)
- Structured logging with metadata objects: `logger.error('Message:', { key: value })`

---

## Security

- **Arcjet**: Bot detection (`LIVE` mode) + Shield in middleware. Allows search engines, preview crawlers, monitors.
- **Auth cookies**: HttpOnly, not accessible via client JS
- **CORS**: Axios configured with `withCredentials: true`
- **No `poweredByHeader`** in Next.js config
- **Input validation**: Zod schemas for forms + runtime guards in server actions/API methods
- **Rate limiting**: Via Arcjet rules (configurable per-route)
- **Sentry PII**: `sendDefaultPii: true` — request headers and IP are collected

---

## Review Checklist

Before submitting code, verify:

- [ ] `pnpm lint` passes (ESLint with `@antfu/eslint-config`)
- [ ] `pnpm check:types` passes (`tsc --noEmit --pretty`)
- [ ] No Tailwind default palette colors used (semantic tokens only)
- [ ] New types prefixed with `T`, enums with `E`
- [ ] `type` keyword used (not `interface`)
- [ ] Server actions call `requireAuth()` for protected operations
- [ ] Server actions call `revalidatePath()` after mutations
- [ ] New env vars added to `Env.ts`, `.env.example`, and Dockerfile if needed
- [ ] New API endpoints added to both `API_ENDPOINTS` and `API_METHODS`
- [ ] UI components import from `@/shared/ui/*` (not `@/components/ui/*` directly)
- [ ] No direct `fetch()` calls in UI components
- [ ] Errors wrapped with `toActionError()` in server actions
- [ ] Commit message follows conventional commits format
- [ ] `pnpm check:deps` (Knip) — no unused exports or dead dependencies

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do |
|---|---|
| Use `interface` for types | Use `type` (ESLint-enforced) |
| Use `bg-red-500`, `text-white` | Use `bg-destructive`, `text-foreground` |
| Call `fetch()` in components | Use server actions or hooks |
| Import `@/utils/server-api` in UI | Import from `@/actions/*` or feature services |
| Deep-import from other features | Import from feature root `@/features/<name>` |
| Use `console.log` | Use `logger` from `@/libs/Logger` |
| Use `interface` | Use `type` keyword |
| Add env vars without validation | Add to `src/libs/Env.ts` with Zod schema |
| Use global state libraries | Use server components + `revalidatePath` + React state |
| Skip `requireAuth()` in actions | Always auth-guard mutating server actions |
| Create API endpoints ad-hoc | Add to `API_ENDPOINTS` + `API_METHODS` in `api-config.ts` |
| Edit shadcn components for styling | Use CVA variants or Tailwind classes at usage site |
| Use Prettier | Formatting handled by ESLint (`@antfu/eslint-config`) |

---

## Repository-Specific Gotchas

1. **Middleware is `proxy.ts`**, not `middleware.ts` — exported from `src/proxy.ts` with `config.matcher`
2. **Tailwind v4** — uses `@import 'tailwindcss'` in CSS, `@theme inline {}` blocks, `@custom-variant` syntax. The `tailwind.config.js` file exists but CSS-first config in `global.css` takes precedence.
3. **Shared UI re-exports** — `src/shared/ui/*.tsx` are 1-line re-exports. Don't put logic there.
4. **`ServerAPI` token refresh** uses a singleton promise pattern (`isRefreshing`) to prevent race conditions during concurrent requests.
5. **Supabase client** is lazy-initialized via a `Proxy` — not created at import time.
6. **Sentry can be disabled** via `NEXT_PUBLIC_SENTRY_DISABLED` env var (useful for local dev).
7. **Turbopack** is used in dev mode (`next dev --turbopack`). Ensure code is Turbopack-compatible.
8. **App runs on port 3001** in dev (`--port 3001`), not the default 3000.
9. **`suppressHydrationWarning`** is set on `<html>` and `<body>` to prevent browser extension mismatch errors.
10. **i18n**: Crowdin configured for translations (`src/locales/en.json` → `src/locales/<lang>.json`), but i18n integration code is excluded from Knip analysis.
11. **Docker output tracing** — `outputFileTracingRoot` and `outputFileTracingIncludes` are configured to fix Sentry `clientReferenceManifest` issues in Docker.
12. **Version bump commits** use `[skip ci]` to prevent infinite CI loops.

---

## Preferred Implementation Patterns

### Adding a new feature

1. Create feature directory: `src/features/<name>/`
2. Add sub-dirs as needed: `services/server/`, `services/client/`, `hooks/`, `ui/`, `utils/`
3. Add `index.ts` barrel export at feature root
4. Create server actions in `src/actions/<name>.ts` (add to barrel `src/actions/index.ts`)
5. Add types in `src/types/<name>.ts` (add to barrel `src/types/index.ts`)
6. Add API endpoints to `src/utils/api-config.ts` (`API_ENDPOINTS` + `API_METHODS`)
7. Add API client methods to `src/utils/server-api.ts`
8. Create page in `src/app/(app)/<name>/page.tsx`

### Adding a new UI component

1. For primitives: use `npx shadcn@latest add <component>` (goes to `src/components/ui/`)
2. Add re-export in `src/shared/ui/<component>.tsx`
3. For domain components: create in `src/components/<domain>/`
4. Use `cn()` for className merging, CVA for variants
5. Import icons from `@solar-icons/react/ssr`

### Adding a new server action

```ts
'use server';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function myAction(data: TMyData) {
  await requireAuth();
  // validate inputs
  try {
    const result = await myApi.doSomething(data);
    revalidatePath('/relevant-path');
    return result;
  } catch (error) {
    throw toActionError(error, 'Fallback error message');
  }
}
```

### Form handling

```tsx
const schema = z.object({ /* ... */ });
type FormData = z.infer<typeof schema>;

const form = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onChange',
  defaultValues: { /* ... */ },
});
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server (Turbopack, port 3001) + Spotlight |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix ESLint issues |
| `pnpm check:types` | TypeScript type check |
| `pnpm check:deps` | Dead code/dependency analysis (Knip) |
| `pnpm commit` | Interactive conventional commit |
| `pnpm clean` | Remove `.next`, `out`, `coverage` |
| `pnpm build-stats` | Build with bundle analysis |
