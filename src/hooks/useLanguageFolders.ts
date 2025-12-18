import type { ResponseAPI, TLanguageFolder } from '@/types';
import type { LanguageFolderQueryParams } from '@/utils/api-config';
import { useEffect, useRef, useState } from 'react';
import { languageFoldersApi } from '@/utils/client-api';

export const useLanguageFolders = (
  params?: LanguageFolderQueryParams,
  initialData?: ResponseAPI<TLanguageFolder[]>,
) => {
  const [data, setData] = useState<ResponseAPI<TLanguageFolder[]> | null>(
    initialData || null,
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<any>(null);
  const initialParamsRef = useRef<string | null>(initialData ? JSON.stringify(params) : null);
  const hasUsedInitialDataRef = useRef(false);
  const initialDataRef = useRef(initialData); // Store initialData in ref to avoid re-fetch on re-render

  useEffect(() => {
    const currentParamsStr = JSON.stringify(params);

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
        const result = await languageFoldersApi.getMy(params);
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
  }, [JSON.stringify(params)]); // Only depend on params, not initialData

  const mutate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await languageFoldersApi.getMy(params);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const folders = data?.items || [];
  const totalItems = data?.totalItems ?? folders.length;
  const pageSize = params?.pageSize || 10;
  const totalPages = data?.totalPages ?? Math.ceil(totalItems / pageSize);
  const currentPage = data?.currentPage ?? params?.page ?? 1;

  return {
    languageFolders: folders,
    totalItems,
    totalPages,
    currentPage,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useLanguageFolder = (id: string | null) => {
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
        const result = await languageFoldersApi.getById(id);
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
      const result = await languageFoldersApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    languageFolder: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const languageFolderMutations = {
  create: async (languageFolderData: {
    name: string;
    folderColor: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
  }) => {
    return await languageFoldersApi.create(languageFolderData);
  },
  update: async (id: string, languageFolderData: {
    name: string;
    folderColor: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
  }) => {
    return await languageFoldersApi.update(id, languageFolderData);
  },
  delete: async (id: string) => {
    return await languageFoldersApi.delete(id);
  },
};
