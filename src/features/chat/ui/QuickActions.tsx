'use client';

import { useTranslations } from 'next-intl';
import { useChat } from '@/providers/ChatProvider';

export function QuickActions() {
  const t = useTranslations('chat.quick');
  const { sendMessage, state } = useChat();

  const QUICK_ACTIONS = [
    { label: t('quiz'), message: t('quizMessage') },
    { label: t('review'), message: t('reviewMessage') },
    { label: t('question'), message: t('questionMessage') },
  ];

  if (state.messages.length > 0) {
    return null;
  }

  return (
    <div className="px-4 pb-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('title')}
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
