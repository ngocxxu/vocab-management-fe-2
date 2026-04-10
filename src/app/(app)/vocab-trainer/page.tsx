import VocabTrainerLayout from '@/components/vocab-trainer/VocabTrainerLayout';
import { getVocabTrainerPageData } from '@/features/vocab-trainer/services/server/getVocabTrainerPageData';

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
    console.error('Failed to fetch vocab trainers:', error);
    throw new Error('Failed to load vocab trainers');
  }
}
