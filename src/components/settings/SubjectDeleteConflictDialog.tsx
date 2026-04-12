'use client';

import { AltArrowRight, Archive, DangerTriangle } from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SubjectDeleteConflictDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: string;
  vocabularyCount?: number;
}>;

export function SubjectDeleteConflictDialog({
  open,
  onOpenChange,
  subjectId,
  vocabularyCount,
}: SubjectDeleteConflictDialogProps) {
  const router = useRouter();

  const handleViewVocabularies = () => {
    onOpenChange(false);
    router.push(`/vocab-list?subjectIds=${encodeURIComponent(subjectId)}`);
  };

  const countLabel = vocabularyCount !== undefined
    ? `${vocabularyCount} Vocabularies`
    : 'Vocabularies';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-md gap-6 rounded-xl sm:max-w-md">
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/90"
            aria-hidden
          >
            <DangerTriangle
              size={32}
              weight="BoldDuotone"
              className="text-primary dark:text-primary"
            />
          </div>
          <DialogHeader className="items-center space-y-2 text-center sm:text-center">
            <DialogTitle className="text-xl font-bold text-foreground">
              Cannot Delete Subject
            </DialogTitle>
            <DialogDescription asChild>
              <p className="text-center text-sm text-muted-foreground">
                {vocabularyCount !== undefined
                  ? (
                      <>
                        This subject is currently used by
                        {' '}
                        <span className="font-semibold text-foreground">
                          {vocabularyCount}
                          {' '}
                          vocabularies
                        </span>
                        . To delete this subject, you must first reassign or delete the
                        associated vocabularies.
                      </>
                    )
                  : (
                      <>
                        This subject is currently used by
                        {' '}
                        <span className="font-semibold text-foreground">one or more vocabularies</span>
                        . To delete this subject, you must first reassign or delete the associated
                        vocabularies.
                      </>
                    )}
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
          <Button
            type="button"
            variant="secondary"
            className="flex-1 rounded-lg font-semibold tracking-wide uppercase"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-lg font-semibold tracking-wide uppercase"
            onClick={handleViewVocabularies}
          >
            View vocabularies
            <AltArrowRight size={18} weight="BoldDuotone" className="ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
