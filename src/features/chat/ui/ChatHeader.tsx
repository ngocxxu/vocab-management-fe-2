'use client';

import Image from 'next/image';
import { CloseCircle } from '@solar-icons/react/ssr';
import { useChat } from '@/providers/ChatProvider';

export function ChatHeader() {
  const { toggleOpen } = useChat();

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <div className="relative shrink-0">
        <Image
          src="/assets/images/head_ai.png"
          alt="AI Assistant"
          width={42}
          height={42}
          className="rounded-full object-cover"
        />
        <span className="absolute right-0 bottom-0 size-3 rounded-full bg-success ring-2 ring-card" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">AI Assistant</p>
        <p className="text-xs font-medium text-success">Online</p>
      </div>
      <button
        type="button"
        onClick={() => void toggleOpen(false)}
        aria-label="Close chat"
        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CloseCircle size={18} weight="BoldDuotone" />
      </button>
    </div>
  );
}
