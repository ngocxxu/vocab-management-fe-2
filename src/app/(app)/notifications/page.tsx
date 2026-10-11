import { NotificationsPageContent } from '@/components/notifications/NotificationsPageContent';
import { getNotificationsPageData } from '@/features/notifications/services/server/getNotificationsPageData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const t = await getTranslations('notifications');
  const { notificationsWithRead, error } = await getNotificationsPageData();
  if (isUnauthorizedError(error)) {
    redirect(getExpiredSessionRedirect('/notifications'));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
        <NotificationsPageContent notificationsWithRead={notificationsWithRead} />
      </div>
    </div>
  );
}
