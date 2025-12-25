import { useCallback, useState } from 'react';

export type LocalPaginationState = {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export type LocalPaginationHandlers = {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  handleSort: (columnId: string) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  resetPagination: () => void;
};

export const useLocalPagination = (defaults?: Partial<LocalPaginationState>) => {
  const defaultPage = defaults?.page || 1;
  const defaultPageSize = defaults?.pageSize || 10;
  const defaultSortBy = defaults?.sortBy || 'updatedAt';
  const defaultSortOrder = defaults?.sortOrder || 'desc';

  const [pagination, setPagination] = useState<LocalPaginationState>({
    page: defaultPage,
    pageSize: defaultPageSize,
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder,
  });

  const updatePagination = useCallback((updates: Partial<LocalPaginationState>) => {
    setPagination(prev => ({ ...prev, ...updates }));
  }, []);

  const setPage = useCallback((page: number) => {
    updatePagination({ page });
  }, [updatePagination]);

  const setPageSize = useCallback((pageSize: number) => {
    updatePagination({ pageSize, page: 1 });
  }, [updatePagination]);

  const setSortBy = useCallback((sortBy: string) => {
    updatePagination({ sortBy });
  }, [updatePagination]);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    updatePagination({ sortOrder });
  }, [updatePagination]);

  const handleSort = useCallback((columnId: string) => {
    if (pagination.sortBy === columnId) {
      updatePagination({
        sortOrder: pagination.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      updatePagination({
        sortBy: columnId,
        sortOrder: 'asc',
        page: 1,
      });
    }
  }, [pagination.sortBy, pagination.sortOrder, updatePagination]);

  const handlePageChange = useCallback((page: number) => {
    updatePagination({ page });
  }, [updatePagination]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    updatePagination({ pageSize, page: 1 });
  }, [updatePagination]);

  const resetPagination = useCallback(() => {
    setPagination({
      page: defaultPage,
      pageSize: defaultPageSize,
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder,
    });
  }, [defaultPage, defaultPageSize, defaultSortBy, defaultSortOrder]);

  const handlers: LocalPaginationHandlers = {
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
