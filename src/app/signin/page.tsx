'use client';

import type { SignInFormData } from '@/libs/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Env } from '@/libs/Env';
import { supabase } from '@/libs/supabase';
import { signInSchema } from '@/libs/validations/auth';
import { authApi } from '@/utils/client-api';

function SignInForm() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setErrorMessage('');

    try {
      // Use client API which calls /api/auth/signin route
      // This route forwards Set-Cookie from NestJS, ensuring cookie is set properly
      await authApi.signin(data);
      const redirectTo = searchParams.get('redirect') || '/dashboard';

      // Use window.location for full page reload so middleware can detect cookie
      globalThis.location.href = redirectTo;
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || error?.message || 'Failed to sign in. Please try again.');
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'apple' | 'facebook' | 'twitter') => {
    setIsOAuthLoading(true);
    setErrorMessage('');

    try {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      const origin = (typeof globalThis !== 'undefined' && globalThis.location.origin)
        ? globalThis.location.origin
        : Env.NEXT_PUBLIC_APP_URL;

      if (!origin) {
        throw new Error('Origin URL could not be determined');
      }

      const callbackUrl = `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to sign in with Google. Please try again.');
      setIsOAuthLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 px-4 pt-6 sm:px-6 sm:pt-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
            <span className="text-xl font-bold text-white">V</span>
          </div>
        </div>
        <CardTitle className="text-center text-xl sm:text-2xl">Welcome back</CardTitle>
        <CardDescription className="text-center text-sm text-gray-600 sm:text-base dark:text-gray-400">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-6 sm:px-6 sm:pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 dark:bg-slate-900 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => handleProviderSignIn('google')}
              disabled={isOAuthLoading || form.formState.isSubmitting}
            >
              {isOAuthLoading
                ? (
                    'Connecting...'
                  )
                : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Sign In with Google
                    </>
                  )}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?
              {' '}
              <Link
                href="/signup"
                className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400"
              >
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-8 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
