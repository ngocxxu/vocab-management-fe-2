'use client';

import type { TBroadcastHistoryItem } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { BroadcastComposeForm } from './BroadcastComposeForm';
import { BroadcastHistoryList } from './BroadcastHistoryList';

type TAdminBroadcastPanelProps = Readonly<{
  broadcasts: TBroadcastHistoryItem[];
}>;

/** The broadcast page: compose on top, the sent history below it. */
export function AdminBroadcastPanel({ broadcasts }: TAdminBroadcastPanelProps) {
  const t = useTranslations('admin.broadcasts');

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="admin-broadcast-compose" className="flex max-w-2xl flex-col gap-4">
        <h2 id="admin-broadcast-compose" className="text-lg font-semibold">{t('sections.compose')}</h2>
        <BroadcastComposeForm />
      </section>

      <section aria-labelledby="admin-broadcast-history" className="flex flex-col gap-4">
        <h2 id="admin-broadcast-history" className="text-lg font-semibold">{t('sections.history')}</h2>
        <BroadcastHistoryList broadcasts={broadcasts} />
      </section>
    </div>
  );
}
