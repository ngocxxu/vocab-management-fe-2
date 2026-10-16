import { expect, test } from '@playwright/test';
import { loginWithAuth0 } from './auth0';
import { E2E_AUTH0_USER } from './fixtures';

// These specs start logged out; the saved session is only for the other specs.
test.use({ storageState: { cookies: [], origins: [] } });

test('sends a logged out visit to /dashboard to Auth0 login', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page.getByLabel(/^Email address/)).toBeVisible();
  await expect(page).toHaveURL(/\.auth0\.com\//);
});

test('stays on Auth0 login with an error for a wrong password', async ({ page }) => {
  await page.goto('/api/auth/login?redirect=%2Fdashboard');

  await page.getByLabel(/^Email address/).fill(E2E_AUTH0_USER.email);
  await page.getByLabel(/^Password/).fill('not-the-password');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  await expect(page.getByText(/wrong email or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\.auth0\.com\//);
});

test('signs in, reaches the dashboard, then signs out', async ({ page }) => {
  await loginWithAuth0(page, E2E_AUTH0_USER);

  // Header and sidebar both render a "Sign out" button; click the visible one.
  await page.getByRole('button', { name: 'Sign out' }).filter({ visible: true }).first().click();
  // Sign-out ends the Auth0 session too, and Auth0 returns the browser to the app root.
  await page.waitForURL(url => url.pathname === '/' && url.hostname === 'localhost');

  await page.goto('/dashboard');
  await expect(page.getByLabel(/^Email address/)).toBeVisible();
});
