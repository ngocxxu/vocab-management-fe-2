'use client';

import { deleteAccount } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DeleteAccountDialog } from '@/shared/ui/DeleteAccountDialog';

export const ProfileDangerZone: React.FC = () => {
  const t = useTranslations('settings.danger');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setIsDialogOpen(false);
      toast.success(t('deleted'));
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tErrors('deleteAccount'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section id="danger" aria-labelledby="danger-title" className="scroll-mt-24 rounded-2xl border border-destructive/40 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="danger-title" className="text-lg font-semibold text-foreground">{t('title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button variant="destructive" className="shrink-0" onClick={() => setIsDialogOpen(true)}>
          {t('button')}
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
