import { getCachedLanguages } from '@/features/reference-data';
import { languagesApi, subjectsApi } from '@/utils/server-api';

export async function getSubjectsPageData() {
  try {
    const [initialSubjectsData, initialLanguagesData] = await Promise.all([
      subjectsApi.getAll(),
      getCachedLanguages().catch(() => languagesApi.getAll()),
    ]);
    return { initialSubjectsData, initialLanguagesData, error: undefined };
  } catch (error) {
    return { initialSubjectsData: undefined, initialLanguagesData: undefined, error };
  }
}
