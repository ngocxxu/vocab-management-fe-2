'use client';

import type { TVocabTrainerConflict } from '@/types/vocab-conflict';
import { AltArrowLeft } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deleteVocab } from '@/actions/vocabs';
import { removeVocabFromTrainer } from '@/actions/vocab-trainers';
import { ETrainerMode } from '@/enum/vocab-trainer';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { vocabInUseText } from '@/utils/vocab-in-use';

type TrainerConflictsContentProps = Readonly<{
  conflicts: TVocabTrainerConflict[];
  loadFailed: boolean;
}>;

type TRemoveTarget = {
  vocabId: string;
  textSource: string;
  trainer: TVocabTrainerConflict['trainers'][number];
};

const MODE_LABEL: Record<ETrainerMode, string> = {
  [ETrainerMode.FSRS]: 'Spaced repetition',
  [ETrainerMode.CLASSIC]: 'Classic',
};

/** The words of a refused delete. Each word can be taken out of its trainers, then deleted once it is free. */
export default function TrainerConflictsContent({ conflicts, loadFailed }: TrainerConflictsContentProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TRemoveTarget | null>(null);

  const refresh = () => startTransition(() => router.refresh());

  const handleRemoveDialogOpenChange = (open: boolean) => {
    if (!open) {
      setRemoveTarget(null);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) {
      return;
    }
    const { vocabId, trainer } = removeTarget;
    setBusyKey(`${vocabId}:${trainer.id}`);
    try {
      await removeVocabFromTrainer(trainer.id, vocabId);
      toast.success(`Removed from ${trainer.name}`);
      setRemoveTarget(null);
      refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove the word from the trainer');
    } finally {
      setBusyKey(null);
    }
  };

  const handleDelete = async (vocabId: string, textSource: string) => {
    setBusyKey(vocabId);
    try {
      const result = await deleteVocab(vocabId);
      if (result.ok) {
        toast.success(`${textSource} deleted`);
      } else {
        toast.error(vocabInUseText(result.conflict));
      }
      refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete vocabulary');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/vocab-list">
          <AltArrowLeft size={18} weight="BoldDuotone" />
          Back to vocab list
        </Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">These words are still in trainers</h1>
        <p className="text-sm text-muted-foreground">
          Take each word out of its trainers, then delete it. Nothing is deleted until a word is free.
        </p>
      </div>

      {loadFailed && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load these words right now</AlertTitle>
          <AlertDescription>Please refresh the page or try again later.</AlertDescription>
        </Alert>
      )}

      {!loadFailed && conflicts.length === 0 && (
        <p className="text-center text-muted-foreground">Nothing is blocking these words any more.</p>
      )}

      {conflicts.map(conflict => (
        <Card key={conflict.vocabId} className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">{conflict.textSource}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conflict.trainers.length === 0
              ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">This word is not in any trainer any more.</p>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={busyKey === conflict.vocabId}
                      onClick={() => void handleDelete(conflict.vocabId, conflict.textSource)}
                    >
                      Delete vocabulary
                    </Button>
                  </div>
                )
              : (
                  <ul className="divide-y divide-border">
                    {conflict.trainers.map(trainer => (
                      <li key={trainer.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{trainer.name}</span>
                          <Badge variant="outline">{MODE_LABEL[trainer.mode]}</Badge>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyKey !== null}
                          onClick={() => setRemoveTarget({ vocabId: conflict.vocabId, textSource: conflict.textSource, trainer })}
                        >
                          Remove from trainer
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={removeTarget !== null} onOpenChange={handleRemoveDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {removeTarget ? `Remove ${removeTarget.textSource} from ${removeTarget.trainer.name}?` : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.trainer.mode === ETrainerMode.FSRS
                ? 'The review schedule of this word in this trainer is deleted. The review history is kept. The word stays in your library.'
                : 'The word stays in your library. It is only removed from this trainer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={busyKey !== null} onClick={() => void handleRemove()}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
