import type { LanguageFolderQueryParams } from '@/utils/api-config';
import useSWR from 'swr';
import { languageFoldersApi } from '@/utils/client-api';

// Hook for getting user's language folders
export const useLanguageFolders = (params?: LanguageFolderQueryParams) => {
  const queryKey = params ? ['languageFolders', JSON.stringify(params)] : 'languageFolders';
  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => languageFoldersApi.getMy(params),
  );

  const folders = data?.items || [];
  const totalItems = data?.totalItems ?? folders.length;
  const pageSize = params?.pageSize || 10;
  const totalPages = data?.totalPages ?? Math.ceil(totalItems / pageSize);
  const currentPage = data?.currentPage ?? params?.page ?? 1;

  return {
    languageFolders: folders,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single language folder by ID
export const useLanguageFolder = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['languageFolder', id] : null,
    () => languageFoldersApi.getById(id!),
  );

  return {
    languageFolder: data,
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
    return await languageFoldersApi.create(languageFolderData);
  },

  // Update language folder
  update: async (id: string, languageFolderData: {
    name: string;
    folderColor: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
  }) => {
    return await languageFoldersApi.update(id, languageFolderData);
  },

  // Delete language folder
  delete: async (id: string) => {
    return await languageFoldersApi.delete(id);
  },
};
