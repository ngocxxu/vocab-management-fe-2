'use client';

import type { TToolActivity } from '@/types/chat';

type ToolChipProps = {
  toolActivity: TToolActivity;
};

export function ToolChip({ toolActivity }: ToolChipProps) {
  return (
    <div className="flex items-start gap-2 px-4">
      <div className="size-7 shrink-0" />
      <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
        <span className="size-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
        {toolActivity.label}
      </div>
    </div>
  );
}
