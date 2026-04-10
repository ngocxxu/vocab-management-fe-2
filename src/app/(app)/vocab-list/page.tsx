import VocabListLayout from '@/features/vocab-list/ui/VocabListLayout';
import { getVocabListPageData } from '@/features/vocab-list/services/server/getVocabListPageData';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VocabListPage({ searchParams }: PageProps) {
  // Await searchParams (mandatory in Next.js 15+)
  const resolvedParams = await searchParams;
  const {
    initialVocabsData,
    initialLanguageFolderData,
    initialSubjectsData,
    initialLanguagesData,
    initialWordTypesData,
    vocabListLoadFailed,
    errors,
  } = await getVocabListPageData(resolvedParams);

  if (errors.vocabs) {
    console.error('Failed to fetch vocab list:', errors.vocabs);
  }
  if (errors.folder) {
    console.error('Failed to fetch language folder:', errors.folder);
  }
  if (errors.subjects) {
    console.error('Failed to fetch subjects:', errors.subjects);
  }
  if (errors.languages) {
    console.error('Failed to fetch languages:', errors.languages);
  }
  if (errors.wordTypes) {
    console.error('Failed to fetch word types:', errors.wordTypes);
  }

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
