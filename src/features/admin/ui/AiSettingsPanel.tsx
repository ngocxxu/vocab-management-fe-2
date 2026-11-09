'use client';

import type { TAiCatalogKind, TAiSettingKey, TAiSettings } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useAdminSystemActions } from '../hooks/useAdminSystemActions';
import { AiSettingField } from './AiSettingField';

type TAiSettingsPanelProps = Readonly<{
  settings: TAiSettings;
}>;

// The default row applies to every AI task. Chat and audio rows can override it. Each model row sits under its provider.
const FIELDS = [
  { settingKey: 'ai.provider', control: 'provider', labelKey: 'fields.defaultProvider' },
  { settingKey: 'ai.model', control: 'model', labelKey: 'fields.defaultModel' },
  { settingKey: 'ai.chat.provider', control: 'provider', labelKey: 'fields.chatProvider' },
  { settingKey: 'ai.chat.model', control: 'model', labelKey: 'fields.chatModel' },
  { settingKey: 'ai.audio.provider', control: 'provider', labelKey: 'fields.audioProvider' },
  { settingKey: 'ai.audio.model', control: 'model', labelKey: 'fields.audioModel' },
] as const;

type TModelCatalogSource = Readonly<{
  providerKey: TAiSettingKey;
  kind: TAiCatalogKind;
}>;

// A model field suggests models from the provider in its own row group. Audio asks for transcription models.
const MODEL_CATALOG: Partial<Record<TAiSettingKey, TModelCatalogSource>> = {
  'ai.model': { providerKey: 'ai.provider', kind: 'text' },
  'ai.chat.model': { providerKey: 'ai.chat.provider', kind: 'text' },
  'ai.audio.model': { providerKey: 'ai.audio.provider', kind: 'audio' },
};

/** The AI settings. Each field is keyed by its stored value, so a save remounts it with the value the server returned. */
export function AiSettingsPanel({ settings }: TAiSettingsPanelProps) {
  const t = useTranslations('admin.system.ai');
  const { isPending, saveAiSetting } = useAdminSystemActions();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map((field) => {
        const source = MODEL_CATALOG[field.settingKey];

        return (
          <AiSettingField
            key={`${field.settingKey}:${settings[field.settingKey] ?? 'unset'}`}
            settingKey={field.settingKey}
            control={field.control}
            label={t(field.labelKey)}
            stored={settings[field.settingKey]}
            catalog={source && { providerValue: settings[source.providerKey], kind: source.kind }}
            isPending={isPending}
            onSave={saveAiSetting}
          />
        );
      })}
    </div>
  );
}
