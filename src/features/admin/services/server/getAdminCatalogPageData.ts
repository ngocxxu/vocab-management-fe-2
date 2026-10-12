import type { TAdminLanguage, TAdminWordType } from '@/types/admin';
import { adminApi } from '@/utils/server-api';

/** Every language with its usage counts, for the languages page. */
export async function getAdminLanguagesPageData(): Promise<TAdminLanguage[]> {
  return adminApi.languages.list();
}

/** Every word type with its usage counts, for the word types page. */
export async function getAdminWordTypesPageData(): Promise<TAdminWordType[]> {
  return adminApi.wordTypes.list();
}
