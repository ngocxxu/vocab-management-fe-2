'use client';

import type { TAdminPlanFormValues } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ADMIN_PLAN_LIMIT_KEYS, ADMIN_PLAN_UNLIMITED } from '@/constants/admin';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { BLANK_LIMIT, isBlankLimit } from '../utils/admin-plans';

type TLimitKey = (typeof ADMIN_PLAN_LIMIT_KEYS)[number];

// A blank price means "no price", so the plan is stored with null rather than 0.
const parseOptionalNumber = (value: string): number | null => (value === '' ? null : Number(value));

/**
 * One limit: a number input plus an Unlimited toggle. Unlimited stores -1, so the admin never types the
 * sentinel. Turning it off puts the limit back at 0 for the admin to set.
 */
function LimitField({ limitKey, label, unlimitedLabel }: Readonly<{
  limitKey: TLimitKey;
  label: string;
  unlimitedLabel: string;
}>) {
  const { control } = useFormContext<TAdminPlanFormValues>();
  const inputId = useId();

  return (
    <Controller
      control={control}
      name={`limits.${limitKey}`}
      render={({ field, fieldState }) => {
        const isUnlimited = field.value === ADMIN_PLAN_UNLIMITED;

        return (
          <div className="flex flex-col gap-2">
            <Label htmlFor={inputId}>{label}</Label>
            <Input
              id={inputId}
              ref={field.ref}
              type="number"
              min={0}
              step={1}
              disabled={isUnlimited}
              value={isUnlimited || isBlankLimit(field.value) ? '' : field.value}
              aria-invalid={fieldState.invalid || undefined}
              onBlur={field.onBlur}
              onChange={event => field.onChange(event.target.value === '' ? BLANK_LIMIT : Number(event.target.value))}
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={isUnlimited}
                onCheckedChange={checked => field.onChange(checked === true ? ADMIN_PLAN_UNLIMITED : 0)}
              />
              {unlimitedLabel}
            </label>
          </div>
        );
      }}
    />
  );
}

/** Name, price label, price and display order. */
export function PlanDetailFields() {
  const t = useTranslations('admin.plans');
  const { register } = useFormContext<TAdminPlanFormValues>();
  const idPrefix = useId();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-name`}>{t('dialog.name')}</Label>
        <Input id={`${idPrefix}-name`} {...register('name')} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-price-label`}>{t('dialog.priceLabel')}</Label>
        <Input id={`${idPrefix}-price-label`} {...register('priceLabel')} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-price`}>{t('dialog.price')}</Label>
        <Input
          id={`${idPrefix}-price`}
          type="number"
          min={0}
          step="0.01"
          placeholder={t('dialog.priceHint')}
          {...register('price', { setValueAs: parseOptionalNumber })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-sort-order`}>{t('dialog.sortOrder')}</Label>
        <Input id={`${idPrefix}-sort-order`} type="number" min={0} step={1} {...register('sortOrder', { valueAsNumber: true })} />
      </div>
    </div>
  );
}

/** The three limits, each with its Unlimited toggle. */
export function PlanLimitFields() {
  const t = useTranslations('admin.plans');

  return (
    <fieldset className="grid gap-4 sm:grid-cols-3">
      <legend className="mb-2 text-sm font-medium text-foreground">{t('dialog.limits')}</legend>
      {ADMIN_PLAN_LIMIT_KEYS.map(limitKey => (
        <LimitField
          key={limitKey}
          limitKey={limitKey}
          label={t(`limits.${limitKey}`)}
          unlimitedLabel={t('unlimited')}
        />
      ))}
    </fieldset>
  );
}

/** Features (one per line), the Stripe price id, and the active flag. */
export function PlanExtraFields() {
  const t = useTranslations('admin.plans');
  const { register, watch, setValue } = useFormContext<TAdminPlanFormValues>();
  const idPrefix = useId();
  const isActive = watch('isActive');

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-features`}>{t('dialog.features')}</Label>
        <Textarea id={`${idPrefix}-features`} rows={4} placeholder={t('dialog.featuresHint')} {...register('featuresText')} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-stripe`}>{t('dialog.stripePriceId')}</Label>
        <Input id={`${idPrefix}-stripe`} {...register('stripePriceId')} />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox checked={isActive} onCheckedChange={checked => setValue('isActive', checked === true)} />
        {t('dialog.active')}
      </label>
    </>
  );
}
