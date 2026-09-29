import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { API, AUTH_FILE } from './fixtures';

const RUN_ID = process.env.E2E_RUN_ID;
const WORD = `e2e-word-${RUN_ID}`;
const TARGET = `e2e-target-${RUN_ID}`;
const TARGET_EDITED = `${TARGET}-edited`;
const SUBJECT = 'E2E Subject';

let folderId = '';

// The language selects in the add dialog are locked to these query params.
function listUrl(): string {
  return `/vocab-list?languageFolderId=${folderId}&sourceLanguageCode=en&targetLanguageCode=vi`;
}

function accessToken(): string {
  const state = JSON.parse(readFileSync(AUTH_FILE, 'utf8')) as { cookies: { name: string; value: string }[] };
  const token = state.cookies.find(cookie => cookie.name === 'accessToken')?.value;
  if (!token) {
    throw new Error('No accessToken cookie in the saved e2e session');
  }
  return token;
}

function wordRow(page: Page) {
  return page.getByRole('row').filter({ hasText: WORD });
}

// Vocab lists are per language folder, and the subject picker can only choose existing
// subjects, so both are created through the backend API. The CRUD itself goes through the UI.
test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ playwright }) => {
  const api = await playwright.request.newContext({
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken()}` },
  });

  const folder = await api.post(`${API}/language-folders`, {
    data: { name: 'E2E Folder', folderColor: '#3b82f6', sourceLanguageCode: 'en', targetLanguageCode: 'vi' },
  });
  expect(folder.ok(), await folder.text()).toBe(true);
  folderId = ((await folder.json()) as { id: string }).id;

  const subject = await api.post(`${API}/subjects`, { data: { name: SUBJECT } });
  expect(subject.ok(), await subject.text()).toBe(true);

  await api.dispose();
});

test('creates a vocab', async ({ page }) => {
  await page.goto(listUrl());

  await page.getByRole('button', { name: /Add Vocab/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Add New Vocabulary')).toBeVisible();

  await dialog.getByPlaceholder('Enter source text').fill(WORD);
  // Always fill the target text: an empty one makes the backend queue an AI translation job.
  await dialog.getByLabel('Target Text').fill(TARGET);

  await dialog.getByText('Choose subjects...').click();
  await page.getByRole('option', { name: SUBJECT }).click();
  await page.keyboard.press('Escape');

  await dialog.getByRole('button', { name: 'Add Vocabulary' }).click();

  await expect(page.getByText('Vocabulary created successfully')).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(wordRow(page)).toContainText(TARGET);
});

test('edits a vocab', async ({ page }) => {
  await page.goto(listUrl());

  await wordRow(page).getByRole('button', { name: 'Edit vocabulary' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Edit Vocabulary')).toBeVisible();

  await dialog.getByLabel('Target Text').fill(TARGET_EDITED);
  await dialog.getByRole('button', { name: 'Update Vocabulary' }).click();

  await expect(page.getByText('Vocabulary updated successfully')).toBeVisible();
  await expect(wordRow(page)).toContainText(TARGET_EDITED);
});

test('deletes a vocab', async ({ page }) => {
  await page.goto(listUrl());

  await wordRow(page).getByRole('button', { name: 'Delete vocabulary item' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Vocabulary deleted successfully!')).toBeVisible();
  await expect(wordRow(page)).toHaveCount(0);

  await page.reload();
  await expect(wordRow(page)).toHaveCount(0);
});
