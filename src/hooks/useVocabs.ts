import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import type { VocabQueryParams } from '@/utils/api-config';
import { useEffect, useState } from 'react';
import { vocabApi } from '@/utils/client-api';

export const useVocabs = (queryParams?: VocabQueryParams) => {
  const [data, setData] = useState<{ items: TVocab[]; totalItems: number; totalPages: number; currentPage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await vocabApi.getAll(queryParams);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(queryParams)]);

  const mutate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await vocabApi.getAll(queryParams);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vocabs: data?.items || [],
    totalItems: data?.totalItems || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useVocab = (id: string | null) => {
  const [data, setData] = useState<TVocab | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await vocabApi.getById(id);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const mutate = async () => {
    if (!id) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await vocabApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vocab: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const vocabMutations = {
  create: async (vocabData: TCreateVocab) => {
    return await vocabApi.create(vocabData);
  },
  update: async (id: string, vocabData: Partial<TCreateVocab>) => {
    return await vocabApi.update(id, vocabData);
  },
  delete: async (id: string) => {
    return await vocabApi.delete(id);
  },
  createBulk: async (vocabData: TCreateVocab[]) => {
    return await vocabApi.createBulk(vocabData);
  },
  deleteBulk: async (ids: string[]) => {
    return await vocabApi.deleteBulk(ids);
  },
};
