'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  RowSelectionState,
  SortingState,
  Table as TanStackTable,
  Updater,
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
import {
  AltArrowDown,
  AltArrowLeft,
  AltArrowRight,
  AltArrowUp,
  RefreshCircle,
  SortVertical,
  TrashBin2,
} from '@solar-icons/react/ssr';
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './button';
import { Skeleton } from './skeleton';

const DEFAULT_EXPANDED_STATE = {};

type DataTableProps<TData extends { id: string }, TValue> = {
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
  onBulkReassign?: (ids: string[], emptyRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>) => void;
  splitToolbar?: boolean;
  filterTrigger?: React.ReactNode;
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

export function DataTable<TData extends { id: string }, TValue>({
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
  onBulkReassign,
  splitToolbar = false,
  filterTrigger,
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
}: Readonly<DataTableProps<TData, TValue>>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState(searchValue);

  React.useEffect(() => {
    setGlobalFilter(searchValue);
  }, [searchValue]);

  const memoizedColumns = useMemo(() => columns, [columns]);

  const handleSortingChange = React.useCallback((updaterOrValue: Updater<SortingState>) => {
    if (manualSorting && onSortingChange) {
      const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
      setSorting(newSorting);

      if (newSorting.length > 0 && newSorting[0]) {
        const firstSort = newSorting[0];
        onSortingChange(firstSort.id, firstSort.desc ? 'desc' : 'asc');
      }
    } else {
      setSorting(updaterOrValue);
    }
  }, [manualSorting, onSortingChange, sorting]);

  // Create table instance with all necessary features
  const table = useReactTable({
    data,
    columns: memoizedColumns,
    getRowId: (row): string => row.id,
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

  // Calculate total selected rows across all pages
  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedIds = useMemo(() => {
    return Object.keys(rowSelection).filter((id: string) => rowSelection[id as keyof typeof rowSelection]);
  }, [rowSelection]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      {showSearch && splitToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {filterTrigger}
            <input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={event => table.setGlobalFilter(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-input bg-background/80 px-4 py-2 text-foreground backdrop-blur-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none sm:w-64 sm:max-w-xs sm:flex-none"
            />
          </div>
          {selectedRowCount > 0 && (onBulkDelete || onBulkReassign) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {selectedRowCount}
                {' '}
                selected
              </span>
              {onBulkReassign && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/40 text-primary"
                  onClick={() => {
                    onBulkReassign(selectedIds, setRowSelection);
                  }}
                >
                  <RefreshCircle size={16} weight="BoldDuotone" className="mr-1.5" />
                  Bulk reassign
                </Button>
              )}
              {onBulkDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/60 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onBulkDelete(selectedIds, setRowSelection);
                  }}
                >
                  <TrashBin2 size={16} weight="BoldDuotone" className="mr-1.5" />
                  Bulk delete
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      {showSearch && !splitToolbar && (
        <div className="flex items-center justify-between">
          {onBulkDelete && selectedRowCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onBulkDelete(selectedIds, setRowSelection);
              }}
              className="flex items-center"
            >
              <TrashBin2 size={16} weight="BoldDuotone" />
              <span>
                Delete (
                {selectedRowCount}
                )
              </span>
            </Button>
          )}
          <div className={onBulkDelete && selectedRowCount > 0 ? '' : 'ml-auto'}>
            <input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={event => table.setGlobalFilter(event.target.value)}
              className="w-64 rounded-lg border border-input bg-background/80 px-4 py-2 text-foreground backdrop-blur-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden border-0 bg-card/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <div className="inline-block min-w-full align-middle sm:px-0">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className={`border-b border-border ${headerClassName}`}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={`${header.id}-${header.column.id}`}
                          className={`bg-muted/30 px-3 py-3 text-left text-xs font-semibold text-muted-foreground sm:px-6 sm:py-4 sm:text-sm ${headerClassName}`}
                          style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        >
                          {header.isPlaceholder
                            ? null
                            : (
                                <div
                                  className={`w-full cursor-pointer p-0 text-left font-semibold text-muted-foreground select-none ${
                                    header.column.getCanSort()
                                      ? 'hover:text-foreground'
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
                                        asc: <AltArrowUp size={16} weight="BoldDuotone" />,
                                        desc: <AltArrowDown size={16} weight="BoldDuotone" />,
                                      }[header.column.getIsSorted() as string] ?? <SortVertical size={16} weight="BoldDuotone" />}
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
                          <tr key={`skeleton-row-${idx}`} className={`border-b border-border ${rowClassName}`}>
                            <td className={`px-3 py-3 sm:px-6 sm:py-4 ${cellClassName}`} colSpan={memoizedColumns.length}>
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
                          <tr className={`border-b border-border ${rowClassName}`}>
                            <td className={`px-3 py-4 text-xs text-muted-foreground sm:px-6 sm:py-6 sm:text-sm ${cellClassName}`} colSpan={memoizedColumns.length}>
                              No results
                            </td>
                          </tr>
                        )
                      : (
                          table.getRowModel().rows.map((row) => {
                            const rowId = row.original.id;
                            const isExpanded = expandedState[rowId];
                            return (
                              <React.Fragment key={`${rowId}-${isExpanded ? 'expanded' : 'collapsed'}`}>
                                <tr
                                  className={`cursor-pointer border-b border-border transition-colors duration-200 hover:bg-muted/30 ${
                                    isExpanded ? 'bg-muted/30' : ''
                                  } ${rowClassName}`}
                                  onClick={(e) => {
                                    const target = e.target as HTMLElement;
                                    if (target.closest('input[type="checkbox"], button, [role="button"], [data-no-expand]')) {
                                      return;
                                    }

                                    if (onRowClick) {
                                      onRowClick(row.original);
                                      return;
                                    }

                                    if (renderExpandedRow && onExpandedChange) {
                                      onExpandedChange({
                                        ...expandedState,
                                        [rowId]: !expandedState[rowId],
                                      });
                                    }
                                  }}
                                >
                                  {row.getVisibleCells().map(cell => (
                                    <td key={`${cell.id}-${cell.column.id}`} className={`px-3 py-3 sm:px-6 sm:py-4 ${cellClassName}`}>
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                  ))}
                                </tr>
                                {renderExpandedRow && expandedState[row.original.id] && (
                                  renderExpandedRow(row)
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-xs text-muted-foreground sm:text-sm">
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
              className="flex items-center space-x-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <AltArrowLeft size={16} weight="BoldDuotone" />
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
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              {(manualPagination ? pageCount : table.getPageCount()) > 5 && (
                <span className="px-2 text-muted-foreground">...</span>
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
                  className="h-8 w-8 rounded-full p-0 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
              className="flex items-center space-x-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <span>Next</span>
              <AltArrowRight size={16} weight="BoldDuotone" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export table instance type for advanced usage
export type { TanStackTable };
