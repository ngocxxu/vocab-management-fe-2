'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// The user must type this English word exactly; only the text around it is translated.
const CONFIRM_WORD = 'delete';

type DeleteAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
};

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}) => {
  const t = useTranslations('settings.deleteAccount');
  const [confirmText, setConfirmText] = useState('');
  const isMatch = confirmText.trim().toLowerCase() === CONFIRM_WORD;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setConfirmText('');
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isMatch || isDeleting) {
      return;
    }
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-confirm-input" className="text-sm text-muted-foreground">
            {t.rich('typeToConfirm', {
              word: CONFIRM_WORD,
              em: chunks => <span className="font-semibold text-foreground">{chunks}</span>,
            })}
          </Label>
          <Input
            id="delete-confirm-input"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
            className="border-input"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!isMatch || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirm}
          >
            {isDeleting ? t('deleting') : t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
