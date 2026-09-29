import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// One id per run; workers inherit it. The local Supabase auth DB is not reset between
// runs, so specs build a unique user email from it.
process.env.E2E_RUN_ID ??= String(Date.now());

const BE_DIR = process.env.E2E_BE_DIR ?? path.resolve(__dirname, '../vocab-management-be-2');
const PREFLIGHT = path.resolve(__dirname, 'e2e/preflight.mjs');

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000, // the first page hit compiles in next dev
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // shared database
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:3101', trace: 'retain-on-failure' },
  webServer: [
    {
      // Backend on :3100 with a freshly migrated + seeded vocab_e2e database on every run.
      // webServer starts before globalSetup, so the reset has to live in this command.
      cwd: BE_DIR,
      command: `node ${PREFLIGHT} && pnpm exec env-cmd -f .env.e2e prisma migrate reset --force && pnpm exec env-cmd -f .env.e2e nodemon`,
      url: 'http://localhost:3100/api/v1/health',
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: 'pipe',
    },
    {
      command: 'pnpm exec dotenv -e .env.e2e -- next dev --turbopack --port 3101',
      url: 'http://localhost:3101/signin',
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});
