'use client';

import type { TRelatedWordItem, TRelatedWordsGroupedResponse } from '@/types/vocab-related-word';
import React from 'react';
import { AddSquare } from '@solar-icons/react/ssr';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip';

type WordRelationsDisplayProps = {
  relatedWords: TRelatedWordItem[] | TRelatedWordsGroupedResponse | undefined;
  onLinkedWordClick: (word: string) => void;
  onAddFreeTextWord: (word: string) => void;
};

function flattenRelatedWords(
  relatedWords: TRelatedWordItem[] | TRelatedWordsGroupedResponse,
): TRelatedWordItem[] {
  if (Array.isArray(relatedWords)) {
    return relatedWords;
  }
  return [
    ...relatedWords.synonyms,
    ...relatedWords.antonyms,
    ...relatedWords.related,
  ];
}

const WordRelationsDisplay: React.FC<WordRelationsDisplayProps> = ({
  relatedWords,
  onLinkedWordClick,
  onAddFreeTextWord,
}) => {
  if (!relatedWords) {
    return null;
  }

  const items = flattenRelatedWords(relatedWords);
  if (items.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Word Relations
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map(item =>
            item.linkedVocabId
              ? (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onLinkedWordClick(item.word)}
                    className="inline-flex cursor-pointer items-center rounded-lg border border-primary/50 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    {item.word}
                  </button>
                )
              : (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 px-3 py-1 text-sm text-foreground">
                        {item.word}
                        <button
                          type="button"
                          onClick={() => onAddFreeTextWord(item.word)}
                          className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-muted-foreground/15 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                          aria-label={`Add "${item.word}" to your list`}
                        >
                          <AddSquare size={13} weight="Bold" />
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">This word is not yet in your list. Click (+) to add it quickly</p>
                    </TooltipContent>
                  </Tooltip>
                ),
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default WordRelationsDisplay;
