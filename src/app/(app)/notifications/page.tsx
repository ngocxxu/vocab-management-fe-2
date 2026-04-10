import { NotificationsPageContent } from '@/components/notifications/NotificationsPageContent';
import { getNotificationsPageData } from '@/features/notifications/services/server/getNotificationsPageData';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const { notificationsWithRead } = await getNotificationsPageData();

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
