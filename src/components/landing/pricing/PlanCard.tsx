'use client';

import type { TPlan } from '@/types/plan';
import { getPlanBadgeClassName, getPlanTextClassName } from '@/constants/plan';
import { cn } from '@/libs/utils';
import Link from 'next/link';
import { CheckCircle } from '@solar-icons/react/ssr';
import { Button } from '@/components/ui/button';
import { PlanLimitsSummary } from './PlanLimitsSummary';
import { CheckItem } from './CheckItem';
import { FeatureItemWithIcon } from './FeatureItemWithIcon';
import { getMemberFeatureIcon, GUEST_FEATURE_ICONS } from './plan-feature-icons';

export function PlanCard({
  plan,
  isRecommended,
  isCurrentPlan,
  onGetNotified,
  isOnList,
}: Readonly<{
  plan: TPlan;
  isRecommended: boolean;
  isCurrentPlan?: boolean;
  onGetNotified?: () => void;
  isOnList?: boolean;
}>) {
  const isGuest = plan.role === 'GUEST';
  const isMember = plan.role === 'MEMBER';

  const labelClass = cn(
    'font-sans text-xs font-medium tracking-wide uppercase',
    isGuest && 'text-muted-foreground',
    isMember && 'text-foreground',
    !isGuest && !isMember && getPlanTextClassName(plan.role),
  );
  const titleClass = cn(
    'font-sans text-2xl font-bold 2xl:text-3xl',
    isGuest && 'text-foreground',
    isMember && 'text-foreground',
    !isGuest && !isMember && getPlanTextClassName(plan.role),
  );
  const currentPlanBadgeClass = cn(
    'rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold',
    isGuest && 'bg-muted text-foreground',
    isMember && 'bg-primary/10 text-primary',
    !isGuest && !isMember && getPlanBadgeClassName(plan.role),
  );

  return (
    <div
      className={`flex h-full flex-col rounded-2xl bg-card p-8 shadow-sm 2xl:p-10 ${
        isCurrentPlan
          ? 'border-2 border-primary ring-2 ring-primary/20'
          : isRecommended
            ? 'border-2 border-primary shadow-lg md:origin-center'
            : 'border border-border'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={labelClass}>
          {plan.role}
        </p>
        {isCurrentPlan && (
          <span className={currentPlanBadgeClass}>
            Current plan
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h3 className={titleClass}>
          {plan.name}
        </h3>
        {isMember && !isCurrentPlan && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-sans text-xs font-semibold text-primary">
            COMING SOON
          </span>
        )}
      </div>
      <p className="mt-2 font-sans text-[15px] leading-relaxed text-muted-foreground">
        {plan.priceLabel}
      </p>
      <PlanLimitsSummary limits={plan.limits} />
      <p className="mt-6 font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase">
        FEATURES
      </p>
      <ul className="mt-3 space-y-2">
        {plan.features.map((f, i) => {
          const memberIcon = isMember && getMemberFeatureIcon(f, i);
          if (memberIcon) {
            return (
              <FeatureItemWithIcon
                key={`${f}-${i}`}
                Icon={memberIcon}
                accent={isRecommended}
              >
                {f}
              </FeatureItemWithIcon>
            );
          }
          if (!isMember && GUEST_FEATURE_ICONS[i]) {
            return (
              <FeatureItemWithIcon key={`${f}-${i}`} Icon={GUEST_FEATURE_ICONS[i]} muted>
                {f}
              </FeatureItemWithIcon>
            );
          }
          return (
            <CheckItem key={`${f}-${i}`} accent={isRecommended}>
              {f}
            </CheckItem>
          );
        })}
      </ul>
      <div className="mt-auto pt-8">
        {isCurrentPlan
          ? (
              <div
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 py-3 font-sans text-sm font-medium text-muted-foreground"
                role="status"
              >
                <CheckCircle size={18} weight="BoldDuotone" className="shrink-0" />
                Your plan
              </div>
            )
          : isMember && isOnList
            ? (
                <div
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-100 py-3 font-sans font-semibold text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle size={20} weight="BoldDuotone" className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  You're on the list!
                </div>
              )
            : isMember && onGetNotified
              ? (
                  <Button
                    type="button"
                    onClick={onGetNotified}
                    className="w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow hover:bg-primary/90"
                    size="lg"
                  >
                    Get Notified
                  </Button>
                )
              : (
                  <Link href="/signup" className="block">
                    <Button
                      variant={isRecommended ? 'default' : 'outline'}
                      className={
                        isRecommended
                          ? 'w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow hover:bg-primary/90'
                          : 'w-full rounded-xl border-border font-semibold text-foreground hover:bg-muted'
                      }
                      size={isRecommended ? 'lg' : undefined}
                    >
                      {isRecommended ? 'Upgrade' : 'Start for Free'}
                    </Button>
                  </Link>
                )}
      </div>
    </div>
  );
}
