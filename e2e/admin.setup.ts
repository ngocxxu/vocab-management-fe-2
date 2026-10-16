import { expect, test as setup } from '@playwright/test';
import { loginWithAuth0 } from './auth0';
import { ADMIN_AUTH_FILE, E2E_AUTH0_ADMIN } from './fixtures';
import { promoteToAdmin } from './db';

// The first login creates the Vocab user; promotion then makes it an admin. Roles come from the database
// on every request, so the saved session already has the ADMIN role.
setup('sign in the e2e admin through Auth0, promote it, and save its session', async ({ page }) => {
  await loginWithAuth0(page, E2E_AUTH0_ADMIN);
  promoteToAdmin(E2E_AUTH0_ADMIN.email);

  // Confirms the promotion took effect: the admin area renders only for ADMIN.
  await page.goto('/admin');
  await expect(page.getByRole('navigation', { name: 'Admin sections' })).toBeVisible();
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
