import type { EQuestionType } from '@/enum/vocab-trainer';
import type { TCreateVocabTrainer, TFormTestVocabTrainer, TQuestionAPI, TVocabTrainer } from '@/types/vocab-trainer';
import useSWR from 'swr';
import axiosInstance from '@/libs/axios';
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

// SWR fetcher function using axios
const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

// Hook for getting vocab trainers with query parameters
export const useVocabTrainers = (queryParams?: VocabTrainerQueryParams) => {
  const queryString = queryParams ? `?${new URLSearchParams(queryParams as Record<string, string>).toString()}` : '';
  const { data, error, isLoading, mutate } = useSWR(
    `/api/vocab-trainers${queryString}`,
    fetcher,
  );

  return {
    vocabTrainers: (data as TVocabTrainer[] | undefined) || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single vocab trainer by ID
export const useVocabTrainer = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/vocab-trainers/${id}` : null,
    fetcher,
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
    id ? `/api/vocab-trainers/${id}/exam` : null,
    fetcher,
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
    const response = await vocabTrainerApi.create(trainerData);
    return response;
  },

  // Delete vocab trainer
  delete: async (id: string) => {
    const response = await vocabTrainerApi.delete(id);
    return response;
  },

  // Bulk delete vocab trainers
  deleteBulk: async (ids: string[]) => {
    const response = await vocabTrainerApi.deleteBulk(ids);
    return response;
  },

  // Submit exam results
  submitExam: async (id: string, examData: TFormTestVocabTrainer) => {
    const response = await vocabTrainerApi.submitExam(id, examData);
    return response;
  },

  // Get exam questions for a trainer
  getExam: async (id: string) => {
    const response = await vocabTrainerApi.getExam(id);
    return response;
  },
};
