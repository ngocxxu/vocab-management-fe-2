# E2E tests (Playwright)

Specs live in `e2e/`. Run with `pnpm test:e2e` (`pnpm test:e2e:ui` for the UI). They never run on push; `.github/workflows/e2e.yml` runs them on a schedule and by hand.

## Isolation from dev

Playwright (`playwright.config.ts`) starts both servers: frontend `:3101`, backend `:3100` (`../vocab-management-be-2`, override with `E2E_BE_DIR`). The backend uses database `vocab_e2e` and Redis db 1, and is migrated, reset and seeded on every run.

## Setup

1. Once: copy `.env.e2e.example` to `.env.e2e` in both repos and fill them in. The test Auth0 accounts live there.
2. Each session, in the backend repo: `docker compose up -d postgres redis`.
3. Stop the frontend `pnpm dev`; two `next dev` in one folder conflict.

`e2e/preflight.mjs` fails fast when postgres (:5433) or redis (:6379) is down.

## Auth

`e2e/auth.setup.ts` signs the e2e user in through Auth0 (`e2e/auth0.ts`) and saves the session to `e2e/.auth/` for the other specs. Specs that sign out use their own user, because signing out revokes that user's sessions on the backend.
