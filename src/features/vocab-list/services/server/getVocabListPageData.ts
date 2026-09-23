import { verifyUser } from '@/actions';
import { getCachedLanguages, getCachedWordTypes } from '@/features/reference-data';
import { MIN_SEMANTIC_QUERY_LENGTH } from '@/features/vocab-search';
import { languageFoldersApi, languagesApi, subjectsApi, vocabApi, wordTypesApi } from '@/utils/server-api';

type SearchParams = { [key: string]: string | string[] | undefined };

export async function getVocabListPageData(resolvedParams: SearchParams) {
  const rawPage = Number(resolvedParams.page);
  const rawPageSize = Number(resolvedParams.pageSize);
  const sourceLanguageCode = typeof resolvedParams.sourceLanguageCode === 'string' ? resolvedParams.sourceLanguageCode : undefined;
  const targetLanguageCode = typeof resolvedParams.targetLanguageCode === 'string' ? resolvedParams.targetLanguageCode : undefined;
  const languageFolderId = typeof resolvedParams.languageFolderId === 'string' ? resolvedParams.languageFolderId : undefined;
  const textSource = typeof resolvedParams.textSource === 'string' ? resolvedParams.textSource : undefined;
  const subjectIdsParam = typeof resolvedParams.subjectIds === 'string' ? resolvedParams.subjectIds : undefined;
  const subjectIds = subjectIdsParam ? subjectIdsParam.split(',') : undefined;

  const queryParams = {
    page: !Number.isNaN(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: !Number.isNaN(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10,
    sortBy: typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'updatedAt',
    sortOrder: (resolvedParams.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    sourceLanguageCode,
    targetLanguageCode,
    languageFolderId,
    textSource,
    subjectIds,
  };

  // Below MIN_SEMANTIC_QUERY_LENGTH the query carries no meaning to embed, and
  // skipping the call here (not just hiding the result) is what saves the
  // Gemini call on every short/empty query.
  const isSemanticQuery = !!textSource && textSource.trim().length >= MIN_SEMANTIC_QUERY_LENGTH;

  const [userResult, vocabsResult, folderResult, subjectsResult, languagesResult, wordTypesResult, semanticResult] = await Promise.allSettled([
    verifyUser(),
    vocabApi.getAll(queryParams),
    languageFolderId ? languageFoldersApi.getById(languageFolderId) : Promise.resolve(null),
    subjectsApi.getAll(),
    getCachedLanguages().catch(() => languagesApi.getAll()),
    getCachedWordTypes().catch(() => wordTypesApi.getAll()),
    isSemanticQuery
      ? vocabApi.searchSemantic({ q: textSource!, languageFolderId, limit: 12 })
      : Promise.resolve(undefined),
  ]);

  return {
    currentUser: userResult.status === 'fulfilled' ? userResult.value : null,
    initialVocabsData: vocabsResult.status === 'fulfilled' ? vocabsResult.value : undefined,
    vocabListLoadFailed: vocabsResult.status === 'rejected',
    initialLanguageFolderData: folderResult.status === 'fulfilled' ? folderResult.value || undefined : undefined,
    initialSubjectsData: subjectsResult.status === 'fulfilled' ? subjectsResult.value : undefined,
    initialLanguagesData: languagesResult.status === 'fulfilled' ? languagesResult.value : undefined,
    initialWordTypesData: wordTypesResult.status === 'fulfilled' ? wordTypesResult.value : undefined,
    // Undefined (not []) when skipped or failed, so the UI can tell "no
    // suggestions fetched" apart from "fetched, genuinely zero results".
    initialSemanticSuggestions: semanticResult.status === 'fulfilled' ? semanticResult.value : undefined,
    errors: {
      user: userResult.status === 'rejected' ? userResult.reason : undefined,
      vocabs: vocabsResult.status === 'rejected' ? vocabsResult.reason : undefined,
      folder: folderResult.status === 'rejected' ? folderResult.reason : undefined,
      subjects: subjectsResult.status === 'rejected' ? subjectsResult.reason : undefined,
      languages: languagesResult.status === 'rejected' ? languagesResult.reason : undefined,
      wordTypes: wordTypesResult.status === 'rejected' ? wordTypesResult.reason : undefined,
      // Deliberately NOT surfaced as a page-level error: this is a supplement
      // to a table that already has its own results, and the backend already
      // degrades to substring search before this call ever fails.
    },
  };
}
