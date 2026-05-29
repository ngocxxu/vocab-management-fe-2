import { AnswerDistributionCard } from '@/components/dashboard/cards/AnswerDistributionCard';
import { DistributionChart } from '@/components/dashboard/cards/DistributionChart';
import { ProgressChart } from '@/components/dashboard/cards/ProgressChart';
import { SubjectMasteryChart } from '@/components/dashboard/cards/SubjectMasteryChart';
import { ZoneError } from '@/features/dashboard/components/ZoneError';
import { getDashboardChartsData } from '@/features/dashboard/services/server/getDashboardChartsData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export async function DashboardChartsZone() {
  try {
    const { summary, subjects, distribution, progress } = await getDashboardChartsData();

    return (
      <div className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="h-full lg:col-span-2">
            <ProgressChart data={progress} />
          </div>
          <div className="h-full lg:col-span-1">
            <AnswerDistributionCard data={summary} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <SubjectMasteryChart data={subjects} />
          <DistributionChart data={distribution} />
        </div>
      </div>
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/dashboard'));
    }
    return <ZoneError sectionName="charts" />;
  }
}
