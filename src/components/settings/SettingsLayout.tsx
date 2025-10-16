'use client';

import type { TSettings, TSettingsTab } from '@/types/settings';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSection } from './ProfileSection';
import { SubjectSection } from './SubjectSection';

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

export const SettingsLayout: React.FC = () => {
  const [_settings, setSettings] = useState<TSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<TSettingsTab>('account');

  const handleProfileChangeAction = (profile: Partial<TSettings['profile']>) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  };

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'subjects', label: 'Subjects' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/30">
      <div className="container mx-auto flex flex-col gap-10 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Settings
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as TSettingsTab)}>
          <TabsList className="mb-8 grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <ProfileSection
              onProfileChangeAction={handleProfileChangeAction}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="py-12 text-center">
              <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                Notifications Settings
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Notification preferences will be available here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <SubjectSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
