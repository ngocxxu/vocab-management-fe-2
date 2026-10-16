import { Suspense } from 'react';
import { getChatMessages, getChatUnreadCount, verifyUser } from '@/actions';
import { ChatBubble, ChatPanel, ChatProvider } from '@/features/chat';
import { AppLoading } from './AppLoading';
import { LayoutClient } from './LayoutClient';

// Not async on purpose: the Suspense boundary lets the loader paint before user and chat data resolve.
export default function Layout(props: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppLoading fullPage />}>
      <AppShell>{props.children}</AppShell>
    </Suspense>
  );
}

async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await verifyUser();

  return (
    <LayoutClient
      currentUser={user}
      chat={(
        <Suspense fallback={null}>
          <ChatScope />
        </Suspense>
      )}
    >
      {children}
    </LayoutClient>
  );
}

async function ChatScope() {
  const [initialChatUnreadCount, initialChatData] = await Promise.all([
    getChatUnreadCount().catch(() => 0),
    getChatMessages().catch(() => ({ messages: [], nextCursor: null })),
  ]);

  return (
    <ChatProvider
      initialUnreadCount={initialChatUnreadCount}
      initialMessages={initialChatData.messages}
      initialNextCursor={initialChatData.nextCursor}
    >
      <ChatBubble />
      <ChatPanel />
    </ChatProvider>
  );
}
