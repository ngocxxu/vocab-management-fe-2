'use client';

import type { TMessage } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/libs/utils';

type MessageBubbleProps = {
  message: TMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'USER';

  if (isUser) {
    return (
      <div className="flex justify-end px-4">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
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
      <div className={cn(
        'max-w-[75%] rounded-2xl rounded-tl-sm bg-card px-4 py-2.5 text-sm text-foreground',
        '[&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0',
        '[&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-foreground',
      )}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}
