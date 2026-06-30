'use client';

import type { TConfirmRequest } from '@/types/chat';
import { ClockCircle } from '@solar-icons/react/ssr';
import { useChat } from '@/providers/ChatProvider';
import { useConfirmTimeout } from '../hooks/useConfirmTimeout';

type ConfirmOverlayProps = {
  confirmRequest: TConfirmRequest;
};

export function ConfirmOverlay({ confirmRequest }: ConfirmOverlayProps) {
  const { confirmResponse } = useChat();

  const remaining = useConfirmTimeout(
    true,
    30,
    () => confirmResponse(confirmRequest.requestId, false),
  );

  const paramsSummary = Object.entries(confirmRequest.params)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(', ');

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-2xl bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <ClockCircle size={28} weight="BoldDuotone" className="text-primary" />
      </div>

      <div className="space-y-2 text-center">
        <p className="text-base font-semibold text-foreground">Action Confirmation Required</p>
        <p className="text-sm text-muted-foreground">
          {`The AI is about to perform: `}
          <span className="font-medium text-foreground">{confirmRequest.action}</span>
          {paramsSummary ? `. ${paramsSummary}` : ''}
        </p>
      </div>

      <p className="text-sm font-semibold text-primary">
        {`Confirming action in ${remaining}s…`}
      </p>

      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={() => confirmResponse(confirmRequest.requestId, true)}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Confirm Now
        </button>
        <button
          type="button"
          onClick={() => confirmResponse(confirmRequest.requestId, false)}
          className="w-full rounded-2xl bg-muted py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
