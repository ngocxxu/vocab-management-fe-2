import type { ResponseAPI, TLanguage } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { languagesApi } from '@/utils/client-api';

export const useLanguages = (initialData?: ResponseAPI<TLanguage[]>) => {
  const [data, setData] = useState<ResponseAPI<TLanguage[]> | null>(initialData || null);
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
        const result = await languagesApi.getAll();
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
      const result = await languagesApi.getAll();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    languages: data?.items || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useLanguage = (id: string | null) => {
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
        const result = await languagesApi.getById(id);
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
      const result = await languagesApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    language: data,
    isLoading,
    isError: error,
    mutate,
  };
};
