'use client';

import type { TAdminWordType, TAdminWordTypeInput } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { ConfirmDeleteDialog } from '@/shared/ui/ConfirmDeleteDialog';
import { DataTable } from '@/shared/ui/table';
import { useCatalogDialogs } from '../hooks/useCatalogDialogs';
import { useWordTypeColumns } from '../hooks/useCatalogColumns';
import { useAdminWordTypeActions } from '../hooks/useAdminCatalogActions';
import { WordTypeFormDialog } from './WordTypeFormDialog';

type TAdminWordTypeListProps = Readonly<{
  wordTypes: TAdminWordType[];
}>;

/** The word types table with how many text targets use each. Add and edit open a form; delete asks first. */
export function AdminWordTypeList({ wordTypes }: TAdminWordTypeListProps) {
  const t = useTranslations('admin.wordTypes');
  const { isPending, createWordType, saveWordType, deleteWordType } = useAdminWordTypeActions();
  const { form, deleteTarget, openCreate, openEdit, closeForm, openDelete, closeDelete } = useCatalogDialogs<TAdminWordType>();
  const columns = useWordTypeColumns({ isPending, onEdit: openEdit, onDelete: openDelete });

  const submitWordType = (input: TAdminWordTypeInput) => (form?.mode === 'edit' ? saveWordType(form.item, input, closeForm) : createWordType(input, closeForm));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" disabled={isPending} onClick={openCreate}>
          {t('create')}
        </Button>
      </div>

      {wordTypes.length === 0
        ? <p className="text-sm text-muted-foreground">{t('empty')}</p>
        : <DataTable columns={columns} data={wordTypes} showSearch={false} showPagination={false} />}

      {form && (
        <WordTypeFormDialog
          wordType={form.mode === 'edit' ? form.item : undefined}
          isPending={isPending}
          onClose={closeForm}
          onSubmit={submitWordType}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          title={t('deleteDialog.title', { name: deleteTarget.name })}
          description={t('deleteDialog.description')}
          confirmLabel={t('deleteDialog.confirm')}
          cancelLabel={t('deleteDialog.cancel')}
          isPending={isPending}
          onClose={closeDelete}
          onConfirm={() => deleteWordType(deleteTarget, closeDelete)}
        />
      )}
    </div>
  );
}
