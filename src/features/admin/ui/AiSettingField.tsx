'use client';

import type { TAiSettingKey } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { AI_PROVIDERS } from '@/constants/admin';
import { AI_MODEL_MAX_LENGTH } from '@/libs/validations/ai-settings';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { fromSelectValue, isSettingChanged, toSelectValue, toSettingValue } from '../utils/ai-setting-draft';

type TAiSettingControl = 'provider' | 'model';

type TAiSettingControlProps = Readonly<{
  id: string;
  draft: string;
  onChange: (draft: string) => void;
}>;

function ProviderControl({ id, draft, onChange }: TAiSettingControlProps) {
  const t = useTranslations('admin.system.ai');

  return (
    <Select value={toSelectValue(draft)} onValueChange={value => onChange(fromSelectValue(value))}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={toSelectValue('')}>{t('envDefault')}</SelectItem>
        {AI_PROVIDERS.map(provider => (
          <SelectItem key={provider} value={provider}>{t(`providers.${provider}`)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ModelControl({ id, draft, onChange }: TAiSettingControlProps) {
  const t = useTranslations('admin.system.ai');

  return (
    <Input
      id={id}
      value={draft}
      placeholder={t('envDefault')}
      maxLength={AI_MODEL_MAX_LENGTH}
      onChange={event => onChange(event.target.value)}
    />
  );
}

type TAiSettingFieldProps = Readonly<{
  settingKey: TAiSettingKey;
  control: TAiSettingControl;
  label: string;
  stored: string | null;
  isPending: boolean;
  onSave: (key: TAiSettingKey, value: string | null) => void;
}>;

/**
 * One AI setting: the control, Save when the draft differs from the stored value, and Reset when a value is stored.
 * The parent gives it a key built from the stored value, so the draft restarts from the server after each save.
 */
export function AiSettingField({ settingKey, control, label, stored, isPending, onSave }: TAiSettingFieldProps) {
  const t = useTranslations('admin.system.ai');
  const id = useId();
  const [draft, setDraft] = useState(stored ?? '');
  const nextValue = toSettingValue(draft);
  const isChanged = isSettingChanged(draft, stored);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <Label htmlFor={id}>{label}</Label>
      {control === 'provider'
        ? <ProviderControl id={id} draft={draft} onChange={setDraft} />
        : <ModelControl id={id} draft={draft} onChange={setDraft} />}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={isPending || !isChanged} onClick={() => onSave(settingKey, nextValue)}>
          {t('save')}
        </Button>
        <Button variant="outline" size="sm" disabled={isPending || stored === null} onClick={() => onSave(settingKey, null)}>
          {t('reset')}
        </Button>
      </div>
    </div>
  );
}
