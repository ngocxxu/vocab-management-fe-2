import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import useSWR from 'swr';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Hook for getting all vocabularies
export const useVocabs = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/vocabs', fetcher);

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

// Hook for searching vocabularies
export const useVocabSearch = (query: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    query ? `/api/vocabs/search?q=${encodeURIComponent(query)}` : null,
    fetcher,
  );

  return {
    searchResults: (data as TVocab[] | undefined) || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for mutations
export const vocabMutations = {
  // Create new vocabulary
  create: async (vocabData: TCreateVocab) => {
    const response = await fetch('/api/vocabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vocabData),
    });

    if (!response.ok) {
      throw new Error('Failed to create vocabulary');
    }

    return response.json();
  },

  // Update vocabulary
  update: async (id: string, vocabData: Partial<TCreateVocab>) => {
    const response = await fetch(`/api/vocabs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vocabData),
    });

    if (!response.ok) {
      throw new Error('Failed to update vocabulary');
    }

    return response.json();
  },

  // Delete vocabulary
  delete: async (id: string) => {
    const response = await fetch(`/api/vocabs/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete vocabulary');
    }

    return response.json();
  },

  // Bulk create vocabularies
  createBulk: async (vocabData: TCreateVocab[]) => {
    const response = await fetch('/api/vocabs/bulk/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { vocabData } }),
    });

    if (!response.ok) {
      throw new Error('Failed to create bulk vocabularies');
    }

    return response.json();
  },

  // Bulk delete vocabularies
  deleteBulk: async (ids: string[]) => {
    const response = await fetch('/api/vocabs/bulk/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { ids } }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete bulk vocabularies');
    }

    return response.json();
  },
};
