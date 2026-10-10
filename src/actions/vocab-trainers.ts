'use server';

import type {
  TCloneVocabTrainer,
  TCreateVocabTrainer,
  TFormTestVocabTrainerUnion,
  TFsrsAnswerCheck,
  TFsrsAnswerInput,
  TFsrsAnswerOutcome,
  TFsrsQueueParams,
  TFsrsReviewQueue,
  TFsrsReviewSummary,
  TQuestionAPI,
  TUpdateFsrsSettings,
  TVocabTrainer,
} from '@/types/vocab-trainer';
import { revalidatePath } from 'next/cache';
import { BackendRequestError } from '@/utils/backend-request-error';
import { vocabTrainerApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function createVocabTrainer(trainerData: TCreateVocabTrainer) {
  await requireAuth();
  if (!trainerData || typeof trainerData !== 'object') {
    throw new Error('Trainer data is required');
  }
  if (!trainerData.name || !trainerData.questionType) {
    throw new Error('Trainer name and question type are required');
  }

  try {
    const result = await vocabTrainerApi.create(trainerData);
    revalidatePath('/vocab-trainer');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to create vocab trainer');
  }
}

export async function updateVocabTrainer(id: string, trainerData: Partial<TCreateVocabTrainer>) {
  await requireAuth();
  if (!id || typeof id !== 'string') {
    throw new Error('Trainer ID is required');
  }
  if (!trainerData || typeof trainerData !== 'object') {
    throw new Error('Trainer data is required');
  }

  try {
    const result = await vocabTrainerApi.update(id, trainerData);
    revalidatePath('/vocab-trainer');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to update vocab trainer');
  }
}

export async function deleteVocabTrainer(id: string): Promise<void> {
  await requireAuth();
  if (!id || typeof id !== 'string') {
    throw new Error('Trainer ID is required');
  }

  try {
    await vocabTrainerApi.delete(id);
    revalidatePath('/vocab-trainer');
  } catch (error) {
    throw toActionError(error, 'Failed to delete vocab trainer');
  }
}

export async function deleteVocabTrainersBulk(ids: string[]): Promise<{ success: boolean }> {
  await requireAuth();
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('IDs array is required and must not be empty');
  }

  try {
    await vocabTrainerApi.deleteBulk(ids);
    revalidatePath('/vocab-trainer');
    return { success: true };
  } catch (error) {
    throw toActionError(error, 'Failed to delete vocab trainers');
  }
}

export async function getExam(id: string): Promise<TQuestionAPI> {
  await requireAuth();
  if (!id || typeof id !== 'string') {
    throw new Error('Trainer ID is required');
  }

  try {
    const result = await vocabTrainerApi.getExam(id);
    return result as TQuestionAPI;
  } catch (error) {
    throw toActionError(error, 'Failed to fetch exam');
  }
}

export async function submitExam(id: string, examData: TFormTestVocabTrainerUnion) {
  await requireAuth();
  if (!id || typeof id !== 'string') {
    throw new Error('Trainer ID is required');
  }
  if (!examData || typeof examData !== 'object') {
    throw new Error('Exam data is required');
  }

  try {
    const result = await vocabTrainerApi.submitExam(id, examData);
    revalidatePath('/vocab-trainer');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to submit exam');
  }
}

const HTTP_CONFLICT = 409;

function assertTrainerId(id: string) {
  if (!id || typeof id !== 'string') {
    throw new Error('Trainer ID is required');
  }
}

/** Starts a new cycle: a new FSRS trainer with the same words, directions and settings. The original is not changed. */
export async function cloneVocabTrainer(id: string, data: TCloneVocabTrainer): Promise<TVocabTrainer> {
  await requireAuth();
  assertTrainerId(id);
  if (!data || typeof data.name !== 'string' || data.name.trim() === '') {
    throw new Error('A name for the new cycle is required');
  }

  try {
    const result = await vocabTrainerApi.clone(id, data);
    revalidatePath('/vocab-trainer');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to start a new cycle');
  }
}

/**
 * Removes one word from a trainer; the word itself stays. For an FSRS trainer its cards go and its review history is kept.
 */
export async function removeVocabFromTrainer(trainerId: string, vocabId: string): Promise<TVocabTrainer> {
  await requireAuth();
  assertTrainerId(trainerId);
  if (!vocabId || typeof vocabId !== 'string') {
    throw new Error('Vocab ID is required');
  }

  try {
    const result = await vocabTrainerApi.removeVocab(trainerId, vocabId);
    revalidatePath('/vocab-trainer');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to remove the word from the trainer');
  }
}

/** Changes the settings of an FSRS trainer. Mode and directions cannot change after creation. */
export async function updateFsrsSettings(id: string, settings: TUpdateFsrsSettings): Promise<TVocabTrainer> {
  await requireAuth();
  assertTrainerId(id);
  if (!settings || typeof settings !== 'object') {
    throw new Error('Settings are required');
  }

  try {
    const result = await vocabTrainerApi.updateFsrsSettings(id, settings);
    revalidatePath('/vocab-trainer');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to update spaced repetition settings');
  }
}

/** The fixed list of cards for one review session. An ended trainer comes back empty with `ended: true`. */
export async function getReviewQueue(id: string, params?: TFsrsQueueParams): Promise<TFsrsReviewQueue> {
  await requireAuth();
  assertTrainerId(id);

  try {
    return await vocabTrainerApi.getReviewQueue(id, params);
  } catch (error) {
    throw toActionError(error, 'Failed to load the review session');
  }
}

export async function getReviewSummary(id: string): Promise<TFsrsReviewSummary> {
  await requireAuth();
  assertTrainerId(id);

  try {
    return await vocabTrainerApi.getReviewSummary(id);
  } catch (error) {
    throw toActionError(error, 'Failed to load the review summary');
  }
}

/** Compares a typed answer with the accepted ones and suggests a rating. Nothing is recorded. */
export async function checkReviewAnswer(id: string, cardId: string, answer: string): Promise<TFsrsAnswerCheck> {
  await requireAuth();
  assertTrainerId(id);
  if (!cardId || typeof cardId !== 'string') {
    throw new Error('Card ID is required');
  }
  if (typeof answer !== 'string') {
    throw new TypeError('Answer is required');
  }

  try {
    return await vocabTrainerApi.checkReviewAnswer(id, cardId, answer);
  } catch (error) {
    throw toActionError(error, 'Failed to check the answer');
  }
}

/**
 * Records the rating of one card. Sending the same `answerId` again does not schedule twice.
 * A trainer whose cycle is over answers 409: that comes back as `{ ended: true }` so the UI can show it, not as an error.
 */
export async function submitReviewAnswer(id: string, answer: TFsrsAnswerInput): Promise<TFsrsAnswerOutcome> {
  await requireAuth();
  assertTrainerId(id);
  if (!answer || typeof answer !== 'object' || !answer.cardId || !answer.answerId) {
    throw new Error('Card ID and answer ID are required');
  }

  try {
    const result = await vocabTrainerApi.submitReviewAnswer(id, answer);
    revalidatePath('/vocab-trainer');
    return { ended: false, result };
  } catch (error) {
    if (error instanceof BackendRequestError && error.statusCode === HTTP_CONFLICT && isCycleEnded(error.body)) {
      revalidatePath('/vocab-trainer');
      return { ended: true };
    }
    throw toActionError(error, 'Failed to save the answer');
  }
}

function isCycleEnded(body: unknown): boolean {
  if (!body || typeof body !== 'object' || !('message' in body)) {
    return false;
  }
  const { message } = body;
  return Array.isArray(message) ? message.includes('CycleEnded') : message === 'CycleEnded';
}
