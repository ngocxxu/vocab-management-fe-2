'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/ui/alert-dialog';
import { Input } from '@/shared/ui/input';
import { isDeleteConfirmed } from '../utils/admin-users-query';

type TDeleteUserDialogProps = Readonly<{
  email: string;
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}>;

export function DeleteUserDialog({ email, open, isPending, onOpenChange, onConfirm }: TDeleteUserDialogProps) {
  const t = useTranslations('admin.users.deleteDialog');
  const inputId = useId();
  const [typed, setTyped] = useState('');
  const confirmed = isDeleteConfirmed(typed, email);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTyped('');
    }
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('description', { email })}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-sm text-muted-foreground">{t('typeEmail', { email })}</label>
          <Input
            id={inputId}
            value={typed}
            onChange={event => setTyped(event.target.value)}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={!confirmed || isPending}
            onClick={(event) => {
              // Keep the dialog open until the delete finishes; the parent closes it on success.
              event.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
