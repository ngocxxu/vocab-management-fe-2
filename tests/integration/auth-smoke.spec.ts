import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';
import { clearAuthCookies } from '../helpers/auth-helper';

test.describe('P0: Auth Smoke Tests (Real API)', () => {
  test('P0-01: Smoke Login & Token', async ({ page }) => {
    await page.goto('/signin');

    await page.getByLabel(/email/i).fill(TEST_USERS.valid.email);
    await page.getByLabel(/password/i).fill(TEST_USERS.valid.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL(/\/dashboard|\/vocab-list/, { timeout: 10000 });

    const cookies = await page.context().cookies();
    const accessTokenCookie = cookies.find(c => c.name === 'accessToken');

    expect(accessTokenCookie).toBeDefined();
    expect(accessTokenCookie?.value).toBeTruthy();
    expect(accessTokenCookie?.httpOnly).toBe(true);
  });

  test('P0-09: Protected Route Guard', async ({ page }) => {
    await clearAuthCookies(page);

    await page.goto('/vocab-list');

    await page.waitForURL(/\/signin/, { timeout: 5000 });

    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });

  test('P0-10: Sign Up Success', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel(/first name/i).fill(TEST_USERS.newUser.firstName);
    await page.getByLabel(/last name/i).fill(TEST_USERS.newUser.lastName);
    await page.getByLabel(/email/i).fill(TEST_USERS.newUser.email);
    await page.getByLabel(/phone/i).fill(TEST_USERS.newUser.phone);
    await page.getByLabel(/password/i).fill(TEST_USERS.newUser.password);

    const signUpButton = page.getByRole('button', { name: /sign up|create account/i });
    await signUpButton.click();

    await page.waitForURL(/\/dashboard|\/signin/, { timeout: 10000 });

    const cookies = await page.context().cookies();
    const accessTokenCookie = cookies.find(c => c.name === 'accessToken');

    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/vocab-list')) {
      expect(accessTokenCookie).toBeDefined();
    } else {
      const successMessage = page.getByText(/success|account created/i);
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });
});
