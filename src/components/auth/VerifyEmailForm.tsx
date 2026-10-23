'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { resendVerificationEmail } from '@/actions/auth';
import { LOGIN_PATH, RESEND_COOLDOWN_SECONDS } from '@/constants/auth';
import { Button } from '@/shared/ui/button';

const MS_PER_SECOND = 1000;

/**
 * Sends a new verification link to the login that was just refused. No address is asked for: the BE emails the one stored
 * on that login. The BE enforces the cooldown too; the countdown here only keeps the button from being offered too early.
 */
export function VerifyEmailForm({ canResend }: Readonly<{ canResend: boolean }>) {
  const t = useTranslations('auth.verifyEmail');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [isPending, startSending] = useTransition();

  const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - now) / MS_PER_SECOND));

  // Ticks only while the cooldown runs, and stops once it is over.
  useEffect(() => {
    if (cooldownUntil === 0) {
      return undefined;
    }
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= cooldownUntil) {
        clearInterval(timer);
      }
    }, MS_PER_SECOND);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  const send = () => {
    setError(null);
    startSending(async () => {
      try {
        await resendVerificationEmail();
        const started = Date.now();
        setNow(started);
        setCooldownUntil(started + RESEND_COOLDOWN_SECONDS * MS_PER_SECOND);
        setSent(true);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : t('failed'));
      }
    });
  };

  const inCooldown = secondsLeft > 0;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </header>

      {canResend
        ? (
            <div className="space-y-4">
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="button" className="w-full" disabled={isPending || inCooldown} onClick={send}>
                {isPending ? t('submitting') : inCooldown ? t('cooling', { seconds: secondsLeft }) : t('submit')}
              </Button>
            </div>
          )
        : <p role="status" className="text-sm text-muted-foreground">{t('expired')}</p>}

      {sent && <p role="status" className="text-sm text-muted-foreground">{t('sent')}</p>}

      {/* A plain link on purpose: the sign-in route sets a cookie and redirects off-site, so it must not be client-routed. */}
      <p className="text-center text-sm">
        <a href={LOGIN_PATH} className="font-medium text-primary underline underline-offset-4">{t('backToSignIn')}</a>
      </p>
    </div>
  );
}
