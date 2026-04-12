import type { TSubject, TSubjectResponse } from '@/types/subject';
import type { TVocabConflictListResponse } from '@/types/vocab-conflict';
import { subjectsApi, vocabApi } from '@/utils/server-api';

type SearchParams = Record<string, string | string[] | undefined>;

export async function getConflictVocabsPageData(
  resolvedParams: SearchParams,
  subjectId: string,
): Promise<{
  conflictData?: TVocabConflictListResponse;
  subjects?: TSubjectResponse;
  conflictSubject: TSubject | null;
  loadFailed: boolean;
}> {
  const rawPage = Number(resolvedParams.page);
  const rawPageSize = Number(resolvedParams.pageSize);
  const textSource = typeof resolvedParams.textSource === 'string' ? resolvedParams.textSource : undefined;

  const queryParams = {
    subjectId,
    page: !Number.isNaN(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: !Number.isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10,
    sortBy: typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'createdAt',
    sortOrder: (resolvedParams.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    ...(textSource ? { textSource } : {}),
  };

  const [conflictResult, subjectsResult, subjectResult] = await Promise.allSettled([
    vocabApi.getConflictBySubject(queryParams),
    subjectsApi.getAll(),
    subjectsApi.getById(subjectId),
  ]);

  const conflictData = conflictResult.status === 'fulfilled' ? conflictResult.value : undefined;
  const subjects = subjectsResult.status === 'fulfilled' ? subjectsResult.value : undefined;

  let conflictSubject: TSubject | null = null;
  if (subjectResult.status === 'fulfilled') {
    conflictSubject = subjectResult.value as TSubject;
  } else if (subjects?.items) {
    conflictSubject = subjects.items.find(s => s.id === subjectId) ?? null;
  }

  return {
    conflictData,
    subjects,
    conflictSubject,
    loadFailed: conflictResult.status === 'rejected',
  };
}
