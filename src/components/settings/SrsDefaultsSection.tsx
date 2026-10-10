'use client';

import type { TSrsDefaults, TSrsQuestionType, TSrsSettings } from '@/types/srs-settings';
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { updateSrsSettings } from '@/actions/srs-settings';
import { FSRS_QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';
import { EFsrsDirection } from '@/enum/vocab-trainer';
import { formatRecallPerTen, SRS_MAX_RETENTION, SRS_MIN_RETENTION, srsSettingsFormSchema } from '@/libs/validations/srs-settings';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Slider } from '@/shared/ui/slider';

type SrsDefaultsSectionProps = {
  settings: TSrsSettings;
};

const DIRECTION_OPTIONS: { value: EFsrsDirection; label: string; hint: string }[] = [
  { value: EFsrsDirection.SOURCE_TO_TARGET, label: 'Word → meaning', hint: 'See the word, recall its meaning.' },
  { value: EFsrsDirection.TARGET_TO_SOURCE, label: 'Meaning → word', hint: 'See the meaning, recall the word.' },
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

export const SrsDefaultsSection: React.FC<SrsDefaultsSectionProps> = ({ settings }) => {
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

  // Radix reports '' when the value it is given is not an option yet (the first render, before the browser timezone is read).
  const handleTimezoneChange = (value: string) => {
    if (value !== '') {
      setChosenTimezone(value);
    }
  };

  const toggleDirection = (direction: EFsrsDirection, checked: boolean) => {
    const next = checked ? [...defaults.directions, direction] : defaults.directions.filter(item => item !== direction);
    if (next.length === 0) {
      return;
    }
    setDefaults({ ...defaults, directions: next });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Check the values and try again');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateSrsSettings({ defaults, timezone });
      setSaved(result);
      setDefaults(result.defaults);
      setChosenTimezone(null);
      toast.success('Spaced repetition defaults saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save spaced repetition settings');
    } finally {
      setIsSaving(false);
    }
  };

  const retentionPercent = Math.round(defaults.desiredRetention * PERCENT);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spaced repetition defaults</CardTitle>
        <CardDescription>
          New spaced repetition trainers start from these values. Trainers you already have are not changed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="srs-retention" className="text-sm font-medium text-foreground">Target recall</Label>
              <span className="text-sm font-semibold text-foreground">
                {retentionPercent}
                %
              </span>
            </div>
            <Slider
              id="srs-retention"
              min={Math.round(SRS_MIN_RETENTION * PERCENT)}
              max={Math.round(SRS_MAX_RETENTION * PERCENT)}
              step={1}
              value={[retentionPercent]}
              onValueChange={([value]) => setDefaults({ ...defaults, desiredRetention: (value ?? retentionPercent) / PERCENT })}
              aria-label="Target recall"
            />
            <p className="text-xs text-muted-foreground">
              At
              {' '}
              {retentionPercent}
              %, you will recall about
              {' '}
              {formatRecallPerTen(defaults.desiredRetention)}
              {' '}
              of every 10 words when they come up for review. A higher target means more reviews.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Directions</legend>
            {DIRECTION_OPTIONS.map(option => (
              <div key={option.value} className="flex items-start gap-2">
                <Checkbox
                  id={`srs-direction-${option.value}`}
                  checked={defaults.directions.includes(option.value)}
                  onCheckedChange={checked => toggleDirection(option.value, checked === true)}
                />
                <Label htmlFor={`srs-direction-${option.value}`} className="flex-col items-start gap-0.5 font-normal">
                  {option.label}
                  <span className="block text-xs text-muted-foreground">{option.hint}</span>
                </Label>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Each direction is reviewed on its own, because remembering a word does not mean remembering its meaning the other way round.
              The directions of a trainer cannot be changed after it is created.
            </p>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="srs-question-type" className="text-sm font-medium text-foreground">Question type</Label>
            <Select value={defaults.questionType} onValueChange={value => setDefaults({ ...defaults, questionType: value as TSrsQuestionType })}>
              <SelectTrigger id="srs-question-type" className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FSRS_QUESTION_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="srs-reminder"
              checked={defaults.reminderEnabled}
              onCheckedChange={checked => setDefaults({ ...defaults, reminderEnabled: checked === true })}
            />
            <Label htmlFor="srs-reminder" className="flex-col items-start gap-0.5 font-normal">
              Email me when cards are due
              <span className="block text-xs text-muted-foreground">
                One email per trainer per day, skipped when nothing is due. It stops after 3 emails without a review.
              </span>
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="srs-timezone" className="text-sm font-medium text-foreground">Timezone</Label>
            <Select value={timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger id="srs-timezone" className="w-full sm:w-72">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Your review day starts at 04:00 in this timezone, so studying after midnight still counts for the day before.
              {isTimezoneFromBrowser && ' Detected from your browser: save to keep it.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSaving || !isDirty || !parsed.success}>
              {isSaving ? 'Saving...' : 'Save defaults'}
            </Button>
            {!parsed.success && <p className="text-xs text-destructive">{parsed.error.issues[0]?.message}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
