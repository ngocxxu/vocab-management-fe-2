import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { setupAuthMocks, setupVocabMocks } from '../../helpers/api-mock-helper';
import { loginHelper } from '../../helpers/auth-helper';
import { fillVocabForm, navigateToVocabList, waitForToast } from '../../helpers/page-helpers';

test.describe('Vocab CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupVocabMocks(page);
    await setupAuthMocks(page);
    await loginHelper(page, TEST_USERS.valid.email, TEST_USERS.valid.password);
    await navigateToVocabList(page);
  });

  test('P0-04: Create Vocab (Happy Path)', async ({ page }) => {
    await page.getByRole('button', { name: /add vocab|add new vocabulary/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /add new vocabulary/i })).toBeVisible();

    await fillVocabForm(page, {
      textSource: 'New Word',
      textTarget: 'Từ mới',
      subjectName: 'General',
      explanationSource: 'A new word',
      explanationTarget: 'Một từ mới',
    });

    await page.getByRole('button', { name: /save|submit/i }).click();

    await waitForToast(page, /vocabulary created successfully/i);
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 3000 });
  });

  test('P0-05: Delete Vocab (Happy Path)', async ({ page }) => {
    const vocabRow = page.locator('tr').filter({ hasText: 'Hello' }).first();
    await expect(vocabRow).toBeVisible();

    const deleteButton = vocabRow.getByRole('button', { name: /delete/i }).last();
    await deleteButton.click();

    const confirmDialog = page.getByRole('dialog').filter({ hasText: /delete|confirm/i });
    await expect(confirmDialog).toBeVisible();

    await page.getByRole('button', { name: /confirm|delete/i }).click();

    await waitForToast(page, /deleted successfully/i);

    await expect(vocabRow).not.toBeVisible({ timeout: 3000 });
  });

  test('P0-06: Edit Vocab (Happy Path)', async ({ page }) => {
    const vocabRow = page.locator('tr').filter({ hasText: 'Hello' }).first();
    await expect(vocabRow).toBeVisible();

    const editButton = vocabRow.getByRole('button', { name: /edit/i }).last();
    await editButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /edit vocabulary/i })).toBeVisible();

    const sourceInput = page.getByLabel(/source text/i);
    await sourceInput.clear();
    await sourceInput.fill('Hello Updated');

    await page.getByRole('button', { name: /save|update/i }).click();

    await waitForToast(page, /vocabulary updated successfully/i);
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 3000 });

    await expect(page.getByText('Hello Updated')).toBeVisible();
  });

  test('P1-01: Create Vocab Validation', async ({ page }) => {
    await page.getByRole('button', { name: /add vocab|add new vocabulary/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /save|submit/i }).click();

    await expect(page.getByText(/source text is required/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/target text is required/i)).toBeVisible();
    await expect(page.getByText(/at least one subject must be selected/i)).toBeVisible();

    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
