'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Slider } from '@/shared/ui/slider';

const SECONDS_PER_MINUTE = 60;

function formatMinutes(seconds: number): string {
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

/** Shown in the dialog footer for Classic trainers, so both modes summarise the same way. */
export const ClassicCardSummary: React.FC<{ wordCount: number }> = ({ wordCount }) => {
  const form = useFormContext();
  const seconds = form.watch('setCountTime') as number;

  return (
    <p className="text-sm text-muted-foreground">
      {wordCount}
      {' '}
      {wordCount === 1 ? 'word' : 'words'}
      {' · '}
      <span className="font-semibold text-foreground">{formatMinutes(seconds)}</span>
      {' time limit'}
    </p>
  );
};

const ClassicSettingsFields: React.FC = () => {
  const form = useFormContext();

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Timed test
      </h3>

      <FormField
        control={form.control}
        name="setCountTime"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-3">
              <FormLabel>Time Limit</FormLabel>
              <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                {formatMinutes(field.value)}
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
                aria-label="Time limit"
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
