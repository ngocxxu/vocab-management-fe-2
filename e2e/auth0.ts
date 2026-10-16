import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { TE2eAccount } from './fixtures';

// Signs in through the real Auth0 Universal Login page, the same path a user takes.
// Labels are the Auth0 defaults ("Email address*", "Password*", "Continue").
export async function loginWithAuth0(page: Page, account: TE2eAccount): Promise<void> {
  await page.goto('/api/auth/login?redirect=%2Fdashboard');

  await page.getByLabel(/^Email address/).fill(account.email);
  await page.getByLabel(/^Password/).fill(account.password);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();

  await page.waitForURL('**/dashboard**');
  await expect(page).toHaveURL(/\/dashboard/);
}
