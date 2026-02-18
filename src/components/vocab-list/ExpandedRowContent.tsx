'use client';

import type { ExpandedRowContentProps, TExamples, TVocab } from '@/types/vocab-list';
import {
  AltArrowUp,
  Pen,
  VolumeLoud,
} from '@solar-icons/react/ssr';
import React, { useCallback } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Button } from '@/components/ui/button';
import { selectVoiceByCode } from '@/utils/textToSpeech';

function boldVocabInSentence(sentence: string, word: string): React.ReactNode {
  if (!word.trim()) {
    return sentence;
  }
  const lower = sentence.toLowerCase();
  const wordLower = word.toLowerCase();
  const i = lower.indexOf(wordLower);
  if (i === -1) {
    return sentence;
  }
  return (
    <>
      {sentence.slice(0, i)}
      <strong>{sentence.slice(i, i + word.length)}</strong>
      {sentence.slice(i + word.length)}
    </>
  );
}

const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
  vocab,
  columnsCount,
  className = '',
  showExplanations = true,
  showExamples = true,
  onCollapse,
  onEdit,
}) => {
  const { speak, cancel, voices } = useSpeechSynthesis();

  const handleSpeakTextTarget = useCallback((text: string) => {
    cancel();
    speak({
      text,
      voice: selectVoiceByCode(voices, vocab.targetLanguageCode || 'en'),
      rate: 0.95,
      pitch: 1,
      volume: 1,
    });
  }, [speak, cancel, voices, vocab.targetLanguageCode]);

  return (
    <tr className={`bg-slate-50 dark:bg-slate-800 ${className}`}>
      <td colSpan={columnsCount} className="p-4">
        <div className="space-y-4 pr-4">
          <div className="rounded-lg bg-card p-4 shadow-sm">
            <div
              className={`grid gap-4 ${vocab.textTargets.length >= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
            >
              {vocab.textTargets.map((target: TVocab['textTargets'][number], index: number) => (
                <div
                  key={`${target.textTarget}-${index}`}
                  className="rounded-lg border border-border bg-muted/20 p-4 dark:bg-muted/10"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <h4 className="text-lg font-bold text-foreground">
                        {target.textTarget}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 p-0"
                        onClick={() => handleSpeakTextTarget(target.textTarget)}
                        aria-label="Play pronunciation"
                        title="Play pronunciation"
                      >
                        <VolumeLoud size={18} weight="BoldDuotone" className="text-muted-foreground" />
                      </Button>
                    </div>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full p-0"
                        onClick={() => onEdit(vocab, index)}
                        aria-label="Edit vocab"
                        title="Edit"
                      >
                        <Pen size={16} weight="BoldDuotone" className="text-muted-foreground" />
                      </Button>
                    )}
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {target.wordType?.name && (
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {target.wordType.name.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {showExplanations && (target.explanationSource || target.explanationTarget) && (
                    <div className="mb-4">
                      <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Explanation
                      </p>
                      <div className="rounded-lg bg-muted p-4 dark:bg-muted">
                        {target.explanationSource && (
                          <p className="text-sm text-foreground italic">{target.explanationSource}</p>
                        )}
                        {target.explanationTarget && (
                          <p className={`text-xs text-muted-foreground ${target.explanationSource ? 'mt-2' : ''}`}>
                            {target.explanationTarget}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {showExamples && target.vocabExamples?.filter((ex: TExamples) => ex.source || ex.target).length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Usage Examples
                      </p>
                      <div className="space-y-3">
                        {target.vocabExamples
                          .filter((ex: TExamples) => ex.source || ex.target)
                          .map((example: TExamples, exIndex: number) => (
                            <div key={`${example.source}-${exIndex}`} className="space-y-0.5 rounded-none border-l-4 border-primary py-1.5 pl-3">
                              {example.source && (
                                <p className="text-sm text-foreground">
                                  {boldVocabInSentence(example.source, vocab.textSource)}
                                </p>
                              )}
                              {example.target && (
                                <p className="pl-2 text-xs text-muted-foreground">{example.target}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {onCollapse && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={onCollapse}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <AltArrowUp size={16} weight="BoldDuotone" />
                  Collapse Details
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ExpandedRowContent;
