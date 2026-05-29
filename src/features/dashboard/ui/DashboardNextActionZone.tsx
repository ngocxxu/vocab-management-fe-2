import { HeroCTA } from '@/features/dashboard/components/HeroCTA';
import { ZoneError } from '@/features/dashboard/components/ZoneError';
import { getDashboardNextActionData } from '@/features/dashboard/services/server/getDashboardNextActionData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export async function DashboardNextActionZone() {
  try {
    const { summary } = await getDashboardNextActionData();
    return (
      <div className="h-full">
        <HeroCTA
          criticalCount={summary.criticalCount}
          warningCount={summary.warningCount}
          lastPracticeAt={summary.lastPracticeAt}
        />
      </div>
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/dashboard'));
    }
    return <ZoneError sectionName="next action" />;
  }
}
