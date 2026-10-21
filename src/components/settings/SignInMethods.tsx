'use client';

import type { ReactNode } from 'react';
import type { TAccountErrorCode } from '@/constants/auth';
import type { TSignInMethods } from '@/types/auth';
import { Key } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { addPasswordLogin } from '@/actions/auth';
import { isAccountErrorCode, LINK_START_PATH } from '@/constants/auth';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { SettingsSection } from './SettingsSection';
import { useSignInMethodsRefresh } from './useSignInMethodsRefresh';

// Brand mark: Solar has no Google logo, so its colours stay as drawn.
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

type TMethodRowProps = Readonly<{
  title: string;
  icon: ReactNode;
  status?: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
}>;

function MethodRow({ title, icon, status, hint, action }: TMethodRowProps) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-muted text-foreground">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{title}</p>
            {status}
          </div>
          {hint}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type TSignInMethodsProps = Readonly<{
  /** Null when the methods could not be loaded: the section then says so instead of disappearing. */
  signInMethods: TSignInMethods | null;
}>;

export const SignInMethods: React.FC<TSignInMethodsProps> = ({ signInMethods: initialSignInMethods }) => {
  const t = useTranslations('settings.signInMethods');
  const [isSending, startSending] = useTransition();
  const [signInMethods, setSignInMethods] = useState(initialSignInMethods);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isConnected = (id: string) => signInMethods?.methods.includes(id) ?? false;
  const isPasswordPending = !isConnected('password') && (signInMethods?.pending.includes('password') ?? false);

  useSignInMethodsRefresh(isPasswordPending, setSignInMethods);

  // The BE creates the password login and Auth0 emails the set-password link, so this is an API call, not a redirect.
  // Asking again while pending only resends the email.
  const addPassword = () => {
    startSending(async () => {
      try {
        await addPasswordLogin();
        setPasswordError(null);
        // Shows the pending state at once; the next focus check replaces it with what the server says.
        setSignInMethods(prev => prev && (prev.pending.includes('password') ? prev : { ...prev, pending: [...prev.pending, 'password'] }));
        toast.success(t('passwordSentToast'));
      } catch (error) {
        const code = error instanceof Error ? error.message : '';
        setPasswordError(t(`errors.${isAccountErrorCode(code) ? code : 'link_failed'}`));
      }
    });
  };

  // /api/auth/callback sends a finished link back here as ?link=success or ?link_error=<code>.
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const error = params.get('link_error');
    if (params.get('link') !== 'success' && !error) {
      return;
    }
    if (error) {
      const code: TAccountErrorCode | 'link_failed' = isAccountErrorCode(error) ? error : 'link_failed';
      toast.error(t(`errors.${code}`));
    } else {
      toast.success(t('success'));
    }
    globalThis.history.replaceState(null, '', `${globalThis.location.pathname}#security`);
  }, [t]);

  if (signInMethods === null) {
    return (
      <SettingsSection id="sign-in-methods" title={t('title')} description={t('description')}>
        <p role="alert" className="py-5 text-sm text-destructive">{t('loadFailed')}</p>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection id="sign-in-methods" title={t('title')} description={t('description')}>
      <MethodRow
        title={t('google')}
        icon={<GoogleIcon />}
        status={isConnected('google') && <Badge variant="secondary">{t('status.connected')}</Badge>}
        action={!isConnected('google') && (
          // A form POST on purpose: it sets a cookie and redirects off-site, so it must not be client-routed or prefetched.
          <form method="post" action={LINK_START_PATH}>
            <input type="hidden" name="method" value="google" />
            <Button type="submit" variant="outline" size="sm">{t('connectGoogle')}</Button>
          </form>
        )}
      />
      <MethodRow
        title={t('password')}
        icon={<Key className="size-5" aria-hidden="true" />}
        status={isConnected('password')
          ? <Badge variant="secondary">{t('status.connected')}</Badge>
          : isPasswordPending && <Badge variant="outline">{t('status.pending')}</Badge>}
        hint={isPasswordPending && <p role="status" className="mt-1 text-sm text-muted-foreground">{t('pendingHint')}</p>}
        action={!isConnected('password') && (
          <Button variant="outline" size="sm" disabled={isSending} onClick={addPassword}>
            {isPasswordPending ? t('resend') : t('addPassword')}
          </Button>
        )}
      />
      {passwordError && <p role="alert" className="pb-5 text-sm text-destructive">{passwordError}</p>}
    </SettingsSection>
  );
};
