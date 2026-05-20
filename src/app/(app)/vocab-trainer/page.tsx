import VocabTrainerLayout from '@/components/vocab-trainer/VocabTrainerLayout';
import { getVocabTrainerPageData } from '@/features/vocab-trainer/services/server/getVocabTrainerPageData';
import { logger } from '@/libs/Logger';
import { isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VocabTrainerPage({ searchParams }: PageProps) {
  // Await searchParams (mandatory in Next.js 15+)
  const resolvedParams = await searchParams;

  try {
    const { initialData, initialLanguagesData } = await getVocabTrainerPageData(resolvedParams);

    return <VocabTrainerLayout initialData={initialData} initialLanguagesData={initialLanguagesData} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect('/signin?redirect=/vocab-trainer');
    }

    logger.error('Failed to fetch vocab trainers:', { error });
    throw new Error('Failed to load vocab trainers');
  }
}
