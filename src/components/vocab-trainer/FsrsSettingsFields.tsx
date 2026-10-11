'use client';

import { Lock } from '@solar-icons/react/ssr';
import React from 'react';
import { useTranslations } from 'next-intl';
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

type FsrsCardCountProps = Pick<FsrsSettingsFieldsProps, 'wordCount' | 'wordsWithoutTranslation'>;

const DIRECTION_OPTIONS = [
  { value: EFsrsDirection.SOURCE_TO_TARGET, titleKey: 'directionRecognise', hintKey: 'directionRecogniseHint', example: 'apple → quả táo' },
  { value: EFsrsDirection.TARGET_TO_SOURCE, titleKey: 'directionRecall', hintKey: 'directionRecallHint', example: 'quả táo → apple' },
];

const MAX_LISTED_WORDS = 5;
const ADVANCED_FIELDS = ['fsrsDesiredRetention', 'fsrsNewPerDay', 'fsrsMaximumInterval'] as const;

function retentionHintKey(retention: number): 'retentionHintHigh' | 'retentionHintMid' | 'retentionHintLow' {
  if (retention >= 0.95) {
    return 'retentionHintHigh';
  }
  if (retention >= 0.9) {
    return 'retentionHintMid';
  }
  return 'retentionHintLow';
}

/** Cards the trainer will create: words with a translation × directions. */
function useCardCount({ wordCount, wordsWithoutTranslation }: FsrsCardCountProps) {
  const form = useFormContext();
  const directions = form.watch('fsrsDirections') as EFsrsDirection[];
  const cardWords = wordCount - wordsWithoutTranslation.length;
  return { directions, cardWords, cards: countCards(cardWords, directions.length) };
}

/** Footer summary: stays visible while the form scrolls. */
export const FsrsCardSummary: React.FC<FsrsCardCountProps> = (props) => {
  const t = useTranslations('trainer.settings');
  const { directions, cardWords, cards } = useCardCount(props);

  return (
    <p className="text-sm text-muted-foreground">
      {t.rich('cardSummary', {
        words: cardWords,
        directions: directions.length,
        cards,
        strong: chunks => <span className="font-semibold text-foreground">{chunks}</span>,
      })}
    </p>
  );
};

const FsrsSettingsFields: React.FC<FsrsSettingsFieldsProps> = ({ editMode, wordCount, wordsWithoutTranslation }) => {
  const t = useTranslations('trainer.settings');
  const form = useFormContext();
  const endsAt = form.watch('fsrsEndsAt') as string;
  const { directions, cards } = useCardCount({ wordCount, wordsWithoutTranslation });
  const suggestion = suggestNewPerDay(cards, endsAt, new Date());
  // Advanced is collapsed by default; open it when one of its fields fails validation so the error is not hidden.
  const advancedHasError = ADVANCED_FIELDS.some(name => Boolean(form.formState.errors[name]));

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
        {t('spacedRepetition')}
      </h3>

      {wordsWithoutTranslation.length > 0 && (
        <Alert>
          <AlertTitle>
            {t('noTranslationTitle', { count: wordsWithoutTranslation.length })}
          </AlertTitle>
          <AlertDescription>
            {t('noTranslationBody', {
              words: wordsWithoutTranslation.slice(0, MAX_LISTED_WORDS).join(', '),
              more: wordsWithoutTranslation.length > MAX_LISTED_WORDS
                ? t('moreWords', { count: wordsWithoutTranslation.length - MAX_LISTED_WORDS })
                : '',
            })}
          </AlertDescription>
        </Alert>
      )}

      <FormField
        control={form.control}
        name="fsrsDirections"
        render={() => (
          <FormItem>
            <FormLabel>{t('directions')}</FormLabel>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label={t('directions')}>
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
                    <span className="block text-sm font-semibold text-foreground">{t(option.titleKey)}</span>
                    <span className="mt-0.5 block text-sm text-primary">{option.example}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{t(option.hintKey)}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('directionsNote')}
            </p>
            {editMode && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock size={12} weight="BoldDuotone" />
                {t('directionsLocked')}
              </p>
            )}
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
              {t('deadline')}
              {' '}
              <span className="font-normal text-muted-foreground">{t('optional')}</span>
            </FormLabel>
            <FormControl>
              <Input type="date" className="mt-1" {...field} />
            </FormControl>
            <p className="text-sm text-muted-foreground">{t('deadlineHelp')}</p>
            <FormMessage />
          </FormItem>
        )}
      />

      <details className="rounded-xl border border-border bg-card p-3" open={advancedHasError || undefined}>
        <summary className="cursor-pointer text-sm font-medium text-foreground">{t('advanced')}</summary>
        <div className="mt-4 space-y-5">
          <FormField
            control={form.control}
            name="fsrsDesiredRetention"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-3">
                  <FormLabel>{t('retention')}</FormLabel>
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
                    aria-label={t('retention')}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  {t('retentionBody', {
                    recall: formatRecallPerTen(field.value),
                    hint: t(retentionHintKey(field.value)),
                  })}
                </p>
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
                  {t('newPerDay')}
                  {' '}
                  <span className="font-normal text-muted-foreground">{t('noLimit')}</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    className="mt-1"
                    placeholder={t('noLimitPlaceholder')}
                    value={field.value ?? ''}
                    onChange={event => field.onChange(event.target.value === '' ? null : Number(event.target.value))}
                  />
                </FormControl>
                {suggestion !== null && field.value !== suggestion && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {t('suggestion', { perDay: suggestion, cards })}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue('fsrsNewPerDay', suggestion, { shouldDirty: true, shouldValidate: true })}
                    >
                      {t('suggestionUse', { count: suggestion })}
                    </Button>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fsrsMaximumInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('maxInterval')}</FormLabel>
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
                    ? t('longTerm')
                    : t('comeBack', { days: field.value })}
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
