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
        className={`relative h-96 w-full transform-gpu transition-transform duration-700 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 rounded-3xl border-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-pink-500 p-1 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950 p-8">
            {/* Language Badge */}
            <div className="mb-6">
              <span className="rounded-full bg-yellow-400/20 px-4 py-2 text-sm font-semibold text-yellow-400">
                {safeFrontLanguageCode.toUpperCase()}
              </span>
            </div>

            {/* Front Text */}
            <div className="text-center">
              {safeFrontText.map((text, index) => (
                <h2
                  key={text + index}
                  className="text-3xl font-bold text-white lg:text-4xl"
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
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio();
                }}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            )}

            {/* Click to flip hint */}
            <div className="absolute bottom-4 text-sm text-slate-300">
              Click to flip
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 rotate-y-180 rounded-3xl border-4 bg-gradient-to-br from-lime-400 via-green-500 to-emerald-500 p-1 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950 p-8">
            {/* Language Badge */}
            <div className="mb-6">
              <span className="rounded-full bg-lime-400/20 px-4 py-2 text-sm font-semibold text-lime-400">
                {safeBackLanguageCode.toUpperCase()}
              </span>
            </div>

            {/* Back Text */}
            <div className="text-center">
              {safeBackText.map((text, index) => (
                <h2
                  key={text + index}
                  className="text-3xl font-bold text-white lg:text-4xl"
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
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio();
                }}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            )}

            {/* Click to flip hint */}
            <div className="absolute bottom-4 text-sm text-slate-300">
              Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
