import useSWR from 'swr';
import axiosInstance from '@/libs/axios';
import { wordTypesApi } from '@/utils/client-api';

// SWR fetcher function using axios
const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

// Hook for getting all word types
export const useWordTypes = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/word-types', fetcher);

  return {
    wordTypes: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single word type by ID
export const useWordType = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/word-types/${id}` : null,
    fetcher,
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
    const response = await wordTypesApi.create(wordTypeData);
    return response;
  },

  // Update word type
  update: async (id: string, wordTypeData: { name: string; description: string }) => {
    const response = await wordTypesApi.update(id, wordTypeData);
    return response;
  },

  // Delete word type
  delete: async (id: string) => {
    const response = await wordTypesApi.delete(id);
    return response;
  },
};
