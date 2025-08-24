import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import type { VocabQueryParams } from '@/utils/api-config';
import useSWR from 'swr';
import axiosInstance from '@/libs/axios';

// SWR fetcher function using axios
const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

// Hook for getting vocabularies with query parameters
export const useVocabs = (queryParams?: VocabQueryParams) => {
  const queryString = queryParams ? `?${new URLSearchParams(queryParams as Record<string, string>).toString()}` : '';
  const { data, error, isLoading, mutate } = useSWR(
    `/api/vocabs${queryString}`,
    fetcher,
  );

  return {
    vocabs: (data as TVocab[] | undefined) || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single vocabulary by ID
export const useVocab = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/vocabs/${id}` : null,
    fetcher,
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
    const response = await axiosInstance.post('/api/vocabs', vocabData);
    return response.data;
  },

  // Update vocabulary
  update: async (id: string, vocabData: Partial<TCreateVocab>) => {
    const response = await axiosInstance.put(`/api/vocabs/${id}`, vocabData);
    return response.data;
  },

  // Delete vocabulary
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/vocabs/${id}`);
    return response.data;
  },

  // Bulk create vocabularies
  createBulk: async (vocabData: TCreateVocab[]) => {
    const response = await axiosInstance.post('/api/vocabs/bulk/create', vocabData);
    return response.data;
  },

  // Bulk delete vocabularies
  deleteBulk: async (ids: string[]) => {
    const response = await axiosInstance.delete('/api/vocabs/bulk/delete', {
      data: { ids },
    });
    return response.data;
  },
};
