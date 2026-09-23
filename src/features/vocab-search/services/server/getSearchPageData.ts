import { logger } from '@/libs/Logger';
import { vocabApi } from '@/utils/server-api';
import { MIN_SEMANTIC_QUERY_LENGTH } from '../../constants';

type SearchParams = { [key: string]: string | string[] | undefined };

export async function getSearchPageData(resolvedParams: SearchParams) {
  const initialQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  const trimmed = initialQuery.trim();

  if (trimmed.length < MIN_SEMANTIC_QUERY_LENGTH) {
    return { initialQuery, groups: [], failed: false };
  }

  // `failed` (not just an empty array) so the page can tell "genuinely no
  // matches" apart from "the request itself broke" — the backend already
  // caps query length and degrades to substring search on its own outages,
  // so a rejection here is a real signal, not routine noise to swallow silently.
  try {
    const groups = await vocabApi.searchSemanticGrouped({ q: trimmed });
    return { initialQuery, groups, failed: false };
  } catch (error) {
    logger.error('Failed to fetch semantic search results:', { error });
    return { initialQuery, groups: [], failed: true };
  }
}
