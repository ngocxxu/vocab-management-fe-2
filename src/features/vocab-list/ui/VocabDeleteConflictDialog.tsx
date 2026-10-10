'use client';

import type { TVocabInUse } from '@/types/vocab-conflict';
import { AltArrowRight, Archive, DangerTriangle } from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';

type VocabDeleteConflictDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: TVocabInUse | null;
  /** The words that were refused, so the resolve page can show them. */
  vocabIds: string[];
}>;

/** Shown when a delete is refused because the word is in a trainer. "View trainers" opens the page that resolves it. */
export default function VocabDeleteConflictDialog({ open, onOpenChange, conflict, vocabIds }: VocabDeleteConflictDialogProps) {
  const router = useRouter();

  const handleView = () => {
    onOpenChange(false);
    router.push(`/vocab-list/trainer-conflicts?vocabIds=${encodeURIComponent(vocabIds.join(','))}`);
  };

  const isBulk = conflict?.kind === 'bulk';
  const countLabel = conflict?.kind === 'bulk'
    ? `${conflict.blockedCount} ${conflict.blockedCount === 1 ? 'Vocab' : 'Vocabs'}`
    : conflict?.kind === 'single'
      ? `${conflict.trainerCount} ${conflict.trainerCount === 1 ? 'Trainer' : 'Trainers'}`
      : 'Trainers';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-md gap-6 rounded-xl sm:max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10" aria-hidden>
            <DangerTriangle size={32} weight="BoldDuotone" className="text-destructive" />
          </div>
          <DialogHeader className="items-center space-y-2 text-center sm:text-center">
            <DialogTitle className="text-xl font-bold text-foreground">
              {isBulk ? 'Cannot Delete Vocabularies' : 'Cannot Delete Vocabulary'}
            </DialogTitle>
            <DialogDescription asChild>
              <p className="text-center text-sm text-muted-foreground">
                {isBulk
                  ? 'Some of the selected words are still in trainers. Nothing was deleted. Remove them from their trainers first.'
                  : 'This word is still in one or more trainers. Remove it from the trainers first.'}
              </p>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Archive size={20} weight="Linear" className="shrink-0 text-muted-foreground" />
            Affected Items
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            {countLabel}
          </span>
        </div>

        <DialogFooter className="flex w-full flex-row gap-3 sm:justify-stretch">
          <Button type="button" variant="secondary" className="flex-1 rounded-lg font-semibold tracking-wide uppercase" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" className="flex-1 rounded-lg font-semibold tracking-wide uppercase" onClick={handleView}>
            View trainers
            <AltArrowRight size={18} weight="BoldDuotone" className="ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
