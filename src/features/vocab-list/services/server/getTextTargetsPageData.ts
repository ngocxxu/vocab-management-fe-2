import type { TextTargetQueryParams } from '@/utils/api-config';
import { requireAuth } from '@/actions/auth';
import { subjectsApi, textTargetApi, vocabApi, wordTypesApi } from '@/utils/server-api';

export async function getTextTargetsPageData(vocabId: string, searchParams?: Record<string, string>) {
  await requireAuth();

  const params: TextTargetQueryParams = {
    page: searchParams?.page ? Number(searchParams.page) : 1,
    pageSize: searchParams?.pageSize ? Number(searchParams.pageSize) : 10,
    sortBy: searchParams?.sortBy || 'textTarget',
    sortOrder: (searchParams?.sortOrder as 'asc' | 'desc') || 'asc',
    textTarget: searchParams?.textTarget || undefined,
    subjectIds: searchParams?.subjectIds ? searchParams.subjectIds.split(',') : undefined,
  };

  try {
    const [vocab, textTargetsData, subjectsData, wordTypesData] = await Promise.all([
      vocabApi.getById(vocabId),
      textTargetApi.getAll(vocabId, params),
      subjectsApi.getAll(),
      wordTypesApi.getAll(),
    ]);

    return { vocab, textTargetsData, subjectsData, wordTypesData, error: null };
  } catch (error) {
    return { vocab: null, textTargetsData: null, subjectsData: null, wordTypesData: null, error };
  }
}
