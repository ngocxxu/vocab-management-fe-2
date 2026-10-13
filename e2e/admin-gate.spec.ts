import { expect, test } from '@playwright/test';

// The default storage state is the normal e2e user from auth.setup.ts, a GUEST rather than an admin.
// Both checks use the real backend, so the role comes from the database, not from the page.

test('a normal user gets a 404 on /admin', async ({ page }) => {
  const response = await page.goto('/admin');

  expect(response?.status()).toBe(404);
});

test('a normal user sees no Admin link', async ({ page }) => {
  await page.goto('/dashboard');
  // The shell is up once its sign-out button is visible. The header and sidebar both render one, so take the visible one.
  await expect(page.getByRole('button', { name: 'Sign out' }).filter({ visible: true }).first()).toBeVisible();

  await expect(page.getByRole('link', { name: 'Admin', exact: true })).toHaveCount(0);
});
