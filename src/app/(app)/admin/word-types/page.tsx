import { AdminWordTypeList, getAdminWordTypesPageData } from '@/features/admin';
import { verifyUser } from '@/actions';
import { logger } from '@/libs/Logger';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminWordTypesPage() {
  const user = await verifyUser();
  if (!user) {
    redirect(getExpiredSessionRedirect('/admin/word-types'));
  }

  try {
    const wordTypes = await getAdminWordTypesPageData();

    return <AdminWordTypeList wordTypes={wordTypes} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/admin/word-types'));
    }

    logger.error('Failed to load admin word types:', { error });
    const t = await getTranslations('admin.wordTypes');

    return <p className="text-destructive">{t('loadError')}</p>;
  }
}
