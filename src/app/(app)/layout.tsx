import { getChatUnreadCount, verifyUser } from '@/actions';
import { LayoutClient } from './LayoutClient';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  const [user, initialChatUnreadCount] = await Promise.all([
    verifyUser(),
    getChatUnreadCount().catch(() => 0),
  ]);

  return (
    <LayoutClient
      currentUser={user}
      initialChatUnreadCount={initialChatUnreadCount}
    >
      {props.children}
    </LayoutClient>
  );
}
