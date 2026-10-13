'use client';

import type { TBroadcastFormValues } from '@/libs/validations/broadcast';
import type { TAdminUser } from '@/types/admin';
import { useTranslations } from 'next-intl';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { UserRecipientPicker } from './UserRecipientPicker';

type TFormControl = Control<TBroadcastFormValues>;
type TFormErrors = FieldErrors<TBroadcastFormValues>;

type TBroadcastAudienceFieldsProps = Readonly<{
  idPrefix: string;
  control: TFormControl;
  errors: TFormErrors;
  target: TBroadcastFormValues['target'];
  recipients: TAdminUser[];
  onRecipientsChange: (recipients: TAdminUser[]) => void;
}>;

const ROLES = ['ADMIN', 'MEMBER', 'GUEST'] as const;

function TargetField({ idPrefix, control }: Readonly<{ idPrefix: string; control: TFormControl }>) {
  const t = useTranslations('admin.broadcasts');

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${idPrefix}-target`}>{t('compose.target')}</Label>
      <Controller
        control={control}
        name="target"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={`${idPrefix}-target`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('target.all')}</SelectItem>
              <SelectItem value="ROLE">{t('target.role')}</SelectItem>
              <SelectItem value="USERS">{t('target.users')}</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

function RoleField({ idPrefix, control, errors }: Readonly<{ idPrefix: string; control: TFormControl; errors: TFormErrors }>) {
  const t = useTranslations('admin.broadcasts');

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${idPrefix}-role`}>{t('compose.role')}</Label>
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={`${idPrefix}-role`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map(role => (
                <SelectItem key={role} value={role}>{t(`roles.${role}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.role && <p role="alert" className="text-sm text-destructive">{t('compose.errors.role')}</p>}
    </div>
  );
}

function UserField({ control, errors, recipients, onRecipientsChange }: Readonly<{
  control: TFormControl;
  errors: TFormErrors;
  recipients: TAdminUser[];
  onRecipientsChange: (recipients: TAdminUser[]) => void;
}>) {
  const t = useTranslations('admin.broadcasts');

  return (
    <div className="flex flex-col gap-2">
      <Label>{t('compose.users')}</Label>
      <Controller
        control={control}
        name="userIds"
        render={({ field }) => (
          <UserRecipientPicker
            recipients={recipients}
            onChange={(users) => {
              onRecipientsChange(users);
              field.onChange(users.map(user => user.id));
            }}
          />
        )}
      />
      {errors.userIds && <p role="alert" className="text-sm text-destructive">{t('compose.errors.userIds')}</p>}
    </div>
  );
}

/** Who receives the message. The role or the user picker appears only for the target that uses it. */
export function BroadcastAudienceFields({ idPrefix, control, errors, target, recipients, onRecipientsChange }: TBroadcastAudienceFieldsProps) {
  return (
    <>
      <TargetField idPrefix={idPrefix} control={control} />
      {target === 'ROLE' && <RoleField idPrefix={idPrefix} control={control} errors={errors} />}
      {target === 'USERS' && (
        <UserField control={control} errors={errors} recipients={recipients} onRecipientsChange={onRecipientsChange} />
      )}
    </>
  );
}
