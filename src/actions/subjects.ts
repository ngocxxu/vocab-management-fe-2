'use server';

import { subjectsApi } from '@/utils/server-api';

export async function createSubject(subjectData: { name: string }) {
  try {
    return await subjectsApi.create({ ...subjectData, order: 0 });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create subject');
  }
}

export async function updateSubject(id: string, subjectData: { name: string; order: number }) {
  try {
    return await subjectsApi.update(id, subjectData);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update subject');
  }
}

export async function deleteSubject(id: string) {
  try {
    return await subjectsApi.delete(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete subject');
  }
}

export async function reorderSubjects(subjects: { id: string; order: number }[]) {
  try {
    return await subjectsApi.reorder(subjects);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to reorder subjects');
  }
}
