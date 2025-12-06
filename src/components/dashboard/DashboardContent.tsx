import React from 'react';
import ErrorState from '@/components/shared/ErrorState';
import { statisticsApi } from '@/utils/server-api';
import { DistributionChart } from './cards/DistributionChart';
import { ProblematicVocabsTable } from './cards/ProblematicVocabsTable';
import { ProgressChart } from './cards/ProgressChart';
import { SubjectMasteryChart } from './cards/SubjectMasteryChart';
import { SummaryStatsCard } from './cards/SummaryStatsCard';

export const DashboardContent: React.FC = async () => {
  try {
    const [summary, bySubject, progress, problematic, distribution] = await Promise.all([
      statisticsApi.getSummary(),
      statisticsApi.getBySubject(),
      statisticsApi.getProgress(),
      statisticsApi.getProblematic(),
      statisticsApi.getDistribution(),
    ]);

    return (
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8 dark:bg-slate-900">
        <div className="container mx-auto space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Statistics Dashboard</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              View your vocabulary learning statistics and track your progress over time.
            </p>
          </div>

          <SummaryStatsCard data={summary} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProgressChart data={progress} />
            </div>
            <div>
              <SubjectMasteryChart data={bySubject} />
            </div>
          </div>

          <DistributionChart data={distribution} />

          <ProblematicVocabsTable data={problematic} />
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8 dark:bg-slate-900">
        <div className="container mx-auto">
          <ErrorState message={error instanceof Error ? error.message : 'Failed to load dashboard statistics'} />
        </div>
      </main>
    );
  }
};
