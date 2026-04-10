'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { SignInForm } from '@/features/auth/ui/SignInForm';

export default function SignInPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <SignInForm />
    </Suspense>
  );
}
