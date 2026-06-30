'use client';

import type { TMessage } from '@/types/chat';
import { ClockCircle, DangerCircle } from '@solar-icons/react/ssr';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/libs/utils';

type MessageBubbleProps = {
  message: TMessage;
  onRetry?: () => void;
};

export function formatMessageTime(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'USER';
  const timeLabel = formatMessageTime(message.createdAt);

  if (isUser) {
    const isSending = message.status === 'sending';
    const isFailed = message.status === 'failed';

    return (
      <div className="flex flex-col items-end gap-1 px-4">
        <div
          className={cn(
            'max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground',
            isSending && 'opacity-60',
          )}
        >
          {message.content}
        </div>
        <div className="mr-0.5 flex items-center gap-1.5">
          {timeLabel && !isFailed && (
            <time dateTime={message.createdAt} className="text-[11px] text-muted-foreground">
              {timeLabel}
            </time>
          )}
          {isSending && (
            <ClockCircle
              size={14}
              className="text-muted-foreground"
              aria-label="Sending"
            />
          )}
          {isFailed && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1 text-xs text-destructive hover:underline"
              aria-label="Retry sending message"
            >
              <DangerCircle size={14} />
              Failed · Tap to retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 px-4">
      <Image
        src="/assets/images/head_ai.png"
        alt="AI"
        width={28}
        height={28}
        className="mt-1 shrink-0 rounded-full object-cover"
      />
      <div className="flex max-w-[75%] flex-col items-start gap-1">
        <div className={cn(
          'rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground',
          '[&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0',
          '[&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-foreground',
        )}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {timeLabel && (
          <time dateTime={message.createdAt} className="ml-0.5 text-[11px] text-muted-foreground">
            {timeLabel}
          </time>
        )}
      </div>
    </div>
  );
}
