'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LINK_START_PATH } from '@/constants/auth';
import { SettingRow, SettingsSection } from './SettingsSection';

// The BE's labels for a connected method, with the translation keys for its row.
const METHODS = [
  { id: 'google', labelKey: 'google', connectKey: 'connectGoogle' },
  { id: 'password', labelKey: 'password', connectKey: 'addPassword' },
] as const;

const KNOWN_LINK_ERRORS = new Set([
  'identity_already_linked',
  'email_not_verified',
  'link_proof_stale',
  'link_nonce_invalid',
  'id_token_invalid',
  'link_session_changed',
  'link_failed',
]);

type SignInMethodsProps = Readonly<{
  /** Provider labels the User has connected (`google`, `password`). */
  methods: string[];
}>;

export const SignInMethods: React.FC<SignInMethodsProps> = ({ methods }) => {
  const t = useTranslations('settings.signInMethods');

  // /api/auth/callback sends a finished link back here as ?link=success or ?link_error=<code>.
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const error = params.get('link_error');
    if (params.get('link') !== 'success' && !error) {
      return;
    }
    if (error) {
      toast.error(t(`errors.${KNOWN_LINK_ERRORS.has(error) ? error : 'link_failed'}`));
    } else {
      toast.success(t('success'));
    }
    globalThis.history.replaceState(null, '', `${globalThis.location.pathname}#security`);
  }, [t]);

  return (
    <SettingsSection id="sign-in-methods" title={t('title')} description={t('description')}>
      {METHODS.map(({ id, labelKey, connectKey }) => (
        <SettingRow key={id} label={t(labelKey)}>
          {methods.includes(id)
            ? <span className="text-sm font-medium text-muted-foreground">{t('connected')}</span>
            : (
                // A plain link on purpose: it sets a cookie and redirects off-site, so it must not be client-routed or prefetched.
                <Button asChild variant="outline" size="sm">
                  <a href={`${LINK_START_PATH}?method=${id}`}>{t(connectKey)}</a>
                </Button>
              )}
        </SettingRow>
      ))}
    </SettingsSection>
  );
};
