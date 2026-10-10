'use client';

import type { TPlan } from '@/types/plan';
import React from 'react';
import { Button } from '@/components/ui/button';
import { getPlanDisplayName } from '@/constants/plan';
import { SettingsSection } from './SettingsSection';

type ProfilePlanProps = {
  role: string;
  currentPlan?: TPlan | null;
};

const UNLIMITED = -1;

function formatLimit(value: number): string {
  return value === UNLIMITED ? 'Unlimited' : String(value);
}

export const ProfilePlan: React.FC<ProfilePlanProps> = ({ role, currentPlan }) => {
  const title = currentPlan?.name ?? getPlanDisplayName(role);
  // Only a real price is shown: the same check the header uses, so "0" or "Free" stay out of the price line.
  const priceText = currentPlan && Number(currentPlan.priceLabel) ? currentPlan.priceLabel : null;

  const limits = currentPlan
    ? [
        { label: 'Vocabs per day', value: formatLimit(currentPlan.limits.vocabPerDay) },
        { label: 'Language folders', value: formatLimit(currentPlan.limits.languageFolders) },
        { label: 'Subjects', value: formatLimit(currentPlan.limits.subjects) },
      ]
    : [];

  return (
    <SettingsSection id="plan" title="Plan" description="Your subscription and what it includes.">
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <p className="text-xl font-semibold text-foreground">{title}</p>
          {priceText && <p className="mt-1 text-sm text-muted-foreground">{priceText}</p>}
        </div>
        <Button variant="outline">Manage subscription</Button>
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
