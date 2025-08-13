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
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './button';

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
                        key={header.id}
                        className={`bg-slate-50/50 px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 ${headerClassName}`}
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-700/50 ${rowClassName}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={`px-6 py-4 ${cellClassName}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
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

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700/80"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                const pageIndex = i + 1;
                return (
                  <Button
                    key={pageIndex}
                    onClick={() => table.setPageIndex(i)}
                    className={`h-8 w-8 rounded-lg p-0 text-sm transition-colors ${
                      table.getState().pagination.pageIndex === i
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    {pageIndex}
                  </Button>
                );
              })}
              {table.getPageCount() > 5 && (
                <span className="px-2 text-slate-500">...</span>
              )}
            </div>

            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700/80"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export table instance type for advanced usage
export type { TanStackTable };
