'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { VocabFilters } from '@/hooks';
import type { TVocabSelectionFolderArray } from '@/types/vocab-selection';
import type { QuickFilter, VocabSelectionFormProps } from '@/types/vocab-trainer';
import type { TVocab } from '@/types/vocab-list';
import type { TLanguage } from '@/types/language';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Checkbox } from '@/shared/ui/checkbox';
import { DataTable } from '@/shared/ui/table';
import { useLocalPagination, useVocabSelection } from '@/hooks';
import { getRandomVocabsForSelection } from '@/actions';
import { cn } from '@/libs/utils';
import { folderMatchesScope, getLastTrainerScope, isAllScope, scopeParam, setLastTrainerScope } from '@/utils/trainer-scope';
import { getMasteryColors, getMasteryDisplay, getMasteryStatus } from '@/utils/vocab-mastery';
import VocabSelectionFilters from './VocabSelectionFilters';
import VocabSelectionScope from './VocabSelectionScope';

const EMPTY_CACHED_FOLDERS: TVocabSelectionFolderArray = [];
const EMPTY_SELECTED_VOCAB_BY_ID: Record<string, TVocab> = {};

function buildInitialFilters(editMode: boolean, languages: TLanguage[]): VocabFilters {
  if (editMode) {
    return { globalFilter: '', sourceLanguageCode: 'ALL', targetLanguageCode: 'ALL', languageFolderId: 'ALL' };
  }
  const lastScope = getLastTrainerScope();
  const validCodes = new Set(languages.map(l => l.code));
  const sourceLanguageCode = lastScope?.sourceLanguageCode && validCodes.has(lastScope.sourceLanguageCode)
    ? lastScope.sourceLanguageCode
    : 'ALL';
  const targetLanguageCode = lastScope?.targetLanguageCode && validCodes.has(lastScope.targetLanguageCode)
    ? lastScope.targetLanguageCode
    : 'ALL';
  return {
    globalFilter: '',
    sourceLanguageCode,
    targetLanguageCode,
    languageFolderId: 'ALL',
  };
}

const VocabSelectionForm: React.FC<VocabSelectionFormProps> = ({
  selectedIds,
  selectedVocabById = EMPTY_SELECTED_VOCAB_BY_ID,
  open = true,
  cachedLanguageFolders = EMPTY_CACHED_FOLDERS,
  onLanguageFoldersLoaded,
  initialLanguagesData,
  editMode = false,
}) => {
  const form = useFormContext();
  const languages = useMemo(() => initialLanguagesData?.items || [], [initialLanguagesData]);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [randomCount, setRandomCount] = useState<number>(10);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const localPagination = useLocalPagination({ page: 1, pageSize: 5, sortBy: 'updatedAt', sortOrder: 'desc' });

  const { pagination, handlers } = localPagination;

  const [filters, setFilters] = useState<VocabFilters>(() => buildInitialFilters(editMode, languages));
  // Edit mode starts scope at ALL/ALL until derived below; skip fetching with that
  // throwaway scope so we don't fire the query twice (once unscoped, once scoped).
  const [scopeReady, setScopeReady] = useState(() => !editMode || selectedIds.length === 0);

  const scopeDerivedRef = useRef(false);
  useEffect(() => {
    if (!editMode || scopeDerivedRef.current || selectedIds.length === 0) {
      return;
    }
    const vocabs = selectedIds.map(id => selectedVocabById[id]).filter((v): v is TVocab => Boolean(v));
    if (vocabs.length === 0) {
      // Wait for at least one selected vocab to hydrate. Do not require every id to
      // resolve — a deleted vocab would otherwise block derivation forever.
      return;
    }
    scopeDerivedRef.current = true;

    const counts = new Map<string, { sourceLanguageCode: string; targetLanguageCode: string; count: number }>();
    vocabs.forEach((v) => {
      const key = `${v.sourceLanguageCode}::${v.targetLanguageCode}`;
      const entry = counts.get(key);
      if (entry) {
        entry.count += 1;
      } else {
        counts.set(key, { sourceLanguageCode: v.sourceLanguageCode, targetLanguageCode: v.targetLanguageCode, count: 1 });
      }
    });

    let majority: { sourceLanguageCode: string; targetLanguageCode: string; count: number } | undefined;
    counts.forEach((entry) => {
      if (!majority || entry.count > majority.count) {
        majority = entry;
      }
    });

    if (majority) {
      setFilters(prev => ({ ...prev, sourceLanguageCode: majority!.sourceLanguageCode, targetLanguageCode: majority!.targetLanguageCode }));
    }
    setScopeReady(true);
  }, [editMode, selectedIds, selectedVocabById]);

  const { vocabs, languageFolders, totalItems, totalPages, currentPage, isLoading } = useVocabSelection({
    open: open && scopeReady,
    pagination,
    filters,
    quickFilter,
    cachedLanguageFolders,
    onLanguageFoldersLoaded,
  });

  const scopedLanguageFolders = useMemo(() => {
    if (isAllScope(filters.sourceLanguageCode, filters.targetLanguageCode)) {
      return languageFolders;
    }
    return languageFolders.filter(f => folderMatchesScope(f, filters.sourceLanguageCode, filters.targetLanguageCode));
  }, [languageFolders, filters.sourceLanguageCode, filters.targetLanguageCode]);

  const outOfScopeIds = useMemo(() => {
    if (isAllScope(filters.sourceLanguageCode, filters.targetLanguageCode)) {
      return [];
    }
    return selectedIds.filter((id) => {
      const vocab = selectedVocabById[id];
      if (!vocab) {
        return false;
      }
      const mismatchSource = filters.sourceLanguageCode !== 'ALL' && vocab.sourceLanguageCode !== filters.sourceLanguageCode;
      const mismatchTarget = filters.targetLanguageCode !== 'ALL' && vocab.targetLanguageCode !== filters.targetLanguageCode;
      return mismatchSource || mismatchTarget;
    });
  }, [selectedIds, selectedVocabById, filters.sourceLanguageCode, filters.targetLanguageCode]);

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

  const handleScopeChange = useCallback((sourceLanguageCode: string, targetLanguageCode: string) => {
    setFilters((prev) => {
      // languageFolders may still be [] while the folders fetch is in flight — don't
      // punish an in-flight load by resetting a folder that would otherwise be valid.
      const stillValidFolder = prev.languageFolderId === 'ALL' || languageFolders.length === 0 || languageFolders.some(f =>
        f.id === prev.languageFolderId && folderMatchesScope(f, sourceLanguageCode, targetLanguageCode));
      return {
        ...prev,
        sourceLanguageCode,
        targetLanguageCode,
        languageFolderId: stillValidFolder ? prev.languageFolderId : 'ALL',
      };
    });
    handlers.handlePageChange(1);
    if (!isAllScope(sourceLanguageCode, targetLanguageCode)) {
      setLastTrainerScope({ sourceLanguageCode, targetLanguageCode });
    }
  }, [handlers, languageFolders]);

  const handleRemoveOutOfScope = useCallback(() => {
    if (outOfScopeIds.length === 0) {
      return;
    }
    const outOfScopeSet = new Set(outOfScopeIds);
    const current = (form.getValues('vocabAssignmentIds') as string[]) || [];
    form.setValue('vocabAssignmentIds', current.filter(id => !outOfScopeSet.has(id)));
    form.clearErrors('vocabAssignmentIds');
  }, [outOfScopeIds, form]);

  const handleQuickFilter = useCallback((id: QuickFilter) => {
    setQuickFilter(id);
    handlers.handlePageChange(1);
  }, [handlers]);

  const handleRandomize = useCallback(async () => {
    if (isLoading || isRandomizing) {
      return;
    }
    setIsRandomizing(true);
    try {
      const result = await getRandomVocabsForSelection({
        count: randomCount,
        languageFolderId: scopeParam(filters.languageFolderId),
        sourceLanguageCode: scopeParam(filters.sourceLanguageCode),
        targetLanguageCode: scopeParam(filters.targetLanguageCode),
      });
      if (!Array.isArray(result)) {
        return;
      }
      form.setValue('vocabAssignmentIds', result.map(v => v.id));
      form.clearErrors('vocabAssignmentIds');
      handlers.handlePageChange(1);
    } finally {
      setIsRandomizing(false);
    }
  }, [filters.languageFolderId, filters.sourceLanguageCode, filters.targetLanguageCode, form, handlers, isLoading, isRandomizing, randomCount]);

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
      header: 'Text Source',
      cell: ({ row }) => (
        <span
          key={`${row.original.textSource}`}
          className="inline-flex max-w-32 min-w-0 shrink-0 items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:max-w-40 md:max-w-48"
          title={row.original.textSource}
        >
          <span className="block min-w-0 truncate">
            {row.original.textSource}
          </span>
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'textTargets',
      header: 'Text Targets',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.textTargets.map(t => (
            <span
              key={`${t.textTarget}-${row.original.id}`}
              className="inline-flex max-w-32 min-w-0 shrink-0 items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:max-w-40"
              title={t.textTarget}
            >
              <span className="block min-w-0 truncate">
                {t.textTarget}
              </span>
            </span>
          ))}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = getMasteryStatus(row.original.masteryScore);
        const { kind } = getMasteryDisplay(row.original.masteryScore);
        const colors = getMasteryColors(kind);
        return (
          <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', colors.pill)}>
            {status}
          </span>
        );
      },
      enableSorting: false,
    },
  ], [areAllOnPageSelected, form, handleToggleAllOnPage]);

  return (
    <div className="space-y-4">
      <VocabSelectionScope
        sourceLanguageCode={filters.sourceLanguageCode}
        targetLanguageCode={filters.targetLanguageCode}
        languages={languages}
        onScopeChange={handleScopeChange}
        outOfScopeCount={outOfScopeIds.length}
        onRemoveOutOfScope={handleRemoveOutOfScope}
      />

      <VocabSelectionFilters
        globalFilter={filters.globalFilter}
        onGlobalFilterChange={value => handleFilterChange('globalFilter', value)}
        languageFolderId={filters.languageFolderId}
        onLanguageFolderChange={value => handleFilterChange('languageFolderId', value)}
        languageFolders={scopedLanguageFolders}
        quickFilter={quickFilter}
        onQuickFilterChange={handleQuickFilter}
        randomCount={randomCount}
        onRandomCountChange={setRandomCount}
        onRandomize={handleRandomize}
        isRandomizeDisabled={isLoading || isRandomizing}
      />

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
                onPageSizeChange={handlers.handlePageSizeChange}
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
