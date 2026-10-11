'use client';

import type { TCloneFormData } from '@/libs/validations/vocab-trainer';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { cloneVocabTrainer } from '@/actions/vocab-trainers';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { createCloneFormSchema, dateInputToEndsAt } from '@/libs/validations/vocab-trainer';

type CloneTrainerDialogProps = Readonly<{
  /** The trainer a new cycle starts from; the dialog is closed while it is null. */
  trainer: TVocabTrainer | null;
  onClose: () => void;
  /** Called after the new trainer was created. */
  onCloned: () => void;
}>;

function CloneForm({ trainer, onClose, onCloned }: Readonly<{ trainer: TVocabTrainer; onClose: () => void; onCloned: () => void }>) {
  const t = useTranslations();
  const schema = useMemo(() => createCloneFormSchema(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<TCloneFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { name: t('trainer.clone.defaultName', { name: trainer.name }), endsAt: '' },
  });
  const wordCount = trainer.vocabAssignments?.length ?? 0;

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const created = await cloneVocabTrainer(trainer.id, { name: values.name.trim(), endsAt: dateInputToEndsAt(values.endsAt) });
      const skipped = created.fsrsSkippedVocabIds?.length ?? 0;
      toast.success(t('trainer.clone.started'));
      if (skipped > 0) {
        toast.info(t('trainer.toast.skipped', { count: skipped }));
      }
      onCloned();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('trainer.clone.startFailed'));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <DialogHeader>
          <DialogTitle>{t('trainer.clone.title')}</DialogTitle>
          <DialogDescription>
            {t('trainer.clone.description', { count: wordCount, name: trainer.name })}
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('trainer.clone.name')}</FormLabel>
              <FormControl>
                <Input className="mt-1" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endsAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('trainer.clone.deadline')}
                {' '}
                <span className="font-normal text-muted-foreground">{t('trainer.clone.optional')}</span>
              </FormLabel>
              <FormControl>
                <Input type="date" className="mt-1" {...field} />
              </FormControl>
              <p className="text-sm text-muted-foreground">{t('trainer.clone.deadlineHint')}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>{t('trainer.clone.cancel')}</Button>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>{isSubmitting ? t('trainer.clone.starting') : t('trainer.clone.startButton')}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

const CloneTrainerDialog: React.FC<CloneTrainerDialogProps> = ({ trainer, onClose, onCloned }) => (
  <Dialog open={trainer !== null} onOpenChange={open => !open && onClose()}>
    <DialogContent className="sm:max-w-md">
      {/* Keyed by trainer so the form always starts from the trainer that was chosen. */}
      {trainer && <CloneForm key={trainer.id} trainer={trainer} onClose={onClose} onCloned={onCloned} />}
    </DialogContent>
  </Dialog>
);

export default CloneTrainerDialog;
