'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LoadingComponent } from '@/shared/ui/shared';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { logger } from '@/libs/Logger';
import { supabase } from '@/libs/supabase';

function getSafeRedirectPath(value: string | null, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  try {
    const url = new URL(value, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

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

        if (!accessToken || !refreshToken) {
          throw new Error('No access token or refresh token in session');
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

        const redirectTo = getSafeRedirectPath(searchParams.get('redirect'), '/dashboard');
        router.push(redirectTo);
      } catch (err) {
        logger.error('Auth callback error:', { error: err });
        setError(err instanceof Error ? err.message : 'Failed to complete sign in');
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
