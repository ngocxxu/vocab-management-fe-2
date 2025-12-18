import type { TSubjectResponse } from '@/types/subject';
import { useEffect, useRef, useState } from 'react';
import { subjectsApi } from '@/utils/client-api';

export const useSubjects = (initialData?: TSubjectResponse) => {
  const [data, setData] = useState<TSubjectResponse | null>(initialData || null);
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
        const result = await subjectsApi.getAll();
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
      const result = await subjectsApi.getAll();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subjects: data?.items || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useSubject = (id: string | null) => {
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
        const result = await subjectsApi.getById(id);
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
      const result = await subjectsApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subject: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const subjectMutations = {
  create: async (subjectData: { name: string }) => {
    return await subjectsApi.create(subjectData);
  },
  update: async (id: string, subjectData: { name: string; order: number }) => {
    return await subjectsApi.update(id, subjectData);
  },
  delete: async (id: string) => {
    return await subjectsApi.delete(id);
  },
  reorder: async (subjects: { id: string; order: number }[]) => {
    return await subjectsApi.reorder(subjects);
  },
};
