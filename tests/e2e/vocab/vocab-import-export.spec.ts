import { unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { setupAuthMocks, setupVocabMocks } from '../../helpers/api-mock-helper';
import { loginHelper } from '../../helpers/auth-helper';
import { navigateToVocabList } from '../../helpers/page-helpers';

test.describe('Vocab Import/Export Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupVocabMocks(page);
    await setupAuthMocks(page);
    await loginHelper(page, TEST_USERS.valid.email, TEST_USERS.valid.password);
    await navigateToVocabList(page);
  });

  test('P1-06: Import CSV Success', async ({ page }) => {
    const importButton = page.getByRole('button', { name: /import|upload/i });
    await importButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    const csvContent = 'textSource,textTarget,sourceLanguageCode,targetLanguageCode\nTest,Thử nghiệm,en,vi';
    const csvFile = join(process.cwd(), 'tests', 'fixtures', 'test-import.csv');
    writeFileSync(csvFile, csvContent);

    await page.route('**/api/vocabs/import/csv*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          created: 1,
          updated: 0,
          failed: 0,
          totalProcessed: 1,
        },
      });
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvFile);

    await page.getByRole('button', { name: /import|upload/i }).click();

    await expect(page.getByText(/import.*success|created.*vocab/i)).toBeVisible({ timeout: 5000 });

    try {
      unlinkSync(csvFile);
    } catch {
      // File might not exist, ignore
    }
  });

  test('P1-07: Import CSV Fail', async ({ page }) => {
    const importButton = page.getByRole('button', { name: /import|upload/i });
    await importButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    const invalidFile = join(process.cwd(), 'tests', 'fixtures', 'test-invalid.exe');
    writeFileSync(invalidFile, 'invalid content');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidFile);

    await expect(page.getByText(/invalid.*file|wrong.*format/i)).toBeVisible({ timeout: 3000 });

    try {
      unlinkSync(invalidFile);
    } catch {
      // File might not exist, ignore
    }
  });

  test('P1-08: Export CSV', async ({ page }) => {
    await page.route('**/api/vocabs/export/csv*', async (route) => {
      await route.fulfill({
        status: 200,
        body: 'textSource,textTarget\nHello,Xin chào',
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="vocabs.csv"',
        },
      });
    });

    const downloadPromise = page.waitForEvent('download');

    const exportButton = page.getByRole('button', { name: /export|download/i });
    await exportButton.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');

    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
  });

  test('P1-09: AI Generate Info', async ({ page }) => {
    await page.getByRole('button', { name: /add vocab|add new vocabulary/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/source text/i).fill('Beautiful');

    await page.route('**/api/vocabs/generate/text-target', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          textTarget: 'Đẹp',
          wordTypeId: 'wt-2',
          explanationSource: 'Pleasing to the senses',
          explanationTarget: 'Làm hài lòng các giác quan',
          subjectIds: ['subject-1'],
          vocabExamples: [
            { source: 'Beautiful flower', target: 'Bông hoa đẹp' },
          ],
        },
      });
    });

    const aiButton = page.getByRole('button', { name: /generate|ai|magic/i });
    if (await aiButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aiButton.click();

      await page.waitForTimeout(1000);

      const targetInput = page.getByLabel(/target text/i).first();
      await expect(targetInput).toHaveValue('Đẹp', { timeout: 5000 });
    }
  });

  test('P1-10: Text-to-Speech', async ({ page }) => {
    const vocabRow = page.locator('tr').filter({ hasText: 'Hello' }).first();
    await expect(vocabRow).toBeVisible();

    const speakButton = vocabRow.getByRole('button', { name: /play pronunciation|speak|volume/i });

    await page.addInitScript(() => {
      window.speechSynthesis = {
        speak: jest.fn(),
        cancel: jest.fn(),
        getVoices: () => [],
      } as any;
    });

    const speakCalled = page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const originalSpeak = window.speechSynthesis.speak;
        window.speechSynthesis.speak = function (utterance: SpeechSynthesisUtterance) {
          resolve(true);
          return originalSpeak.call(this, utterance);
        };
      });
    });

    await speakButton.click();

    const result = await Promise.race([
      speakCalled,
      new Promise<boolean>(resolve => setTimeout(() => resolve(false), 2000)),
    ]);

    expect(result).toBe(true);
  });
});
