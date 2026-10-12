'use client';

import type { TAdminPlan, TAdminUserRole } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { ADMIN_PLAN_LIMIT_KEYS, ADMIN_PLAN_UNLIMITED } from '@/constants/admin';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

type TPlanRoleCardProps = Readonly<{
  role: TAdminUserRole;
  plan?: TAdminPlan;
  canCreate: boolean;
  isPending: boolean;
  onEdit: (role: TAdminUserRole, plan?: TAdminPlan) => void;
  onToggleActive: (plan: TAdminPlan) => void;
}>;

type TPlanSummaryProps = Readonly<{
  plan: TAdminPlan;
  isPending: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
}>;

type TNoPlanProps = Readonly<{
  role: TAdminUserRole;
  canCreate: boolean;
  isPending: boolean;
  onCreate: () => void;
}>;

function PlanSummary({ plan, isPending, onEdit, onToggleActive }: TPlanSummaryProps) {
  const t = useTranslations('admin.plans');
  const formatLimit = (value: number) => (value === ADMIN_PLAN_UNLIMITED ? t('unlimited') : String(value));

  return (
    <>
      <div>
        <p className="font-medium text-foreground">{plan.name}</p>
        <p className="text-sm text-muted-foreground">{plan.priceLabel}</p>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {ADMIN_PLAN_LIMIT_KEYS.map(key => (
          <div key={key} className="rounded-xl bg-muted/40 p-3">
            <dt className="text-xs text-muted-foreground">{t(`limits.${key}`)}</dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">{formatLimit(plan.limits[key])}</dd>
          </div>
        ))}
      </dl>

      {plan.features.length > 0 && (
        <ul className="list-inside list-disc text-sm text-muted-foreground">
          {plan.features.map(feature => <li key={feature}>{feature}</li>)}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={isPending} onClick={onEdit}>
          {t('edit')}
        </Button>
        <Button variant="ghost" size="sm" disabled={isPending} onClick={onToggleActive}>
          {plan.isActive ? t('deactivate') : t('reactivate')}
        </Button>
      </div>
    </>
  );
}

function NoPlan({ role, canCreate, isPending, onCreate }: TNoPlanProps) {
  const t = useTranslations('admin.plans');

  return (
    <>
      <p className="text-sm text-muted-foreground">{role === 'ADMIN' ? t('adminUnlimited') : t('noPlan')}</p>
      {canCreate && (
        <div className="mt-auto">
          <Button size="sm" disabled={isPending} onClick={onCreate}>
            {t('create')}
          </Button>
        </div>
      )}
    </>
  );
}

/** One role's card: its plan summary with edit and switch actions, or the create action when the role has none. */
export function PlanRoleCard({ role, plan, canCreate, isPending, onEdit, onToggleActive }: TPlanRoleCardProps) {
  const t = useTranslations('admin.plans');
  const tUsers = useTranslations('admin.users');

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">{tUsers(`roles.${role}`)}</h2>
        {plan && <Badge variant={plan.isActive ? 'secondary' : 'outline'}>{plan.isActive ? t('statusActive') : t('statusInactive')}</Badge>}
      </div>

      {plan
        ? (
            <PlanSummary
              plan={plan}
              isPending={isPending}
              onEdit={() => onEdit(role, plan)}
              onToggleActive={() => onToggleActive(plan)}
            />
          )
        : (
            <NoPlan role={role} canCreate={canCreate} isPending={isPending} onCreate={() => onEdit(role)} />
          )}
    </li>
  );
}
