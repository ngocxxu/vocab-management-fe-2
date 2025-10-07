import useSWR from 'swr';
import { wordTypesApi } from '@/utils/client-api';

// Hook for getting all word types
export const useWordTypes = () => {
  const { data, error, isLoading, mutate } = useSWR('wordTypes', () => wordTypesApi.getAll());

  return {
    wordTypes: data.items || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single word type by ID
export const useWordType = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['wordType', id] : null,
    () => wordTypesApi.getById(id!),
  );

  return {
    wordType: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for mutations
export const wordTypeMutations = {
  // Create new word type
  create: async (wordTypeData: { name: string; description: string }) => {
    return await wordTypesApi.create(wordTypeData);
  },

  // Update word type
  update: async (id: string, wordTypeData: { name: string; description: string }) => {
    return await wordTypesApi.update(id, wordTypeData);
  },

  // Delete word type
  delete: async (id: string) => {
    return await wordTypesApi.delete(id);
  },
};
