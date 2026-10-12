import { AdminPlanList, getAdminPlansPageData } from '@/features/admin';
import { verifyUser } from '@/actions';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminPlansPage() {
  const user = await verifyUser();
  if (!user) {
    redirect(getExpiredSessionRedirect('/admin/plans'));
  }

  try {
    const plans = await getAdminPlansPageData();

    return <AdminPlanList plans={plans} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/admin/plans'));
    }

    logger.error('Failed to load admin plans:', { error });
    const t = await getTranslations('admin.plans');

    return <p className="text-destructive">{t('loadError')}</p>;
  }
}
