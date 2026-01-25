import { expect, test } from '@playwright/test';
import { TEST_USERS } from '../../fixtures/test-users';
import { setupAuthMocks, setupVocabMocks } from '../../helpers/api-mock-helper';
import { loginHelper } from '../../helpers/auth-helper';
import { navigateToVocabList } from '../../helpers/page-helpers';

test.describe('Vocab List Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupVocabMocks(page);
    await setupAuthMocks(page);
    await loginHelper(page, TEST_USERS.valid.email, TEST_USERS.valid.password);
    await navigateToVocabList(page);
  });

  test('P1-02: Search Function', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search vocab/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Hello');
    await searchInput.press('Enter');

    await page.waitForTimeout(500);

    const requestPromise = page.waitForRequest(request =>
      request.url().includes('/api/vocabs')
      && request.method() === 'GET'
      && new URL(request.url()).searchParams.get('textSource') === 'Hello',
    );

    await searchInput.fill('Hello');
    await searchInput.press('Enter');

    const request = await requestPromise;
    const url = new URL(request.url());
    expect(url.searchParams.get('textSource')).toBe('Hello');

    await expect(page.getByText('Hello')).toBeVisible();
    await expect(page.getByText('Computer')).not.toBeVisible();
  });

  test('P1-03: Filter by Subject', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    const subjectFilter = page.getByLabel(/filter by subjects|choose subjects/i);
    await expect(subjectFilter).toBeVisible();

    await subjectFilter.click();

    const generalOption = page.getByRole('option', { name: /general/i });
    await generalOption.click();

    const requestPromise = page.waitForRequest(request =>
      request.url().includes('/api/vocabs')
      && request.method() === 'GET'
      && new URL(request.url()).searchParams.get('subjectIds')?.includes('subject-1') === true,
    );

    await page.getByRole('button', { name: /apply|filter/i }).click();

    const request = await requestPromise;
    const url = new URL(request.url());
    expect(url.searchParams.get('subjectIds')).toContain('subject-1');
  });

  test('P1-04: Pagination Logic', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /next|›/i });

    if (await nextButton.isEnabled()) {
      const requestPromise = page.waitForRequest(request =>
        request.url().includes('/api/vocabs')
        && request.method() === 'GET'
        && new URL(request.url()).searchParams.get('page') === '2',
      );

      await nextButton.click();

      const request = await requestPromise;
      const url = new URL(request.url());
      expect(url.searchParams.get('page')).toBe('2');

      const pageIndicator = page.getByText(/page.*2|2.*of/i);
      await expect(pageIndicator).toBeVisible({ timeout: 3000 });
    }
  });

  test('P1-05: Bulk Delete', async ({ page }) => {
    const checkboxes = page.getByRole('checkbox', { name: /select row/i });
    const checkboxCount = await checkboxes.count();

    if (checkboxCount >= 2) {
      await checkboxes.nth(1).click();
      await checkboxes.nth(2).click();

      const bulkDeleteButton = page.getByRole('button', { name: /delete.*selected|bulk delete/i });
      await expect(bulkDeleteButton).toBeVisible();

      await bulkDeleteButton.click();

      const confirmDialog = page.getByRole('dialog').filter({ hasText: /delete.*items|bulk delete/i });
      await expect(confirmDialog).toBeVisible();

      const requestPromise = page.waitForRequest(request =>
        request.url().includes('/api/vocabs/bulk/delete')
        && request.method() === 'POST',
      );

      await page.getByRole('button', { name: /confirm|delete/i }).click();

      await requestPromise;

      await expect(page.getByText(/deleted successfully/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('P1-11: Expand Row Details', async ({ page }) => {
    const vocabRow = page.locator('tr').filter({ hasText: 'Hello' }).first();
    await expect(vocabRow).toBeVisible();

    const expandButton = vocabRow.getByRole('button').filter({ hasText: /expand|chevron/i }).first();
    await expandButton.click();

    await page.waitForTimeout(500);

    const expandedContent = page.locator('tr').filter({ hasText: /examples|text target/i });
    await expect(expandedContent).toBeVisible({ timeout: 3000 });

    await expandButton.click();

    await expect(expandedContent).toBeHidden({ timeout: 2000 });
  });
});
