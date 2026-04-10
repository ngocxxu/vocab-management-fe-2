'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { SignUpForm } from '@/features/auth/ui/SignUpForm';

export default function SignUpPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <SignUpForm />
    </Suspense>
  );
}
