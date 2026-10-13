'use client';

import type { TBroadcastHistoryItem } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';

type TBroadcastRowActionsProps = Readonly<{
  broadcast: TBroadcastHistoryItem;
  isPending: boolean;
  onToggle: (broadcast: TBroadcastHistoryItem) => void;
  onDelete: (broadcast: TBroadcastHistoryItem) => void;
}>;

/** Switch-off and delete for one broadcast row. The page owns the dialogs; the row only reports the choice. */
export function BroadcastRowActions({ broadcast, isPending, onToggle, onDelete }: TBroadcastRowActionsProps) {
  const t = useTranslations('admin.broadcasts');

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" disabled={isPending} onClick={() => onToggle(broadcast)}>
        {t(broadcast.isActive ? 'history.deactivate' : 'history.activate')}
      </Button>
      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={isPending} onClick={() => onDelete(broadcast)}>
        {t('history.delete')}
      </Button>
    </div>
  );
}
