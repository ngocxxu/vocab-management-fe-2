'use client';

import { TrashBin2 } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import type { DeleteActionButtonProps } from '@/types';

const DeleteActionButton: React.FC<DeleteActionButtonProps> = ({
  itemId,
  itemName,
  onDelete,
  onSuccess,
  successMessage,
  errorMessage,
}) => {
  const t = useTranslations('shared');

  const handleDelete = async () => {
    try {
      // `false` means the item was not deleted and the caller already told the user why (e.g. a conflict dialog).
      const handled = await onDelete(itemId);
      if (handled === false) {
        return;
      }
      await onSuccess?.();
      toast.success(successMessage || t('deleted', { name: itemName }));
    } catch (error) {
      console.error(`Failed to delete ${itemName}:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : errorMessage || t('deleteFailed', { name: itemName }),
      );
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-destructive/10"
          aria-label={t('deleteAria', { name: itemName })}
        >
          <TrashBin2 size={16} weight="BoldDuotone" className="text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDescription', { name: itemName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteActionButton;
