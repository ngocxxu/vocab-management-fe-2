import { expect, test } from '@playwright/test';
import { API, AUTH_SPEC_USER, FORM_ALERT } from './fixtures';

// These specs start logged out; the saved session is only for the other specs.
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeAll(async ({ playwright }) => {
  const api = await playwright.request.newContext();
  const response = await api.post(`${API}/auth/signup`, {
    data: { ...AUTH_SPEC_USER, phone: '', avatar: '', role: 'GUEST' },
  });
  expect(response.ok(), await response.text()).toBe(true);
  await api.dispose();
});

test('redirects a logged out visit to /dashboard to the signin page', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/signin\?redirect=%2Fdashboard/);
});

test('shows an error and stays on signin for a wrong password', async ({ page }) => {
  await page.goto('/signin');

  await page.getByLabel('Email Address').fill(AUTH_SPEC_USER.email);
  await page.getByLabel('Password', { exact: true }).fill('not-the-password');
  await page.getByRole('button', { name: /Sign In to Dashboard/ }).click();

  await expect(page.locator(FORM_ALERT)).toBeVisible();
  await expect(page).toHaveURL(/\/signin/);
});

test('signs in, reaches the dashboard, then signs out', async ({ page }) => {
  await page.goto('/signin');

  await page.getByLabel('Email Address').fill(AUTH_SPEC_USER.email);
  await page.getByLabel('Password', { exact: true }).fill(AUTH_SPEC_USER.password);
  await page.getByRole('button', { name: /Sign In to Dashboard/ }).click();
  await page.waitForURL('**/dashboard**');

  // Header and sidebar both render a "Sign out" button; click the visible one.
  await page.getByRole('button', { name: 'Sign out' }).filter({ visible: true }).first().click();
  await page.waitForURL(url => !url.pathname.startsWith('/dashboard'));

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/signin/);
});
