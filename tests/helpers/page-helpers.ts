import type { Page } from '@playwright/test';

export async function navigateToVocabList(page: Page) {
  await page.goto('/vocab-list');
  await page.waitForLoadState('networkidle');
}

export async function fillVocabForm(page: Page, data: {
  textSource: string;
  textTarget: string;
  subjectName?: string;
  explanationSource?: string;
  explanationTarget?: string;
}) {
  if (data.textSource) {
    await page.getByLabel(/source text/i).fill(data.textSource);
  }

  if (data.textTarget) {
    const targetInputs = page.getByLabel(/target text/i);
    const firstTarget = targetInputs.first();
    await firstTarget.fill(data.textTarget);
  }

  if (data.subjectName) {
    const combobox = page.locator('button[role="combobox"]').first();
    if (await combobox.isVisible()) {
      await combobox.click();
      await page.getByRole('option', { name: new RegExp(data.subjectName, 'i') }).click();
    }
  }

  if (data.explanationSource) {
    await page.getByLabel(/explanation.*source/i).first().fill(data.explanationSource);
  }

  if (data.explanationTarget) {
    await page.getByLabel(/explanation.*target/i).first().fill(data.explanationTarget);
  }
}

export async function waitForToast(page: Page, message: string | RegExp) {
  const toast = typeof message === 'string'
    ? page.getByText(message, { exact: false })
    : page.getByText(message);
  await toast.waitFor({ state: 'visible', timeout: 5000 });
  return toast;
}
