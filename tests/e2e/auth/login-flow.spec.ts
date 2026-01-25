import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { setupAuthMocks } from '../../helpers/api-mock-helper';
import { clearAuthCookies, logoutHelper } from '../../helpers/auth-helper';

test.describe('Auth Flow Tests', () => {
  test('P1-17: Login Error Handling', async ({ page }) => {
    await setupAuthMocks(page, true);
    await clearAuthCookies(page);

    await page.goto('/signin');

    await page.getByLabel(/email/i).fill(TEST_USERS.valid.email);
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    const errorMessage = page.getByText(/invalid.*credentials|wrong.*password|authentication.*failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    await expect(page).toHaveURL(/\/signin/);
  });

  test('P1-18: Logout Flow', async ({ page }) => {
    await setupAuthMocks(page);
    await page.goto('/signin');

    await page.getByLabel(/email/i).fill(TEST_USERS.valid.email);
    await page.getByLabel(/password/i).fill(TEST_USERS.valid.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL(/\/dashboard|\/vocab-list/, { timeout: 10000 });

    const cookiesBefore = await page.context().cookies();
    const hasAccessToken = cookiesBefore.some(c => c.name === 'accessToken');
    expect(hasAccessToken).toBe(true);

    await logoutHelper(page);

    await page.waitForURL(/\/signin/, { timeout: 5000 });

    const cookiesAfter = await page.context().cookies();
    const hasAccessTokenAfter = cookiesAfter.some(c => c.name === 'accessToken');
    expect(hasAccessTokenAfter).toBe(false);
  });

  test('P1-19: Session Expiry', async ({ page }) => {
    await setupAuthMocks(page);
    await page.goto('/signin');

    await page.getByLabel(/email/i).fill(TEST_USERS.valid.email);
    await page.getByLabel(/password/i).fill(TEST_USERS.valid.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL(/\/dashboard|\/vocab-list/, { timeout: 10000 });

    await page.route('**/api/vocabs*', async (route) => {
      await route.fulfill({
        status: 401,
        json: { error: 'Unauthorized', message: 'Token expired' },
      });
    });

    await page.goto('/vocab-list');

    await page.waitForURL(/\/signin/, { timeout: 10000 });

    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });
});
