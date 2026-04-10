'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { ForgotPasswordForm } from '@/features/auth/ui/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
