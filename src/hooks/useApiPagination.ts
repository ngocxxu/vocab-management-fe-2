import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

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

export const useApiPagination = (defaults?: Partial<PaginationState>) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultPage = defaults?.page || 1;
  const defaultPageSize = defaults?.pageSize || 10;
  const defaultSortBy = defaults?.sortBy || 'textSource';
  const defaultSortOrder = defaults?.sortOrder || 'asc';

  const pagination = useMemo<PaginationState>(() => ({
    page: Number(searchParams.get('page')) || defaultPage,
    pageSize: Number(searchParams.get('pageSize')) || defaultPageSize,
    sortBy: searchParams.get('sortBy') || defaultSortBy,
    sortOrder: (searchParams.get('sortOrder') || defaultSortOrder) as 'asc' | 'desc',
  }), [searchParams, defaultPage, defaultPageSize, defaultSortBy, defaultSortOrder]);

  const updateUrl = useCallback((updates: Partial<PaginationState>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.page !== undefined) {
      params.set('page', updates.page.toString());
    }
    if (updates.pageSize !== undefined) {
      params.set('pageSize', updates.pageSize.toString());
    }
    if (updates.sortBy !== undefined) {
      params.set('sortBy', updates.sortBy);
    }
    if (updates.sortOrder !== undefined) {
      params.set('sortOrder', updates.sortOrder);
    }

    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const setPage = useCallback((page: number) => {
    updateUrl({ page });
  }, [updateUrl]);

  const setPageSize = useCallback((pageSize: number) => {
    updateUrl({ pageSize, page: 1 });
  }, [updateUrl]);

  const setSortBy = useCallback((sortBy: string) => {
    updateUrl({ sortBy });
  }, [updateUrl]);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    updateUrl({ sortOrder });
  }, [updateUrl]);

  const handleSort = useCallback((columnId: string) => {
    if (pagination.sortBy === columnId) {
      updateUrl({
        sortOrder: pagination.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      updateUrl({
        sortBy: columnId,
        sortOrder: 'asc',
        page: 1,
      });
    }
  }, [pagination.sortBy, pagination.sortOrder, updateUrl]);

  const handlePageChange = useCallback((page: number) => {
    updateUrl({ page });
  }, [updateUrl]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    updateUrl({ pageSize, page: 1 });
  }, [updateUrl]);

  const resetPagination = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', defaultPage.toString());
    params.set('pageSize', defaultPageSize.toString());
    params.set('sortBy', defaultSortBy);
    params.set('sortOrder', defaultSortOrder);
    router.push(`?${params.toString()}`);
  }, [router, searchParams, defaultPage, defaultPageSize, defaultSortBy, defaultSortOrder]);

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
