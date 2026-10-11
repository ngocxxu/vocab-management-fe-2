'use client';

import type { TPlan } from '@/types/plan';
import { useTranslations } from 'next-intl';
import PricingCardsFromApi from '@/components/landing/PricingCardsFromApi';

export default function LandingPricing({
  plans = [],
  currentUserRole,
}: Readonly<{ plans?: TPlan[]; currentUserRole?: string }>) {
  const t = useTranslations('landing.pricing');
  const planList = Array.isArray(plans) ? plans : [];

  return (
    <section
      id="pricing"
      className="border-t border-border/80 bg-muted/50 py-20 dark:bg-background"
    >
      <div className="container mx-auto max-w-[1600px] px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mx-auto w-fit rounded-full border border-primary px-3 py-1 font-sans text-xs font-semibold tracking-wide text-primary uppercase">
            {t('tagline')}
          </p>
          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight sm:text-4xl 2xl:text-[2.75rem]">
            <span className="text-foreground">{t('headingPlain')}</span>
            {' '}
            <span className="text-primary">{t('headingAccent')}</span>
          </h2>
          <p className="mx-auto mt-4 font-sans text-[15px] leading-relaxed text-muted-foreground 2xl:text-base">
            {t('subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 overflow-visible md:grid-cols-2 md:gap-10 2xl:max-w-6xl">
          <PricingCardsFromApi plans={planList} currentUserRole={currentUserRole} />
        </div>
      </div>
    </section>
  );
}
