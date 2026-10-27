'use client';

import type { TAdminUser, TAdminUserRole } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { deleteAdminUser, updateAdminUser } from '@/actions/admin';
import type { TAdminUserToggleFlag } from '../utils/admin-user-toggle';
import { buildAdminUserToggle } from '../utils/admin-user-toggle';
import { useAdminAction } from './useAdminAction';

/** Mutations for the users table. Each runs a server action, shows a toast, and refreshes the rows. */
export function useAdminUserActions() {
  const t = useTranslations('admin.users');
  const { isPending, runAction } = useAdminAction(t('toast.failed'));
  const [deleteTarget, setDeleteTarget] = useState<TAdminUser | null>(null);

  const changeRole = useCallback((user: TAdminUser, role: TAdminUserRole) => {
    runAction(() => updateAdminUser(user.id, { role }), t('toast.roleUpdated'));
  }, [runAction, t]);

  const toggleFlag = useCallback((user: TAdminUser, flag: TAdminUserToggleFlag) => {
    const { change, toastKey } = buildAdminUserToggle(user, flag);
    runAction(() => updateAdminUser(user.id, change), t(`toast.${toastKey}`));
  }, [runAction, t]);

  const toggleActive = useCallback((user: TAdminUser) => toggleFlag(user, 'isActive'), [toggleFlag]);

  const toggleMcpAccess = useCallback((user: TAdminUser) => toggleFlag(user, 'mcpAccess'), [toggleFlag]);

  const confirmDelete = useCallback((user: TAdminUser) => {
    runAction(() => deleteAdminUser(user.id), t('toast.deleted'), () => setDeleteTarget(null));
  }, [runAction, t]);

  return { isPending, deleteTarget, setDeleteTarget, changeRole, toggleActive, toggleMcpAccess, confirmDelete };
}
