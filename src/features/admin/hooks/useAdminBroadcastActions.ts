'use client';

import type { TBroadcastFormValues } from '@/libs/validations/broadcast';
import type { TBroadcastHistoryItem } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { cleanupAdminBroadcasts, createAdminBroadcast, deleteAdminBroadcast, setAdminBroadcastActive } from '@/actions/admin-broadcasts';
import { useAdminAction } from './useAdminAction';

type TAdminBroadcastActions = {
  isPending: boolean;
  sendBroadcast: (input: TBroadcastFormValues, onSuccess: () => void) => void;
  toggleBroadcast: (broadcast: TBroadcastHistoryItem) => void;
  deleteBroadcast: (broadcast: TBroadcastHistoryItem, onSuccess: () => void) => void;
  cleanupExpired: (onSuccess: () => void) => void;
};

/** Mutations for the broadcast panel. Each runs a server action, toasts the outcome and refreshes the page. */
export function useAdminBroadcastActions(): TAdminBroadcastActions {
  const t = useTranslations('admin.broadcasts');
  const { isPending, runAction } = useAdminAction(t('toast.failed'));

  const sendBroadcast = useCallback((input: TBroadcastFormValues, onSuccess: () => void) => {
    runAction(() => createAdminBroadcast(input), t('toast.sent'), onSuccess);
  }, [runAction, t]);

  const toggleBroadcast = useCallback((broadcast: TBroadcastHistoryItem) => {
    runAction(
      () => setAdminBroadcastActive(broadcast.id, !broadcast.isActive),
      t(broadcast.isActive ? 'toast.deactivated' : 'toast.activated'),
    );
  }, [runAction, t]);

  const deleteBroadcast = useCallback((broadcast: TBroadcastHistoryItem, onSuccess: () => void) => {
    runAction(() => deleteAdminBroadcast(broadcast.id), t('toast.deleted'), onSuccess);
  }, [runAction, t]);

  const cleanupExpired = useCallback((onSuccess: () => void) => {
    runAction(() => cleanupAdminBroadcasts(), t('toast.cleaned'), onSuccess);
  }, [runAction, t]);

  return { isPending, sendBroadcast, toggleBroadcast, deleteBroadcast, cleanupExpired };
}
