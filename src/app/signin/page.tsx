'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <SignInForm />
    </Suspense>
  );
}
