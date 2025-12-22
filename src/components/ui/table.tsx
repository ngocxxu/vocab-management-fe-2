'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  RowSelectionState,
  SortingState,
  Table as TanStackTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Trash } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './button';
import { Skeleton } from './skeleton';

const DEFAULT_EXPANDED_STATE = {};

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChangeAction?: (value: string) => void;
  showSearch?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  expandedState?: Record<string, boolean>;
  onExpandedChange?: (expanded: Record<string, boolean>) => void;
  onRowClick?: (row: TData) => void;
  onBulkDelete?: (ids: string[], emptyRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>) => void;
  // Server-side pagination & sorting
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  pageCount?: number;
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onSortingChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  // Loading state to render skeleton rows inside the table
  isLoading?: boolean;
  skeletonRowCount?: number;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChangeAction,
  showSearch = true,
  showPagination = true,
  pageSize = 10,
  className = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  renderExpandedRow,
  expandedState = DEFAULT_EXPANDED_STATE,
  onExpandedChange,
  onRowClick,
  onBulkDelete,
  // Server-side props
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  pageCount = -1,
  currentPage = 1,
  totalItems = 0,
  onPageChange,
  onSortingChange,
  isLoading = false,
  skeletonRowCount,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState(searchValue);

  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Handle sorting change for server-side sorting
  const handleSortingChange = React.useCallback((updaterOrValue: any) => {
    if (manualSorting && onSortingChange) {
      const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
      setSorting(newSorting);

      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        onSortingChange(id, desc ? 'desc' : 'asc');
      }
    } else {
      setSorting(updaterOrValue);
    }
  }, [manualSorting, onSortingChange, sorting]);

  // Create table instance with all necessary features
  const table = useReactTable({
    data,
    columns: memoizedColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: currentPage - 1, // TanStack uses 0-based index
        pageSize,
      },
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      onSearchChangeAction?.(value);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    manualSorting,
    manualFiltering: true,
    pageCount: manualPagination ? pageCount : undefined,
    // Enable global filtering
    globalFilterFn: 'includesString',
    // Enable column filtering
    enableColumnFilters: true,
    // Enable global filtering
    enableGlobalFilter: true,
    // Enable row selection
    enableRowSelection: true,
    // Enable sorting
    enableSorting: true,
    // Set initial page size
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      {showSearch && (
        <div className="flex items-center justify-between">
          {onBulkDelete && table.getSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const selectedIds = table.getSelectedRowModel().rows.map(row => (row.original as any).id);
                onBulkDelete(selectedIds, setRowSelection);
              }}
              className="flex items-center"
            >
              <Trash className="h-4 w-4" />
              <span>
                Delete (
                {table.getSelectedRowModel().rows.length}
                )
              </span>
            </Button>
          )}
          <div className={onBulkDelete && table.getSelectedRowModel().rows.length > 0 ? '' : 'ml-auto'}>
            <input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={event => table.setGlobalFilter(event.target.value)}
              className="w-64 rounded-lg border border-slate-200 bg-white/80 px-4 py-2 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden border-0 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm dark:bg-slate-800/80">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className={`border-b border-slate-200 dark:border-slate-700 ${headerClassName}`}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={`${header.id}-${header.column.id}`}
                        className={`bg-slate-50/50 px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 ${headerClassName}`}
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      >
                        {header.isPlaceholder
                          ? null
                          : (
                              <div
                                className={`w-full cursor-pointer p-0 text-left font-semibold text-slate-700 select-none dark:text-slate-300 ${
                                  header.column.getCanSort()
                                    ? 'hover:text-slate-900 dark:hover:text-slate-100'
                                    : 'cursor-default'
                                }`}
                                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    const handler = header.column.getToggleSortingHandler();
                                    if (handler) {
                                      handler(e);
                                    }
                                  }
                                }}
                                role={header.column.getCanSort() ? 'button' : undefined}
                                tabIndex={header.column.getCanSort() ? 0 : undefined}
                                title={
                                  header.column.getCanSort()
                                    ? header.column.getNextSortingOrder() === 'asc'
                                      ? 'Sort ascending'
                                      : header.column.getNextSortingOrder() === 'desc'
                                        ? 'Sort descending'
                                        : 'Clear sort'
                                    : undefined
                                }
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getCanSort() && (
                                  <span className="ml-2 inline-block">
                                    {{
                                      asc: <ArrowUp className="h-4 w-4" />,
                                      desc: <ArrowDown className="h-4 w-4" />,
                                    }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="h-4 w-4" />}
                                  </span>
                                )}
                              </div>
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading
                  ? (
                      Array.from({ length: skeletonRowCount ?? pageSize }).map((_, idx) => (
                        <tr key={`skeleton-row-${idx}`} className={`border-b border-slate-100 dark:border-slate-700 ${rowClassName}`}>
                          <td className={`px-6 py-4 ${cellClassName}`} colSpan={memoizedColumns.length}>
                            <div className="flex items-center gap-4">
                              <Skeleton className="h-5 w-5" />
                              <Skeleton className="h-5 w-1/3" />
                              <Skeleton className="h-5 w-1/2" />
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  : table.getRowModel().rows.length === 0
                    ? (
                        <tr className={`border-b border-slate-100 dark:border-slate-700 ${rowClassName}`}>
                          <td className={`px-6 py-6 text-sm text-slate-500 dark:text-slate-400 ${cellClassName}`} colSpan={memoizedColumns.length}>
                            No results
                          </td>
                        </tr>
                      )
                    : (
                        table.getRowModel().rows.map((row) => {
                          const rowId = (row.original as any).id;
                          const isExpanded = expandedState[rowId];
                          return (
                            <React.Fragment key={`${rowId}-${isExpanded ? 'expanded' : 'collapsed'}`}>
                              <tr
                                className={`cursor-pointer border-b border-slate-100 transition-colors duration-200 hover:bg-slate-200/50 dark:border-slate-700 dark:hover:bg-slate-700/50 ${
                                  isExpanded ? 'bg-slate-200/50 dark:bg-slate-700/50' : ''
                                } ${rowClassName}`}
                                onClick={(e) => {
                                // Don't expand if clicking on interactive elements
                                  const target = e.target as HTMLElement;
                                  if (target.closest('input[type="checkbox"], button, [role="button"], [data-no-expand]')) {
                                    return;
                                  }

                                  // Handle row click for navigation
                                  if (onRowClick) {
                                    onRowClick(row.original);
                                    return;
                                  }

                                  // Handle expand/collapse if no row click handler
                                  if (renderExpandedRow && onExpandedChange) {
                                    const rowId = (row.original as any).id;
                                    onExpandedChange({
                                      ...expandedState,
                                      [rowId]: !expandedState[rowId],
                                    });
                                  }
                                }}
                              >
                                {row.getVisibleCells().map(cell => (
                                  <td key={`${cell.id}-${cell.column.id}`} className={`px-6 py-4 ${cellClassName}`}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                ))}
                              </tr>
                              {renderExpandedRow && expandedState[(row.original as any).id] && (
                                renderExpandedRow(row)
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing
            {' '}
            {manualPagination ? data.length : table.getFilteredRowModel().rows.length}
            {' '}
            of
            {' '}
            {manualPagination ? totalItems : data.length}
            {' '}
            results
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => {
                if (manualPagination && onPageChange) {
                  onPageChange(currentPage - 1);
                } else {
                  table.previousPage();
                }
              }}
              disabled={manualPagination ? currentPage <= 1 : !table.getCanPreviousPage()}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, manualPagination ? pageCount : table.getPageCount()) }, (_, i) => {
                const pageNumber = i + 1;
                const isActive = manualPagination ? currentPage === pageNumber : table.getState().pagination.pageIndex === i;
                return (
                  <Button
                    key={`${pageNumber}-${i}`}
                    onClick={() => {
                      if (manualPagination && onPageChange) {
                        onPageChange(pageNumber);
                      } else {
                        table.setPageIndex(i);
                      }
                    }}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-8 w-8 rounded-full p-0 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              {(manualPagination ? pageCount : table.getPageCount()) > 5 && (
                <span className="px-2 text-slate-500 dark:text-slate-400">...</span>
              )}
              {(manualPagination ? pageCount : table.getPageCount()) > 5 && (
                <Button
                  key={`${manualPagination ? pageCount : table.getPageCount()}-last`}
                  onClick={() => {
                    if (manualPagination && onPageChange) {
                      onPageChange(pageCount);
                    } else {
                      table.setPageIndex(table.getPageCount() - 1);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  {manualPagination ? pageCount : table.getPageCount()}
                </Button>
              )}
            </div>

            <Button
              key={`${manualPagination ? pageCount : table.getPageCount()}-next`}
              onClick={() => {
                if (manualPagination && onPageChange) {
                  onPageChange(currentPage + 1);
                } else {
                  table.nextPage();
                }
              }}
              disabled={manualPagination ? currentPage >= pageCount : !table.getCanNextPage()}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <span>Next</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export table instance type for advanced usage
export type { TanStackTable };
