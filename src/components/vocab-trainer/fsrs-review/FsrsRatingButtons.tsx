'use client';

import type { TFsrsPreviewButton } from '@/types/vocab-trainer';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { EFsrsRating } from '@/enum/vocab-trainer';
import { cn } from '@/libs/utils';
import { formatInterval, FSRS_RATING_LABEL_KEYS, FSRS_RATINGS } from '@/utils/fsrs-review';

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

const FsrsRatingButtons: React.FC<FsrsRatingButtonsProps> = ({ preview, suggested, disabled = false, onRate }) => {
  const t = useTranslations('trainer.fsrs');
  const intervalUnits = {
    lessThanDay: t('interval.lessThanDay'),
    day: t('interval.day'),
    month: t('interval.month'),
    year: t('interval.year'),
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={t('review.ratingGroup')}>
      {FSRS_RATINGS.map((rating, index) => {
        const interval = formatInterval(preview[rating].scheduledDays, intervalUnits);
        const isSuggested = suggested === rating;
        const ratingName = t(FSRS_RATING_LABEL_KEYS[rating]);

        return (
          <Button
            key={rating}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => onRate(rating)}
            aria-keyshortcuts={String(index + 1)}
            aria-label={`${t('review.ratingAria', { rating: ratingName, interval })}${isSuggested ? t('review.suggestedSuffix') : ''}`}
            className={cn('h-auto flex-col gap-0.5 rounded-xl py-3 sm:h-auto', RATING_CLASSES[rating], isSuggested && 'ring-2 ring-primary')}
          >
            <span className="text-sm font-semibold text-foreground">{ratingName}</span>
            <span className="text-xs text-muted-foreground">{interval}</span>
            <span className="text-[10px] text-muted-foreground" aria-hidden="true">
              {isSuggested ? t('review.suggestedBadge') : ''}
              {index + 1}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default FsrsRatingButtons;
