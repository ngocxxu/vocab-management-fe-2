import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { BackendRequestError } from '@/utils/backend-request-error';
import { answerReminderPrompt, reloadVocabTrainer, submitReviewAnswer } from './vocab-trainers';

const { submitReviewAnswerApi, getTrainerApi, answerReminderPromptApi } = vi.hoisted(() => ({
  submitReviewAnswerApi: vi.fn(),
  getTrainerApi: vi.fn(),
  answerReminderPromptApi: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('./auth', () => ({ requireAuth: vi.fn() }));
vi.mock('@/utils/server-api', () => ({
  vocabTrainerApi: {
    submitReviewAnswer: submitReviewAnswerApi,
    getById: getTrainerApi,
    answerReminderPrompt: answerReminderPromptApi,
  },
}));

const answer = { cardId: 'card-1', answerId: 'answer-1', rating: 'GOOD', questionType: 'FLIP_CARD' } as const;
const errorBody = (statusCode: number, message: string | string[]) => ({
  statusCode,
  message,
  error: 'Error',
  timestamp: '2026-10-04T00:00:00.000Z',
  path: '/vocab-trainers/trainer-1',
});
const trainer = { id: 'trainer-1', name: 'Verbs', reminderPromptPending: true } as unknown as TVocabTrainer;

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

describe('reloadVocabTrainer', () => {
  beforeEach(() => {
    getTrainerApi.mockReset();
  });

  it('returns the trainer when the backend still has it', async () => {
    getTrainerApi.mockResolvedValue(trainer);

    await expect(reloadVocabTrainer('trainer-1')).resolves.toEqual({ kind: 'found', trainer });
    expect(getTrainerApi).toHaveBeenCalledWith('trainer-1');
  });

  it('returns gone on 404: the backend removes a trainer when its cycle completes', async () => {
    getTrainerApi.mockRejectedValue(new BackendRequestError('Not Found', 404, errorBody(404, 'Vocab trainer not found')));

    await expect(reloadVocabTrainer('trainer-1')).resolves.toEqual({ kind: 'gone' });
  });

  it('throws for other errors so the page can show the results without the prompt', async () => {
    getTrainerApi.mockRejectedValue(new BackendRequestError('Bad Request', 400, errorBody(400, 'Bad id')));

    await expect(reloadVocabTrainer('trainer-1')).rejects.toThrow('Bad id');
  });
});

describe('answerReminderPrompt', () => {
  beforeEach(() => {
    answerReminderPromptApi.mockReset();
  });

  it('sends the answer and returns the trainer', async () => {
    answerReminderPromptApi.mockResolvedValue({ ...trainer, reminderPromptPending: false });

    await expect(answerReminderPrompt('trainer-1', false)).resolves.toMatchObject({ id: 'trainer-1', reminderPromptPending: false });
    expect(answerReminderPromptApi).toHaveBeenCalledWith('trainer-1', false);
  });

  it('rejects an empty trainer id before calling the backend', async () => {
    await expect(answerReminderPrompt('', true)).rejects.toThrow('Trainer ID is required');
    expect(answerReminderPromptApi).not.toHaveBeenCalled();
  });
});
