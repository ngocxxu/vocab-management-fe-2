'use client';

import type { TBroadcastHistoryItem } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { ConfirmDeleteDialog } from '@/shared/ui/ConfirmDeleteDialog';
import { DataTable } from '@/shared/ui/table';
import { useAdminBroadcastActions } from '../hooks/useAdminBroadcastActions';
import { useBroadcastColumns } from '../hooks/useCatalogColumns';
import { useCatalogDialogs } from '../hooks/useCatalogDialogs';

type TBroadcastHistoryListProps = Readonly<{
  broadcasts: TBroadcastHistoryItem[];
}>;

/** Sent broadcasts with their recipient counts. Each can be switched off or deleted; expired ones can be cleared in one go. */
export function BroadcastHistoryList({ broadcasts }: TBroadcastHistoryListProps) {
  const t = useTranslations('admin.broadcasts');
  const { isPending, toggleBroadcast, deleteBroadcast, cleanupExpired } = useAdminBroadcastActions();
  const { deleteTarget, openDelete, closeDelete } = useCatalogDialogs<TBroadcastHistoryItem>();
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);
  const columns = useBroadcastColumns({ isPending, onToggle: toggleBroadcast, onDelete: openDelete });
  const closeCleanup = () => setIsCleanupOpen(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t('history.description')}</p>
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => setIsCleanupOpen(true)}>
          {t('history.cleanup')}
        </Button>
      </div>

      {broadcasts.length === 0
        ? <p className="text-sm text-muted-foreground">{t('history.empty')}</p>
        : <DataTable columns={columns} data={broadcasts} showSearch={false} showPagination={false} />}

      {deleteTarget && (
        <ConfirmDeleteDialog
          title={t('deleteDialog.title')}
          description={t('deleteDialog.description')}
          confirmLabel={t('deleteDialog.confirm')}
          cancelLabel={t('deleteDialog.cancel')}
          isPending={isPending}
          onClose={closeDelete}
          onConfirm={() => deleteBroadcast(deleteTarget, closeDelete)}
        />
      )}

      {isCleanupOpen && (
        <ConfirmDeleteDialog
          title={t('cleanupDialog.title')}
          description={t('cleanupDialog.description')}
          confirmLabel={t('cleanupDialog.confirm')}
          cancelLabel={t('cleanupDialog.cancel')}
          isPending={isPending}
          onClose={closeCleanup}
          onConfirm={() => cleanupExpired(closeCleanup)}
        />
      )}
    </div>
  );
}
