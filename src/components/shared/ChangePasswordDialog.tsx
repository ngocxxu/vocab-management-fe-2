'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LockPassword } from '@solar-icons/react/ssr';
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

function buildSchema(hasPassword: boolean) {
  return z
    .object({
      currentPassword: z.string().optional(),
      newPassword: z
        .string()
        .min(1, 'New password is required')
        .min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .superRefine((data, ctx) => {
      if (hasPassword && !data.currentPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Current password is required',
          path: ['currentPassword'],
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
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
      toast.success(hasPassword ? 'Password changed successfully' : 'Password set successfully');
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
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
            {hasPassword ? 'Change Password' : 'Set Password'}
          </DialogTitle>
          <DialogDescription>
            {hasPassword
              ? 'Enter your current password and choose a new one.'
              : 'Add a password to your account so you can also sign in with email and password.'}
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
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showCurrentPassword ? 'text' : 'password'} autoComplete="current-password" className="pr-10" {...field} />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(prev => !prev)}
                          className="absolute top-1/2 right-3 -translate-y-1/2"
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" className="pr-10" {...field} />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(prev => !prev)}
                        className="absolute top-1/2 right-3 -translate-y-1/2"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
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
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" className="pr-10" {...field} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        className="absolute top-1/2 right-3 -translate-y-1/2"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : hasPassword ? 'Update Password' : 'Set Password'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
