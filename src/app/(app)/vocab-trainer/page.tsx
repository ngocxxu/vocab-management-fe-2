import type { EQuestionType } from '@/enum/vocab-trainer';
import VocabTrainerLayout from '@/components/vocab-trainer/VocabTrainerLayout';
import { languagesApi, vocabTrainerApi } from '@/utils/server-api';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VocabTrainerPage({ searchParams }: PageProps) {
  // Await searchParams (mandatory in Next.js 15+)
  const resolvedParams = await searchParams;

  // Parse query parameters
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

  try {
    // Fetch data server-side
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

    return <VocabTrainerLayout initialData={initialData} initialLanguagesData={initialLanguagesData} />;
  } catch (error) {
    console.error('Failed to fetch vocab trainers:', error);
    throw new Error('Failed to load vocab trainers');
  }
}
