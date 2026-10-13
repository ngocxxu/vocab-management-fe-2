import { expect, test as setup } from '@playwright/test';
import { ADMIN_AUTH_FILE, ADMIN_USER } from './fixtures';
import { promoteToAdmin } from './promote';
import { signUpViaApi } from './signup';

// The user is created through the API and promoted before anything signs it in. The first page sign-in then
// starts with ADMIN already in the database, so the saved session never carries a stale role.
setup('sign up the e2e admin, promote it, and save its session', async ({ page }) => {
  await signUpViaApi(ADMIN_USER);
  promoteToAdmin(ADMIN_USER.email);

  await page.goto('/signin');
  await page.getByLabel('Email Address').fill(ADMIN_USER.email);
  await page.getByLabel('Password', { exact: true }).fill(ADMIN_USER.password);
  await page.getByRole('button', { name: /Sign In to Dashboard/ }).click();
  await page.waitForURL('**/dashboard**');
  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
