import useSWR from 'swr';
import axiosInstance from '@/libs/axios';

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
    const response = await axiosInstance.post('/api/subjects', subjectData);
    return response.data;
  },

  // Update subject
  update: async (id: string, subjectData: { name: string; order: number }) => {
    const response = await axiosInstance.put(`/api/subjects/${id}`, subjectData);
    return response.data;
  },

  // Delete subject
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/api/subjects/${id}`);
    return response.data;
  },

  // Reorder subjects
  reorder: async (subjectIds: string[]) => {
    const response = await axiosInstance.post('/api/subjects/reorder', subjectIds);
    return response.data;
  },
};
