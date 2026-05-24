import VocabTrainerLayout from '@/components/vocab-trainer/VocabTrainerLayout';
import { getVocabTrainerPageData } from '@/features/vocab-trainer/services/server/getVocabTrainerPageData';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VocabTrainerPage({ searchParams }: PageProps) {
  // Await searchParams (mandatory in Next.js 15+)
  const resolvedParams = await searchParams;

  try {
    const { currentUser, initialData, initialLanguagesData } = await getVocabTrainerPageData(resolvedParams);

    return <VocabTrainerLayout currentUser={currentUser} initialData={initialData} initialLanguagesData={initialLanguagesData} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/vocab-trainer'));
    }

    logger.error('Failed to fetch vocab trainers:', { error });
    return <VocabTrainerLayout loadError="Unable to load vocab trainers right now. Please refresh the page or try again later." />;
  }
}
