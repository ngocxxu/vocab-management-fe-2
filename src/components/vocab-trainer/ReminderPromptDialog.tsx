'use client';

import type { TVocabTrainer } from '@/types/vocab-trainer';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { answerReminderPrompt } from '@/actions/vocab-trainers';
import { logger } from '@/libs/Logger';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';

type ReminderPromptDialogProps = Readonly<{
  trainer: TVocabTrainer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Receives the trainer the backend returns after the answer. */
  onAnswered: (trainer: TVocabTrainer) => void;
}>;

/**
 * Asks whether reminders stay on after three failed attempts in a row.
 * Closing the dialog without an answer leaves the question pending.
 */
export default function ReminderPromptDialog({ trainer, open, onOpenChange, onAnswered }: ReminderPromptDialogProps) {
  const t = useTranslations('trainer.prompt');
  const [isSaving, setIsSaving] = useState(false);

  const answer = async (continueReminders: boolean) => {
    setIsSaving(true);
    try {
      const updated = await answerReminderPrompt(trainer.id, continueReminders);
      toast.success(continueReminders ? t('toastOn') : t('toastOff'));
      onAnswered(updated);
      onOpenChange(false);
    } catch (error) {
      logger.error('Answering the reminder prompt failed', { error, trainerId: trainer.id });
      toast.error(t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description', { name: trainer.name, count: trainer.reminderFailStreakForPrompt })}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => answer(false)} disabled={isSaving}>
            {t('no')}
          </Button>
          <Button onClick={() => answer(true)} disabled={isSaving}>
            {t('yes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
