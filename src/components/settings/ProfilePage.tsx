'use client';

import type { TUser } from '@/types/auth';
import type { TPlan } from '@/types/plan';
import type { TSrsSettings } from '@/types/srs-settings';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/libs/utils';
import { ProfileDangerZone } from './ProfileDangerZone';
import { ProfileIdentity } from './ProfileIdentity';
import { ProfilePlan } from './ProfilePlan';
import { ProfileSecurity } from './ProfileSecurity';
import { SettingsPageShell } from './SettingsPageShell';
import { SrsDefaultsSection } from './SrsDefaultsSection';

type ProfilePageProps = {
  currentUser?: TUser | null;
  currentPlan?: TPlan | null;
  srsSettings?: TSrsSettings | null;
};

// The order is the order of the tabs. Spaced repetition comes right after the account, because it is what people come back for.
// labelKey is a translation key under `settings.nav`.
const NAV_ITEMS = [
  { id: 'account', labelKey: 'account' },
  { id: 'spaced-repetition', labelKey: 'spacedRepetition' },
  { id: 'security', labelKey: 'security' },
  { id: 'plan', labelKey: 'plan' },
  { id: 'danger', labelKey: 'danger' },
] as const;

type TabId = (typeof NAV_ITEMS)[number]['id'];

const TAB_PREFIX = 'tab-';

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, currentPlan, srsSettings }) => {
  const t = useTranslations('settings');
  // The spaced repetition tab only exists when its settings loaded.
  const tabs = useMemo(() => NAV_ITEMS.filter(item => item.id !== 'spaced-repetition' || Boolean(srsSettings)), [srsSettings]);
  const [selected, setSelected] = useState<TabId>('account');
  const [isSrsDirty, setIsSrsDirty] = useState(false);
  const current = tabs.some(tab => tab.id === selected) ? selected : (tabs[0]?.id ?? 'account');

  // A link such as /profile#spaced-repetition opens that tab. The hash is kept in sync when a tab is picked.
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    const match = tabs.find(tab => tab.id === fromHash);
    if (match) {
      setSelected(match.id);
    }
  }, [tabs]);

  const selectTab = (id: TabId) => {
    setSelected(id);
    window.history.replaceState(null, '', `#${id}`);
  };

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) {
      return;
    }
    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    if (next) {
      selectTab(next.id);
      document.getElementById(`${TAB_PREFIX}${next.id}`)?.focus();
    }
  };

  const panel = (id: TabId, children: React.ReactNode) => (
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${TAB_PREFIX}${id}`} hidden={current !== id} className="min-w-0">
      {children}
    </div>
  );

  return (
    <SettingsPageShell
      title={t('profile.title')}
      description={t('profile.description')}
    >
      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div role="tablist" aria-label={t('tabsLabel')} aria-orientation="vertical" className="lg:sticky lg:top-8 lg:self-start">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {tabs.map((tab, index) => {
              const isSelected = current === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`${TAB_PREFIX}${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`${tab.id}-panel`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => selectTab(tab.id)}
                  onKeyDown={event => handleTabKeyDown(event, index)}
                  className={cn(
                    'flex shrink-0 items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {t(`nav.${tab.labelKey}`)}
                  {tab.id === 'spaced-repetition' && isSrsDirty && (
                    <span aria-label={t('profile.unsavedChanges')} className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          {panel('account', <ProfileIdentity currentUser={currentUser} currentPlan={currentPlan} />)}
          {srsSettings && panel('spaced-repetition', <SrsDefaultsSection settings={srsSettings} onDirtyChange={setIsSrsDirty} />)}
          {panel('security', <ProfileSecurity hasPassword={currentUser?.hasPassword ?? false} />)}
          {panel('plan', <ProfilePlan role={currentUser?.role ?? ''} currentPlan={currentPlan} />)}
          {panel('danger', <ProfileDangerZone />)}
        </div>
      </div>
    </SettingsPageShell>
  );
};
