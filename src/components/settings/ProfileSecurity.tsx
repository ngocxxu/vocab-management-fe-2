'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import type { TSignInMethods } from '@/types/auth';
import { Badge } from '@/shared/ui/badge';
import { SettingRow, SettingsSection } from './SettingsSection';
import { SignInMethods } from './SignInMethods';

type TProfileSecurityProps = Readonly<{
  /** Sign-in methods, or null when they could not be loaded (the section then shows an error). */
  signInMethods?: TSignInMethods | null;
}>;

export const ProfileSecurity: React.FC<TProfileSecurityProps> = ({ signInMethods }) => {
  const t = useTranslations('settings.security');

  return (
    <div className="space-y-6">
      <SignInMethods signInMethods={signInMethods ?? null} />
      <SettingsSection id="security" title={t('title')} description={t('description')}>
        {/* Not wired to the backend yet: shown disabled so it does not look like a working setting. */}
        <SettingRow label={t('twoFactor')} description={t('twoFactorHint')}>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{t('comingSoon')}</Badge>
            <button
              type="button"
              role="switch"
              aria-label={t('twoFactor')}
              aria-checked={false}
              disabled
              className="relative h-6 w-11 cursor-not-allowed rounded-full border border-input bg-muted opacity-60"
            >
              <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-card shadow" />
            </button>
          </div>
        </SettingRow>
      </SettingsSection>
    </div>
  );
};
