'use client';

import type { TAdminPlan, TAdminPlanFormValues, TAdminUserRole } from '@/types/admin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { adminPlanFormSchema } from '@/libs/validations/admin';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { toPlanFormValues } from '../utils/admin-plans';
import { PlanDetailFields, PlanExtraFields, PlanLimitFields } from './PlanFormFields';

type TPlanFormDialogProps = Readonly<{
  role: TAdminUserRole;
  plan?: TAdminPlan;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TAdminPlanFormValues) => void;
}>;

/** Create or edit one plan. The role is fixed by the card that opened the dialog. */
export function PlanFormDialog({ role, plan, isPending, onOpenChange, onSubmit }: TPlanFormDialogProps) {
  const t = useTranslations('admin.plans');
  const tUsers = useTranslations('admin.users');
  const form = useForm<TAdminPlanFormValues>({
    resolver: zodResolver(adminPlanFormSchema),
    defaultValues: toPlanFormValues(plan),
    mode: 'onChange',
  });
  const roleName = tUsers(`roles.${role}`);
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>{plan ? t('dialog.editTitle', { role: roleName }) : t('dialog.createTitle', { role: roleName })}</DialogTitle>
              <DialogDescription>{t('dialog.description')}</DialogDescription>
            </DialogHeader>

            {hasErrors && <p role="alert" className="text-sm text-destructive">{t('validation.invalid')}</p>}

            <PlanDetailFields />
            <PlanLimitFields />
            <PlanExtraFields />

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                {t('dialog.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {t('dialog.save')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
