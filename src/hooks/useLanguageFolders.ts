import useSWR from 'swr';
import axiosInstance from '@/libs/axios';
import { languageFoldersApi } from '@/utils/client-api';

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
    const response = await languageFoldersApi.create(languageFolderData);
    return response;
  },

  // Update language folder
  update: async (id: string, languageFolderData: {
    name: string;
    folderColor: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
  }) => {
    const response = await languageFoldersApi.update(id, languageFolderData);
    return response;
  },

  // Delete language folder
  delete: async (id: string) => {
    const response = await languageFoldersApi.delete(id);
    return response;
  },
};
