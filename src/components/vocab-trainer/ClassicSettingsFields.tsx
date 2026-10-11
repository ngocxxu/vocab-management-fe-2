'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Slider } from '@/shared/ui/slider';

const SECONDS_PER_MINUTE = 60;

/** Shown in the dialog footer for Classic trainers, so both modes summarise the same way. */
export const ClassicCardSummary: React.FC<{ wordCount: number }> = ({ wordCount }) => {
  const t = useTranslations('trainer.classic');
  const form = useFormContext();
  const seconds = form.watch('setCountTime') as number;

  return (
    <p className="text-sm text-muted-foreground">
      {t.rich('cardSummary', {
        count: wordCount,
        time: t('minutes', { count: Math.floor(seconds / SECONDS_PER_MINUTE) }),
        strong: chunks => <span className="font-semibold text-foreground">{chunks}</span>,
      })}
    </p>
  );
};

const ClassicSettingsFields: React.FC = () => {
  const t = useTranslations('trainer.classic');
  const form = useFormContext();

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {t('timedTest')}
      </h3>

      <FormField
        control={form.control}
        name="setCountTime"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-3">
              <FormLabel>{t('timeLimit')}</FormLabel>
              <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                {t('minutes', { count: Math.floor(field.value / SECONDS_PER_MINUTE) })}
              </span>
            </div>
            <FormControl>
              <Slider
                min={60}
                max={1800}
                step={60}
                value={[field.value]}
                onValueChange={(value) => {
                  field.onChange(value[0]);
                  form.clearErrors('setCountTime');
                }}
                aria-label={t('timeLimitAria')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ClassicSettingsFields;
