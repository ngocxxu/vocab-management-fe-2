'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TAdminLanguage, TAdminWordType, TBroadcastHistoryItem } from '@/types/admin';
import { useFormatter, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { BroadcastRowActions } from '../ui/BroadcastRowActions';
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

type TBroadcastColumnsOptions = {
  isPending: boolean;
  onToggle: (broadcast: TBroadcastHistoryItem) => void;
  onDelete: (broadcast: TBroadcastHistoryItem) => void;
};

const PRIORITY_LABEL_KEYS = {
  LOW: 'priority.low',
  MEDIUM: 'priority.medium',
  HIGH: 'priority.high',
} as const;

/** Columns for the broadcast history. Switching off and deleting are handed up to the page that owns the dialogs. */
export function useBroadcastColumns({ isPending, onToggle, onDelete }: TBroadcastColumnsOptions): ColumnDef<TBroadcastHistoryItem>[] {
  const t = useTranslations('admin.broadcasts');
  const format = useFormatter();

  return useMemo<ColumnDef<TBroadcastHistoryItem>[]>(() => [
    {
      id: 'message',
      accessorKey: 'message',
      header: t('history.columns.message'),
      enableSorting: false,
      cell: ({ row }) => <span className="line-clamp-2 max-w-md">{row.original.message}</span>,
    },
    {
      id: 'priority',
      header: t('history.columns.priority'),
      enableSorting: false,
      cell: ({ row }) => t(PRIORITY_LABEL_KEYS[row.original.priority]),
    },
    { id: 'recipientCount', accessorKey: 'recipientCount', header: t('history.columns.recipients'), enableSorting: false },
    {
      id: 'expiresAt',
      header: t('history.columns.expiresAt'),
      enableSorting: false,
      cell: ({ row }) => format.dateTime(new Date(row.original.expiresAt), { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      id: 'status',
      header: t('history.columns.status'),
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'outline'}>
          {t(row.original.isActive ? 'history.status.active' : 'history.status.inactive')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t('history.columns.actions'),
      enableSorting: false,
      cell: ({ row }) => <BroadcastRowActions broadcast={row.original} isPending={isPending} onToggle={onToggle} onDelete={onDelete} />,
    },
  ], [t, format, isPending, onToggle, onDelete]);
}
