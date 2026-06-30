'use client';

import { useChat } from '@/providers/ChatProvider';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ConfirmOverlay } from './ConfirmOverlay';
import { MessageList } from './MessageList';
import { QuickActions } from './QuickActions';

export function ChatPanel() {
  const { state } = useChat();

  if (!state.isOpen) {
    return null;
  }

  return (
    <div className="fixed right-8 bottom-25 z-50 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl max-sm:inset-0 max-sm:h-auto max-sm:w-auto max-sm:rounded-none">
      {state.confirmRequest && (
        <ConfirmOverlay confirmRequest={state.confirmRequest} />
      )}
      <ChatHeader />
      <MessageList />
      <QuickActions />
      <ChatInput />
    </div>
  );
}
