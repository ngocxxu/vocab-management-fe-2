'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ResponseAPI, TLanguage } from '@/types';
import type { TVocab } from '@/types/vocab-list';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { getVocabsForSelection } from '@/actions';
import { getMyLanguageFoldersForSelection } from '@/actions/language-folders';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/table';
import { useApiPagination, useAuth } from '@/hooks';

type VocabSelectionFormProps = {
  selectedIds: string[];
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
};

type RowVocab = {
  id: string;
  textSource: string;
  textTargets: { textTarget: string }[];
  sourceLanguageCode: string;
  targetLanguageCode: string;
};

const VocabSelectionForm: React.FC<VocabSelectionFormProps> = ({ selectedIds, initialLanguagesData }) => {
  const form = useFormContext();
  const { user } = useAuth();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sourceLanguageCode, setSourceLanguageCode] = useState<string>('ALL');
  const [targetLanguageCode, setTargetLanguageCode] = useState<string>('ALL');
  const [languageFolderId, setLanguageFolderId] = useState<string>('ALL');
  const [vocabs, setVocabs] = useState<TVocab[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [languageFolders, setLanguageFolders] = useState<any[]>([]);

  // server-side pagination, 5 items per page
  const { pagination, handlers } = useApiPagination({ page: 1, pageSize: 5, sortBy: 'textSource', sortOrder: 'asc' });

  const languages = initialLanguagesData?.items || [];

  useEffect(() => {
    const fetchLanguageFolders = async () => {
      try {
        const result = await getMyLanguageFoldersForSelection({ page: 1, pageSize: 100 });
        if ('error' in result) {
          console.error('Failed to fetch language folders:', result.error);
          return;
        }
        setLanguageFolders(result.items || []);
      } catch (error) {
        console.error('Failed to fetch language folders:', error);
      }
    };
    fetchLanguageFolders();
  }, []);

  useEffect(() => {
    const fetchVocabs = async () => {
      setIsLoading(true);
      try {
        const result = await getVocabsForSelection({
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortBy: pagination.sortBy,
          sortOrder: pagination.sortOrder,
          textSource: globalFilter || undefined,
          sourceLanguageCode: sourceLanguageCode !== 'ALL' ? sourceLanguageCode : undefined,
          targetLanguageCode: targetLanguageCode !== 'ALL' ? targetLanguageCode : undefined,
          languageFolderId: languageFolderId !== 'ALL' ? languageFolderId : undefined,
          userId: user?.id,
        });
        if ('error' in result) {
          console.error('Failed to fetch vocabs:', result.error);
          return;
        }
        setVocabs(result.items || []);
        setTotalItems(result.totalItems || 0);
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.currentPage || 1);
      } catch (error) {
        console.error('Failed to fetch vocabs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVocabs();
  }, [pagination.page, pagination.pageSize, pagination.sortBy, pagination.sortOrder, globalFilter, sourceLanguageCode, targetLanguageCode, languageFolderId, user?.id]);

  const data = useMemo<RowVocab[]>(() => vocabs, [vocabs]);

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

  const columns = useMemo<ColumnDef<RowVocab>[]>(() => [
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
        <div className="font-medium text-slate-900 dark:text-slate-100">{row.original.textSource}</div>
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
              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-200"
            >
              {t.textTarget}
            </span>
          ))}
        </div>
      ),
      enableSorting: false,
    },
  ], [areAllOnPageSelected, form, handleToggleAllOnPage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Vocabularies</h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {selectedIds.length}
          {' '}
          selected
        </span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <FormLabel className="mb-1 block text-sm font-medium">Source Language</FormLabel>
          <Select
            value={sourceLanguageCode}
            onValueChange={(value) => {
              setSourceLanguageCode(value);
              handlers.handlePageChange(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {languages?.map((lng: any) => (
                <SelectItem key={lng.code} value={lng.code}>{lng.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FormLabel className="mb-1 block text-sm font-medium">Target Language</FormLabel>
          <Select
            value={targetLanguageCode}
            onValueChange={(value) => {
              setTargetLanguageCode(value);
              handlers.handlePageChange(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {languages?.map((lng: any) => (
                <SelectItem key={lng.code} value={lng.code}>{lng.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FormLabel className="mb-1 block text-sm font-medium">Language Folder</FormLabel>
          <Select
            value={languageFolderId}
            onValueChange={(value) => {
              setLanguageFolderId(value);
              handlers.handlePageChange(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {languageFolders?.map((f: any) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormField
        control={form.control}
        name="vocabAssignmentIds"
        render={() => (
          <FormItem>
            <FormLabel className="sr-only">Vocabularies</FormLabel>
            <FormControl>
              <DataTable<RowVocab, unknown>
                columns={columns}
                data={data}
                searchPlaceholder="Search vocab..."
                searchValue={globalFilter}
                onSearchChangeAction={setGlobalFilter}
                showSearch={true}
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
