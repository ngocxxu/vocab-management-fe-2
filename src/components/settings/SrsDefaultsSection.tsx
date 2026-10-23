'use client';

import type { TSrsDefaults, TSrsQuestionType, TSrsSettings } from '@/types/srs-settings';
import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { updateSrsSettings } from '@/actions/srs-settings';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { FSRS_QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';
import { EFsrsDirection } from '@/enum/vocab-trainer';
import { toggleDirection } from '@/utils/fsrs-directions';
import { toDisplayMessage } from '@/i18n/validation';
import { formatRecallPerTen, SRS_MAX_RETENTION, SRS_MIN_RETENTION, srsSettingsFormSchema } from '@/libs/validations/srs-settings';
import { SettingRow, SettingsGroup, SettingsSection } from './SettingsSection';

type SrsDefaultsSectionProps = {
  settings: TSrsSettings;
  /** Lets the page mark the Spaced repetition tab while there are unsaved changes. */
  onDirtyChange?: (isDirty: boolean) => void;
};

// labelKey and hintKey are translation keys under `directions`.
const DIRECTION_OPTIONS: { value: EFsrsDirection; labelKey: string; hintKey: string }[] = [
  { value: EFsrsDirection.SOURCE_TO_TARGET, labelKey: 'directions.sourceToTarget.label', hintKey: 'directions.sourceToTarget.hint' },
  { value: EFsrsDirection.TARGET_TO_SOURCE, labelKey: 'directions.targetToSource.label', hintKey: 'directions.targetToSource.hint' },
  { value: EFsrsDirection.RANDOM, labelKey: 'directions.random.label', hintKey: 'directions.random.hint' },
];

const PERCENT = 100;

function listTimezones(current: string): string[] {
  const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone') ?? [];

  return supported.includes(current) || current === '' ? supported : [current, ...supported];
}

// The browser timezone never changes while the page is open, so there is nothing to subscribe to.
const subscribeToNothing = (): (() => void) => () => undefined;
const readBrowserTimezone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;
// On the server there is no browser timezone: the snapshot is empty there, so the first render matches the server's.
const readServerTimezone = (): string => '';

export const SrsDefaultsSection: React.FC<SrsDefaultsSectionProps> = ({ settings, onDirtyChange }) => {
  const t = useTranslations();
  const tSrs = useTranslations('settings.srs');
  const tErrors = useTranslations('errors');
  const [saved, setSaved] = useState(settings);
  const [defaults, setDefaults] = useState<TSrsDefaults>(settings.defaults);
  // null until the user picks one: until then the timezone is the saved one, or the browser's the first time.
  const [chosenTimezone, setChosenTimezone] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const browserTimezone = useSyncExternalStore(subscribeToNothing, readBrowserTimezone, readServerTimezone);
  const timezone = chosenTimezone ?? saved.timezone ?? browserTimezone;
  const isTimezoneFromBrowser = chosenTimezone === null && saved.timezone === null && browserTimezone !== '';

  const timezones = useMemo(() => listTimezones(timezone), [timezone]);
  const parsed = srsSettingsFormSchema.safeParse({ ...defaults, timezone });
  const isDirty = JSON.stringify(defaults) !== JSON.stringify(saved.defaults) || (timezone !== '' && timezone !== saved.timezone);
  const retentionPercent = Math.round(defaults.desiredRetention * PERCENT);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Radix reports '' when the value it is given is not an option yet (the first render, before the browser timezone is read).
  const handleTimezoneChange = (value: string) => {
    if (value !== '') {
      setChosenTimezone(value);
    }
  };

  const pickDirection = (direction: EFsrsDirection) => {
    setDefaults({ ...defaults, directions: toggleDirection(defaults.directions, direction) });
  };

  const discardChanges = () => {
    setDefaults(saved.defaults);
    setChosenTimezone(null);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsed.success) {
      toast.error(toDisplayMessage(parsed.error.issues[0]?.message ?? 'validation.checkValues', t));
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateSrsSettings({ defaults, timezone });
      setSaved(result);
      setDefaults(result.defaults);
      setChosenTimezone(null);
      toast.success(tSrs('savedToast'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tErrors('saveSpacedRepetitionSettings'));
    } finally {
      setIsSaving(false);
    }
  };

  // Shown only while there are unsaved changes; it stays at the bottom of the section while the page scrolls.
  const saveBar = isDirty
    ? (
        <div className="sticky bottom-4 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
          <div>
            <p className={parsed.success ? 'text-sm text-foreground' : 'text-sm text-destructive'}>
              {parsed.success ? tSrs('unsaved') : toDisplayMessage(parsed.error.issues[0]?.message ?? 'validation.checkValues', t)}
            </p>
            {parsed.success && (
              <p className="text-xs text-muted-foreground">{tSrs('saveFootnote')}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={discardChanges} disabled={isSaving}>
              {tSrs('discard')}
            </Button>
            <Button type="submit" disabled={isSaving || !parsed.success}>
              {isSaving ? tSrs('saving') : tSrs('save')}
            </Button>
          </div>
        </div>
      )
    : null;

  return (
    <form onSubmit={handleSave}>
      <SettingsSection
        id="spaced-repetition"
        title={tSrs('title')}
        description={tSrs('description')}
        footer={saveBar}
      >
        <SettingsGroup
          title={tSrs('newTrainersTitle')}
          description={tSrs('newTrainersDescription')}
        >
          <SettingRow
            label={tSrs('targetRecall')}
            htmlFor="srs-retention"
            description={tSrs('recallSentence', { percent: retentionPercent, recall: formatRecallPerTen(defaults.desiredRetention) })}
          >
            <div className="space-y-2">
              <p className="text-right text-sm font-semibold text-foreground">
                {retentionPercent}
                %
              </p>
              <Slider
                id="srs-retention"
                min={Math.round(SRS_MIN_RETENTION * PERCENT)}
                max={Math.round(SRS_MAX_RETENTION * PERCENT)}
                step={1}
                value={[retentionPercent]}
                onValueChange={([value]) => setDefaults({ ...defaults, desiredRetention: (value ?? retentionPercent) / PERCENT })}
                aria-label={tSrs('targetRecall')}
              />
            </div>
          </SettingRow>

          <SettingRow
            label={tSrs('directions')}
            description={tSrs('directionsDescription')}
          >
            <div className="space-y-3">
              {DIRECTION_OPTIONS.map(option => (
                <div key={option.value} className="flex items-start gap-2">
                  <Checkbox
                    id={`srs-direction-${option.value}`}
                    checked={defaults.directions.includes(option.value)}
                    onCheckedChange={() => pickDirection(option.value)}
                  />
                  <Label htmlFor={`srs-direction-${option.value}`} className="flex-col items-start gap-0.5 font-normal">
                    {t(option.labelKey)}
                    <span className="block text-xs text-muted-foreground">{t(option.hintKey)}</span>
                  </Label>
                </div>
              ))}
            </div>
          </SettingRow>

          <SettingRow label={tSrs('questionType')} htmlFor="srs-question-type">
            <Select value={defaults.questionType} onValueChange={value => setDefaults({ ...defaults, questionType: value as TSrsQuestionType })}>
              <SelectTrigger id="srs-question-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FSRS_QUESTION_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{t(option.labelKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            label={tSrs('emailReminders')}
            description={tSrs('emailRemindersDescription')}
          >
            <div className="flex items-start gap-2">
              <Checkbox
                id="srs-reminder"
                checked={defaults.reminderEnabled}
                onCheckedChange={checked => setDefaults({ ...defaults, reminderEnabled: checked === true })}
              />
              <Label htmlFor="srs-reminder" className="font-normal">{tSrs('emailReminderLabel')}</Label>
            </div>
          </SettingRow>
        </SettingsGroup>

        <SettingsGroup
          title={tSrs('allTrainersTitle')}
          description={tSrs('allTrainersDescription')}
        >
          <SettingRow
            label={tSrs('timezone')}
            htmlFor="srs-timezone"
            description={(
              <>
                {tSrs('timezoneHint')}
                {isTimezoneFromBrowser && tSrs('timezoneDetected')}
              </>
            )}
          >
            <Select value={timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger id="srs-timezone" className="w-full">
                <SelectValue placeholder={tSrs('selectTimezone')} />
              </SelectTrigger>
              <SelectContent>
                {timezones.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
        </SettingsGroup>
      </SettingsSection>
    </form>
  );
};
