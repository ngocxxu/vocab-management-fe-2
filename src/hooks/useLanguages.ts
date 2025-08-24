import useSWR from 'swr';
import { languagesApi } from '@/utils/client-api';

// Hook for getting all languages
export const useLanguages = () => {
  const { data, error, isLoading, mutate } = useSWR('languages', () => languagesApi.getAll());

  return {
    languages: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single language by ID
export const useLanguage = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['language', id] : null,
    () => languagesApi.getById(id!),
  );

  return {
    language: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for mutations
export const languageMutations = {
  // Create new language
  create: async (languageData: { name: string; code: string }) => {
    return await languagesApi.create(languageData);
  },

  // Update language
  update: async (id: string, languageData: { name: string; code: string }) => {
    return await languagesApi.update(id, languageData);
  },

  // Delete language
  delete: async (id: string) => {
    return await languagesApi.delete(id);
  },
};
