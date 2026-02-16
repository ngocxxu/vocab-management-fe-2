'use server';

import { revalidatePath } from 'next/cache';
import { subjectsApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function createSubject(subjectData: { name: string }) {
  await requireAuth();
  try {
    const result = await subjectsApi.create({ ...subjectData, order: 0 });
    revalidatePath('/subjects');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to create subject');
  }
}

export async function updateSubject(id: string, subjectData: { name: string; order: number }) {
  await requireAuth();
  try {
    const result = await subjectsApi.update(id, subjectData);
    revalidatePath('/subjects');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to update subject');
  }
}

export async function deleteSubject(id: string) {
  await requireAuth();
  try {
    const result = await subjectsApi.delete(id);
    revalidatePath('/subjects');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to delete subject');
  }
}

export async function reorderSubjects(subjects: { id: string; order: number }[]) {
  await requireAuth();
  try {
    const result = await subjectsApi.reorder(subjects);
    revalidatePath('/subjects');
    revalidatePath('/vocab-list');
    return result;
  } catch (error) {
    throw toActionError(error, 'Failed to reorder subjects');
  }
}
