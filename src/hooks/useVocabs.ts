import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import type { VocabQueryParams } from '@/utils/api-config';
import useSWR from 'swr';
import { vocabApi } from '@/utils/client-api';

// Hook for getting vocabularies with query parameters
export const useVocabs = (queryParams?: VocabQueryParams) => {
  const { data, error, isLoading, mutate } = useSWR(
    queryParams ? ['vocabs', queryParams] : 'vocabs',
    () => vocabApi.getAll(queryParams),
  );

  return {
    vocabs: data?.items || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single vocabulary by ID
export const useVocab = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['vocab', id] : null,
    () => vocabApi.getById(id!),
  );

  return {
    vocab: data as TVocab | undefined,
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for mutations
export const vocabMutations = {
  // Create new vocabulary
  create: async (vocabData: TCreateVocab) => {
    return await vocabApi.create(vocabData);
  },

  // Update vocabulary
  update: async (id: string, vocabData: Partial<TCreateVocab>) => {
    return await vocabApi.update(id, vocabData);
  },

  // Delete vocabulary
  delete: async (id: string) => {
    return await vocabApi.delete(id);
  },

  // Bulk create vocabularies
  createBulk: async (vocabData: TCreateVocab[]) => {
    return await vocabApi.createBulk(vocabData);
  },

  // Bulk delete vocabularies
  deleteBulk: async (ids: string[]) => {
    return await vocabApi.deleteBulk(ids);
  },
};
