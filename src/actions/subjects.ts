'use server';

import { revalidatePath } from 'next/cache';
import { subjectsApi } from '@/utils/server-api';

export async function createSubject(subjectData: { name: string }) {
  try {
    const result = await subjectsApi.create({ ...subjectData, order: 0 });
    revalidatePath('/subjects');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create subject');
  }
}

export async function updateSubject(id: string, subjectData: { name: string; order: number }) {
  try {
    const result = await subjectsApi.update(id, subjectData);
    revalidatePath('/subjects');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update subject');
  }
}

export async function deleteSubject(id: string) {
  try {
    const result = await subjectsApi.delete(id);
    revalidatePath('/subjects');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete subject');
  }
}

export async function reorderSubjects(subjects: { id: string; order: number }[]) {
  try {
    const result = await subjectsApi.reorder(subjects);
    revalidatePath('/subjects');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to reorder subjects');
  }
}
