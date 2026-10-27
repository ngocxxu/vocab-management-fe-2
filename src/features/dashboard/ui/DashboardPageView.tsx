import { PAGE_CONTAINER_CLASS } from '@/components/shared/page-layout';
import { SectionLabel } from '../components/SectionLabel';
import { ChartsSkeleton } from '../components/skeletons/ChartsSkeleton';
import { HeroCTASkeleton } from '../components/skeletons/HeroCTASkeleton';
import { HeatmapSkeleton } from '../components/skeletons/HeatmapSkeleton';
import { TableSkeleton } from '../components/skeletons/TableSkeleton';
import { DashboardChartsZone } from './DashboardChartsZone';
import { DashboardCriticalZone } from './DashboardCriticalZone';
import { DashboardHeatmapZone } from './DashboardHeatmapZone';
import { DashboardNextActionZone } from './DashboardNextActionZone';
import { DashboardProblematicZone } from './DashboardProblematicZone';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

const OVERVIEW_SKELETON_KEYS = ['total-words', 'average-mastery', 'accuracy', 'need-review'];

export function DashboardPageView() {
  const t = useTranslations('dashboard.section');

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className={`${PAGE_CONTAINER_CLASS} space-y-6 md:space-y-8`}>
        <Suspense
          fallback={(
            <div className="animate-pulse space-y-6">
              <div className="h-16 rounded-lg bg-muted" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {OVERVIEW_SKELETON_KEYS.map(key => (
                  <div key={key} className="h-32 rounded-2xl bg-muted" />
                ))}
              </div>
            </div>
          )}
        >
          <DashboardCriticalZone />
        </Suspense>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="flex min-w-0 flex-col gap-3 lg:col-span-1">
            <SectionLabel>{t('nextAction')}</SectionLabel>
            <div className="flex min-h-0 flex-1 flex-col">
              <Suspense fallback={<HeroCTASkeleton />}>
                <DashboardNextActionZone />
              </Suspense>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-3 lg:col-span-2">
            <SectionLabel>{t('activity')}</SectionLabel>
            <div className="flex min-h-0 flex-1 flex-col">
              <Suspense fallback={<HeatmapSkeleton />}>
                <DashboardHeatmapZone />
              </Suspense>
            </div>
          </div>
        </div>

        <SectionLabel>{t('wordsToReview')}</SectionLabel>
        <Suspense fallback={<TableSkeleton />}>
          <DashboardProblematicZone />
        </Suspense>

        <SectionLabel>{t('charts')}</SectionLabel>
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardChartsZone />
        </Suspense>

      </div>
    </main>
  );
}
