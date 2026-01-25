import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { setupAuthMocks, setupDashboardMocks } from '../../helpers/api-mock-helper';
import { loginHelper } from '../../helpers/auth-helper';

test.describe('Dashboard Stats Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMocks(page);
    await setupDashboardMocks(page);
    await loginHelper(page, TEST_USERS.valid.email, TEST_USERS.valid.password);
  });

  test('P1-22: Dashboard Stats Load', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const totalVocabsCard = page.getByText(/total.*vocab|vocab.*total/i).first();
    await expect(totalVocabsCard).toBeVisible({ timeout: 5000 });

    const learnedVocabsCard = page.getByText(/learned|mastered/i).first();
    await expect(learnedVocabsCard).toBeVisible();

    const statsValue = page.locator('[class*="stat"], [class*="metric"]').first();
    await expect(statsValue).toBeVisible();

    const statsText = await statsValue.textContent();
    expect(statsText).toBeTruthy();
    expect(Number.parseInt(statsText || '0', 10)).toBeGreaterThanOrEqual(0);
  });
});
