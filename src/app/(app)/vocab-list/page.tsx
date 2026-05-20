import VocabListLayout from '@/features/vocab-list/ui/VocabListLayout';
import { getVocabListPageData } from '@/features/vocab-list/services/server/getVocabListPageData';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, hasUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

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
  const pageErrors = Object.values(errors);

  if (hasUnauthorizedError(pageErrors)) {
    redirect(getExpiredSessionRedirect('/vocab-list'));
  }

  if (errors.vocabs) {
    logger.error('Failed to fetch vocab list:', { error: errors.vocabs });
  }
  if (errors.folder) {
    logger.error('Failed to fetch language folder:', { error: errors.folder });
  }
  if (errors.subjects) {
    logger.error('Failed to fetch subjects:', { error: errors.subjects });
  }
  if (errors.languages) {
    logger.error('Failed to fetch languages:', { error: errors.languages });
  }
  if (errors.wordTypes) {
    logger.error('Failed to fetch word types:', { error: errors.wordTypes });
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
