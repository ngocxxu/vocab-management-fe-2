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

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'USER';

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
        {isSending && (
          <ClockCircle
            size={14}
            className="mr-0.5 text-muted-foreground"
            aria-label="Sending"
          />
        )}
        {isFailed && (
          <button
            type="button"
            onClick={onRetry}
            className="mr-0.5 flex items-center gap-1 text-xs text-destructive hover:underline"
            aria-label="Retry sending message"
          >
            <DangerCircle size={14} />
            Failed · Tap to retry
          </button>
        )}
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
      <div className={cn(
        'max-w-[75%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm text-foreground',
        '[&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0',
        '[&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-foreground',
      )}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}
