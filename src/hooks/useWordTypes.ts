import type { TWordTypeResponse } from '@/types/word-type';
import { useEffect, useRef, useState } from 'react';
import { wordTypesApi } from '@/utils/client-api';

export const useWordTypes = (initialData?: TWordTypeResponse) => {
  const [data, setData] = useState<TWordTypeResponse | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<any>(null);
  const initialDataRef = useRef(initialData);
  const hasUsedInitialDataRef = useRef(false);

  useEffect(() => {
    // Skip fetch if we have initialData and this is the first render
    if (initialDataRef.current && !hasUsedInitialDataRef.current) {
      hasUsedInitialDataRef.current = true;
      return;
    }

    // If already used initialData, skip fetch
    if (hasUsedInitialDataRef.current && initialDataRef.current) {
      return;
    }

    // Fetch when no initialData
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await wordTypesApi.getAll();
        if (!cancelled) {
          setData(result);
          hasUsedInitialDataRef.current = true;
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
  }, []); // Only run once on mount

  const mutate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await wordTypesApi.getAll();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    wordTypes: data?.items || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useWordType = (id: string | null) => {
  const [data, setData] = useState<any>(undefined);
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
        const result = await wordTypesApi.getById(id);
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
      const result = await wordTypesApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    wordType: data,
    isLoading,
    isError: error,
    mutate,
  };
};
