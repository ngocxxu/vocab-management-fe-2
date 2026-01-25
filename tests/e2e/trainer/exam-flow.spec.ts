import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { setupAuthMocks, setupTrainerMocks, setupVocabMocks } from '../../helpers/api-mock-helper';
import { loginHelper } from '../../helpers/auth-helper';

test.describe('Vocab Trainer Exam Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupVocabMocks(page);
    await setupAuthMocks(page);
    await setupTrainerMocks(page);
    await loginHelper(page, TEST_USERS.valid.email, TEST_USERS.valid.password);
  });

  test('P0-07: Start Trainer Exam', async ({ page }) => {
    await page.goto('/vocab-trainer');

    await page.waitForLoadState('networkidle');

    const startButton = page.getByRole('button', { name: /start|begin|practice/i }).first();
    await expect(startButton).toBeVisible({ timeout: 5000 });

    await startButton.click();

    await page.waitForURL(/\/exam/, { timeout: 10000 });

    const examPage = page.url();
    expect(examPage).toMatch(/\/exam/);

    const questionElement = page.locator('.question, .flip-card, [data-testid="question"]').first();
    await expect(questionElement).toBeVisible({ timeout: 5000 });
  });

  test('P0-08: Submit Exam Result', async ({ page }) => {
    await page.goto('/vocab-trainer');
    await page.waitForLoadState('networkidle');

    const startButton = page.getByRole('button', { name: /start|begin|practice/i }).first();
    await startButton.click();

    await page.waitForURL(/\/exam/, { timeout: 10000 });

    await page.waitForTimeout(1000);

    const submitButton = page.getByRole('button', { name: /submit|finish|complete/i });
    if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitButton.click();
    } else {
      const answerInput = page.locator('input, textarea, button').first();
      await answerInput.fill('test answer');
      await submitButton.click();
    }

    await page.waitForURL(/\/result/, { timeout: 10000 });

    const resultPage = page.url();
    expect(resultPage).toMatch(/\/result/);

    const scoreElement = page.getByText(/score|points|result/i).first();
    await expect(scoreElement).toBeVisible({ timeout: 5000 });
  });

  test('P1-12: Create Trainer', async ({ page }) => {
    await page.goto('/vocab-trainer');
    await page.waitForLoadState('networkidle');

    const createButton = page.getByRole('button', { name: /add|create.*trainer|new trainer/i });
    await createButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/name|trainer name/i).fill('Daily Practice');

    const vocabCheckboxes = page.getByRole('checkbox').filter({ hasText: /hello|computer/i });
    if (await vocabCheckboxes.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await vocabCheckboxes.first().click();
    }

    await page.getByRole('button', { name: /save|create/i }).click();

    await expect(page.getByText(/trainer.*created|successfully/i)).toBeVisible({ timeout: 5000 });

    await expect(page.getByText('Daily Practice')).toBeVisible({ timeout: 3000 });
  });

  test('P1-16: Retry Exam', async ({ page }) => {
    await page.goto('/vocab-trainer');
    await page.waitForLoadState('networkidle');

    const startButton = page.getByRole('button', { name: /start|begin|practice/i }).first();
    await startButton.click();

    await page.waitForURL(/\/exam/, { timeout: 10000 });

    await page.waitForTimeout(1000);

    const submitButton = page.getByRole('button', { name: /submit|finish/i });
    if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitButton.click();
    }

    await page.waitForURL(/\/result/, { timeout: 10000 });

    const retryButton = page.getByRole('button', { name: /practice again|retry|try again/i });
    await expect(retryButton).toBeVisible({ timeout: 5000 });

    await retryButton.click();

    await page.waitForURL(/\/exam/, { timeout: 10000 });

    const questionNumber = page.getByText(/question.*1|1.*of/i);
    await expect(questionNumber).toBeVisible({ timeout: 3000 });
  });
});
