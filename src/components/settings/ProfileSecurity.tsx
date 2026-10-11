'use client';

import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChangePasswordDialog } from '@/shared/ui/ChangePasswordDialog';
import { SettingRow, SettingsSection } from './SettingsSection';

type ProfileSecurityProps = {
  hasPassword: boolean;
};

export const ProfileSecurity: React.FC<ProfileSecurityProps> = ({ hasPassword }) => {
  const t = useTranslations('settings.security');
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  return (
    <SettingsSection
      id="security"
      title={t('title')}
      description={t('description')}
      footer={<ChangePasswordDialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen} hasPassword={hasPassword} />}
    >
      <SettingRow
        label={hasPassword ? t('passwordLabel') : t('setPasswordLabel')}
        description={hasPassword ? t('updateHint') : t('addHint')}
      >
        <Button variant="outline" onClick={() => setIsPasswordOpen(true)}>
          {hasPassword ? t('changePassword') : t('setPassword')}
        </Button>
      </SettingRow>

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
  );
};
