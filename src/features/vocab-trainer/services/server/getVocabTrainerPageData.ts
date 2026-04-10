import type { EQuestionType } from '@/enum/vocab-trainer';
import { languagesApi, vocabTrainerApi } from '@/utils/server-api';

type SearchParams = { [key: string]: string | string[] | undefined };

export async function getVocabTrainerPageData(resolvedParams: SearchParams) {
  const rawPage = Number(resolvedParams.page);
  const rawPageSize = Number(resolvedParams.pageSize);
  const name = typeof resolvedParams.name === 'string' ? resolvedParams.name : undefined;
  const statusParam = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;
  const status = statusParam ? statusParam.split(',') : undefined;
  const questionType = typeof resolvedParams.questionType === 'string' ? resolvedParams.questionType : undefined;

  const queryParams = {
    page: !Number.isNaN(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: !Number.isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10,
    sortBy: typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'name',
    sortOrder: (resolvedParams.sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
    name,
    status,
    questionType,
  };

  const [initialData, initialLanguagesData] = await Promise.all([
    vocabTrainerApi.getAll({
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
      name: queryParams.name,
      status: queryParams.status,
      questionType: queryParams.questionType as EQuestionType,
    }),
    languagesApi.getAll(),
  ]);

  return { initialData, initialLanguagesData };
}
