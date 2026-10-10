'use client';

import type { TCloneFormData } from '@/libs/validations/vocab-trainer';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { zodResolver } from '@hookform/resolvers/zod';
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
  const schema = useMemo(() => createCloneFormSchema(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<TCloneFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { name: `${trainer.name} (new cycle)`, endsAt: '' },
  });
  const wordCount = trainer.vocabAssignments?.length ?? 0;

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const created = await cloneVocabTrainer(trainer.id, { name: values.name.trim(), endsAt: dateInputToEndsAt(values.endsAt) });
      const skipped = created.fsrsSkippedVocabIds?.length ?? 0;
      toast.success('New cycle started');
      if (skipped > 0) {
        toast.info(`${skipped} ${skipped === 1 ? 'word has' : 'words have'} no translation yet and got no questions.`);
      }
      onCloned();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start a new cycle');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <DialogHeader>
          <DialogTitle>Start a new cycle</DialogTitle>
          <DialogDescription>
            A new trainer with the same
            {' '}
            {wordCount}
            {' '}
            {wordCount === 1 ? 'word' : 'words'}
            , directions and settings. Every question starts as new.
            {' '}
            {trainer.name}
            {' '}
            stays as it is, with its history.
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
                Deadline
                {' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input type="date" className="mt-1" {...field} />
              </FormControl>
              <p className="text-sm text-muted-foreground">Every word will be asked again before this date, for example an exam.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>{isSubmitting ? 'Starting…' : 'Start new cycle'}</Button>
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
