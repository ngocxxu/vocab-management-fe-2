import useSWR from 'swr';
import { subjectsApi } from '@/utils/client-api';

// Hook for getting all subjects
export const useSubjects = () => {
  const { data, error, isLoading, mutate } = useSWR('subjects', () => subjectsApi.getAll());

  return {
    subjects: data?.items || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single subject by ID
export const useSubject = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['subject', id] : null,
    () => subjectsApi.getById(id!),
  );

  return {
    subject: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// API functions for mutations
export const subjectMutations = {
  // Create new subject
  create: async (subjectData: { name: string }) => {
    return await subjectsApi.create(subjectData);
  },

  // Update subject
  update: async (id: string, subjectData: { name: string; order: number }) => {
    return await subjectsApi.update(id, subjectData);
  },

  // Delete subject
  delete: async (id: string) => {
    return await subjectsApi.delete(id);
  },

  // Reorder subjects
  reorder: async (subjects: { id: string; order: number }[]) => {
    return await subjectsApi.reorder(subjects);
  },
};
