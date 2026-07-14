import { TOP_PROBLEMATIC_LIMIT } from '@/constants/statistics';
import type { TProblematicLanguage, TTopProblematicVocab } from '@/types/statistics';
import { statisticsApi } from '@/utils/server-api';

function languageLabel(language: TProblematicLanguage): string {
  return language.sourceLanguageName ?? language.sourceLanguageCode.toUpperCase();
}

export async function getDashboardProblematicData() {
  const languages = (await statisticsApi.getProblematicLanguages()) ?? [];

  // Alphabetical by display label; first tab is default-selected client-side.
  const sortedLanguages = [...languages].sort((a, b) => languageLabel(a).localeCompare(languageLabel(b)));

  // Prefetch each language's top-10 in parallel; N languages is small.
  const itemsEntries = await Promise.all(
    sortedLanguages.map(async (language): Promise<[string, TTopProblematicVocab[]]> => {
      const items = await statisticsApi.getProblematic({
        status: 'all',
        limit: TOP_PROBLEMATIC_LIMIT,
        page: 1,
        sourceLanguageCode: language.sourceLanguageCode,
      });
      return [language.sourceLanguageCode, items ?? []];
    }),
  );

  const itemsByLang: Record<string, TTopProblematicVocab[]> = Object.fromEntries(itemsEntries);

  return {
    languages: sortedLanguages,
    itemsByLang,
  };
}
