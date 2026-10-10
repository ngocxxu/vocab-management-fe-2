'use client';

import { TrashBin2 } from '@solar-icons/react/ssr';
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
  const handleDelete = async () => {
    try {
      // `false` means the item was not deleted and the caller already told the user why (e.g. a conflict dialog).
      const handled = await onDelete(itemId);
      if (handled === false) {
        return;
      }
      await onSuccess?.();
      toast.success(successMessage || `${itemName} deleted successfully!`);
    } catch (error) {
      console.error(`Failed to delete ${itemName}:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : errorMessage || `Failed to delete ${itemName}. Please try again.`,
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
          aria-label={`Delete ${itemName}`}
        >
          <TrashBin2 size={16} weight="BoldDuotone" className="text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            {' '}
            {itemName}
            {' '}
            and remove it from your list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteActionButton;
