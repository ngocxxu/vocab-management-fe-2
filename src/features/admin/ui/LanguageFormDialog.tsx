'use client';

import type { TAdminLanguage, TAdminLanguageInput } from '@/types/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { languageFormSchema } from '@/libs/validations/catalog';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type TLanguageFormDialogProps = Readonly<{
  language?: TAdminLanguage;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: TAdminLanguageInput) => void;
}>;

/** Add a language, or rename one. The code is fixed once the language exists, so it is read-only on edit. */
export function LanguageFormDialog({ language, isPending, onClose, onSubmit }: TLanguageFormDialogProps) {
  const t = useTranslations('admin.languages');
  const idPrefix = useId();
  const isEdit = language !== undefined;
  const { register, handleSubmit, formState: { errors } } = useForm<TAdminLanguageInput>({
    resolver: zodResolver(languageFormSchema),
    defaultValues: { code: language?.code ?? '', name: language?.name ?? '' },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{isEdit ? t('dialog.editTitle') : t('dialog.createTitle')}</DialogTitle>
            <DialogDescription>{isEdit ? t('codeLocked') : t('dialog.codeHint')}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${idPrefix}-name`}>{t('dialog.name')}</Label>
            <Input id={`${idPrefix}-name`} aria-invalid={errors.name ? true : undefined} {...register('name')} />
            {errors.name && <p role="alert" className="text-sm text-destructive">{t('dialog.nameHint')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${idPrefix}-code`}>{t('dialog.code')}</Label>
            <Input id={`${idPrefix}-code`} readOnly={isEdit} aria-invalid={errors.code ? true : undefined} {...register('code')} />
            {errors.code && <p role="alert" className="text-sm text-destructive">{t('dialog.codeHint')}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
              {t('dialog.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t('dialog.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
