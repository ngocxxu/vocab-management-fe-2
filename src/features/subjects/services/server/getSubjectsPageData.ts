import { subjectsApi } from '@/utils/server-api';

export async function getSubjectsPageData() {
  try {
    const initialSubjectsData = await subjectsApi.getAll();
    return { initialSubjectsData };
  } catch {
    return { initialSubjectsData: undefined };
  }
}
