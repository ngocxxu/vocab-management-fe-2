'use client';

import type { TAiCatalogKind, TAiModel, TAiSettingKey } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { AI_PROVIDERS } from '@/constants/admin';
import { AI_MODEL_MAX_LENGTH } from '@/libs/validations/ai-settings';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useAiModelCatalog } from '../hooks/useAiModelCatalog';
import { getCatalogHint, toCatalogProvider } from '../utils/ai-model-catalog';
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

type TModelControlProps = TAiSettingControlProps & Readonly<{
  listId: string;
  models: TAiModel[];
  describedBy?: string;
}>;

// A text input with a datalist: the admin picks a suggestion or types any model id.
function ModelControl({ id, listId, draft, models, describedBy, onChange }: TModelControlProps) {
  const t = useTranslations('admin.system.ai');

  return (
    <>
      <Input
        id={id}
        list={listId}
        value={draft}
        placeholder={t('envDefault')}
        maxLength={AI_MODEL_MAX_LENGTH}
        aria-describedby={describedBy}
        onChange={event => onChange(event.target.value)}
      />
      <datalist id={listId}>
        {models.map(model => (
          <option key={model.id} value={model.id}>{model.name}</option>
        ))}
      </datalist>
    </>
  );
}

/** Where a model field gets its suggestions: the provider stored in its row group, and the kind of model it needs. */
type TAiSettingCatalog = Readonly<{
  providerValue: string | null;
  kind: TAiCatalogKind;
}>;

type TAiSettingFieldProps = Readonly<{
  settingKey: TAiSettingKey;
  control: TAiSettingControl;
  label: string;
  stored: string | null;
  catalog?: TAiSettingCatalog;
  isPending: boolean;
  onSave: (key: TAiSettingKey, value: string | null) => void;
}>;

/**
 * One AI setting: the control, Save when the draft differs from the stored value, and Reset when a value is stored.
 * The parent gives it a key built from the stored value, so the draft restarts from the server after each save.
 */
export function AiSettingField({ settingKey, control, label, stored, catalog, isPending, onSave }: TAiSettingFieldProps) {
  const t = useTranslations('admin.system.ai');
  const id = useId();
  const labelId = useId();
  const listId = useId();
  const hintId = useId();
  const [draft, setDraft] = useState(stored ?? '');
  const nextValue = toSettingValue(draft);
  const isChanged = isSettingChanged(draft, stored);

  const providerValue = catalog?.providerValue ?? null;
  const catalogProvider = toCatalogProvider(providerValue);
  const suggestions = useAiModelCatalog(control === 'model' ? catalogProvider : null, catalog?.kind ?? 'text');
  const hint = control === 'model' ? getCatalogHint(providerValue, catalogProvider, suggestions.status) : null;

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <Label id={labelId} htmlFor={id}>{label}</Label>
      {control === 'provider'
        ? <ProviderControl id={id} draft={draft} onChange={setDraft} />
        : (
            <ModelControl
              id={id}
              listId={listId}
              draft={draft}
              models={suggestions.models}
              describedBy={hint ? hintId : undefined}
              onChange={setDraft}
            />
          )}
      {hint && <p id={hintId} className="text-sm text-muted-foreground">{t(`modelList.${hint}`)}</p>}
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
