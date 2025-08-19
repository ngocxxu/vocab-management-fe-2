import useSWR from 'swr';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

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
    const response = await fetch('/api/languages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(languageData),
    });

    if (!response.ok) {
      throw new Error('Failed to create language');
    }

    return response.json();
  },

  // Update language
  update: async (id: string, languageData: { name: string; code: string }) => {
    const response = await fetch(`/api/languages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(languageData),
    });

    if (!response.ok) {
      throw new Error('Failed to update language');
    }

    return response.json();
  },

  // Delete language
  delete: async (id: string) => {
    const response = await fetch(`/api/languages/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete language');
    }

    return response.json();
  },
};
