'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingState,
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
  CloseCircle,
  Magnifer,
  RefreshCircle,
  SortVertical,
  TrashBin2,
} from '@solar-icons/react/ssr';
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { PAGE_SIZE_OPTIONS } from '@/constants/pagination';
import { Button } from './button';
import { Skeleton } from './skeleton';

const DEFAULT_EXPANDED_STATE = {};
const DEFAULT_VISIBLE_PAGE_COUNT = 5;
const EXPANDED_VISIBLE_PAGE_COUNT = 9;
const EXPANDED_WINDOW_TRIGGER_PAGE = 5;

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= DEFAULT_VISIBLE_PAGE_COUNT) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage < EXPANDED_WINDOW_TRIGGER_PAGE) {
    return Array.from({ length: DEFAULT_VISIBLE_PAGE_COUNT }, (_, index) => index + 1);
  }

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const halfWindow = Math.floor(EXPANDED_VISIBLE_PAGE_COUNT / 2);
  const visibleCount = Math.min(EXPANDED_VISIBLE_PAGE_COUNT, totalPages);
  const maxStartPage = totalPages - visibleCount + 1;
  const startPage = Math.min(Math.max(safeCurrentPage - halfWindow, 1), maxStartPage);

  return Array.from({ length: visibleCount }, (_, index) => startPage + index);
}

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
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  // Loading state to render skeleton rows inside the table
  isLoading?: boolean;
  skeletonRowCount?: number;
  enableColumnResizing?: boolean;
  // Unique id for this table instance — when provided, column widths persist to localStorage
  tableId?: string;
  // Controlled column visibility — when provided, DataTable uses these instead of internal state
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (vis: VisibilityState) => void;
};

const COLUMN_SIZING_STORAGE_PREFIX = 'data-table:column-sizing:';
const DEFAULT_COLUMN_MIN_SIZE = 60;
const DEFAULT_COLUMN_MAX_SIZE = 600;

function readStoredColumnSizing(tableId: string | undefined): ColumnSizingState {
  if (!tableId || typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(`${COLUMN_SIZING_STORAGE_PREFIX}${tableId}`);
    return raw ? JSON.parse(raw) as ColumnSizingState : {};
  } catch {
    return {};
  }
}

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
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS as unknown as number[],
  isLoading = false,
  skeletonRowCount,
  enableColumnResizing = false,
  tableId,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange: onControlledColumnVisibilityChange,
}: Readonly<DataTableProps<TData, TValue>>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({});

  // Use controlled visibility when provided, otherwise fall back to internal state
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility;
  const setColumnVisibility = (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
    const next = typeof updater === 'function' ? updater(columnVisibility) : updater;
    if (onControlledColumnVisibilityChange) {
      onControlledColumnVisibilityChange(next);
    } else {
      setInternalColumnVisibility(next);
    }
  };
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState(searchValue);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => readStoredColumnSizing(tableId));

  React.useEffect(() => {
    setGlobalFilter(searchValue);
  }, [searchValue]);

  React.useEffect(() => {
    if (!tableId || typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(`${COLUMN_SIZING_STORAGE_PREFIX}${tableId}`, JSON.stringify(columnSizing));
  }, [tableId, columnSizing]);

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
    columnResizeMode: enableColumnResizing ? 'onChange' : undefined,
    defaultColumn: {
      minSize: DEFAULT_COLUMN_MIN_SIZE,
      maxSize: DEFAULT_COLUMN_MAX_SIZE,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnSizing,
      pagination: {
        pageIndex: currentPage - 1, // TanStack uses 0-based index
        pageSize,
      },
    },
    onColumnSizingChange: setColumnSizing,
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

  const isResizingColumn = table.getState().columnSizingInfo.isResizingColumn;
  React.useEffect(() => {
    if (!isResizingColumn || typeof document === 'undefined') {
      return;
    }
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = 'col-resize';
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [isResizingColumn]);

  // Calculate total selected rows across all pages
  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedIds = useMemo(() => {
    return Object.keys(rowSelection).filter((id: string) => rowSelection[id as keyof typeof rowSelection]);
  }, [rowSelection]);
  const totalPages = manualPagination ? pageCount : table.getPageCount();
  const visiblePageNumbers = useMemo(() => {
    return getVisiblePageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table */}
      <Card className="overflow-hidden border-0 bg-card/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-sm">
        {/* Search bar inside card, above table headers */}
        {showSearch && (
          <div className="border-b border-border px-4 py-3 pt-0 sm:px-6">
            {splitToolbar
              ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      {filterTrigger}
                      <div className="relative min-w-0 flex-1 sm:max-w-xs sm:flex-none">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                          <Magnifer size={16} weight="BoldDuotone" className="text-muted-foreground" />
                        </span>
                        <input
                          placeholder={searchPlaceholder}
                          value={globalFilter ?? ''}
                          onChange={event => table.setGlobalFilter(event.target.value)}
                          className="w-full rounded-full border-0 bg-muted/60 py-2.5 pr-8 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                        />
                        {globalFilter && (
                          <button
                            type="button"
                            onClick={() => table.setGlobalFilter('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          >
                            <CloseCircle size={16} weight="BoldDuotone" />
                          </button>
                        )}
                      </div>
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
                )
              : (
                  <div className="flex items-center justify-between gap-3">
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
                    <div className={`relative ${onBulkDelete && selectedRowCount > 0 ? 'flex-1' : 'w-full max-w-sm'}`}>
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Magnifer size={16} weight="BoldDuotone" className="text-muted-foreground" />
                      </span>
                      <input
                        placeholder={searchPlaceholder}
                        value={globalFilter ?? ''}
                        onChange={event => table.setGlobalFilter(event.target.value)}
                        className="w-full rounded-full border-0 bg-muted/60 py-2.5 pr-8 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                      />
                      {globalFilter && (
                        <button
                          type="button"
                          onClick={() => table.setGlobalFilter('')}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        >
                          <CloseCircle size={16} weight="BoldDuotone" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
          </div>
        )}
        <CardContent className="p-0">
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <div className="inline-block min-w-full align-middle sm:px-0">
              <table
                style={enableColumnResizing ? { width: table.getTotalSize(), minWidth: '100%', tableLayout: 'fixed' } : undefined}
                className={enableColumnResizing ? '' : 'w-full'}
              >
                {enableColumnResizing && (
                  <colgroup>
                    {table.getVisibleLeafColumns().map(column => (
                      <col key={column.id} style={{ width: column.getSize() }} />
                    ))}
                  </colgroup>
                )}
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className={`border-b border-border ${headerClassName}`}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={`${header.id}-${header.column.id}`}
                          className={`relative bg-muted/30 px-3 py-3 text-left text-xs font-semibold text-muted-foreground sm:px-6 sm:py-4 sm:text-sm ${headerClassName}`}
                          style={{ width: enableColumnResizing ? header.getSize() : (header.getSize() !== 150 ? header.getSize() : undefined) }}
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
                          {enableColumnResizing && header.column.getCanResize() && (
                            <div
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                header.getResizeHandler()(e);
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                header.getResizeHandler()(e);
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                header.column.resetSize();
                              }}
                              style={{ touchAction: 'none' }}
                              className="group absolute top-0 right-0 flex h-full w-3 cursor-col-resize items-center justify-center select-none"
                              title="Drag to resize, double-click to reset"
                              aria-hidden="true"
                            >
                              <div
                                className={`h-4 w-0.5 rounded-full transition-all ${
                                  header.column.getIsResizing()
                                    ? 'h-full w-1 bg-primary'
                                    : 'bg-border group-hover:h-full group-hover:w-1 group-hover:bg-primary/60'
                                }`}
                              />
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
          <div className="flex items-center gap-3">
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
            {onPageSizeChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={v => onPageSizeChange(Number(v))}
                >
                  <SelectTrigger className="h-7 w-[70px] border-border bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map(size => (
                      <SelectItem key={size} value={String(size)} className="text-xs">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              {visiblePageNumbers.map((pageNumber) => {
                const isActive = manualPagination
                  ? currentPage === pageNumber
                  : table.getState().pagination.pageIndex === pageNumber - 1;
                return (
                  <Button
                    key={pageNumber}
                    onClick={() => {
                      if (manualPagination && onPageChange) {
                        onPageChange(pageNumber);
                      } else {
                        table.setPageIndex(pageNumber - 1);
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
              {totalPages > visiblePageNumbers.at(-1)! && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              {totalPages > visiblePageNumbers.at(-1)! && (
                <Button
                  key={`${totalPages}-last`}
                  onClick={() => {
                    if (manualPagination && onPageChange) {
                      onPageChange(pageCount);
                    } else {
                      table.setPageIndex(totalPages - 1);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {totalPages}
                </Button>
              )}
            </div>

            <Button
              key={`${totalPages}-next`}
              onClick={() => {
                if (manualPagination && onPageChange) {
                  onPageChange(currentPage + 1);
                } else {
                  table.nextPage();
                }
              }}
              disabled={manualPagination ? currentPage >= totalPages : !table.getCanNextPage()}
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
