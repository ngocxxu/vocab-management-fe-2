'use client';

import type { TAdminPlan, TAdminPlanPayload, TAdminUserRole } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { createAdminPlan, updateAdminPlan } from '@/actions/admin';
import { useAdminAction } from './useAdminAction';

type TAdminPlanActions = {
  isPending: boolean;
  createPlan: (role: TAdminUserRole, payload: TAdminPlanPayload, onSuccess: () => void) => void;
  savePlan: (plan: TAdminPlan, payload: TAdminPlanPayload, onSuccess: () => void) => void;
  toggleActive: (plan: TAdminPlan) => void;
};

/** Mutations for the plans page. Each runs a server action, shows a toast, and refreshes the cards. */
export function useAdminPlanActions(): TAdminPlanActions {
  const t = useTranslations('admin.plans');
  const { isPending, runAction } = useAdminAction(t('toast.failed'));

  const createPlan = useCallback((role: TAdminUserRole, payload: TAdminPlanPayload, onSuccess: () => void) => {
    runAction(() => createAdminPlan({ ...payload, role }), t('toast.created'), onSuccess);
  }, [runAction, t]);

  const savePlan = useCallback((plan: TAdminPlan, payload: TAdminPlanPayload, onSuccess: () => void) => {
    runAction(() => updateAdminPlan(plan.role, payload), t('toast.saved'), onSuccess);
  }, [runAction, t]);

  const toggleActive = useCallback((plan: TAdminPlan) => {
    const message = plan.isActive ? t('toast.deactivated') : t('toast.activated');
    runAction(() => updateAdminPlan(plan.role, { isActive: !plan.isActive }), message);
  }, [runAction, t]);

  return { isPending, createPlan, savePlan, toggleActive };
}
