'use client';

import type { TAdminPlan, TAdminPlanFormValues, TAdminUserRole } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ADMIN_USER_ROLES } from '@/constants/admin';
import { useAdminPlanActions } from '../hooks/useAdminPlanActions';
import { getCreatableRoles, toAdminPlanPayload } from '../utils/admin-plans';
import { PlanFormDialog } from './PlanFormDialog';
import { PlanRoleCard } from './PlanRoleCard';

type TEditingPlan = { role: TAdminUserRole; plan?: TAdminPlan };

type TAdminPlanListProps = Readonly<{
  plans: TAdminPlan[];
}>;

/** One card per role. A role with no plan can be created; a plan can be edited and switched on or off. */
export function AdminPlanList({ plans }: TAdminPlanListProps) {
  const t = useTranslations('admin.plans');
  const { isPending, createPlan, savePlan, toggleActive } = useAdminPlanActions();
  const [editing, setEditing] = useState<TEditingPlan | null>(null);
  const creatableRoles = getCreatableRoles(plans);

  const submitPlan = (values: TAdminPlanFormValues) => {
    if (!editing) {
      return;
    }
    const payload = toAdminPlanPayload(values, editing.plan);
    const close = () => setEditing(null);

    if (editing.plan) {
      savePlan(editing.plan, payload, close);
    } else {
      createPlan(editing.role, payload, close);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{t('description')}</p>

      <ul className="grid gap-4 md:grid-cols-3">
        {ADMIN_USER_ROLES.map(role => (
          <PlanRoleCard
            key={role}
            role={role}
            plan={plans.find(item => item.role === role)}
            canCreate={creatableRoles.includes(role)}
            isPending={isPending}
            onEdit={(editRole, plan) => setEditing({ role: editRole, plan })}
            onToggleActive={toggleActive}
          />
        ))}
      </ul>

      {editing && (
        <PlanFormDialog
          key={editing.role}
          role={editing.role}
          plan={editing.plan}
          isPending={isPending}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null);
            }
          }}
          onSubmit={submitPlan}
        />
      )}
    </div>
  );
}
