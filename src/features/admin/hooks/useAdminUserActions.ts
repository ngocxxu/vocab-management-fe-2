'use client';

import type { TAdminUser, TAdminUserRole } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deleteAdminUser, updateAdminUser } from '@/actions/admin';

/** Mutations for the users table. Each runs a server action, shows a toast, and refreshes the rows. */
export function useAdminUserActions() {
  const t = useTranslations('admin.users');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<TAdminUser | null>(null);

  // Errors show the message the API sent, such as "There must be at least one active admin".
  const runAction = useCallback((action: () => Promise<unknown>, successMessage: string, onSuccess?: () => void) => {
    startTransition(async () => {
      try {
        await action();
        onSuccess?.();
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('toast.failed'));
      }
    });
  }, [router, t]);

  const changeRole = useCallback((user: TAdminUser, role: TAdminUserRole) => {
    runAction(() => updateAdminUser(user.id, { role }), t('toast.roleUpdated'));
  }, [runAction, t]);

  const toggleActive = useCallback((user: TAdminUser) => {
    const message = user.isActive ? t('toast.deactivated') : t('toast.activated');
    runAction(() => updateAdminUser(user.id, { isActive: !user.isActive }), message);
  }, [runAction, t]);

  const confirmDelete = useCallback((user: TAdminUser) => {
    runAction(() => deleteAdminUser(user.id), t('toast.deleted'), () => setDeleteTarget(null));
  }, [runAction, t]);

  return { isPending, deleteTarget, setDeleteTarget, changeRole, toggleActive, confirmDelete };
}
