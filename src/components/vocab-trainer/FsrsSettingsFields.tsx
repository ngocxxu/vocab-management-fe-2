'use client';

import { Lock } from '@solar-icons/react/ssr';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Slider } from '@/shared/ui/slider';
import { EFsrsDirection } from '@/enum/vocab-trainer';
import { cn } from '@/libs/utils';
import { formatRecallPerTen, SRS_MAX_RETENTION, SRS_MIN_RETENTION } from '@/libs/validations/srs-settings';
import { countCards, FSRS_MAX_INTERVAL_DAYS, suggestNewPerDay } from '@/libs/validations/vocab-trainer';

type FsrsSettingsFieldsProps = Readonly<{
  /** Mode and directions are fixed once the trainer exists. */
  editMode: boolean;
  wordCount: number;
  /** Selected words that have no translation yet: they get no card. */
  wordsWithoutTranslation: string[];
}>;

const DIRECTION_OPTIONS = [
  { value: EFsrsDirection.SOURCE_TO_TARGET, title: 'Recognise', example: 'apple → quả táo', hint: 'See the word, know the meaning' },
  { value: EFsrsDirection.TARGET_TO_SOURCE, title: 'Recall', example: 'quả táo → apple', hint: 'See the meaning, produce the word' },
];

const MAX_LISTED_WORDS = 5;

function retentionHint(retention: number): string {
  if (retention >= 0.95) {
    return 'Very few misses, but many more reviews every day.';
  }
  if (retention >= 0.9) {
    return 'A good balance between remembering and workload.';
  }
  return 'Fewer reviews, but you will forget more words.';
}

const FsrsSettingsFields: React.FC<FsrsSettingsFieldsProps> = ({ editMode, wordCount, wordsWithoutTranslation }) => {
  const form = useFormContext();
  const directions = form.watch('fsrsDirections') as EFsrsDirection[];
  const endsAt = form.watch('fsrsEndsAt') as string;
  const cardWords = wordCount - wordsWithoutTranslation.length;
  const cards = countCards(cardWords, directions.length);
  const suggestion = suggestNewPerDay(cards, endsAt, new Date());

  const toggleDirection = (direction: EFsrsDirection) => {
    const next = directions.includes(direction) ? directions.filter(d => d !== direction) : [...directions, direction];
    // The last direction stays selected: a trainer without one would have no cards.
    if (next.length === 0) {
      return;
    }
    form.setValue('fsrsDirections', next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Spaced repetition
      </h3>

      {wordsWithoutTranslation.length > 0 && (
        <Alert>
          <AlertTitle>
            {wordsWithoutTranslation.length === 1 ? '1 word has' : `${wordsWithoutTranslation.length} words have`}
            {' '}
            no translation yet
          </AlertTitle>
          <AlertDescription>
            They get no questions until you add a translation:
            {' '}
            {wordsWithoutTranslation.slice(0, MAX_LISTED_WORDS).join(', ')}
            {wordsWithoutTranslation.length > MAX_LISTED_WORDS && ` and ${wordsWithoutTranslation.length - MAX_LISTED_WORDS} more`}
            .
          </AlertDescription>
        </Alert>
      )}

      <FormField
        control={form.control}
        name="fsrsDirections"
        render={() => (
          <FormItem>
            <FormLabel>Directions to learn</FormLabel>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Directions to learn">
              {DIRECTION_OPTIONS.map((option) => {
                const selected = directions.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    disabled={editMode}
                    onClick={() => toggleDirection(option.value)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed',
                      selected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted',
                      editMode && !selected && 'opacity-50',
                    )}
                  >
                    <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                    <span className="mt-0.5 block text-sm text-primary">{option.example}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{option.hint}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {cardWords}
              {' '}
              {cardWords === 1 ? 'word' : 'words'}
              {' × '}
              {directions.length}
              {' '}
              {directions.length === 1 ? 'direction' : 'directions'}
              {' = '}
              <span className="font-semibold text-foreground">
                {cards}
                {' '}
                {cards === 1 ? 'question' : 'questions'}
              </span>
              {' to learn'}
              {directions.length > 1 && ', about twice the reviews'}
            </p>
            <p className="text-xs text-muted-foreground">
              Each word is asked once per direction, then comes back on a schedule until you know it. Over time you will see more questions than this.
            </p>
            {editMode && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock size={12} weight="BoldDuotone" />
                Directions are fixed after the trainer is created.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fsrsDesiredRetention"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-3">
              <FormLabel>Desired retention</FormLabel>
              <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                {Math.round(field.value * 100)}
                %
              </span>
            </div>
            <FormControl>
              <Slider
                min={Math.round(SRS_MIN_RETENTION * 100)}
                max={Math.round(SRS_MAX_RETENTION * 100)}
                step={1}
                value={[Math.round(field.value * 100)]}
                onValueChange={value => field.onChange((value[0] ?? 90) / 100)}
                aria-label="Desired retention"
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              About
              {' '}
              {formatRecallPerTen(field.value)}
              {' '}
              of 10 words still remembered when they come back.
              {' '}
              {retentionHint(field.value)}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fsrsEndsAt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Deadline
              {' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </FormLabel>
            <FormControl>
              <Input type="date" className="mt-1" {...field} />
            </FormControl>
            <p className="text-sm text-muted-foreground">Every word will be asked again before this date, for example an exam.</p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fsrsNewPerDay"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              New questions per day
              {' '}
              <span className="font-normal text-muted-foreground">(empty = no limit)</span>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                className="mt-1"
                placeholder="No limit"
                value={field.value ?? ''}
                onChange={event => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
              />
            </FormControl>
            {suggestion !== null && field.value !== suggestion && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {suggestion}
                  {' '}
                  new
                  {' '}
                  {suggestion === 1 ? 'question' : 'questions'}
                  {' '}
                  a day brings all
                  {' '}
                  {cards}
                  {' '}
                  in before the deadline.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue('fsrsNewPerDay', suggestion, { shouldDirty: true, shouldValidate: true })}
                >
                  Use
                  {' '}
                  {suggestion}
                </Button>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <details className="rounded-xl border border-border bg-card p-3">
        <summary className="cursor-pointer text-sm font-medium text-foreground">Advanced</summary>
        <div className="mt-3">
          <FormField
            control={form.control}
            name="fsrsMaximumInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longest gap between reviews (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={FSRS_MAX_INTERVAL_DAYS}
                    className="mt-1"
                    value={Number.isNaN(field.value) ? '' : field.value}
                    onChange={event => field.onChange(event.target.value === '' ? Number.NaN : Number(event.target.value))}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  {field.value === FSRS_MAX_INTERVAL_DAYS
                    ? 'Long term: no practical limit.'
                    : `Cards come back at least every ${field.value} days.`}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </details>
    </div>
  );
};

export default FsrsSettingsFields;
