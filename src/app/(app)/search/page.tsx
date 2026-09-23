import { GlobalVocabSearch } from '@/features/vocab-search';
import { getSearchPageData } from '@/features/vocab-search/services/server/getSearchPageData';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Cross-folder semantic search.
 *
 * A route of its own, not a mode of the VocabList search box: widening the scope
 * has to be a deliberate, visible action (NN/g on scoped search), and a real URL
 * makes a result set shareable.
 *
 * Fetched here, server-side, same as VocabList's own search — there is no
 * client-side route to the backend for this, and it would need one (a proxy
 * or CORS) to work from the browser.
 */
export default async function GlobalSearchPage({ searchParams }: PageProps) {
  // Await searchParams (mandatory in Next.js 15+)
  const resolvedParams = await searchParams;
  const { initialQuery, groups, failed } = await getSearchPageData(resolvedParams);

  return <GlobalVocabSearch initialQuery={initialQuery} initialGroups={groups} failed={failed} />;
}
