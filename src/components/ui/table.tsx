'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
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
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './button';

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
  renderExpandedRow?: (row: any) => React.ReactNode;
  expandedState?: Record<string, boolean>;
  onExpandedChange?: (expanded: Record<string, boolean>) => void;
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
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState(searchValue);

  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

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
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      onSearchChangeAction?.(value);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
        <div className="flex justify-end">
          <input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={event => table.setGlobalFilter(event.target.value)}
            className="w-64 rounded-lg border border-slate-200 bg-white/80 px-4 py-2 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
          />
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
                        key={header.id + Math.random()}
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
                {table.getRowModel().rows.map(row => (
                  <React.Fragment key={row.id + Math.random()}>
                    <tr
                      className={`cursor-pointer border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-700/50 ${rowClassName}`}
                      onClick={(e) => {
                        // Don't expand if clicking on interactive elements
                        const target = e.target as HTMLElement;
                        if (target.closest('input[type="checkbox"], button, [role="button"], [data-no-expand]')) {
                          return;
                        }

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
                        <td key={cell.id + Math.random()} className={`px-6 py-4 ${cellClassName}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {renderExpandedRow && expandedState[(row.original as any).id] && (
                      renderExpandedRow(row)
                    )}
                  </React.Fragment>
                ))}
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
            {table.getFilteredRowModel().rows.length}
            {' '}
            of
            {' '}
            {data.length}
            {' '}
            results
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
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
              {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                const pageIndex = i + 1;
                return (
                  <Button
                    key={pageIndex + Math.random()}
                    onClick={() => table.setPageIndex(i)}
                    variant={table.getState().pagination.pageIndex === i ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-8 w-8 rounded-full p-0 text-sm font-medium transition-colors ${
                      table.getState().pagination.pageIndex === i
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {pageIndex}
                  </Button>
                );
              })}
              {table.getPageCount() > 5 && (
                <span className="px-2 text-slate-500 dark:text-slate-400">...</span>
              )}
              {table.getPageCount() > 5 && (
                <Button
                  key={table.getPageCount() + Math.random()}
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  {table.getPageCount()}
                </Button>
              )}
            </div>

            <Button
              key={table.getPageCount() + Math.random()}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
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
