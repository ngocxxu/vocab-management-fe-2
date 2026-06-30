'use client';

import type { TToolActivity } from '@/types/chat';
import { RefreshCircle } from '@solar-icons/react/ssr';

type ToolChipProps = {
  toolActivity: TToolActivity;
};

export function ToolChip({ toolActivity }: ToolChipProps) {
  return (
    <div className="flex items-start gap-2 px-4">
      <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <RefreshCircle size={14} weight="Bold" className="animate-spin" />
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-xs leading-snug text-muted-foreground">
        {toolActivity.label}
      </div>
    </div>
  );
}
