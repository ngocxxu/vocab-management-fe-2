import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { setupAuthMocks, setupVocabMocks } from '../../helpers/api-mock-helper';
import { loginHelper } from '../../helpers/auth-helper';

test.describe('Library Folder Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupVocabMocks(page);
    await setupAuthMocks(page);
    await loginHelper(page, TEST_USERS.valid.email, TEST_USERS.valid.password);
  });

  test('P1-23: Create Folder', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('networkidle');

    const createButton = page.getByRole('button', { name: /new folder|create.*folder|add.*folder/i });
    await expect(createButton).toBeVisible({ timeout: 5000 });

    await createButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    await page.route('**/api/language-folders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          json: {
            id: 'folder-new',
            name: 'New Folder',
            folderColor: '#3b82f6',
            sourceLanguageCode: 'en',
            targetLanguageCode: 'vi',
            userId: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.getByLabel(/folder name|name/i).fill('New Folder');

    const sourceLangSelect = page.locator('button[role="combobox"]').first();
    await sourceLangSelect.click();
    await page.getByRole('option', { name: /english/i }).click();

    const targetLangSelect = page.locator('button[role="combobox"]').nth(1);
    await targetLangSelect.click();
    await page.getByRole('option', { name: /vietnamese/i }).click();

    await page.getByRole('button', { name: /save|create/i }).click();

    await expect(page.getByText(/folder.*created|successfully/i)).toBeVisible({ timeout: 5000 });

    await expect(page.getByText('New Folder')).toBeVisible({ timeout: 3000 });
  });

  test('P1-24: Move Vocab to Folder', async ({ page }) => {
    await page.goto('/vocab-list');
    await page.waitForLoadState('networkidle');

    const vocabRow = page.locator('tr').filter({ hasText: 'Hello' }).first();
    await expect(vocabRow).toBeVisible({ timeout: 5000 });

    await page.route('**/api/vocabs/*', async (route) => {
      if (route.request().method() === 'PUT') {
        const requestBody = await route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          json: {
            ...requestBody,
            languageFolderId: 'folder-1',
          },
        });
      } else {
        await route.continue();
      }
    });

    const moveButton = vocabRow.getByRole('button', { name: /move|folder/i });

    if (await moveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await moveButton.click();

      const folderOption = page.getByRole('option', { name: /english.*vietnamese|folder/i });
      await folderOption.click();

      await expect(page.getByText(/moved|updated.*successfully/i)).toBeVisible({ timeout: 5000 });
    } else {
      const editButton = vocabRow.getByRole('button', { name: /edit/i });
      await editButton.click();

      await expect(page.getByRole('dialog')).toBeVisible();

      const folderSelect = page.locator('button[role="combobox"]').filter({ hasText: /folder/i });
      if (await folderSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await folderSelect.click();
        await page.getByRole('option', { name: /english.*vietnamese/i }).click();

        await page.getByRole('button', { name: /save/i }).click();

        await expect(page.getByText(/updated.*successfully/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
