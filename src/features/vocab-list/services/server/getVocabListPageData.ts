import { languageFoldersApi, languagesApi, subjectsApi, vocabApi, wordTypesApi } from '@/utils/server-api';

type SearchParams = { [key: string]: string | string[] | undefined };

export async function getVocabListPageData(resolvedParams: SearchParams) {
  const rawPage = Number(resolvedParams.page);
  const rawPageSize = Number(resolvedParams.pageSize);
  const sourceLanguageCode = typeof resolvedParams.sourceLanguageCode === 'string' ? resolvedParams.sourceLanguageCode : undefined;
  const targetLanguageCode = typeof resolvedParams.targetLanguageCode === 'string' ? resolvedParams.targetLanguageCode : undefined;
  const languageFolderId = typeof resolvedParams.languageFolderId === 'string' ? resolvedParams.languageFolderId : undefined;
  const textSource = typeof resolvedParams.textSource === 'string' ? resolvedParams.textSource : undefined;
  const subjectIdsParam = typeof resolvedParams.subjectIds === 'string' ? resolvedParams.subjectIds : undefined;
  const subjectIds = subjectIdsParam ? subjectIdsParam.split(',') : undefined;

  const queryParams = {
    page: !Number.isNaN(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: !Number.isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10,
    sortBy: typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'updatedAt',
    sortOrder: (resolvedParams.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    sourceLanguageCode,
    targetLanguageCode,
    languageFolderId,
    textSource,
    subjectIds,
  };

  const [vocabsResult, folderResult, subjectsResult, languagesResult, wordTypesResult] = await Promise.allSettled([
    vocabApi.getAll(queryParams),
    languageFolderId ? languageFoldersApi.getById(languageFolderId) : Promise.resolve(null),
    subjectsApi.getAll(),
    languagesApi.getAll(),
    wordTypesApi.getAll(),
  ]);

  return {
    initialVocabsData: vocabsResult.status === 'fulfilled' ? vocabsResult.value : undefined,
    vocabListLoadFailed: vocabsResult.status === 'rejected',
    initialLanguageFolderData: folderResult.status === 'fulfilled' ? folderResult.value || undefined : undefined,
    initialSubjectsData: subjectsResult.status === 'fulfilled' ? subjectsResult.value : undefined,
    initialLanguagesData: languagesResult.status === 'fulfilled' ? languagesResult.value : undefined,
    initialWordTypesData: wordTypesResult.status === 'fulfilled' ? wordTypesResult.value : undefined,
    errors: {
      vocabs: vocabsResult.status === 'rejected' ? vocabsResult.reason : undefined,
      folder: folderResult.status === 'rejected' ? folderResult.reason : undefined,
      subjects: subjectsResult.status === 'rejected' ? subjectsResult.reason : undefined,
      languages: languagesResult.status === 'rejected' ? languagesResult.reason : undefined,
      wordTypes: wordTypesResult.status === 'rejected' ? wordTypesResult.reason : undefined,
    },
  };
}
