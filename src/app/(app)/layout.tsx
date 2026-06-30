import { getChatMessages, getChatUnreadCount, verifyUser } from '@/actions';
import { LayoutClient } from './LayoutClient';

export default async function Layout(props: {
  children: React.ReactNode;
}) {
  const [user, initialChatUnreadCount, initialChatData] = await Promise.all([
    verifyUser(),
    getChatUnreadCount().catch(() => 0),
    getChatMessages().catch(() => ({ messages: [], nextCursor: null })),
  ]);

  return (
    <LayoutClient
      currentUser={user}
      initialChatUnreadCount={initialChatUnreadCount}
      initialChatMessages={initialChatData.messages}
      initialChatNextCursor={initialChatData.nextCursor}
    >
      {props.children}
    </LayoutClient>
  );
}
