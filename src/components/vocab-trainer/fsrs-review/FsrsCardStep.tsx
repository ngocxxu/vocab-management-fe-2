'use client';

import type { TSrsQuestionType } from '@/types/srs-settings';
import type { TFsrsAnswerCheck, TFsrsAnswerDiffSegment, TFsrsQueueItem } from '@/types/vocab-trainer';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { checkReviewAnswer } from '@/actions/vocab-trainers';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { EFsrsRating, EQuestionType } from '@/enum/vocab-trainer';
import { cn } from '@/libs/utils';
import { clampDuration, directionLabelKey, ratingForKey } from '@/utils/fsrs-review';
import FlipCard from '../FlipCard';
import FsrsRatingButtons from './FsrsRatingButtons';

type FsrsCardStepProps = Readonly<{
  trainerId: string;
  item: TFsrsQueueItem;
  questionType: TSrsQuestionType;
  /** `retry` is the UI-only round after a session: nothing is sent to the server. */
  variant: 'review' | 'retry';
  /** Resolves true when the answer was accepted; the step is then replaced by the next card. */
  onRate: (rating: EFsrsRating, meta: { answerId: string; durationMs: number }) => Promise<boolean>;
}>;

const SEGMENT_CLASSES: Record<TFsrsAnswerDiffSegment['type'], string> = {
  same: 'text-foreground',
  missing: 'text-success underline decoration-2',
  extra: 'text-destructive line-through',
};

/** Keys under trainer.fsrs.card for the text a screen reader reads after a segment. */
const SEGMENT_HINT_KEYS: Record<TFsrsAnswerDiffSegment['type'], string | null> = {
  same: null,
  missing: 'missingHint',
  extra: 'extraHint',
};

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

const FsrsCardStep: React.FC<FsrsCardStepProps> = ({ trainerId, item, questionType, variant, onRate }) => {
  const t = useTranslations('trainer.fsrs');
  const isTyped = questionType === EQuestionType.FILL_IN_THE_BLANK;
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [check, setCheck] = useState<TFsrsAnswerCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // One id per card shown: sending it again after a failed request never schedules the card twice.
  const [answerId] = useState(() => crypto.randomUUID());
  const startedAt = useRef(0);
  const submitLock = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    inputRef.current?.focus();
  }, []);

  const handleRate = useCallback(async (rating: EFsrsRating) => {
    // A double click or a held key must not send a second answer while the first is on its way.
    if (submitLock.current) {
      return;
    }
    submitLock.current = true;
    setIsSubmitting(true);
    const accepted = await onRate(rating, { answerId, durationMs: clampDuration(startedAt.current, Date.now()) });
    if (!accepted) {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }, [onRate, answerId]);

  const handleCheck = async (typed: string) => {
    if (isChecking || revealed) {
      return;
    }
    setIsChecking(true);
    try {
      setCheck(await checkReviewAnswer(trainerId, item.cardId, typed));
      setRevealed(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('review.checkFailed'));
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if (!revealed) {
        if (!isTyped && (event.key === ' ' || event.key === 'Enter') && !isTypingTarget(event.target)) {
          event.preventDefault();
          setRevealed(true);
        }
        return;
      }
      const rating = ratingForKey(event.key);
      if (rating && !isTypingTarget(event.target)) {
        event.preventDefault();
        void handleRate(rating);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, isTyped, handleRate]);

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-muted-foreground">{t(directionLabelKey(item.direction))}</span>
        {item.isNew && <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">{t('card.new')}</span>}
      </div>

      {isTyped
        ? (
            <div className="rounded-3xl border-2 border-border bg-card p-6 text-center sm:p-8">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.frontLanguageCode.toUpperCase()}</span>
              <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">{item.frontText.join(', ')}</h2>
            </div>
          )
        : (
            <FlipCard
              question={{
                frontText: item.frontText,
                backText: item.acceptedAnswers,
                frontLanguageCode: item.frontLanguageCode,
                backLanguageCode: item.backLanguageCode,
              }}
              isFlipped={revealed}
              onFlip={() => setRevealed(true)}
            />
          )}

      {isTyped && (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCheck(answer);
          }}
        >
          <label htmlFor={`answer-${item.cardId}`} className="text-sm font-medium text-foreground">
            {t('card.yourAnswer', { language: item.backLanguageCode.toUpperCase() })}
          </label>
          <Input
            ref={inputRef}
            id={`answer-${item.cardId}`}
            value={answer}
            onChange={event => setAnswer(event.target.value)}
            readOnly={revealed}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="h-12 text-lg"
          />
          {!revealed && (
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isChecking}>{t('card.check')}</Button>
              <Button type="button" variant="outline" disabled={isChecking} onClick={() => void handleCheck('')}>{t('card.iDontKnow')}</Button>
            </div>
          )}
        </form>
      )}

      {!isTyped && !revealed && (
        <div className="flex justify-center">
          <Button type="button" onClick={() => setRevealed(true)}>
            {t('card.showAnswer')}
            <span className="ml-2 text-xs opacity-70" aria-hidden="true">{t('card.spaceHint')}</span>
          </Button>
        </div>
      )}

      {isTyped && revealed && check && (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4" aria-live="polite">
          <p className="text-sm text-muted-foreground">{t('card.comparedWith')}</p>
          <p className="text-xl font-semibold">
            {check.diff.map((segment, index) => {
              const hintKey = SEGMENT_HINT_KEYS[segment.type];

              return (
                // eslint-disable-next-line react/no-array-index-key -- the segments have no id and never reorder
                <span key={index} className={cn(SEGMENT_CLASSES[segment.type])}>
                  {segment.text}
                  {hintKey && <span className="sr-only">{t(`card.${hintKey}`)}</span>}
                </span>
              );
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('card.accepted', { answers: check.correctAnswers.join(', ') })}
          </p>
        </div>
      )}

      {revealed && variant === 'review' && (
        <FsrsRatingButtons
          preview={item.preview}
          suggested={check?.suggestedRating}
          disabled={isSubmitting}
          onRate={rating => void handleRate(rating)}
        />
      )}

      {revealed && variant === 'retry' && (
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={t('card.retryGroup')}>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => void handleRate(EFsrsRating.AGAIN)}>
            {t('card.stillMissed')}
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={() => void handleRate(EFsrsRating.GOOD)}>
            {t('card.gotIt')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FsrsCardStep;
