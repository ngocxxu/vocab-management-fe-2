'use client';

import React, { useState } from 'react';
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
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove your account and all associated data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-confirm-input" className="text-sm text-muted-foreground">
            Type
            {' '}
            <span className="font-semibold text-foreground">delete</span>
            {' '}
            to confirm.
          </Label>
          <Input
            id="delete-confirm-input"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="delete"
            autoComplete="off"
            className="border-input"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!isMatch || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirm}
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
