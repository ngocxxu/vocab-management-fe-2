import { VocabTrainerLayout } from '@/components/vocab-trainer';
import { vocabTrainerApi } from '@/utils/server-api';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VocabTrainerPage({ searchParams }: PageProps) {
  // Await searchParams (mandatory in Next.js 15+)
  const resolvedParams = await searchParams;

  // Parse query parameters
  const rawPage = Number(resolvedParams.page);
  const rawPageSize = Number(resolvedParams.pageSize);

  const queryParams = {
    page: !Number.isNaN(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: !Number.isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10,
    sortBy: typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'name',
    sortOrder: (resolvedParams.sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
  };

  try {
    // Fetch data server-side
    const initialData = await vocabTrainerApi.getAll(queryParams);

    return <VocabTrainerLayout initialData={initialData} />;
  } catch (error) {
    console.error('Failed to fetch vocab trainers:', error);
    throw new Error('Failed to load vocab trainers');
  }
}
