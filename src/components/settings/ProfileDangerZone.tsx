'use client';

import { deleteAccount } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DeleteAccountDialog } from '@/shared/ui/DeleteAccountDialog';

export const ProfileDangerZone: React.FC = () => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setIsDialogOpen(false);
      toast.success('Account deleted');
      router.push('/signin');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section id="danger" aria-labelledby="danger-title" className="scroll-mt-24 rounded-2xl border border-destructive/40 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="danger-title" className="text-lg font-semibold text-foreground">Delete account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently remove your account and all associated data. This cannot be undone.
          </p>
        </div>
        <Button variant="destructive" className="shrink-0" onClick={() => setIsDialogOpen(true)}>
          Delete Permanently
        </Button>
      </div>

      <DeleteAccountDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </section>
  );
};
