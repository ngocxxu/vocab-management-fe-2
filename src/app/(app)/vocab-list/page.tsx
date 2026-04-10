import VocabListLayout from '@/components/vocab-list/VocabListLayout';
import { languageFoldersApi, languagesApi, subjectsApi, vocabApi, wordTypesApi } from '@/utils/server-api';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VocabListPage({ searchParams }: PageProps) {
  // Await searchParams (mandatory in Next.js 15+)
  const resolvedParams = await searchParams;

  // Parse query parameters
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

  const [
    vocabsResult,
    folderResult,
    subjectsResult,
    languagesResult,
    wordTypesResult,
  ] = await Promise.allSettled([
    vocabApi.getAll(queryParams),
    languageFolderId ? languageFoldersApi.getById(languageFolderId) : Promise.resolve(null),
    subjectsApi.getAll(),
    languagesApi.getAll(),
    wordTypesApi.getAll(),
  ]);

  if (vocabsResult.status === 'rejected') {
    console.error('Failed to fetch vocab list:', vocabsResult.reason);
  }
  if (folderResult.status === 'rejected') {
    console.error('Failed to fetch language folder:', folderResult.reason);
  }
  if (subjectsResult.status === 'rejected') {
    console.error('Failed to fetch subjects:', subjectsResult.reason);
  }
  if (languagesResult.status === 'rejected') {
    console.error('Failed to fetch languages:', languagesResult.reason);
  }
  if (wordTypesResult.status === 'rejected') {
    console.error('Failed to fetch word types:', wordTypesResult.reason);
  }

  const initialVocabsData = vocabsResult.status === 'fulfilled' ? vocabsResult.value : undefined;
  const vocabListLoadFailed = vocabsResult.status === 'rejected';
  const initialLanguageFolderData
    = folderResult.status === 'fulfilled' ? folderResult.value || undefined : undefined;
  const initialSubjectsData = subjectsResult.status === 'fulfilled' ? subjectsResult.value : undefined;
  const initialLanguagesData = languagesResult.status === 'fulfilled' ? languagesResult.value : undefined;
  const initialWordTypesData = wordTypesResult.status === 'fulfilled' ? wordTypesResult.value : undefined;

  return (
    <VocabListLayout
      initialVocabsData={initialVocabsData}
      initialLanguageFolderData={initialLanguageFolderData}
      initialSubjectsData={initialSubjectsData}
      initialLanguagesData={initialLanguagesData}
      initialWordTypesData={initialWordTypesData}
      vocabListLoadFailed={vocabListLoadFailed}
    />
  );
}
