'use client';

import type { ForgotPasswordFormData } from '@/libs/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { AltArrowRight, CheckCircle, Letter } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPassword } from '@/actions';
import { forgotPasswordSchema } from '@/libs/validations/auth';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { AuthLeftPanel } from './AuthLeftPanel';

const pageBg = '#F5F7FA';

function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const reset = useCallback(() => {
    setSuccess(false);
    form.reset();
  }, [form]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    try {
      await resetPassword(data);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? (err as { message?: string }).message
        : null;
      setError(msg || t('errors.resetPassword'));
    }
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
            {success
              ? (
                  <>
                    <div className="flex justify-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle size={24} weight="BoldDuotone" className="text-primary" />
                      </div>
                    </div>
                    <h2 className="mt-4 text-center font-sans text-2xl font-bold text-foreground">{t('common.checkYourEmail')}</h2>
                    <p className="mt-2 text-center font-sans text-sm text-muted-foreground">
                      {t.rich('forgotPassword.sentTo', {
                        email: form.getValues('email'),
                        strong: chunks => <strong>{chunks}</strong>,
                      })}
                    </p>
                    <Alert className="mt-6">
                      <AlertDescription>
                        {t('common.spamHint')}
                      </AlertDescription>
                    </Alert>
                    <div className="mt-6 space-y-3">
                      <Button type="button" variant="outline" className="h-11 w-full" onClick={reset}>
                        {t('forgotPassword.sendAnother')}
                      </Button>
                      <Link href="/signin" className="block">
                        <Button variant="ghost" className="h-11 w-full">{t('common.backToSignIn')}</Button>
                      </Link>
                    </div>
                  </>
                )
              : (
                  <>
                    <h2 className="font-sans text-2xl font-bold text-foreground">{t('forgotPassword.title')}</h2>
                    <p className="mt-1 font-sans text-sm text-muted-foreground">
                      {t('forgotPassword.subtitle')}
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
                        <Button type="submit" className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
                          <AltArrowRight size={18} weight="BoldDuotone" className="ml-2" />
                        </Button>
                        <p className="text-center font-sans text-sm text-muted-foreground">
                          {t('forgotPassword.rememberPassword')}
                          {' '}
                          <Link href="/signin" className="font-semibold text-primary hover:underline">{t('common.signInLink')}</Link>
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
}

export { ForgotPasswordForm };
export default ForgotPasswordForm;
