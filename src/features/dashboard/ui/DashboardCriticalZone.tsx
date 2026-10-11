import { FsrsSummaryCard } from '../components/FsrsSummaryCard';
import { KpiGrid } from '../components/KpiGrid';
import { SectionLabel } from '../components/SectionLabel';
import { getDashboardCriticalData } from '../services/server/getDashboardCriticalData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export async function DashboardCriticalZone() {
  try {
    const t = await getTranslations('dashboard');
    const { user, summary } = await getDashboardCriticalData();
    const firstName = user?.firstName ?? t('welcomeFallbackName');

    return (
      <>
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t('welcome', { name: firstName })}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('subtitle')}
          </p>
        </header>

        <SectionLabel>{t('section.overview')}</SectionLabel>
        <KpiGrid summary={summary} />
        <FsrsSummaryCard summary={summary} />
      </>
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/dashboard'));
    }
    throw error;
  }
}
