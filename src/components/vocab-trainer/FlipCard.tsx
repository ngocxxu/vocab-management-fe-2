'use client';

import type { TFlipCardQuestion } from '@/types/vocab-trainer';
import { Volume2 } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

type FlipCardProps = {
  question: TFlipCardQuestion;
  isFlipped: boolean;
  onFlip: () => void;
  onPlayAudio?: () => void;
};

const FlipCard: React.FC<FlipCardProps> = ({
  question,
  isFlipped,
  onFlip,
  onPlayAudio,
}) => {
  const { frontText, backText, frontLanguageCode, backLanguageCode } = question;

  // Add safety checks for language codes and text arrays
  const safeFrontLanguageCode = frontLanguageCode || 'EN';
  const safeBackLanguageCode = backLanguageCode || 'VI';
  const safeFrontText = frontText || ['No text available'];
  const safeBackText = backText || ['No text available'];

  return (
    <div className="perspective-1000 mx-auto max-w-2xl">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onFlip();
          }
        }}
        onClick={onFlip}
        className={`relative h-64 w-full transform-gpu transition-transform duration-700 sm:h-80 md:h-96 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 rounded-3xl border-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-pink-500 p-1 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl bg-white p-4 sm:p-6 md:p-8 dark:bg-slate-900">
            {/* Language Badge */}
            <div className="mb-3 sm:mb-4 md:mb-6">
              <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold text-yellow-600 sm:px-4 sm:py-2 sm:text-sm dark:text-yellow-400">
                {safeFrontLanguageCode.toUpperCase()}
              </span>
            </div>

            {/* Front Text */}
            <div className="text-center">
              {safeFrontText.map((text, index) => (
                <h2
                  key={text + index}
                  className="text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl lg:text-4xl dark:text-white"
                >
                  {text}
                  {index < safeFrontText.length - 1 && ', '}
                </h2>
              ))}
            </div>

            {/* Audio Button */}
            {onPlayAudio && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-slate-900/20 text-slate-900 hover:bg-slate-900/30 dark:bg-white/20 dark:text-white dark:hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio();
                }}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            )}

            {/* Click to flip hint */}
            <div className="absolute bottom-4 text-sm text-slate-600 dark:text-slate-300">
              Click to flip
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 rotate-y-180 rounded-3xl border-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-teal-600 p-1 backface-hidden dark:from-emerald-600 dark:via-teal-600 dark:to-emerald-700"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl bg-white p-4 sm:p-6 md:p-8 dark:bg-slate-900">
            {/* Language Badge */}
            <div className="mb-3 sm:mb-4 md:mb-6">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700 sm:px-4 sm:py-2 sm:text-sm dark:text-emerald-400">
                {safeBackLanguageCode.toUpperCase()}
              </span>
            </div>

            {/* Back Text */}
            <div className="text-center">
              {safeBackText.map((text, index) => (
                <h2
                  key={text + index}
                  className="text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl lg:text-4xl dark:text-white"
                >
                  {text}
                  {index < safeBackText.length - 1 && ', '}
                </h2>
              ))}
            </div>

            {/* Audio Button */}
            {onPlayAudio && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-slate-900/20 text-slate-900 hover:bg-slate-900/30 dark:bg-white/20 dark:text-white dark:hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio();
                }}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            )}

            {/* Click to flip hint */}
            <div className="absolute bottom-4 text-sm text-slate-600 dark:text-slate-300">
              Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
