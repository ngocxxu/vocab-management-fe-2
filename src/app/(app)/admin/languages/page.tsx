import { AdminLanguageList, getAdminLanguagesPageData } from '@/features/admin';
import { verifyUser } from '@/actions';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLanguagesPage() {
  const user = await verifyUser();
  if (!user) {
    redirect(getExpiredSessionRedirect('/admin/languages'));
  }

  try {
    const languages = await getAdminLanguagesPageData();

    return <AdminLanguageList languages={languages} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/admin/languages'));
    }

    logger.error('Failed to load admin languages:', { error });
    const t = await getTranslations('admin.languages');

    return <p className="text-destructive">{t('loadError')}</p>;
  }
}
