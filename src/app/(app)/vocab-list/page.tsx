import { VocabListLayout } from '@/components/vocab-list';
import { languageFoldersApi, languagesApi, subjectsApi, vocabApi, wordTypesApi } from '@/utils/server-api';

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

  const queryParams = {
    page: !Number.isNaN(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: !Number.isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10,
    sortBy: typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'textSource',
    sortOrder: (resolvedParams.sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
    sourceLanguageCode,
    targetLanguageCode,
    languageFolderId,
  };

  try {
    // Fetch all data concurrently at server-side
    const [initialVocabsData, initialLanguageFolderData, initialSubjectsData, initialLanguagesData, initialWordTypesData] = await Promise.all([
      vocabApi.getAll(queryParams),
      languageFolderId ? languageFoldersApi.getById(languageFolderId) : Promise.resolve(null),
      subjectsApi.getAll(),
      languagesApi.getAll(),
      wordTypesApi.getAll(),
    ]);

    return (
      <VocabListLayout
        initialVocabsData={initialVocabsData}
        initialLanguageFolderData={initialLanguageFolderData || undefined}
        initialSubjectsData={initialSubjectsData}
        initialLanguagesData={initialLanguagesData}
        initialWordTypesData={initialWordTypesData}
      />
    );
  } catch (error) {
    console.error('Failed to fetch vocab list data:', error);
    // Return layout without initial data if fetch fails
    return <VocabListLayout />;
  }
}
