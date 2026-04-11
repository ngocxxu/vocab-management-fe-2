'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LoadingComponent } from '@/shared/ui/shared';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { supabase } from '@/libs/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [_, setIsLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session) {
          throw new Error('No session found. Please try signing in again.');
        }

        const accessToken = session.access_token;
        const refreshToken = session.refresh_token;

        if (!accessToken) {
          throw new Error('No access token in session');
        }

        const response = await fetch('/api/auth/oauth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ accessToken, refreshToken }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to sync OAuth');
        }

        await response.json();

        const redirectTo = searchParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete OAuth sign in');
        setIsLoading(false);

        timeoutId = setTimeout(() => {
          router.push('/signin');
        }, 3000);
      }
    };

    handleCallback();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Redirecting to sign in page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadingComponent
      title="Completing sign in..."
    />
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={(
        <LoadingComponent
          title="Loading..."
        />
      )}
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
