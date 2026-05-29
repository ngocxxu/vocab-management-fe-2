import { SectionLabel } from '@/features/dashboard/components/SectionLabel';
import { ChartsSkeleton } from '@/features/dashboard/components/skeletons/ChartsSkeleton';
import { HeroCTASkeleton } from '@/features/dashboard/components/skeletons/HeroCTASkeleton';
import { HeatmapSkeleton } from '@/features/dashboard/components/skeletons/HeatmapSkeleton';
import { TableSkeleton } from '@/features/dashboard/components/skeletons/TableSkeleton';
import { DashboardChartsZone } from '@/features/dashboard/ui/DashboardChartsZone';
import { DashboardCriticalZone } from '@/features/dashboard/ui/DashboardCriticalZone';
import { DashboardHeatmapZone } from '@/features/dashboard/ui/DashboardHeatmapZone';
import { DashboardNextActionZone } from '@/features/dashboard/ui/DashboardNextActionZone';
import { DashboardProblematicZone } from '@/features/dashboard/ui/DashboardProblematicZone';
import { Suspense } from 'react';

export function DashboardPageView() {
  return (
    <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
      <div className="container mx-auto space-y-6 md:space-y-8">
        <Suspense
          fallback={(
            <div className="animate-pulse space-y-6">
              <div className="h-16 rounded-lg bg-muted" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-lg bg-muted" />
                ))}
              </div>
            </div>
          )}
        >
          <DashboardCriticalZone />
        </Suspense>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="flex min-w-0 flex-col gap-3 lg:col-span-1">
            <SectionLabel>Next action</SectionLabel>
            <div className="flex min-h-0 flex-1 flex-col">
              <Suspense fallback={<HeroCTASkeleton />}>
                <DashboardNextActionZone />
              </Suspense>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-3 lg:col-span-2">
            <SectionLabel>Activity</SectionLabel>
            <div className="flex min-h-0 flex-1 flex-col">
              <Suspense fallback={<HeatmapSkeleton />}>
                <DashboardHeatmapZone />
              </Suspense>
            </div>
          </div>
        </div>

        <SectionLabel>Charts</SectionLabel>
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardChartsZone />
        </Suspense>

        <SectionLabel>Words to review</SectionLabel>
        <Suspense fallback={<TableSkeleton />}>
          <DashboardProblematicZone />
        </Suspense>

      </div>
    </main>
  );
}
