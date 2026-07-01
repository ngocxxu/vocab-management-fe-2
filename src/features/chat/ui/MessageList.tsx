'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { MessageBubble } from './MessageBubble';
import { ToolChip } from './ToolChip';

export function MessageList() {
  const { state, loadMoreHistory, retryMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingHistoryRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  useLayoutEffect(() => {
    if (isLoadingHistoryRef.current && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      isLoadingHistoryRef.current = false;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages.length, state.isQueued, state.toolActivity]);

  const handleScroll = () => {
    if (!containerRef.current || isLoadingHistoryRef.current) {
      return;
    }
    if (containerRef.current.scrollTop === 0 && state.nextCursor) {
      prevScrollHeightRef.current = containerRef.current.scrollHeight;
      isLoadingHistoryRef.current = true;
      loadMoreHistory();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-4"
    >
      {state.messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
          onRetry={message.status === 'failed' ? () => retryMessage(message.id, message.message) : undefined}
        />
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
          <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
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
