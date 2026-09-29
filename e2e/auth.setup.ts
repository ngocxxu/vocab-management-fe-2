import { expect, test as setup } from '@playwright/test';
import { AUTH_FILE, E2E_USER } from './fixtures';

setup('sign up the e2e user and save the session', async ({ page }) => {
  await page.goto('/signup');

  await page.getByLabel('First Name').fill(E2E_USER.firstName);
  await page.getByLabel('Last Name').fill(E2E_USER.lastName);
  await page.getByLabel('Email Address').fill(E2E_USER.email);
  await page.getByLabel('Password', { exact: true }).fill(E2E_USER.password);
  await page.getByLabel('Confirm Password').fill(E2E_USER.password);
  await page.getByRole('button', { name: /Create Account/ }).click();

  // A session means local Supabase has email confirmation off. If instead the page shows
  // "We've sent a confirmation link", enable_confirmations is on in supabase/config.toml.
  await page.waitForURL('**/dashboard**');
  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({ path: AUTH_FILE });
});
