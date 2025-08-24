import useSWR from 'swr';
import axiosInstance from '@/libs/axios';

// SWR fetcher function using axios
const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

// Hook for getting user's language folders
export const useLanguageFolders = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/language-folders/my', fetcher);

  return {
    languageFolders: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single language folder by ID
export const useLanguageFolder = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/language-folders/${id}` : null,
    fetcher,
  );

  return {
    languageFolder: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for mutations
export const languageFolderMutations = {
  // Create new language folder
  create: async (languageFolderData: {
    name: string;
    folderColor: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
  }) => {
    const response = await axiosInstance.post('/api/language-folders', languageFolderData);
    return response.data;
  },

  // Update language folder
  update: async (id: string, languageFolderData: {
    name: string;
    folderColor: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
  }) => {
    const response = await axiosInstance.put(`/api/language-folders/${id}`, languageFolderData);
    return response.data;
  },

  // Delete language folder
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/language-folders/${id}`);
    return response.data;
  },
};
