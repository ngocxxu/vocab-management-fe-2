'use client';

import type { TFsrsPreviewButton } from '@/types/vocab-trainer';
import React from 'react';
import { Button } from '@/shared/ui/button';
import { EFsrsRating } from '@/enum/vocab-trainer';
import { cn } from '@/libs/utils';
import { formatInterval, FSRS_RATING_LABELS, FSRS_RATINGS } from '@/utils/fsrs-review';

type FsrsRatingButtonsProps = Readonly<{
  preview: Record<EFsrsRating, TFsrsPreviewButton>;
  /** The button the answer check suggests; the user's click is still final. */
  suggested?: EFsrsRating;
  disabled?: boolean;
  onRate: (rating: EFsrsRating) => void;
}>;

const RATING_CLASSES: Record<EFsrsRating, string> = {
  [EFsrsRating.AGAIN]: 'border-destructive/40 hover:bg-destructive/10',
  [EFsrsRating.HARD]: 'border-warning/60 hover:bg-warning/15',
  [EFsrsRating.GOOD]: 'border-success/40 hover:bg-success/10',
  [EFsrsRating.EASY]: 'border-primary/40 hover:bg-primary/10',
};

const FsrsRatingButtons: React.FC<FsrsRatingButtonsProps> = ({ preview, suggested, disabled = false, onRate }) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="How well did you remember it?">
    {FSRS_RATINGS.map((rating, index) => {
      const interval = formatInterval(preview[rating].scheduledDays);
      const isSuggested = suggested === rating;

      return (
        <Button
          key={rating}
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onRate(rating)}
          aria-keyshortcuts={String(index + 1)}
          aria-label={`${FSRS_RATING_LABELS[rating]}, comes back in ${interval}${isSuggested ? ', suggested' : ''}`}
          className={cn('h-auto flex-col gap-0.5 rounded-xl py-3 sm:h-auto', RATING_CLASSES[rating], isSuggested && 'ring-2 ring-primary')}
        >
          <span className="text-sm font-semibold text-foreground">{FSRS_RATING_LABELS[rating]}</span>
          <span className="text-xs text-muted-foreground">{interval}</span>
          <span className="text-[10px] text-muted-foreground" aria-hidden="true">
            {isSuggested ? 'Suggested · ' : ''}
            {index + 1}
          </span>
        </Button>
      );
    })}
  </div>
);

export default FsrsRatingButtons;
