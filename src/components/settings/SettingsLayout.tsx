'use client';

import type { TSettings, TSettingsTab } from '@/types/settings';
import type { TSubjectResponse } from '@/types/subject';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSection } from './ProfileSection';
import { SubjectSection } from './SubjectSection';

type SettingsLayoutProps = {
  initialSubjectsData?: TSubjectResponse;
};

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

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ initialSubjectsData }) => {
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
    { id: 'subjects', label: 'Subjects' },
    { id: 'notifications', label: 'Notifications' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex flex-col gap-10 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
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

          <TabsContent value="subjects" className="space-y-6">
            <SubjectSection initialSubjectsData={initialSubjectsData} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="py-12 text-center">
              <h3 className="mb-2 text-lg font-medium text-foreground">
                Notifications Settings
              </h3>
              <p className="text-muted-foreground">
                Notification preferences will be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
