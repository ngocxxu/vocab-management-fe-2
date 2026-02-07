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

type DeleteActionButtonProps = {
  itemId: string;
  itemName: string;
  onDelete: (id: string) => Promise<void>;
  onSuccess?: () => void | Promise<void>;
  successMessage?: string;
  errorMessage?: string;
};

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
      await onDelete(itemId);
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
          className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-700"
        >
          <TrashBin2 size={16} weight="BoldDuotone" className="text-slate-500" />
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
            className="bg-red-500 hover:bg-red-600"
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
