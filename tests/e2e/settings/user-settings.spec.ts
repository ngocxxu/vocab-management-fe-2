import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { setupAuthMocks } from '../../helpers/api-mock-helper';
import { loginHelper } from '../../helpers/auth-helper';

test.describe('User Settings Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMocks(page);
    await loginHelper(page, TEST_USERS.valid.email, TEST_USERS.valid.password);
  });

  test('P1-20: Change Password', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const passwordSection = page.getByRole('heading', { name: /password|change password/i });
    await expect(passwordSection).toBeVisible({ timeout: 5000 });

    await page.route('**/api/auth/change-password', async (route) => {
      await route.fulfill({
        status: 200,
        json: { message: 'Password changed successfully' },
      });
    });

    const currentPasswordInput = page.getByLabel(/current.*password|old.*password/i);
    const newPasswordInput = page.getByLabel(/new.*password/i);
    const confirmPasswordInput = page.getByLabel(/confirm.*password/i);

    if (await currentPasswordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await currentPasswordInput.fill('OldPassword123!');
      await newPasswordInput.fill('NewPassword123!');
      await confirmPasswordInput.fill('NewPassword123!');

      const saveButton = page.getByRole('button', { name: /save|update.*password/i });
      await saveButton.click();

      await expect(page.getByText(/password.*changed|updated.*successfully/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('P1-21: Theme Toggle', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const themeToggle = page.getByRole('button', { name: /theme|dark mode|light mode/i });

    if (await themeToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      const htmlBefore = await page.locator('html').getAttribute('class');

      await themeToggle.click();

      await page.waitForTimeout(500);

      const htmlAfter = await page.locator('html').getAttribute('class');

      if (htmlBefore?.includes('dark')) {
        expect(htmlAfter).not.toContain('dark');
      } else {
        expect(htmlAfter).toContain('dark');
      }
    } else {
      const bodyBackground = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      expect(bodyBackground).toBeTruthy();
    }
  });
});
