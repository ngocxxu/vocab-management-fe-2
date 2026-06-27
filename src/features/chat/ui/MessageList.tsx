'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { MessageBubble } from './MessageBubble';
import { ToolChip } from './ToolChip';

export function MessageList() {
  const { state, loadMoreHistory } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages.length]);

  const handleScroll = () => {
    if (!containerRef.current) {
      return;
    }
    if (containerRef.current.scrollTop === 0 && state.nextCursor) {
      loadMoreHistory();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-1 flex-col gap-3 overflow-y-auto py-4"
    >
      {state.messages.map(message => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {state.isQueued && (
        <div className="flex items-start gap-2 px-4">
          <Image
            src="/assets/images/head_ai.png"
            alt="AI"
            width={28}
            height={28}
            className="mt-1 shrink-0 rounded-full object-cover"
          />
          <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-3">
            <div className="flex items-center gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      {state.toolActivity && (
        <ToolChip toolActivity={state.toolActivity} />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
