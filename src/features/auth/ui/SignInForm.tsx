'use client';

import type { SignInFormData } from '@/libs/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { AltArrowRight, Letter, LockPassword } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon } from '@/components/auth/EyeIcon';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { signInSchema } from '@/libs/validations/auth';
import { useAuthMutations } from '../hooks/useAuthMutations';
import { AuthLeftPanel } from './AuthLeftPanel';

const pageBg = '#F5F7FA';

function useRedirectTarget() {
  const searchParams = useSearchParams();
  return useMemo(() => searchParams.get('redirect') || '/dashboard', [searchParams]);
}

function SignInForm() {
  const t = useTranslations('auth');
  const redirectTo = useRedirectTarget();
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const { errorMessage, isOAuthLoading, signin, signInWithProvider } = useAuthMutations();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      await signin(data);
      globalThis.location.href = redirectTo;
    } catch {}
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithProvider('google', redirectTo);
    } catch {}
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center overflow-auto p-4"
      style={{
        backgroundColor: pageBg,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="relative flex w-full max-w-[1280px] shrink-0 overflow-hidden rounded-2xl shadow-xl lg:h-[1024px]">
        <AuthLeftPanel />

        <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center overflow-auto px-8 py-10">
          <div className="mx-auto w-full max-w-md rounded-2xl bg-card px-8 py-10 shadow-xl">
            <h2 className="font-sans text-2xl font-bold text-foreground">{t('signIn.title')}</h2>
            <p className="mt-1 font-sans text-sm text-muted-foreground">{t('signIn.subtitle')}</p>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border"
                onClick={handleGoogleSignIn}
                disabled={isOAuthLoading || form.formState.isSubmitting}
              >
                {isOAuthLoading
                  ? <span className="text-sm">{t('common.connecting')}</span>
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
                <span className="bg-card px-2 font-sans text-xs text-muted-foreground uppercase">{t('common.orContinueWithEmail')}</span>
              </div>
            </div>

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
                      <FormLabel className="text-foreground uppercase">{t('common.emailAddress')}</FormLabel>
                      <div className="relative">
                        <Letter size={18} weight="BoldDuotone" className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                          <Input type="email" placeholder="name@company.com" className="h-11 pl-10" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-foreground uppercase">{t('common.password')}</FormLabel>
                        <Link href="/forgot-password" className="text-sm font-medium text-primary uppercase hover:underline">
                          {t('signIn.forgotPassword')}
                        </Link>
                      </div>
                      <div className="relative">
                        <LockPassword size={18} weight="BoldDuotone" className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                          <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="h-11 pr-10 pl-10" {...field} />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(v => !v)}
                          aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                        >
                          <EyeIcon open={showPassword} />
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="keep-signed-in"
                    checked={keepSignedIn}
                    onCheckedChange={v => setKeepSignedIn(v === true)}
                    className="h-4 w-4 rounded-full"
                  />
                  <label htmlFor="keep-signed-in" className="cursor-pointer font-sans text-sm text-muted-foreground">
                    {t('signIn.keepSignedIn')}
                  </label>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? t('signIn.submitting') : t('signIn.submit')}
                  <AltArrowRight size={18} weight="BoldDuotone" className="ml-2" />
                </Button>

                <p className="text-center font-sans text-sm text-muted-foreground">
                  {t('signIn.noAccount')}
                  {' '}
                  <Link href="/signup" className="font-semibold text-primary hover:underline">
                    {t('signIn.createAccount')}
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

export { SignInForm };
export default SignInForm;
