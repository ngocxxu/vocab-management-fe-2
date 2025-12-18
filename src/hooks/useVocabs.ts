import type { ResponseAPI } from '@/types';
import type { TVocab } from '@/types/vocab-list';
import type { VocabQueryParams } from '@/utils/api-config';
import { useEffect, useRef, useState } from 'react';
import { vocabApi } from '@/utils/client-api';

export const useVocabs = (
  queryParams?: VocabQueryParams,
  initialData?: ResponseAPI<TVocab[]>,
) => {
  const [data, setData] = useState<ResponseAPI<TVocab[]> | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<any>(null);
  const initialParamsRef = useRef<string | null>(initialData ? JSON.stringify(queryParams) : null);
  const hasUsedInitialDataRef = useRef(false);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    const currentParamsStr = JSON.stringify(queryParams);

    // Skip fetch if we have initialData and this is the first render with matching params
    if (initialDataRef.current && !hasUsedInitialDataRef.current && currentParamsStr === initialParamsRef.current) {
      hasUsedInitialDataRef.current = true;
      return;
    }

    // If params changed from initial params, fetch
    if (hasUsedInitialDataRef.current && currentParamsStr === initialParamsRef.current) {
      // Same params as initial, skip fetch
      return;
    }

    // Fetch when params changed or no initialData
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await vocabApi.getAll(queryParams);
        if (!cancelled) {
          setData(result);
          hasUsedInitialDataRef.current = true;
          initialParamsRef.current = currentParamsStr;
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
