import { verifyUser } from '@/actions';
import ErrorState from '@/components/shared/ErrorState';
import { statisticsApi } from '@/utils/server-api';
import React from 'react';
import { AnswerDistributionCard } from './cards/AnswerDistributionCard';
import { DistributionChart } from './cards/DistributionChart';
import { ProblematicVocabsTable } from './cards/ProblematicVocabsTable';
import { ProgressChart } from './cards/ProgressChart';
import { SubjectMasteryChart } from './cards/SubjectMasteryChart';
import { SummaryStatsCard } from './cards/SummaryStatsCard';

export const DashboardContent: React.FC = async () => {
  try {
    const [user, summary, bySubject, progress, problematic, distribution] = await Promise.all([
      verifyUser(),
      statisticsApi.getSummary(),
      statisticsApi.getBySubject(),
      statisticsApi.getProgress(),
      statisticsApi.getProblematic(),
      statisticsApi.getDistribution(),
    ]);

    const firstName = user?.firstName ?? 'there';

    return (
      <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
        <div className="container mx-auto space-y-6 md:space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Welcome back,
              {' '}
              {firstName}
              !
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Track your language learning progress and improve your skills with our AI-powered tools.
            </p>
          </div>

          <SummaryStatsCard data={summary} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="h-full lg:col-span-2">
              <ProgressChart data={progress} />
            </div>
            <div className="h-full lg:col-span-1">
              <AnswerDistributionCard data={summary} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <SubjectMasteryChart data={bySubject} />
            <DistributionChart data={distribution} />
          </div>

          <ProblematicVocabsTable data={problematic} />
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
        <div className="container mx-auto">
          <ErrorState message={error instanceof Error ? error.message : 'Failed to load dashboard statistics'} />
        </div>
      </main>
    );
  }
};
