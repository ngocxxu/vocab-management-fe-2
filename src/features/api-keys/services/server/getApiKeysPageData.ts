import { apiKeysApi } from '@/utils/server-api';

export async function getApiKeysPageData() {
  try {
    const initialApiKeysData = await apiKeysApi.getAll();
    return { initialApiKeysData, error: undefined };
  } catch (error) {
    return { initialApiKeysData: undefined, error };
  }
}
