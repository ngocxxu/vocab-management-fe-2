'use client';

import type { TPlan } from '@/types/plan';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/components/ui/button';
import { getPlanDisplayName } from '@/constants/plan';
import { SettingsSection } from './SettingsSection';

type ProfilePlanProps = {
  role: string;
  currentPlan?: TPlan | null;
};

const UNLIMITED = -1;

export const ProfilePlan: React.FC<ProfilePlanProps> = ({ role, currentPlan }) => {
  const t = useTranslations('settings.plan');
  const title = currentPlan?.name ?? getPlanDisplayName(role);
  // Only a real price is shown: the same check the header uses, so "0" or "Free" stay out of the price line.
  const priceText = currentPlan && Number(currentPlan.priceLabel) ? currentPlan.priceLabel : null;

  const formatLimit = (value: number): string => (value === UNLIMITED ? t('unlimited') : String(value));

  const limits = currentPlan
    ? [
        { label: t('vocabsPerDay'), value: formatLimit(currentPlan.limits.vocabPerDay) },
        { label: t('languageFolders'), value: formatLimit(currentPlan.limits.languageFolders) },
        { label: t('subjects'), value: formatLimit(currentPlan.limits.subjects) },
      ]
    : [];

  return (
    <SettingsSection id="plan" title={t('title')} description={t('description')}>
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <p className="text-xl font-semibold text-foreground">{title}</p>
          {priceText && <p className="mt-1 text-sm text-muted-foreground">{priceText}</p>}
        </div>
        <Button variant="outline">{t('manage')}</Button>
      </div>

      {limits.length > 0 && (
        <dl className="grid gap-4 py-5 sm:grid-cols-3">
          {limits.map(limit => (
            <div key={limit.label} className="rounded-xl border border-border bg-muted/30 p-4">
              <dt className="text-xs font-medium text-muted-foreground">{limit.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">{limit.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </SettingsSection>
  );
};
