'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TAdminLanguage, TAdminWordType } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { LanguageRowActions } from '../ui/LanguageRowActions';

type TLanguageColumnsOptions = {
  isPending: boolean;
  onRename: (language: TAdminLanguage) => void;
  onDelete: (language: TAdminLanguage) => void;
};

type TWordTypeColumnsOptions = {
  isPending: boolean;
  onEdit: (wordType: TAdminWordType) => void;
  onDelete: (wordType: TAdminWordType) => void;
};

/** Columns for the languages table. Rename and delete are handed up to the page that owns the dialogs. */
export function useLanguageColumns({ isPending, onRename, onDelete }: TLanguageColumnsOptions): ColumnDef<TAdminLanguage>[] {
  const t = useTranslations('admin.languages');

  return useMemo<ColumnDef<TAdminLanguage>[]>(() => [
    { id: 'name', accessorKey: 'name', header: t('columns.name'), enableSorting: false },
    { id: 'code', accessorKey: 'code', header: t('columns.code'), enableSorting: false },
    { id: 'vocabCount', accessorKey: 'vocabCount', header: t('columns.vocabs'), enableSorting: false },
    { id: 'folderCount', accessorKey: 'folderCount', header: t('columns.folders'), enableSorting: false },
    {
      id: 'actions',
      header: t('columns.actions'),
      enableSorting: false,
      cell: ({ row }) => (
        <LanguageRowActions
          language={row.original}
          isPending={isPending}
          onRename={() => onRename(row.original)}
          onDelete={() => onDelete(row.original)}
        />
      ),
    },
  ], [t, isPending, onRename, onDelete]);
}

/** Columns for the word types table. Edit and delete are handed up to the page that owns the dialogs. */
export function useWordTypeColumns({ isPending, onEdit, onDelete }: TWordTypeColumnsOptions): ColumnDef<TAdminWordType>[] {
  const t = useTranslations('admin.wordTypes');

  return useMemo<ColumnDef<TAdminWordType>[]>(() => [
    { id: 'name', accessorKey: 'name', header: t('columns.name'), enableSorting: false },
    { id: 'description', accessorKey: 'description', header: t('columns.description'), enableSorting: false },
    { id: 'textTargetCount', accessorKey: 'textTargetCount', header: t('columns.textTargets'), enableSorting: false },
    {
      id: 'actions',
      header: t('columns.actions'),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={isPending} onClick={() => onEdit(row.original)}>
            {t('edit')}
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={isPending} onClick={() => onDelete(row.original)}>
            {t('delete')}
          </Button>
        </div>
      ),
    },
  ], [t, isPending, onEdit, onDelete]);
}
