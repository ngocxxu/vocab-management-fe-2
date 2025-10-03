import { useCallback, useState } from 'react';

export type PaginationState = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export type PaginationHandlers = {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  handleSort: (columnId: string) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  resetPagination: () => void;
};

export const useApiPagination = (initialState?: Partial<PaginationState>) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    sortBy: 'textSource',
    sortOrder: 'asc',
    ...initialState,
  });

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setPagination(prev => ({ ...prev, sortBy }));
  }, []);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    setPagination(prev => ({ ...prev, sortOrder }));
  }, []);

  const handleSort = useCallback((columnId: string) => {
    setPagination((prev) => {
      if (prev.sortBy === columnId) {
        // Toggle sort order if same column
        return {
          ...prev,
          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
          page: 1, // Reset to first page when sorting changes
        };
      } else {
        // Set new column and default to ascending
        return {
          ...prev,
          sortBy: columnId,
          sortOrder: 'asc',
          page: 1, // Reset to first page when sorting changes
        };
      }
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      page: 1,
      pageSize: 10,
      sortBy: 'textSource',
      sortOrder: 'asc',
    });
  }, []);

  const handlers: PaginationHandlers = {
    setPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  };

  return {
    pagination,
    handlers,
  };
};
