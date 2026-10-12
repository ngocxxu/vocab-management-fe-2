import { AdminBroadcastPanel, getAdminBroadcastPageData } from '@/features/admin';
import { verifyUser } from '@/actions';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminBroadcastsPage() {
  const user = await verifyUser();
  if (!user) {
    redirect(getExpiredSessionRedirect('/admin/broadcasts'));
  }

  try {
    const broadcasts = await getAdminBroadcastPageData();

    return <AdminBroadcastPanel broadcasts={broadcasts} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/admin/broadcasts'));
    }

    logger.error('Failed to load admin broadcasts:', { error });
    const t = await getTranslations('admin.broadcasts');

    return <p className="text-destructive">{t('loadError')}</p>;
  }
}
