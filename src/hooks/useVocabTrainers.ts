import type { EQuestionType } from '@/enum/vocab-trainer';
import type { TCreateVocabTrainer, TFormTestVocabTrainerUnion, TQuestionAPI, TVocabTrainer } from '@/types/vocab-trainer';
import useSWR from 'swr';
import { vocabTrainerApi } from '@/utils/client-api';

// Query parameters type for vocab trainers
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

// Hook for getting vocab trainers with query parameters
export const useVocabTrainers = (queryParams?: VocabTrainerQueryParams) => {
  const { data, error, isLoading, mutate } = useSWR(
    queryParams ? ['vocabTrainers', queryParams] : 'vocabTrainers',
    () => vocabTrainerApi.getAll(queryParams),
  );

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

// Hook for getting a single vocab trainer by ID
export const useVocabTrainer = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['vocabTrainer', id] : null,
    () => vocabTrainerApi.getById(id!),
  );

  return {
    vocabTrainer: data as TVocabTrainer | undefined,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting exam questions for a trainer
export const useVocabTrainerExam = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['vocabTrainerExam', id] : null,
    () => vocabTrainerApi.getExam(id!),
  );

  return {
    exam: data as TQuestionAPI | undefined,
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for mutations
export const vocabTrainerMutations = {
  // Create new vocab trainer
  create: async (trainerData: TCreateVocabTrainer) => {
    return await vocabTrainerApi.create(trainerData);
  },

  // Update vocab trainer
  update: async (id: string, trainerData: Partial<TCreateVocabTrainer>) => {
    return await vocabTrainerApi.update(id, trainerData);
  },

  // Delete vocab trainer
  delete: async (id: string) => {
    return await vocabTrainerApi.delete(id);
  },

  // Bulk delete vocab trainers
  deleteBulk: async (ids: string[]) => {
    return await vocabTrainerApi.deleteBulk(ids);
  },

  // Submit exam results
  submitExam: async (id: string, examData: TFormTestVocabTrainerUnion) => {
    return await vocabTrainerApi.submitExam(id, examData);
  },

  // Get exam questions for a trainer
  getExam: async (id: string) => {
    return await vocabTrainerApi.getExam(id);
  },
};
