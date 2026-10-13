'use client';

import type { TAiSettingKey } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { clearAdminCaches, saveAdminAiSetting } from '@/actions/admin-system';
import { useAdminAction } from './useAdminAction';

type TAdminSystemActions = {
  isPending: boolean;
  saveAiSetting: (key: TAiSettingKey, value: string | null) => void;
  clearCaches: (onSuccess: () => void) => void;
};

/** Mutations for the system page. Each runs a server action, toasts the outcome and refreshes the page. */
export function useAdminSystemActions(): TAdminSystemActions {
  const t = useTranslations('admin.system');
  const { isPending, runAction } = useAdminAction(t('toast.failed'));

  const saveAiSetting = useCallback((key: TAiSettingKey, value: string | null) => {
    runAction(() => saveAdminAiSetting({ key, value }), t(value === null ? 'toast.reset' : 'toast.saved'));
  }, [runAction, t]);

  const clearCaches = useCallback((onSuccess: () => void) => {
    runAction(() => clearAdminCaches(), t('toast.cleared'), onSuccess);
  }, [runAction, t]);

  return { isPending, saveAiSetting, clearCaches };
}
