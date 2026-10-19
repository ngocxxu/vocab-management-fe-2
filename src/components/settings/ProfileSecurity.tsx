'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import { SettingRow, SettingsSection } from './SettingsSection';
import { SignInMethods } from './SignInMethods';

type ProfileSecurityProps = Readonly<{
  /** Connected sign-in methods, or null when they could not be loaded (the section is then left out). */
  signInMethods?: string[] | null;
}>;

export const ProfileSecurity: React.FC<ProfileSecurityProps> = ({ signInMethods }) => {
  const t = useTranslations('settings.security');

  return (
    <div className="space-y-6">
      {signInMethods && <SignInMethods methods={signInMethods} />}
      <SettingsSection id="security" title={t('title')} description={t('description')}>
        {/* Not wired to the backend yet: shown disabled so it does not look like a working setting. */}
        <SettingRow label={t('twoFactor')} description={t('twoFactorHint')}>
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
        </SettingRow>
      </SettingsSection>
    </div>
  );
};
