'use client';

import type { SignUpFormData } from '@/libs/validations/auth';
import { AltArrowRight, Letter, LockPassword, StarFall } from '@solar-icons/react/ssr';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRole } from '@/constants/auth';
import { Env } from '@/libs/Env';
import { supabase } from '@/libs/supabase';
import { signUpSchema } from '@/libs/validations/auth';
import { authApi } from '@/utils/client-api';

function EyeIcon({ open }: Readonly<{ open: boolean }>) {
  if (open) {
    return (
      <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const logoSrc = '/assets/logo/logo-light-mode.png';

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setErrorMessage('');
    try {
      const signupData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        avatar: '',
        role: UserRole.STAFF,
      };
      await authApi.signup(signupData);
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      globalThis.location.href = redirectTo;
    } catch (err) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      setErrorMessage(msg || (err instanceof Error ? err.message : 'Failed to create account. Please try again.'));
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
        options: { redirectTo: callbackUrl },
      });
      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to sign in with provider. Please try again.');
      setIsOAuthLoading(false);
    }
  };

  const pageBg = '#F5F7FA';
  const leftPanelBg = '#EFF4FC';

  return (
    <div
      className="flex min-h-screen items-center justify-center overflow-auto p-4"
      style={{
        backgroundColor: pageBg,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="relative flex h-[1024px] w-[1280px] shrink-0 overflow-hidden rounded-2xl shadow-xl">
        <aside
          className="relative flex min-w-0 flex-[0_0_45%] flex-col justify-between overflow-hidden px-8 py-10"
          style={{ backgroundColor: leftPanelBg }}
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden
          />
          <div className="relative">
            <div className="flex items-center gap-3 2xl:gap-4">
              <div className="relative size-10 shrink-0 min-[1600px]:size-16 2xl:size-14">
                <Image
                  src={logoSrc}
                  alt="Vocab"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <span className="font-sans text-xl font-bold text-foreground uppercase min-[1600px]:text-4xl 2xl:text-3xl">Vocab</span>
                <p className="font-sans text-xs tracking-wide text-primary uppercase min-[1600px]:text-lg 2xl:text-base">PRECISION LEARNING</p>
              </div>
            </div>
            <div className="mt-16 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 min-[1600px]:mt-32 min-[1600px]:px-6 min-[1600px]:py-3 min-[1600px]:text-xl 2xl:mt-24 2xl:px-5 2xl:py-2.5 2xl:text-lg">
              <StarFall size={18} weight="BoldDuotone" className="text-primary-foreground min-[1600px]:size-6 2xl:size-5" />
              <span className="font-sans text-sm font-medium text-primary-foreground uppercase min-[1600px]:text-xl 2xl:text-lg">
                AI-Powered Precision Learning
              </span>
            </div>
            <h1 className="mt-8 font-sans text-2xl leading-tight font-bold text-foreground min-[1600px]:text-6xl min-[1600px]:tracking-tight sm:text-3xl 2xl:mt-10 2xl:text-5xl 2xl:leading-tight">
              Master any language with
              {' '}
              <span className="text-primary">Precision.</span>
            </h1>
            <p className="mt-4 font-sans text-base leading-relaxed text-muted-foreground min-[1600px]:text-2xl 2xl:mt-6 2xl:text-xl">
              Our neural-spaced repetition system adapts to your pace, ensuring 98% retention through science-backed algorithms.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-8 min-[1600px]:gap-12 2xl:mt-12 2xl:gap-10">
              <div>
                <p className="font-sans text-xl font-bold text-foreground min-[1600px]:text-4xl 2xl:text-3xl">98%</p>
                <p className="font-sans text-sm text-muted-foreground uppercase min-[1600px]:text-xl 2xl:text-lg">Retention Rate</p>
              </div>
              <div>
                <p className="font-sans text-xl font-bold text-foreground min-[1600px]:text-4xl 2xl:text-3xl">15+</p>
                <p className="font-sans text-sm text-muted-foreground uppercase min-[1600px]:text-xl 2xl:text-lg">Global Languages</p>
              </div>
            </div>
          </div>
          <p className="relative mt-auto pt-8 font-sans text-xs text-muted-foreground uppercase min-[1600px]:text-lg 2xl:text-base">
            ©
            {new Date().getFullYear()}
            {' '}
            Ngoc Quach. All rights reserved.
          </p>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center overflow-auto px-8 py-10">
          <div className="mx-auto w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-xl">
            <h2 className="font-sans text-2xl font-bold text-foreground">Create Account</h2>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              Sign up to get started with your vocabulary management.
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border"
                onClick={() => handleProviderSignIn('google')}
                disabled={isOAuthLoading || form.formState.isSubmitting}
              >
                {isOAuthLoading
                  ? (
                      <span className="text-sm">Connecting...</span>
                    )
                  : (
                      <>
                        <svg className="mr-2 size-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" className="text-[#4285F4]" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" className="text-[#34A853]" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" className="text-[#FBBC05]" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" className="text-[#EA4335]" />
                        </svg>
                        <span className="text-sm">Google</span>
                      </>
                    )}
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 font-sans text-xs text-muted-foreground uppercase">
                  OR CONTINUE WITH EMAIL
                </span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground uppercase">First Name</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="John" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground uppercase">Last Name</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Doe" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground uppercase">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Letter
                            size={18}
                            weight="BoldDuotone"
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            className="h-11 pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground uppercase">Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="h-11"
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
                      <FormLabel className="text-foreground uppercase">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockPassword
                            size={18}
                            weight="BoldDuotone"
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            className="h-11 pr-10 pl-10"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            <EyeIcon open={showPassword} />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground uppercase">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockPassword
                            size={18}
                            weight="BoldDuotone"
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            className="h-11 pr-10 pl-10"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirmPassword(v => !v)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            <EyeIcon open={showConfirmPassword} />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
                  <AltArrowRight size={18} weight="BoldDuotone" className="ml-2" />
                </Button>

                <p className="text-center font-sans text-sm text-muted-foreground">
                  Already have an account?
                  {' '}
                  <Link href="/signin" className="font-semibold text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <SignUpContent />
    </Suspense>
  );
}
