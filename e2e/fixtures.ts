// Test-only password for every e2e user. Local dev only, never a real credential.
export const E2E_PASSWORD = 'E2e-password-123';

export type TE2eUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

// Test-only credentials. The email is unique per run, so reruns never collide with earlier users.
// Domain must be a real-looking one: the backend IsEmail() rejects @test.local.
export const E2E_USER: TE2eUser = {
  email: `e2e+${process.env.E2E_RUN_ID}@example.com`,
  password: E2E_PASSWORD,
  firstName: 'Ee',
  lastName: 'Test',
};

export const AUTH_FILE = 'e2e/.auth/user.json';

// Next.js renders its own role="alert" route announcer, so target the form alert only.
export const FORM_ALERT = '[role="alert"]:not(#__next-route-announcer__)';

export const API = 'http://localhost:3100/api/v1';

// auth.spec signs in and out with its own user. Signing out revokes the user's sessions on
// the backend, which would invalidate the saved session the other specs reuse.
export const AUTH_SPEC_USER: TE2eUser = {
  email: `e2e+${process.env.E2E_RUN_ID}-auth@example.com`,
  password: E2E_PASSWORD,
  firstName: 'Ee',
  lastName: 'Auth',
};

export const ADMIN_AUTH_FILE = 'e2e/.auth/admin.json';

// Signed up through the API, then promoted to ADMIN by admin.setup.ts before its first sign-in.
export const ADMIN_USER: TE2eUser = {
  email: `e2e+${process.env.E2E_RUN_ID}-admin@example.com`,
  password: E2E_PASSWORD,
  firstName: 'Ee',
  lastName: 'Admin',
};

// Created by admin.spec.ts, then changed, deactivated, reactivated and deleted through the admin UI.
export const TARGET_USER: TE2eUser = {
  email: `e2e+${process.env.E2E_RUN_ID}-target@example.com`,
  password: E2E_PASSWORD,
  firstName: 'Ee',
  lastName: 'Target',
};
