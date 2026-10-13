'use client';

import type { TAiSettings } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useAdminSystemActions } from '../hooks/useAdminSystemActions';
import { AiSettingField } from './AiSettingField';

type TAiSettingsPanelProps = Readonly<{
  settings: TAiSettings;
}>;

// Each row is one use case, so the provider sits beside its model.
const FIELDS = [
  { settingKey: 'ai.chat.provider', control: 'provider', labelKey: 'fields.chatProvider' },
  { settingKey: 'ai.chat.model', control: 'model', labelKey: 'fields.chatModel' },
  { settingKey: 'ai.audio.provider', control: 'provider', labelKey: 'fields.audioProvider' },
  { settingKey: 'ai.audio.model', control: 'model', labelKey: 'fields.audioModel' },
] as const;

/** The four AI settings. Each field is keyed by its stored value, so a save remounts it with the value the server returned. */
export function AiSettingsPanel({ settings }: TAiSettingsPanelProps) {
  const t = useTranslations('admin.system.ai');
  const { isPending, saveAiSetting } = useAdminSystemActions();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map(field => (
        <AiSettingField
          key={`${field.settingKey}:${settings[field.settingKey] ?? 'unset'}`}
          settingKey={field.settingKey}
          control={field.control}
          label={t(field.labelKey)}
          stored={settings[field.settingKey]}
          isPending={isPending}
          onSave={saveAiSetting}
        />
      ))}
    </div>
  );
}
