import type { Page } from '@playwright/test';
import { MOCK_LANGUAGE_FOLDER, MOCK_LANGUAGES, MOCK_SUBJECTS, MOCK_VOCABS, MOCK_WORD_TYPES } from '../fixtures/mock-data';

export async function setupVocabMocks(page: Page) {
  await page.route('**/api/vocabs*', async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());

    if (method === 'GET') {
      const textSource = url.searchParams.get('textSource');
      const subjectIds = url.searchParams.get('subjectIds');
      const pageNum = Number.parseInt(url.searchParams.get('page') || '1', 10);
      const pageSize = Number.parseInt(url.searchParams.get('pageSize') || '10', 10);

      let filteredVocabs = [...MOCK_VOCABS];

      if (textSource) {
        filteredVocabs = filteredVocabs.filter(v =>
          v.textSource.toLowerCase().includes(textSource.toLowerCase()),
        );
      }

      if (subjectIds) {
        const subjectIdArray = subjectIds.split(',');
        filteredVocabs = filteredVocabs.filter(v =>
          v.textTargets.some(tt =>
            tt.textTargetSubjects.some(tts => subjectIdArray.includes(tts.subject.id)),
          ),
        );
      }

      const startIndex = (pageNum - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedVocabs = filteredVocabs.slice(startIndex, endIndex);

      await route.fulfill({
        status: 200,
        json: {
          items: paginatedVocabs,
          totalItems: filteredVocabs.length,
          totalPages: Math.ceil(filteredVocabs.length / pageSize),
          currentPage: pageNum,
        },
      });
    } else if (method === 'POST') {
      const requestBody = await route.request().postDataJSON();
      const newVocab: typeof MOCK_VOCABS[0] = {
        id: `vocab-${Date.now()}`,
        textSource: requestBody.textSource,
        sourceLanguageCode: requestBody.sourceLanguageCode,
        targetLanguageCode: requestBody.targetLanguageCode,
        textTargets: requestBody.textTargets.map((tt: any) => ({
          textTarget: tt.textTarget,
          wordType: MOCK_WORD_TYPES.items.find(wt => wt.id === tt.wordTypeId) || MOCK_WORD_TYPES.items[0],
          explanationSource: tt.explanationSource || '',
          explanationTarget: tt.explanationTarget || '',
          grammar: tt.grammar || '',
          vocabExamples: tt.vocabExamples || [],
          textTargetSubjects: (tt.subjectIds || []).map((sid: string) => ({
            id: `tts-${Date.now()}`,
            subject: MOCK_SUBJECTS.items.find(s => s.id === sid) || MOCK_SUBJECTS.items[0],
          })),
        })),
        masteryScore: 0,
      };
      await route.fulfill({
        status: 201,
        json: newVocab,
      });
    } else if (method === 'PUT') {
      const requestBody = await route.request().postDataJSON();
      const vocabId = url.pathname.split('/').pop();
      const updatedVocab = {
        ...MOCK_VOCABS.find(v => v.id === vocabId),
        ...requestBody,
        textTargets: requestBody.textTargets?.map((tt: any) => ({
          textTarget: tt.textTarget,
          wordType: MOCK_WORD_TYPES.items.find(wt => wt.id === tt.wordTypeId) || MOCK_WORD_TYPES.items[0],
          explanationSource: tt.explanationSource || '',
          explanationTarget: tt.explanationTarget || '',
          grammar: tt.grammar || '',
          vocabExamples: tt.vocabExamples || [],
          textTargetSubjects: (tt.subjectIds || []).map((sid: string) => ({
            id: `tts-${Date.now()}`,
            subject: MOCK_SUBJECTS.items.find(s => s.id === sid) || MOCK_SUBJECTS.items[0],
          })),
        })),
      };
      await route.fulfill({
        status: 200,
        json: updatedVocab,
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        json: { message: 'Deleted successfully' },
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/vocabs/bulk/delete', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        json: { success: true, message: 'Bulk delete successful' },
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/subjects', async (route) => {
    await route.fulfill({ status: 200, json: MOCK_SUBJECTS });
  });

  await page.route('**/api/languages', async (route) => {
    await route.fulfill({ status: 200, json: MOCK_LANGUAGES });
  });

  await page.route('**/api/word-types', async (route) => {
    await route.fulfill({ status: 200, json: MOCK_WORD_TYPES });
  });

  await page.route('**/api/language-folders/*', async (route) => {
    await route.fulfill({ status: 200, json: MOCK_LANGUAGE_FOLDER });
  });
}

export async function setupAuthMocks(page: Page, shouldFail = false) {
  await page.route('**/api/auth/signin', async (route) => {
    if (shouldFail) {
      await route.fulfill({
        status: 401,
        json: { error: 'Invalid credentials' },
      });
    } else {
      await route.fulfill({
        status: 200,
        json: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
          },
          message: 'Sign in successful',
          token: 'mock-access-token',
        },
        headers: {
          'Set-Cookie': 'accessToken=mock-access-token; Path=/; HttpOnly; SameSite=Lax',
        },
      });
    }
  });

  await page.route('**/api/auth/signup', async (route) => {
    await route.fulfill({
      status: 201,
      json: {
        user: {
          id: 'user-new',
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'user',
        },
        message: 'Sign up successful',
        token: 'mock-access-token',
      },
      headers: {
        'Set-Cookie': 'accessToken=mock-access-token; Path=/; HttpOnly; SameSite=Lax',
      },
    });
  });

  await page.route('**/api/auth/verify', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      },
    });
  });

  await page.route('**/api/auth/signout', async (route) => {
    await route.fulfill({
      status: 200,
      json: { message: 'Sign out successful' },
    });
  });
}

export async function setupTrainerMocks(page: Page) {
  await page.route('**/api/vocab-trainers*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        json: {
          items: [
            {
              id: 'trainer-1',
              name: 'Daily Practice',
              status: 'active',
              questionType: 'multiple-choice',
              reminderTime: 9,
              countTime: 10,
              setCountTime: 10,
              reminderDisabled: false,
              reminderRepeat: 1,
              reminderLastRemind: '2024-01-01',
              userId: 'user-1',
              vocabAssignments: [],
              results: [],
              questionAnswers: [],
              updatedAt: '2024-01-01',
              createdAt: '2024-01-01',
            },
          ],
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
        },
      });
    } else if (method === 'POST') {
      const requestBody = await route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        json: {
          id: `trainer-${Date.now()}`,
          ...requestBody,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/vocab-trainers/*/exam', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        json: {
          questionType: 'multiple-choice',
          questions: [
            {
              id: 'q-1',
              vocabId: 'vocab-1',
              vocab: MOCK_VOCABS[0],
              options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Xin lỗi'],
              correctAnswer: 'Xin chào',
            },
          ],
        },
      });
    } else if (method === 'PATCH') {
      await route.fulfill({
        status: 200,
        json: { jobId: 'job-123', message: 'Exam submitted successfully' },
      });
    } else {
      await route.continue();
    }
  });
}

export async function setupDashboardMocks(page: Page) {
  await page.route('**/api/vocabs/statistics/summary', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        totalVocabs: 100,
        learnedVocabs: 50,
        averageMastery: 6.5,
        totalSubjects: 5,
      },
    });
  });
}
