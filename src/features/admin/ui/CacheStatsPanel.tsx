'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TCacheRow } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { ConfirmDeleteDialog } from '@/shared/ui/ConfirmDeleteDialog';
import { DataTable } from '@/shared/ui/table';
import { useAdminSystemActions } from '../hooks/useAdminSystemActions';

type TCacheStatsPanelProps = Readonly<{
  rows: TCacheRow[];
}>;

// DataTable needs a row id. The prefix is unique, so it serves as the id here and the mapper's rows stay as they are.
type TCacheTableRow = TCacheRow & { id: string };

function useCacheColumns(): ColumnDef<TCacheTableRow>[] {
  const t = useTranslations('admin.system.cache');

  return useMemo<ColumnDef<TCacheTableRow>[]>(() => [
    {
      id: 'prefix',
      accessorKey: 'prefix',
      header: t('prefix'),
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono">{row.original.prefix}</span>,
    },
    {
      id: 'count',
      accessorKey: 'count',
      header: t('count'),
      enableSorting: false,
      cell: ({ row }) => <span className="tabular-nums">{row.original.count}</span>,
    },
  ], [t]);
}

/** Key counts per Redis prefix, and the one control that clears them. The page offers no whole-database flush. */
export function CacheStatsPanel({ rows }: TCacheStatsPanelProps) {
  const t = useTranslations('admin.system.cache');
  const columns = useCacheColumns();
  const tableRows = useMemo<TCacheTableRow[]>(() => rows.map(row => ({ ...row, id: row.prefix })), [rows]);
  const { isPending, clearCaches } = useAdminSystemActions();
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {rows.length === 0
        ? <p className="text-sm text-muted-foreground">{t('empty')}</p>
        : <DataTable columns={columns} data={tableRows} showSearch={false} showPagination={false} />}

      <Button variant="outline" className="w-fit" disabled={isPending} onClick={() => setIsConfirming(true)}>
        {t('clear')}
      </Button>

      {isConfirming && (
        <ConfirmDeleteDialog
          title={t('confirm.title')}
          description={t('confirm.description')}
          confirmLabel={t('confirm.confirm')}
          cancelLabel={t('confirm.cancel')}
          isPending={isPending}
          onClose={() => setIsConfirming(false)}
          onConfirm={() => clearCaches(() => setIsConfirming(false))}
        />
      )}
    </div>
  );
}
