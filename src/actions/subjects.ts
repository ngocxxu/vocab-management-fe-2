'use server';

import { revalidatePath } from 'next/cache';
import { isStandardErrorBody } from '@/types/api-error';
import { BackendRequestError } from '@/utils/backend-request-error';
import { parseVocabularyCountFromConflictMessage } from '@/utils/parse-vocabulary-conflict-count';
import { subjectsApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export type DeleteSubjectResult
  = | { ok: true }
    | { ok: false; code: 'CONFLICT'; vocabularyCount?: number };

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

export async function deleteSubject(id: string): Promise<DeleteSubjectResult> {
  await requireAuth();
  try {
    await subjectsApi.delete(id);
    revalidatePath('/subjects');
    revalidatePath('/vocab-list');
    return { ok: true };
  } catch (error) {
    if (error instanceof BackendRequestError && error.statusCode === 409) {
      let vocabularyCount: number | undefined;
      if (isStandardErrorBody(error.body)) {
        vocabularyCount = parseVocabularyCountFromConflictMessage(error.body.message);
      }
      return { ok: false, code: 'CONFLICT', vocabularyCount };
    }
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
