'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LockPassword } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { changePassword } from '@/actions/auth';
import { EyeIcon } from '@/components/auth/EyeIcon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Schema messages are validation keys, translated by FormMessage.
function buildSchema(hasPassword: boolean) {
  return z
    .object({
      currentPassword: z.string().optional(),
      newPassword: z
        .string()
        .min(1, 'validation.newPasswordRequired')
        .min(6, 'validation.passwordTooShort'),
      confirmPassword: z.string().min(1, 'validation.confirmPasswordRequired'),
    })
    .superRefine((data, ctx) => {
      if (hasPassword && !data.currentPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validation.currentPasswordRequired',
          path: ['currentPassword'],
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validation.passwordsDoNotMatch',
          path: ['confirmPassword'],
        });
      }
    });
}

type ChangePasswordFormData = {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
};

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasPassword: boolean;
};

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onOpenChange,
  hasPassword,
}) => {
  const t = useTranslations('settings.password');
  const tErrors = useTranslations('errors');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(buildSchema(hasPassword)),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      await changePassword({
        currentPassword: hasPassword ? data.currentPassword : undefined,
        newPassword: data.newPassword,
      });
      toast.success(hasPassword ? t('changedToast') : t('setToast'));
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tErrors('updatePassword'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockPassword size={20} weight="BoldDuotone" className="text-muted-foreground" />
            {hasPassword ? t('changeTitle') : t('setTitle')}
          </DialogTitle>
          <DialogDescription>
            {hasPassword ? t('changeDescription') : t('setDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {hasPassword && (
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('currentPassword')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showCurrentPassword ? 'text' : 'password'} autoComplete="current-password" className="pr-10" {...field} />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(prev => !prev)}
                          className="absolute top-1/2 right-3 -translate-y-1/2"
                          aria-label={showCurrentPassword ? t('hidePassword') : t('showPassword')}
                        >
                          <EyeIcon open={showCurrentPassword} />
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('newPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" className="pr-10" {...field} />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(prev => !prev)}
                        className="absolute top-1/2 right-3 -translate-y-1/2"
                        aria-label={showNewPassword ? t('hidePassword') : t('showPassword')}
                      >
                        <EyeIcon open={showNewPassword} />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmNewPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" className="pr-10" {...field} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        className="absolute top-1/2 right-3 -translate-y-1/2"
                        aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
                      >
                        <EyeIcon open={showConfirmPassword} />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => handleOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('saving') : hasPassword ? t('update') : t('set')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
