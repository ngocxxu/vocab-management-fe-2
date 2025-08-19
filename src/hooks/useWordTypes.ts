import useSWR from 'swr';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

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
    const response = await fetch('/api/word-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wordTypeData),
    });

    if (!response.ok) {
      throw new Error('Failed to create word type');
    }

    return response.json();
  },

  // Update word type
  update: async (id: string, wordTypeData: { name: string; description: string }) => {
    const response = await fetch(`/api/word-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wordTypeData),
    });

    if (!response.ok) {
      throw new Error('Failed to update word type');
    }

    return response.json();
  },

  // Delete word type
  delete: async (id: string) => {
    const response = await fetch(`/api/word-types/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete word type');
    }

    return response.json();
  },
};
