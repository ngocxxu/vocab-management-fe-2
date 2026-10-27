'use client';

import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { PAGE_CONTAINER_CLASS } from '@/components/shared/page-layout';
import ErrorState from '@/shared/ui/ErrorState';

type TErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error }: TErrorProps) {
  const t = useTranslations('shell.errors');

  // A React error boundary stops propagation, so nothing reaches Sentry's
  // global handlers on its own. Without this the dashboard can be broken for
  // every user and no issue is ever raised. Mirrors global-error.tsx.
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className={PAGE_CONTAINER_CLASS}>
        <ErrorState message={error.message || t('loadDashboard')} />
      </div>
    </main>
  );
}
