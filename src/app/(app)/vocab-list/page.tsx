import { VocabListLayout } from '@/components/vocab-list';
import { subjectsApi } from '@/utils/server-api';

export default async function VocabListPage() {
  try {
    // Fetch subjects data server-side
    const initialSubjectsData = await subjectsApi.getAll();

    return <VocabListLayout initialSubjectsData={initialSubjectsData} />;
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    // Return layout without initial data if fetch fails
    return <VocabListLayout />;
  }
}
