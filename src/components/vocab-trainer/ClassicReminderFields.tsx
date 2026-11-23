'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { CLASSIC_MAX_REPEAT, CLASSIC_SPACING_DAYS } from '@/libs/validations/vocab-trainer';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

type ClassicReminderFieldsProps = Readonly<{
  /** Passes the trainer already has. Max passes cannot go below this. 0 for a new trainer. */
  earnedPasses: number;
}>;

/** Days between reminders and max passes of a Classic trainer. */
export default function ClassicReminderFields({ earnedPasses }: ClassicReminderFieldsProps) {
  const t = useTranslations('trainer.classic');
  const form = useFormContext();

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {t('reminderTitle')}
      </h3>

      <FormField
        control={form.control}
        name="reminderSpacingDays"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('spacingLabel')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                step={1}
                min={CLASSIC_SPACING_DAYS.min}
                max={CLASSIC_SPACING_DAYS.max}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(event) => {
                  field.onChange(Number(event.target.value));
                  form.clearErrors('reminderSpacingDays');
                }}
              />
            </FormControl>
            <FormDescription>
              {t('spacingHint', { min: CLASSIC_SPACING_DAYS.min, max: CLASSIC_SPACING_DAYS.max })}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reminderMaxRepeat"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('maxRepeatLabel')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                step={1}
                min={Math.max(CLASSIC_MAX_REPEAT.min, earnedPasses)}
                max={CLASSIC_MAX_REPEAT.max}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(event) => {
                  field.onChange(Number(event.target.value));
                  form.clearErrors('reminderMaxRepeat');
                }}
              />
            </FormControl>
            <FormDescription>
              {t('maxRepeatHint', { min: CLASSIC_MAX_REPEAT.min, max: CLASSIC_MAX_REPEAT.max })}
              {earnedPasses > 0 && ` ${t('earnedFloor', { count: earnedPasses })}`}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
