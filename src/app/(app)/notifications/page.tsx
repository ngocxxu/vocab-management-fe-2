import type { TNotification } from '@/types/notification';
import { notificationsApi } from '@/utils/server-api';
import { NotificationsPageContent } from '@/components/notifications/NotificationsPageContent';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  let notificationsWithRead: { notification: TNotification; isRead: boolean }[] = [];

  try {
    const res = await notificationsApi.getMy();
    const items = res?.items ?? [];
    notificationsWithRead = items.map((notification) => {
      const isRead = notification.recipients?.[0]?.isRead ?? false;
      return { notification, isRead };
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Notifications page fetch error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="mt-2 text-muted-foreground">
          Stay updated with your learning progress and achievements.
        </p>
        <NotificationsPageContent notificationsWithRead={notificationsWithRead} />
      </div>
    </div>
  );
}
