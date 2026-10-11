'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { QuestionCircle } from '@solar-icons/react/ssr';
import { sendSupportEmail } from '@/actions/support';
import { SUPPORT_CATEGORIES, supportSchema } from '@/libs/validations/support';
import type { TSupportCategory, TSupportFormData } from '@/libs/validations/support';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

type SupportButtonProps = {
  userEmail?: string;
  className?: string;
  inline?: boolean;
};

// Category values are sent to the backend as they are; only the label shown in the select is translated.
const SUPPORT_CATEGORY_LABEL_KEYS: Record<TSupportCategory, string> = {
  'Bug Report': 'supportCategories.bugReport',
  'Feature Request': 'supportCategories.featureRequest',
  'Account Issue': 'supportCategories.accountIssue',
  'Other': 'supportCategories.other',
};

export function SupportButton({ userEmail = '', className, inline = false }: SupportButtonProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const form = useForm<TSupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      category: undefined,
      email: userEmail,
      subject: '',
      message: '',
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset({ category: undefined, email: userEmail, subject: '', message: '' });
    }
  };

  const onSubmit = async (data: TSupportFormData) => {
    try {
      await sendSupportEmail(data);
      toast.success(t('support.sent'));
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('support.sendFailed'));
    }
  };

  return (
    <>
      {inline
        ? (
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 flex-shrink-0 rounded-xl hover:bg-accent ${className ?? ''}`}
              onClick={() => setOpen(true)}
              title={t('support.inlineTitle')}
              aria-label={t('support.openAria')}
            >
              <QuestionCircle size={20} weight="BoldDuotone" className="text-muted-foreground" />
            </Button>
          )
        : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t('support.openAria')}
              className={`fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-lg ring-1 ring-border/50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${className ?? ''}`}
            >
              <QuestionCircle size={18} weight="BoldDuotone" className="text-primary" />
              <span>{t('support.trigger')}</span>
            </button>
          )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QuestionCircle size={20} weight="BoldDuotone" className="text-primary" />
              {t('support.title')}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('support.category')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('support.selectCategory')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPORT_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {t(SUPPORT_CATEGORY_LABEL_KEYS[cat])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('support.yourEmail')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        readOnly={Boolean(userEmail)}
                        className={userEmail ? 'bg-muted text-muted-foreground' : ''}
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('support.subject')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('support.subjectPlaceholder')}
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('support.message')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('support.messagePlaceholder')}
                        rows={4}
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-row justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={form.formState.isSubmitting}
                >
                  {t('support.cancel')}
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? t('support.sending') : t('support.send')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
