import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { setupAuthMocks, setupTrainerMocks, setupVocabMocks } from '../../helpers/api-mock-helper';
import { loginHelper } from '../../helpers/auth-helper';

test.describe('Exam Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await setupVocabMocks(page);
    await setupAuthMocks(page);
    await setupTrainerMocks(page);
    await loginHelper(page, TEST_USERS.valid.email, TEST_USERS.valid.password);
  });

  test('P1-13: Flip Card Interaction', async ({ page }) => {
    await page.goto('/vocab-trainer');
    await page.waitForLoadState('networkidle');

    await page.route('**/api/vocab-trainers/*/exam', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          questionType: 'flip-card',
          questions: [
            {
              id: 'q-1',
              vocabId: 'vocab-1',
              vocab: {
                id: 'vocab-1',
                textSource: 'Hello',
                textTargets: [{ textTarget: 'Xin chào' }],
              },
            },
          ],
        },
      });
    });

    const startButton = page.getByRole('button', { name: /start|begin/i }).first();
    await startButton.click();

    await page.waitForURL(/\/exam/, { timeout: 10000 });

    const flipCard = page.locator('.flip-card, [data-testid="flip-card"]').first();
    await expect(flipCard).toBeVisible({ timeout: 5000 });

    const frontSide = flipCard.locator('.flip-card-front, [data-testid="card-front"]').first();
    await expect(frontSide).toBeVisible();

    await flipCard.click();

    await page.waitForTimeout(500);

    const backSide = flipCard.locator('.flip-card-back, [data-testid="card-back"]').first();
    await expect(backSide).toBeVisible({ timeout: 2000 });

    const transform = await flipCard.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });

    expect(transform).not.toBe('none');
  });

  test('P1-14: Multiple Choice Logic', async ({ page }) => {
    await page.goto('/vocab-trainer');
    await page.waitForLoadState('networkidle');

    await page.route('**/api/vocab-trainers/*/exam', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          questionType: 'multiple-choice',
          questions: [
            {
              id: 'q-1',
              vocabId: 'vocab-1',
              vocab: {
                id: 'vocab-1',
                textSource: 'Hello',
                textTargets: [{ textTarget: 'Xin chào' }],
              },
              options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Xin lỗi'],
              correctAnswer: 'Xin chào',
            },
          ],
        },
      });
    });

    const startButton = page.getByRole('button', { name: /start|begin/i }).first();
    await startButton.click();

    await page.waitForURL(/\/exam/, { timeout: 10000 });

    const correctOption = page.getByRole('button', { name: /xin chào/i }).first();
    await expect(correctOption).toBeVisible({ timeout: 5000 });

    await correctOption.click();

    await page.waitForTimeout(500);

    const correctIndicator = page.locator('.correct, [data-correct="true"], .bg-green').first();
    await expect(correctIndicator).toBeVisible({ timeout: 2000 });

    const wrongOption = page.getByRole('button', { name: /tạm biệt/i }).first();
    if (await wrongOption.isVisible({ timeout: 1000 }).catch(() => false)) {
      await wrongOption.click();

      await page.waitForTimeout(500);

      const wrongIndicator = page.locator('.incorrect, [data-correct="false"], .bg-red').first();
      await expect(wrongIndicator).toBeVisible({ timeout: 2000 });
    }
  });

  test('P1-15: Fill In Blank Logic', async ({ page }) => {
    await page.goto('/vocab-trainer');
    await page.waitForLoadState('networkidle');

    await page.route('**/api/vocab-trainers/*/exam', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          questionType: 'fill-in-blank',
          questions: [
            {
              id: 'q-1',
              vocabId: 'vocab-1',
              vocab: {
                id: 'vocab-1',
                textSource: 'Hello',
                textTargets: [{ textTarget: 'Xin chào' }],
              },
              correctAnswer: 'Xin chào',
            },
          ],
        },
      });
    });

    const startButton = page.getByRole('button', { name: /start|begin/i }).first();
    await startButton.click();

    await page.waitForURL(/\/exam/, { timeout: 10000 });

    const answerInput = page.locator('input[type="text"], textarea').first();
    await expect(answerInput).toBeVisible({ timeout: 5000 });

    await answerInput.fill('xin chào');

    const submitButton = page.getByRole('button', { name: /submit|check|verify/i });
    await submitButton.click();

    await page.waitForTimeout(500);

    const correctIndicator = page.locator('.correct, [data-correct="true"]').first();
    await expect(correctIndicator).toBeVisible({ timeout: 2000 });

    await answerInput.clear();
    await answerInput.fill('wrong answer');
    await submitButton.click();

    await page.waitForTimeout(500);

    const wrongIndicator = page.locator('.incorrect, [data-correct="false"]').first();
    await expect(wrongIndicator).toBeVisible({ timeout: 2000 });
  });
});
