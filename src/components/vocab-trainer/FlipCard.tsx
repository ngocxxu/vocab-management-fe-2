'use client';

import type { FlipCardProps } from '@/types/vocab-trainer';
import { VolumeLoud } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';

const FlipCard: React.FC<FlipCardProps> = ({
  question,
  isFlipped,
  onFlip,
  onPlayAudio,
}) => {
  const { frontText, backText, frontLanguageCode, backLanguageCode } = question;

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
        <div
          className="absolute inset-0 rounded-3xl border-2 border-border p-1 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl bg-card p-4 sm:p-6 md:p-8">
            <div className="mb-3 sm:mb-4 md:mb-6">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:px-4 sm:py-2 sm:text-sm">
                {safeFrontLanguageCode.toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              {safeFrontText.map((text, index) => (
                <h2
                  key={`${text}-${index}`}
                  className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl lg:text-4xl"
                >
                  {text}
                  {index < safeFrontText.length - 1 && ', '}
                </h2>
              ))}
            </div>
            {onPlayAudio && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-muted text-foreground hover:bg-muted/80"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio();
                }}
              >
                <VolumeLoud size={20} weight="BoldDuotone" />
              </Button>
            )}
            <div className="absolute bottom-4 text-sm text-muted-foreground">
              Click to flip
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 rotate-y-180 rounded-3xl border-2 border-border p-1 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl bg-card p-4 sm:p-6 md:p-8">
            <div className="mb-3 sm:mb-4 md:mb-6">
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success sm:px-4 sm:py-2 sm:text-sm">
                {safeBackLanguageCode.toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              {safeBackText.map((text, index) => (
                <h2
                  key={`${text}-${index}`}
                  className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl lg:text-4xl"
                >
                  {text}
                  {index < safeBackText.length - 1 && ', '}
                </h2>
              ))}
            </div>
            {onPlayAudio && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-muted text-foreground hover:bg-muted/80"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio();
                }}
              >
                <VolumeLoud size={20} weight="BoldDuotone" />
              </Button>
            )}
            <div className="absolute bottom-4 text-sm text-muted-foreground">
              Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
