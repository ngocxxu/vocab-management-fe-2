import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendRequestError } from '@/utils/backend-request-error';
import { submitReviewAnswer } from './vocab-trainers';

const { submitReviewAnswerApi } = vi.hoisted(() => ({ submitReviewAnswerApi: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('./auth', () => ({ requireAuth: vi.fn() }));
vi.mock('@/utils/server-api', () => ({ vocabTrainerApi: { submitReviewAnswer: submitReviewAnswerApi } }));

const answer = { cardId: 'card-1', answerId: 'answer-1', rating: 'GOOD', questionType: 'FLIP_CARD' } as const;

describe('submitReviewAnswer', () => {
  beforeEach(() => {
    submitReviewAnswerApi.mockReset();
  });

  it('returns the scheduling result of the answer', async () => {
    const result = { cardId: 'card-1', isDuplicate: false };
    submitReviewAnswerApi.mockResolvedValue(result);

    await expect(submitReviewAnswer('trainer-1', answer as never)).resolves.toEqual({ ended: false, result });
  });

  it('returns ended instead of throwing when the cycle is over', async () => {
    submitReviewAnswerApi.mockRejectedValue(new BackendRequestError('Conflict', 409, { statusCode: 409, message: 'CycleEnded', error: 'Conflict', timestamp: '2026-10-04T00:00:00.000Z', path: '/vocab-trainers/trainer-1/review-answer' }));

    await expect(submitReviewAnswer('trainer-1', answer as never)).resolves.toEqual({ ended: true });
  });

  it('still throws for another conflict, such as a reused answer id', async () => {
    submitReviewAnswerApi.mockRejectedValue(new BackendRequestError('Conflict', 409, { statusCode: 409, message: 'AnswerIdReused', error: 'Conflict', timestamp: '2026-10-04T00:00:00.000Z', path: '/vocab-trainers/trainer-1/review-answer' }));

    await expect(submitReviewAnswer('trainer-1', answer as never)).rejects.toThrow('AnswerIdReused');
  });
});
