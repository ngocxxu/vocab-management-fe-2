import type { EQuestionType } from '@/enum/vocab-trainer';
import type { TCreateVocabTrainer, TFormTestVocabTrainerUnion, TQuestionAPI, TVocabTrainer } from '@/types/vocab-trainer';
import { useEffect, useState } from 'react';
import { vocabTrainerApi } from '@/utils/client-api';

export type VocabTrainerQueryParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  name?: string;
  status?: string | string[];
  questionType?: EQuestionType;
  userId?: string;
};

export const useVocabTrainers = (queryParams?: VocabTrainerQueryParams) => {
  const [data, setData] = useState<{ items: TVocabTrainer[]; totalItems: number; totalPages: number; currentPage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await vocabTrainerApi.getAll(queryParams);
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
      const result = await vocabTrainerApi.getAll(queryParams);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vocabTrainers: (data?.items || []) as TVocabTrainer[],
    totalItems: data?.totalItems || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useVocabTrainer = (id: string | null) => {
  const [data, setData] = useState<TVocabTrainer | undefined>(undefined);
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
        const result = await vocabTrainerApi.getById(id);
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
      const result = await vocabTrainerApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vocabTrainer: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useVocabTrainerExam = (id: string | null) => {
  const [data, setData] = useState<TQuestionAPI | undefined>(undefined);
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
        const result = await vocabTrainerApi.getExam(id);
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
      const result = await vocabTrainerApi.getExam(id);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exam: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const vocabTrainerMutations = {
  create: async (trainerData: TCreateVocabTrainer) => {
    return await vocabTrainerApi.create(trainerData);
  },
  update: async (id: string, trainerData: Partial<TCreateVocabTrainer>) => {
    return await vocabTrainerApi.update(id, trainerData);
  },
  delete: async (id: string) => {
    return await vocabTrainerApi.delete(id);
  },
  deleteBulk: async (ids: string[]) => {
    return await vocabTrainerApi.deleteBulk(ids);
  },
  submitExam: async (id: string, examData: TFormTestVocabTrainerUnion) => {
    return await vocabTrainerApi.submitExam(id, examData);
  },
  getExam: async (id: string) => {
    return await vocabTrainerApi.getExam(id);
  },
};
