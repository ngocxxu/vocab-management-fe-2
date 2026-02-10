'use client';

import type { TSettings } from '@/types/settings';
import React, { useState } from 'react';
import { ProfileSection } from './ProfileSection';
import { SettingsPageShell } from './SettingsPageShell';

const defaultSettings: TSettings = {
  profile: {
    id: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    avatar: '',
    role: '',
    isActive: false,
  },
  timezone: {
    city: 'New York',
    timezone: 'UTC-4',
    dateTimeFormat: 'dd/mm/yyyy 00:00',
  },
  motivation: {
    desiredDailyTimeUtilization: 7,
    desiredDailyCoreWorkRange: {
      start: 3,
      end: 6,
    },
  },
  work: {
    function: 'Design',
    jobTitle: 'Team Lead designer',
    responsibilities: '',
  },
};

export const ProfilePage: React.FC = () => {
  const [_settings, setSettings] = useState<TSettings>(defaultSettings);

  const handleProfileChangeAction = (profile: Partial<TSettings['profile']>) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  };

  return (
    <SettingsPageShell
      title="Profile"
      description="Manage your personal profile information and application settings."
    >
      <ProfileSection onProfileChangeAction={handleProfileChangeAction} />
    </SettingsPageShell>
  );
};
