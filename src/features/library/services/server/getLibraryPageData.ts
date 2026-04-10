import { languageFoldersApi, languagesApi } from '@/utils/server-api';

type SearchParams = { [key: string]: string | string[] | undefined };

export async function getLibraryPageData(resolvedParams: SearchParams) {
  const rawPage = Number(resolvedParams.page);
  const rawPageSize = Number(resolvedParams.pageSize);

  const queryParams = {
    page: !Number.isNaN(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: !Number.isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : 50,
    sortBy: typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'name',
    sortOrder: (resolvedParams.sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
  };

  const [initialData, initialLanguagesData] = await Promise.all([
    languageFoldersApi.getMy(queryParams),
    languagesApi.getAll(),
  ]);

  return { initialData, initialLanguagesData };
}
