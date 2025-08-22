import useSWR from 'swr';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Hook for getting vocabularies by source and target language
export const useVocabsByLanguage = (sourceLanguageCode?: string, targetLanguageCode?: string) => {
  const url = sourceLanguageCode && targetLanguageCode
    ? `/api/vocabs?source=${sourceLanguageCode}&target=${targetLanguageCode}`
    : null;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    vocabs: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};
