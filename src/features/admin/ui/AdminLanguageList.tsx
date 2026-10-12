'use client';

import type { TAdminLanguage, TAdminLanguageInput } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { ConfirmDeleteDialog } from '@/shared/ui/ConfirmDeleteDialog';
import { DataTable } from '@/shared/ui/table';
import { useLanguageColumns } from '../hooks/useCatalogColumns';
import { useCatalogDialogs } from '../hooks/useCatalogDialogs';
import { useAdminLanguageActions } from '../hooks/useAdminCatalogActions';
import { LanguageFormDialog } from './LanguageFormDialog';

type TAdminLanguageListProps = Readonly<{
  languages: TAdminLanguage[];
}>;

/** The languages table with usage counts. Add and rename open a form; delete asks first and is locked while in use. */
export function AdminLanguageList({ languages }: TAdminLanguageListProps) {
  const t = useTranslations('admin.languages');
  const { isPending, createLanguage, saveLanguage, deleteLanguage } = useAdminLanguageActions();
  const { form, deleteTarget, openCreate, openEdit, closeForm, openDelete, closeDelete } = useCatalogDialogs<TAdminLanguage>();
  const columns = useLanguageColumns({ isPending, onRename: openEdit, onDelete: openDelete });

  const submitLanguage = (input: TAdminLanguageInput) => (form?.mode === 'edit' ? saveLanguage(form.item, input, closeForm) : createLanguage(input, closeForm));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t('description')}</p>
        <Button size="sm" disabled={isPending} onClick={openCreate}>
          {t('create')}
        </Button>
      </div>

      {languages.length === 0
        ? <p className="text-sm text-muted-foreground">{t('empty')}</p>
        : <DataTable columns={columns} data={languages} showSearch={false} showPagination={false} />}

      {form && (
        <LanguageFormDialog
          language={form.mode === 'edit' ? form.item : undefined}
          isPending={isPending}
          onClose={closeForm}
          onSubmit={submitLanguage}
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
          onConfirm={() => deleteLanguage(deleteTarget, closeDelete)}
        />
      )}
    </div>
  );
}
