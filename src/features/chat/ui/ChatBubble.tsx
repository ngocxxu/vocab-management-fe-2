'use client';

import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { useChat } from '@/providers/ChatProvider';
import { formatMessageTime } from './MessageBubble';

export function ChatBubble() {
  const { toggleOpen, dismissPreview, state } = useChat();

  const handleToggle = () => {
    void toggleOpen(!state.isOpen);
  };

  const hasUnread = state.unreadCount > 0;
  const lastAssistantMsg = state.messages.findLast(m => m.role === 'ASSISTANT');
  const showPreview = !state.isOpen && hasUnread && !state.previewDismissed && !!lastAssistantMsg;

  return (
    <TooltipProvider>
      {showPreview && lastAssistantMsg && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Open AI Assistant chat"
          onClick={() => void toggleOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              void toggleOpen(true);
            }
          }}
          className="group fixed right-8 bottom-24 z-50 flex w-72 cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl transition-shadow hover:shadow-2xl"
        >
          <button
            type="button"
            aria-label="Dismiss preview"
            onClick={(e) => {
              e.stopPropagation();
              dismissPreview();
            }}
            className="absolute -top-2 -right-2 hidden size-5 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground ring-1 ring-border group-hover:flex"
          >
            ✕
          </button>
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20">
            <Image
              src="/assets/images/head_ai.png"
              alt="AI"
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {lastAssistantMsg.content}
            </p>
            <p className="text-xs text-muted-foreground">
              BubbleBot
              {' • '}
              {formatMessageTime(lastAssistantMsg.createdAt)}
            </p>
          </div>
        </div>
      )}
      <Tooltip open={state.isOpen ? false : undefined}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Open AI Assistant"
            className={`fixed right-8 bottom-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary/70 shadow-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${!state.isOpen ? 'hover:-translate-y-1 hover:shadow-xl' : ''} `}
          >
            <div className="relative">
              <Image
                src="/assets/images/head_ai.png"
                alt="AI Assistant"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 size-3 rounded-full bg-destructive ring-2 ring-primary" />
              )}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Chat with AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
