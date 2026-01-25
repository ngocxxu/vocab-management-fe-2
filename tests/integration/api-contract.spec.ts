import { expect, test } from '@playwright/test';

test.describe('P0: API Contract & Smoke Tests (Real API)', () => {
  test('P0-02: Smoke Fetch List', async ({ request }) => {
    const response = await request.get('/api/vocabs?page=1&pageSize=10');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('totalItems');
    expect(data).toHaveProperty('totalPages');
    expect(data).toHaveProperty('currentPage');

    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThanOrEqual(0);

    if (data.items.length > 0) {
      expect(data.items[0]).toHaveProperty('id');
      expect(data.items[0]).toHaveProperty('textSource');
    }
  });

  test('P0-03: API Contract Check', async ({ request }) => {
    const response = await request.get('/api/vocabs?page=1&pageSize=1');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const firstItem = data.items[0];

      expect(firstItem).toHaveProperty('id');
      expect(typeof firstItem.id).toBe('string');

      expect(firstItem).toHaveProperty('textSource');
      expect(typeof firstItem.textSource).toBe('string');

      expect(firstItem).toHaveProperty('textTargets');
      expect(Array.isArray(firstItem.textTargets)).toBe(true);

      if (firstItem.textTargets.length > 0) {
        const firstTarget = firstItem.textTargets[0];
        expect(firstTarget).toHaveProperty('textTarget');
        expect(typeof firstTarget.textTarget).toBe('string');
      }

      if ('masteryScore' in firstItem) {
        expect(typeof firstItem.masteryScore).toBe('number');
      }

      expect(firstItem).toHaveProperty('sourceLanguageCode');
      expect(firstItem).toHaveProperty('targetLanguageCode');
    }
  });
});
