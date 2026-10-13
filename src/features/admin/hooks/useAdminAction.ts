'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { toast } from 'sonner';

/**
 * Runs one admin server action in a transition: toasts the outcome and refreshes the page.
 * The users and plans hooks both use it, so their error handling stays the same.
 */
type TAdminActionRunner = {
  isPending: boolean;
  runAction: (action: () => Promise<unknown>, successMessage: string, onSuccess?: () => void) => void;
};

export function useAdminAction(failedMessage: string): TAdminActionRunner {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Errors show the message the API sent, such as "There must be at least one active admin".
  const runAction = useCallback((action: () => Promise<unknown>, successMessage: string, onSuccess?: () => void) => {
    startTransition(async () => {
      try {
        await action();
        onSuccess?.();
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : failedMessage);
      }
    });
  }, [router, failedMessage]);

  return { isPending, runAction };
}
