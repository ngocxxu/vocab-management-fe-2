'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChangePasswordDialog } from '@/shared/ui/ChangePasswordDialog';
import { SettingRow, SettingsSection } from './SettingsSection';

type ProfileSecurityProps = {
  hasPassword: boolean;
};

export const ProfileSecurity: React.FC<ProfileSecurityProps> = ({ hasPassword }) => {
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  return (
    <SettingsSection
      id="security"
      title="Security"
      description="How you sign in and how your account is protected."
      footer={<ChangePasswordDialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen} hasPassword={hasPassword} />}
    >
      <SettingRow
        label={hasPassword ? 'Password' : 'Set a password'}
        description={hasPassword
          ? 'Update the password you use to sign in.'
          : 'Add a password so you can also sign in with email and password.'}
      >
        <Button variant="outline" onClick={() => setIsPasswordOpen(true)}>
          {hasPassword ? 'Change password' : 'Set password'}
        </Button>
      </SettingRow>

      {/* Not wired to the backend yet: shown disabled so it does not look like a working setting. */}
      <SettingRow label="Two-factor authentication" description="Ask for a verification code when you sign in. Coming soon.">
        <button
          type="button"
          role="switch"
          aria-label="Two-factor authentication"
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
