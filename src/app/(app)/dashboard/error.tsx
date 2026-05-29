'use client';

import ErrorState from '@/shared/ui/ErrorState';

type TErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error }: TErrorProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
      <div className="container mx-auto">
        <ErrorState message={error.message || 'Failed to load dashboard'} />
      </div>
    </main>
  );
}
