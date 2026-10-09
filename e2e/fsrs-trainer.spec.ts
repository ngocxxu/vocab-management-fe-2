import type { APIRequestContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { API, AUTH_FILE } from './fixtures';

const RUN_ID = process.env.E2E_RUN_ID;
const WORDS = ['apple', 'river', 'window'];

let folderId = '';
let api: APIRequestContext;
let trainerId = '';
let trainerName = '';
let typedTrainerId = '';

function accessToken(): string {
  const state = JSON.parse(readFileSync(AUTH_FILE, 'utf8')) as { cookies: { name: string; value: string }[] };
  const token = state.cookies.find(cookie => cookie.name === 'accessToken')?.value;
  if (!token) {
    throw new Error('No accessToken cookie in the saved e2e session');
  }
  return token;
}

// Words and trainers are created through the backend API: the FSRS flow is what is under test, not the vocab forms.
async function createVocab(text: string): Promise<string> {
  const res = await api.post(`${API}/vocabs`, {
    data: {
      textSource: `${text}-${RUN_ID}`,
      sourceLanguageCode: 'en',
      targetLanguageCode: 'vi',
      languageFolderId: folderId,
      textTargets: [{ textTarget: `${text}-vi-${RUN_ID}` }],
    },
  });
  expect(res.ok(), await res.text()).toBe(true);
  return ((await res.json()) as { id: string }).id;
}

async function createFsrsTrainer(name: string, questionType: string, vocabIds: string[]): Promise<string> {
  const res = await api.post(`${API}/vocab-trainers`, {
    data: {
      name,
      status: 'PENDING',
      questionType,
      mode: 'FSRS',
      vocabAssignmentIds: vocabIds,
      fsrsDirections: ['SOURCE_TO_TARGET', 'TARGET_TO_SOURCE'],
    },
  });
  expect(res.ok(), await res.text()).toBe(true);
  return ((await res.json()) as { id: string }).id;
}

async function summaryOf(id: string) {
  const res = await api.get(`${API}/vocab-trainers/${id}/review-summary`);
  expect(res.ok(), await res.text()).toBe(true);
  return (await res.json()) as { overdue: number; dueToday: number; newAvailable: number; ended: boolean };
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ playwright }) => {
  api = await playwright.request.newContext({ extraHTTPHeaders: { Authorization: `Bearer ${accessToken()}` } });

  const folder = await api.post(`${API}/language-folders`, {
    data: { name: `FSRS E2E ${RUN_ID}`, folderColor: '#3b82f6', sourceLanguageCode: 'en', targetLanguageCode: 'vi' },
  });
  expect(folder.ok(), await folder.text()).toBe(true);
  folderId = ((await folder.json()) as { id: string }).id;

  const vocabIds: string[] = [];
  for (const word of WORDS) {
    vocabIds.push(await createVocab(word));
  }

  trainerName = `FSRS E2E ${RUN_ID}`;
  trainerId = await createFsrsTrainer(trainerName, 'FLIP_CARD', vocabIds);
  // Not a suffix of trainerName: the list row filter matches by substring.
  typedTrainerId = await createFsrsTrainer(`Typed ${RUN_ID}`, 'FILL_IN_THE_BLANK', vocabIds);
});

test.afterAll(async () => {
  await api.dispose();
});

test('a new FSRS trainer shows 6 cards waiting and the review page starts a session', async ({ page }) => {
  // 3 words in 2 directions = 6 NEW cards.
  expect(await summaryOf(trainerId)).toMatchObject({ newAvailable: 6, ended: false });

  await page.goto('/vocab-trainer');
  const row = page.getByRole('row').filter({ hasText: trainerName });
  await expect(row).toContainText('Spaced repetition');

  await page.goto(`/vocab-trainer/${trainerId}/review`);
  await page.getByRole('button', { name: /^Start \d+ questions?/ }).click();

  await expect(page.getByRole('button', { name: /^Show answer/ })).toBeVisible();
});

test('rating a card moves it out of today and the next session starts from the rest', async ({ page }) => {
  const before = await summaryOf(trainerId);

  await page.goto(`/vocab-trainer/${trainerId}/review`);
  await page.getByRole('button', { name: /^Start \d+ questions?/ }).click();
  await page.getByRole('button', { name: /^Show answer/ }).click();
  await page.getByRole('button', { name: /^Good,/ }).click();

  // The card is recorded on the server: one new card less waits for today.
  await expect.poll(async () => (await summaryOf(trainerId)).newAvailable).toBe(before.newAvailable - 1);
});

test('a typed answer shows the check and a suggested rating before anything is recorded', async ({ page }) => {
  await page.goto(`/vocab-trainer/${typedTrainerId}/review`);
  await page.getByRole('button', { name: /^Start \d+ questions?/ }).click();

  const answer = page.locator('input[id^="answer-"]');
  await expect(answer).toBeVisible();
  await answer.fill('definitely wrong');
  await page.getByRole('button', { name: 'Check', exact: true }).click();

  // The suggestion is shown, nothing is rated yet: the user's click is what records it.
  await expect(page.getByRole('group', { name: 'How well did you remember it?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Again,.*suggested/ })).toBeVisible();
  expect((await summaryOf(typedTrainerId)).newAvailable).toBe(6);
});

test('the stats page of the trainer renders', async ({ page }) => {
  await page.goto(`/vocab-trainer/${trainerId}/stats`);

  await expect(page.getByText(trainerName)).toBeVisible();
  await expect(page.getByText('Unable to load these statistics')).toHaveCount(0);
});

// Not covered yet (ticket 14 is not in the code, and a backend way to end a cycle is missing):
// - deleting a vocab that is in a trainer shows the conflict message (ticket 14)
// - an ended cycle shows Extend and New cycle, and a large backlog limits the session
// - the reminder email arrives the next morning (manual checklist)
