import { AdminSystemPanel, getAdminSystemPageData } from '@/features/admin';
import { verifyUser } from '@/actions';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminSystemPage() {
  const user = await verifyUser();
  if (!user) {
    redirect(getExpiredSessionRedirect('/admin/system'));
  }

  try {
    const { aiSettings, cacheRows } = await getAdminSystemPageData();

    return <AdminSystemPanel aiSettings={aiSettings} cacheRows={cacheRows} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/admin/system'));
    }

    logger.error('Failed to load admin system settings:', { error });
    const t = await getTranslations('admin.system');

    return <p className="text-destructive">{t('loadError')}</p>;
  }
}
