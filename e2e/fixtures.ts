// Test-only credentials for the local Supabase started by `supabase start`.
// The email is unique per run: the Supabase auth DB is not reset between runs.
// Domain must be a real-looking one: the backend IsEmail() rejects @test.local.
export const E2E_USER = {
  email: `e2e+${process.env.E2E_RUN_ID}@example.com`,
  password: 'E2e-password-123',
  firstName: 'Ee',
  lastName: 'Test',
};

export const AUTH_FILE = 'e2e/.auth/user.json';

// Next.js renders its own role="alert" route announcer, so target the form alert only.
export const FORM_ALERT = '[role="alert"]:not(#__next-route-announcer__)';

export const API = 'http://localhost:3100/api/v1';

// auth.spec signs in and out with its own user. Signing out revokes the user's sessions on
// the backend, which would invalidate the saved session the other specs reuse.
export const AUTH_SPEC_USER = {
  email: `e2e+${process.env.E2E_RUN_ID}-auth@example.com`,
  password: 'E2e-password-123',
  firstName: 'Ee',
  lastName: 'Auth',
};
