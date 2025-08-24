import useSWR from 'swr';
import axiosInstance from '@/libs/axios';

// SWR fetcher function using axios
const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

// Hook for getting all languages
export const useLanguages = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/languages', fetcher);

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
    id ? `/api/languages/${id}` : null,
    fetcher,
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
    const response = await axiosInstance.post('/api/languages', languageData);
    return response.data;
  },

  // Update language
  update: async (id: string, languageData: { name: string; code: string }) => {
    const response = await axiosInstance.put(`/api/languages/${id}`, languageData);
    return response.data;
  },

  // Delete language
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/languages/${id}`);
    return response.data;
  },
};
