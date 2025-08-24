import useSWR from 'swr';
import axiosInstance from '@/libs/axios';
import { subjectsApi } from '@/utils/client-api';

// SWR fetcher function using axios
const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

// Hook for getting all subjects
export const useSubjects = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/subjects', fetcher);

  return {
    subjects: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for getting a single subject by ID
export const useSubject = (id: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/subjects/${id}` : null,
    fetcher,
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
  create: async (subjectData: { name: string; order: number }) => {
    const response = await subjectsApi.create(subjectData);
    return response;
  },

  // Update subject
  update: async (id: string, subjectData: { name: string; order: number }) => {
    const response = await subjectsApi.update(id, subjectData);
    return response;
  },

  // Delete subject
  delete: async (id: string) => {
    const response = await subjectsApi.delete(id);
    return response;
  },

  // Reorder subjects
  reorder: async (subjectIds: string[]) => {
    const response = await subjectsApi.reorder(subjectIds);
    return response;
  },
};
