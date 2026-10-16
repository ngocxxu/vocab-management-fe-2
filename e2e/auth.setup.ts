import { expect, test as setup } from '@playwright/test';
import { loginWithAuth0 } from './auth0';
import { AUTH_FILE, E2E_AUTH0_USER } from './fixtures';

setup('sign in the e2e user through Auth0 and save the session', async ({ page }) => {
  await loginWithAuth0(page, E2E_AUTH0_USER);

  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: AUTH_FILE });
});
