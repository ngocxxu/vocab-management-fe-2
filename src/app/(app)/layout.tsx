import { verifyUser } from '@/actions';
import { getPlans } from '@/actions/plans';
import { getLayoutNotificationsData } from '@/features/notifications/services/server/getLayoutNotificationsData';
import { LayoutClient } from './LayoutClient';

export const dynamic = 'force-dynamic';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  const [user, notificationsData] = await Promise.all([
    verifyUser(),
    getLayoutNotificationsData(),
  ]);
  const currentPlan = user?.role ? (await getPlans(user.role))[0] ?? null : null;
  const { allNotifications, unreadNotifications, unreadCount } = notificationsData;

  return (
    <LayoutClient
      currentUser={user}
      currentPlan={currentPlan}
      initialAllNotifications={allNotifications}
      initialUnreadNotifications={unreadNotifications}
      initialUnreadCount={unreadCount}
    >
      {props.children}
    </LayoutClient>
  );
}
