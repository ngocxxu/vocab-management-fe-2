import { describe, expect, it } from 'vitest';
import { getReviewUrl } from './vocab-trainer';

describe('getReviewUrl', () => {
  it('points at the FSRS review page of the trainer', () => {
    expect(getReviewUrl('t1')).toBe('/vocab-trainer/t1/review');
  });
});
