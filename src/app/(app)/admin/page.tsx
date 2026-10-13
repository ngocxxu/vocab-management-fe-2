import { AdminOverview, getAdminOverviewData } from '@/features/admin';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  try {
    const stats = await getAdminOverviewData();

    return <AdminOverview stats={stats} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/admin'));
    }

    logger.error('Failed to load admin overview:', { error });

    return <AdminOverview />;
  }
}
