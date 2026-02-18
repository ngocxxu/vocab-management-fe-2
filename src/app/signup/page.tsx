'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <SignUpForm />
    </Suspense>
  );
}
