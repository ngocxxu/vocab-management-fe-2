'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
