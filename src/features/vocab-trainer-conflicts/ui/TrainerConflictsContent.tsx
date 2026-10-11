'use client';

import type { TVocabTrainerConflict } from '@/types/vocab-conflict';
import { AltArrowLeft } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { vocabInUseMessage } from '@/utils/vocab-in-use';

type TrainerConflictsContentProps = Readonly<{
  conflicts: TVocabTrainerConflict[];
  loadFailed: boolean;
}>;

type TRemoveTarget = {
  vocabId: string;
  textSource: string;
  trainer: TVocabTrainerConflict['trainers'][number];
};

/** The words of a refused delete. Each word can be taken out of its trainers, then deleted once it is free. */
export default function TrainerConflictsContent({ conflicts, loadFailed }: TrainerConflictsContentProps) {
  const t = useTranslations('trainerConflicts');
  const tSubjects = useTranslations('subjects');
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TRemoveTarget | null>(null);

  const modeLabel: Record<ETrainerMode, string> = {
    [ETrainerMode.FSRS]: t('modeSpaced'),
    [ETrainerMode.CLASSIC]: t('modeClassic'),
  };

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
      toast.success(t('removedFrom', { name: trainer.name }));
      setRemoveTarget(null);
      refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('removeFailed'));
    } finally {
      setBusyKey(null);
    }
  };

  const handleDelete = async (vocabId: string, textSource: string) => {
    setBusyKey(vocabId);
    try {
      const result = await deleteVocab(vocabId);
      if (result.ok) {
        toast.success(t('deleted', { text: textSource }));
      } else {
        toast.error(vocabInUseMessage(result.conflict, tSubjects));
      }
      refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('deleteFailed'));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/vocab-list">
          <AltArrowLeft size={18} weight="BoldDuotone" />
          {t('backToList')}
        </Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {loadFailed && (
        <Alert variant="destructive">
          <AlertTitle>{t('loadFailedTitle')}</AlertTitle>
          <AlertDescription>{t('loadFailedDescription')}</AlertDescription>
        </Alert>
      )}

      {!loadFailed && conflicts.length === 0 && (
        <p className="text-center text-muted-foreground">{t('nothingBlocking')}</p>
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
                    <p className="text-sm text-muted-foreground">{t('notInAnyTrainer')}</p>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={busyKey === conflict.vocabId}
                      onClick={() => void handleDelete(conflict.vocabId, conflict.textSource)}
                    >
                      {t('deleteVocabulary')}
                    </Button>
                  </div>
                )
              : (
                  <ul className="divide-y divide-border">
                    {conflict.trainers.map(trainer => (
                      <li key={trainer.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{trainer.name}</span>
                          <Badge variant="outline">{modeLabel[trainer.mode]}</Badge>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyKey !== null}
                          onClick={() => setRemoveTarget({ vocabId: conflict.vocabId, textSource: conflict.textSource, trainer })}
                        >
                          {t('removeFromTrainer')}
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
              {removeTarget ? t('removeDialogTitle', { text: removeTarget.textSource, trainer: removeTarget.trainer.name }) : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.trainer.mode === ETrainerMode.FSRS
                ? t('removeFsrsDescription')
                : t('removeClassicDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction disabled={busyKey !== null} onClick={() => void handleRemove()}>
              {t('remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
