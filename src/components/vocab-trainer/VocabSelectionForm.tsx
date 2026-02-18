'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { VocabFilters } from '@/hooks';
import type { TVocabSelectionFolderArray } from '@/types/vocab-selection';
import type { QuickFilter, VocabSelectionFormProps } from '@/types/vocab-trainer';
import type { TVocab } from '@/types/vocab-list';
import { Folder, Magnifer } from '@solar-icons/react/ssr';
import React, { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/table';
import { useApiPagination, useLocalPagination, useVocabSelection } from '@/hooks';
import { cn } from '@/libs/utils';
import { getMasteryLevel } from '@/utils/vocab-mastery';

const EMPTY_CACHED_FOLDERS: TVocabSelectionFolderArray = [];

const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: 'all', label: 'All Words' },
  { id: 'recent', label: 'Recently Added' },
  { id: 'difficult', label: 'Difficult' },
  { id: 'unlearned', label: 'Unlearned' },
];

const VocabSelectionForm: React.FC<VocabSelectionFormProps> = ({
  selectedIds,
  open = true,
  cachedLanguageFolders = EMPTY_CACHED_FOLDERS,
  onLanguageFoldersLoaded,
  editMode = false,
}) => {
  const form = useFormContext();
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const apiPagination = useApiPagination({ page: 1, pageSize: 5, sortBy: 'updatedAt', sortOrder: 'desc' });
  const localPagination = useLocalPagination({ page: 1, pageSize: 5, sortBy: 'updatedAt', sortOrder: 'desc' });

  const { pagination, handlers } = editMode ? localPagination : apiPagination;

  const [filters, setFilters] = useState<VocabFilters>({
    globalFilter: '',
    sourceLanguageCode: 'ALL',
    targetLanguageCode: 'ALL',
    languageFolderId: 'ALL',
  });

  const { vocabs, languageFolders, totalItems, totalPages, currentPage, isLoading } = useVocabSelection({
    open,
    pagination,
    filters,
    cachedLanguageFolders,
    onLanguageFoldersLoaded,
  });

  const data = useMemo<TVocab[]>(() => vocabs, [vocabs]);

  const handleToggleAllOnPage = useCallback((checked: boolean) => {
    const current = (form.getValues('vocabAssignmentIds') as string[]) || [];
    const pageIds = data.map(v => v.id);
    const newValue = checked
      ? Array.from(new Set([...current, ...pageIds]))
      : current.filter(id => !pageIds.includes(id));
    form.setValue('vocabAssignmentIds', newValue);
    form.clearErrors('vocabAssignmentIds');
  }, [data, form]);

  const areAllOnPageSelected = data.length > 0 && data.every(v => selectedIds.includes(v.id));

  const handleFilterChange = useCallback((key: keyof VocabFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    handlers.handlePageChange(1);
  }, [handlers]);

  const handleQuickFilter = useCallback((id: QuickFilter) => {
    setQuickFilter(id);
    handlers.handlePageChange(1);
  }, [handlers]);

  const columns = useMemo<ColumnDef<TVocab>[]>(() => [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={areAllOnPageSelected}
          onCheckedChange={value => handleToggleAllOnPage(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <FormField
          control={form.control}
          name="vocabAssignmentIds"
          render={({ field }) => (
            <FormItem className="m-0 flex items-center space-y-0">
              <FormControl>
                <Checkbox
                  checked={(field.value || []).includes(row.original.id)}
                  onCheckedChange={(checked) => {
                    const current: string[] = field.value || [];
                    const newValue = checked
                      ? Array.from(new Set([...current, row.original.id]))
                      : current.filter(id => id !== row.original.id);
                    field.onChange(newValue);
                    form.clearErrors('vocabAssignmentIds');
                  }}
                  aria-label="Select row"
                  className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                />
              </FormControl>
            </FormItem>
          )}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'textSource',
      header: 'SOURCE TERM',
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 dark:text-slate-100">{row.original.textSource}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'textTargets',
      header: 'TRANSLATIONS',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.textTargets.map((t, i) => (
            <span
              key={`${t.textTarget}-${row.original.id}-${i}`}
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                i === 0
                  ? 'text-slate-800 dark:text-slate-200'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
              )}
            >
              {t.textTarget}
            </span>
          ))}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'status',
      header: 'STATUS',
      cell: ({ row }) => {
        const status = getMasteryLevel(row.original.masteryScore);
        const statusClass = {
          New: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
          Learning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
          Mastered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
          Difficult: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
        }[status];
        return (
          <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', statusClass)}>
            {status}
          </span>
        );
      },
      enableSorting: false,
    },
  ], [areAllOnPageSelected, form, handleToggleAllOnPage]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Magnifer
            size={18}
            weight="BoldDuotone"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search across all folders..."
            value={filters.globalFilter}
            onChange={e => handleFilterChange('globalFilter', e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.languageFolderId}
          onValueChange={value => handleFilterChange('languageFolderId', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Folder size={16} weight="BoldDuotone" className="mr-2 shrink-0" />
            <span className="flex-1 text-left">
              Folder:
              {' '}
              <SelectValue placeholder="All" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            {languageFolders?.map(f => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Quick filters
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleQuickFilter(id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                quickFilter === id
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <FormField
        control={form.control}
        name="vocabAssignmentIds"
        render={() => (
          <FormItem>
            <FormLabel className="sr-only">Vocabularies</FormLabel>
            <FormControl>
              <DataTable<TVocab, unknown>
                columns={columns}
                data={data}
                searchPlaceholder="Search across all folders..."
                searchValue={filters.globalFilter}
                onSearchChangeAction={value => handleFilterChange('globalFilter', value)}
                showSearch={false}
                showPagination={true}
                pageSize={pagination.pageSize}
                manualPagination={true}
                manualSorting={true}
                manualFiltering={true}
                isLoading={isLoading}
                skeletonRowCount={pagination.pageSize}
                pageCount={totalPages}
                currentPage={currentPage}
                totalItems={totalItems}
                onPageChange={handlers.handlePageChange}
                onSortingChange={handlers.handleSort}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VocabSelectionForm;
