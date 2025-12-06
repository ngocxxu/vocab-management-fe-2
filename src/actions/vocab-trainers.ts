'use server';

import type { TCreateVocabTrainer, TFormTestVocabTrainerUnion } from '@/types/vocab-trainer';
import { vocabTrainerApi } from '@/utils/server-api';

export async function createVocabTrainer(trainerData: TCreateVocabTrainer) {
  try {
    return await vocabTrainerApi.create(trainerData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create vocab trainer');
  }
}

export async function updateVocabTrainer(id: string, trainerData: Partial<TCreateVocabTrainer>) {
  try {
    return await vocabTrainerApi.update(id, trainerData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update vocab trainer');
  }
}

export async function deleteVocabTrainer(id: string): Promise<void> {
  try {
    await vocabTrainerApi.delete(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete vocab trainer');
  }
}

export async function deleteVocabTrainersBulk(ids: string[]): Promise<{ success: boolean }> {
  try {
    await vocabTrainerApi.deleteBulk(ids);
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete vocab trainers');
  }
}

export async function submitExam(id: string, examData: TFormTestVocabTrainerUnion) {
  try {
    return await vocabTrainerApi.submitExam(id, examData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to submit exam');
  }
}
