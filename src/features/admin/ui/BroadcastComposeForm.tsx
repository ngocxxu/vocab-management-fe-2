'use client';

import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import type { TAdminUser } from '@/types/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { BROADCAST_MESSAGE_MAX_LENGTH, broadcastFormSchema } from '@/libs/validations/broadcast';
import type { TBroadcastFormValues } from '@/libs/validations/broadcast';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { useAdminBroadcastActions } from '../hooks/useAdminBroadcastActions';
import { BroadcastAudienceFields } from './BroadcastAudienceFields';

// A fresh object each time: the form keeps a reference to what it was reset with.
const emptyForm = (): TBroadcastFormValues => ({
  message: '',
  priority: 'MEDIUM',
  expiresAt: '',
  target: 'ALL',
  role: 'MEMBER',
  userIds: [],
});

/** Priority select. Kept apart so the compose form stays short. */
function PriorityField({ idPrefix, control }: Readonly<{ idPrefix: string; control: Control<TBroadcastFormValues> }>) {
  const t = useTranslations('admin.broadcasts');

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${idPrefix}-priority`}>{t('compose.priority')}</Label>
      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={`${idPrefix}-priority`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{t('priority.low')}</SelectItem>
              <SelectItem value="MEDIUM">{t('priority.medium')}</SelectItem>
              <SelectItem value="HIGH">{t('priority.high')}</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

/** Message textarea with a live character count and its error. */
function MessageField({ idPrefix, register, errors, message }: Readonly<{
  idPrefix: string;
  register: UseFormRegister<TBroadcastFormValues>;
  errors: FieldErrors<TBroadcastFormValues>;
  message: string;
}>) {
  const t = useTranslations('admin.broadcasts');

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${idPrefix}-message`}>{t('compose.message')}</Label>
      <Textarea id={`${idPrefix}-message`} rows={4} aria-invalid={errors.message ? true : undefined} {...register('message')} />
      <p className="text-sm text-muted-foreground">{t('compose.messageCount', { count: message.length, max: BROADCAST_MESSAGE_MAX_LENGTH })}</p>
      {errors.message && <p role="alert" className="text-sm text-destructive">{t('compose.errors.message', { max: BROADCAST_MESSAGE_MAX_LENGTH })}</p>}
    </div>
  );
}

/** Compose one broadcast: the message, its priority, when it expires, and who receives it. */
export function BroadcastComposeForm() {
  const t = useTranslations('admin.broadcasts');
  const idPrefix = useId();
  const { isPending, sendBroadcast } = useAdminBroadcastActions();
  const [recipients, setRecipients] = useState<TAdminUser[]>([]);
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<TBroadcastFormValues>({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues: emptyForm(),
  });
  const message = watch('message') ?? '';
  const target = watch('target');

  const onSubmit = (values: TBroadcastFormValues) => {
    sendBroadcast(values, () => {
      reset(emptyForm());
      setRecipients([]);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <MessageField idPrefix={idPrefix} register={register} errors={errors} message={message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <PriorityField idPrefix={idPrefix} control={control} />
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-expires`}>{t('compose.expiresAt')}</Label>
          <Input id={`${idPrefix}-expires`} type="datetime-local" aria-invalid={errors.expiresAt ? true : undefined} {...register('expiresAt')} />
          {errors.expiresAt && <p role="alert" className="text-sm text-destructive">{t('compose.errors.expiresAt')}</p>}
        </div>
      </div>

      <BroadcastAudienceFields
        idPrefix={idPrefix}
        control={control}
        errors={errors}
        target={target}
        recipients={recipients}
        onRecipientsChange={setRecipients}
      />

      <Button type="submit" disabled={isPending} className="w-fit">{t('compose.submit')}</Button>
    </form>
  );
}
