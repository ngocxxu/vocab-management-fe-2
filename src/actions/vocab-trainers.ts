'use server';

import type { TCreateVocabTrainer, TFormTestVocabTrainerUnion, TQuestionAPI } from '@/types/vocab-trainer';
import { revalidatePath } from 'next/cache';
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
