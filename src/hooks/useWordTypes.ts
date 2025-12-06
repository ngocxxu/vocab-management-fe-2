import { useEffect, useState } from 'react';
import { wordTypesApi } from '@/utils/client-api';

export const useWordTypes = () => {
  const [data, setData] = useState<{ items: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await wordTypesApi.getAll();
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
  }, []);

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

export const wordTypeMutations = {
  create: async (wordTypeData: { name: string; description: string }) => {
    return await wordTypesApi.create(wordTypeData);
  },
  update: async (id: string, wordTypeData: { name: string; description: string }) => {
    return await wordTypesApi.update(id, wordTypeData);
  },
  delete: async (id: string) => {
    return await wordTypesApi.delete(id);
  },
};
