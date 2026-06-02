import { KpiGrid } from '../components/KpiGrid';
import { SectionLabel } from '../components/SectionLabel';
import { getDashboardCriticalData } from '../services/server/getDashboardCriticalData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export async function DashboardCriticalZone() {
  try {
    const { user, summary } = await getDashboardCriticalData();
    const firstName = user?.firstName ?? 'there';

    return (
      <>
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back,
            {' '}
            {firstName}
            !
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Track your language learning progress and improve your skills with our AI-powered tools.
          </p>
        </header>

        <SectionLabel>Overview</SectionLabel>
        <KpiGrid summary={summary} />
      </>
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/dashboard'));
    }
    throw error;
  }
}
