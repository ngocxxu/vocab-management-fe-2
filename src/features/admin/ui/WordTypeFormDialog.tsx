'use client';

import type { TAdminWordType, TAdminWordTypeInput } from '@/types/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { wordTypeFormSchema } from '@/libs/validations/catalog';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';

type TWordTypeFormDialogProps = Readonly<{
  wordType?: TAdminWordType;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: TAdminWordTypeInput) => void;
}>;

/** Add a word type, or edit one's name and description. */
export function WordTypeFormDialog({ wordType, isPending, onClose, onSubmit }: TWordTypeFormDialogProps) {
  const t = useTranslations('admin.wordTypes');
  const idPrefix = useId();
  const { register, handleSubmit, formState: { errors } } = useForm<TAdminWordTypeInput>({
    resolver: zodResolver(wordTypeFormSchema),
    defaultValues: { name: wordType?.name ?? '', description: wordType?.description ?? '' },
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
            <DialogTitle>{wordType ? t('dialog.editTitle') : t('dialog.createTitle')}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${idPrefix}-name`}>{t('dialog.name')}</Label>
            <Input id={`${idPrefix}-name`} aria-invalid={errors.name ? true : undefined} {...register('name')} />
            {errors.name && <p role="alert" className="text-sm text-destructive">{t('dialog.nameHint')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${idPrefix}-description`}>{t('dialog.description')}</Label>
            <Textarea id={`${idPrefix}-description`} rows={3} aria-invalid={errors.description ? true : undefined} {...register('description')} />
            {errors.description && <p role="alert" className="text-sm text-destructive">{t('dialog.descriptionHint')}</p>}
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
