'use client';

import { useChat } from '@/providers/ChatProvider';

const QUICK_ACTIONS = [
  { label: 'Take a Quiz', message: 'Create a quiz for my vocabulary' },
  { label: 'Review Words', message: 'Review my vocabulary words' },
  { label: 'Ask a Question', message: 'I have a question about my vocab' },
] as const;

export function QuickActions() {
  const { sendMessage, state } = useChat();

  if (state.messages.length > 0) {
    return null;
  }

  return (
    <div className="px-4 pb-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Quick Actions
      </p>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.label}
            type="button"
            onClick={() => sendMessage(action.message)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
