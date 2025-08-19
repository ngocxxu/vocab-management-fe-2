import useSWR from 'swr';

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

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
    const response = await fetch('/api/subjects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      throw new Error('Failed to create subject');
    }

    return response.json();
  },

  // Update subject
  update: async (id: string, subjectData: { name: string; order: number }) => {
    const response = await fetch(`/api/subjects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      throw new Error('Failed to update subject');
    }

    return response.json();
  },

  // Delete subject
  delete: async (id: string) => {
    const response = await fetch(`/api/subjects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete subject');
    }

    return response.json();
  },

  // Reorder subjects
  reorder: async (subjectIds: string[]) => {
    const response = await fetch('/api/subjects/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subjectIds),
    });

    if (!response.ok) {
      throw new Error('Failed to reorder subjects');
    }

    return response.json();
  },
};
