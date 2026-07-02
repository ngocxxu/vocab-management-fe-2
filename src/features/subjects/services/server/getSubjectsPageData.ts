import { subjectsApi } from '@/utils/server-api';

export async function getSubjectsPageData() {
  try {
    const initialSubjectsData = await subjectsApi.getAll();
    return { initialSubjectsData, error: undefined };
  } catch (error) {
    return { initialSubjectsData: undefined, error };
  }
}
