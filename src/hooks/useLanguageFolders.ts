import useSWR from 'swr';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

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
    const response = await fetch('/api/language-folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(languageFolderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create language folder');
    }

    return response.json();
  },

  // Update language folder
  update: async (id: string, languageFolderData: {
    name: string;
    folderColor: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
  }) => {
    const response = await fetch(`/api/language-folders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(languageFolderData),
    });

    if (!response.ok) {
      throw new Error('Failed to update language folder');
    }

    return response.json();
  },

  // Delete language folder
  delete: async (id: string) => {
    const response = await fetch(`/api/language-folders/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete language folder');
    }

    return response.json();
  },
};
