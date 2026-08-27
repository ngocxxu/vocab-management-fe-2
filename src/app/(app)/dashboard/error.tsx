'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import ErrorState from '@/shared/ui/ErrorState';

type TErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error }: TErrorProps) {
  // A React error boundary stops propagation, so nothing reaches Sentry's
  // global handlers on its own. Without this the dashboard can be broken for
  // every user and no issue is ever raised. Mirrors global-error.tsx.
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
      <div className="container mx-auto">
        <ErrorState message={error.message || 'Failed to load dashboard'} />
      </div>
    </main>
  );
}
