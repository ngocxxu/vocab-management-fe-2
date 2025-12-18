'use server';

import type { TCreateVocabTrainer, TFormTestVocabTrainerUnion } from '@/types/vocab-trainer';
import { revalidatePath } from 'next/cache';
import { vocabTrainerApi } from '@/utils/server-api';

export async function createVocabTrainer(trainerData: TCreateVocabTrainer) {
  try {
    const result = await vocabTrainerApi.create(trainerData);
    revalidatePath('/vocab-trainer');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create vocab trainer');
  }
}

export async function updateVocabTrainer(id: string, trainerData: Partial<TCreateVocabTrainer>) {
  try {
    const result = await vocabTrainerApi.update(id, trainerData);
    revalidatePath('/vocab-trainer');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update vocab trainer');
  }
}

export async function deleteVocabTrainer(id: string): Promise<void> {
  try {
    await vocabTrainerApi.delete(id);
    revalidatePath('/vocab-trainer');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete vocab trainer');
  }
}

export async function deleteVocabTrainersBulk(ids: string[]): Promise<{ success: boolean }> {
  try {
    await vocabTrainerApi.deleteBulk(ids);
    revalidatePath('/vocab-trainer');
    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete vocab trainers');
  }
}

export async function submitExam(id: string, examData: TFormTestVocabTrainerUnion) {
  try {
    const result = await vocabTrainerApi.submitExam(id, examData);
    revalidatePath('/vocab-trainer');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to submit exam');
  }
}
