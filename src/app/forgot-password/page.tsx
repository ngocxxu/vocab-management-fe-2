'use client';

import type { ForgotPasswordFormData } from '@/libs/validations/auth';
import { AltArrowRight, CheckCircle, Letter, StarFall } from '@solar-icons/react/ssr';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPassword } from '@/actions';
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
import { forgotPasswordSchema } from '@/libs/validations/auth';

const pageBg = '#F5F7FA';
const leftPanelBg = '#EFF4FC';
const logoSrc = '/assets/logo/logo-light-mode.png';

function LeftPanel() {
  return (
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
            AI-Powered Intelligence
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
  );
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    try {
      await resetPassword(data);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? (err as { message?: string }).message
        : null;
      setError(msg || 'Failed to send reset email. Please try again.');
    }
  };

  const layout = (
    <div
      className="flex min-h-screen items-center justify-center overflow-auto p-4"
      style={{
        backgroundColor: pageBg,
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="relative flex h-[1024px] w-[1280px] shrink-0 overflow-hidden rounded-2xl shadow-xl">
        <LeftPanel />
        <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center overflow-auto px-8 py-10">
          <div className="mx-auto w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-xl">
            {success
              ? (
                  <>
                    <div className="flex justify-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle size={24} weight="BoldDuotone" className="text-primary" />
                      </div>
                    </div>
                    <h2 className="mt-4 text-center font-sans text-2xl font-bold text-foreground">
                      Check your email
                    </h2>
                    <p className="mt-2 text-center font-sans text-sm text-muted-foreground">
                      We&apos;ve sent a password reset link to
                      {' '}
                      <strong>{form.getValues('email')}</strong>
                    </p>
                    <Alert className="mt-6">
                      <AlertDescription>
                        If you don&apos;t see the email in your inbox, please check your spam folder.
                      </AlertDescription>
                    </Alert>
                    <div className="mt-6 space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full"
                        onClick={() => {
                          setSuccess(false);
                          form.reset();
                        }}
                      >
                        Send another email
                      </Button>
                      <Link href="/signin" className="block">
                        <Button variant="ghost" className="h-11 w-full">
                          Back to sign in
                        </Button>
                      </Link>
                    </div>
                  </>
                )
              : (
                  <>
                    <h2 className="font-sans text-2xl font-bold text-foreground">Forgot Password</h2>
                    <p className="mt-1 font-sans text-sm text-muted-foreground">
                      Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
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
                        <Button
                          type="submit"
                          className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
                          <AltArrowRight size={18} weight="BoldDuotone" className="ml-2" />
                        </Button>
                        <p className="text-center font-sans text-sm text-muted-foreground">
                          Remember your password?
                          {' '}
                          <Link href="/signin" className="font-semibold text-primary hover:underline">
                            Sign in
                          </Link>
                        </p>
                      </form>
                    </Form>
                  </>
                )}
          </div>
        </div>
      </div>
    </div>
  );

  return layout;
}
