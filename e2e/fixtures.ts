// Test-only accounts. The two Auth0 users are created once by hand in the dev tenant, and their
// passwords come from .env.e2e, never from this file. The DB is reset on every run.
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing: set it in .env.e2e (see .env.e2e.example)`);
  }
  return value;
}

export type TE2eAccount = {
  email: string;
  password: string;
};

// Signs in through Auth0 Universal Login. The first login creates the Vocab user (POST /auth/sync).
export const E2E_AUTH0_USER: TE2eAccount = {
  email: requiredEnv('E2E_AUTH0_USER_EMAIL'),
  password: requiredEnv('E2E_AUTH0_USER_PASSWORD'),
};

// Promoted to ADMIN in the database by admin.setup.ts after its first login.
export const E2E_AUTH0_ADMIN: TE2eAccount = {
  email: requiredEnv('E2E_AUTH0_ADMIN_EMAIL'),
  password: requiredEnv('E2E_AUTH0_ADMIN_PASSWORD'),
};

export const AUTH_FILE = 'e2e/.auth/user.json';
export const ADMIN_AUTH_FILE = 'e2e/.auth/admin.json';

export const API = 'http://localhost:3100/api/v1';

// Created straight in the database by admin.spec.ts, with no Auth0 identity, so deleting it through the
// admin UI never touches the dev tenant. The email is unique per run.
export const TARGET_USER = {
  email: `e2e+${process.env.E2E_RUN_ID}-target@example.com`,
  firstName: 'Ee',
  lastName: 'Target',
};
