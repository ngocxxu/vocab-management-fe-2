'use client';

import type { TVocab } from '@/types/vocab-list';
import { Volume2 } from 'lucide-react';
import React, { useCallback } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Button } from '@/components/ui/button';
import { selectVoiceByCode } from '@/utils/textToSpeech';

type ExpandedRowContentProps = {
  vocab: TVocab;
  columnsCount: number;
  className?: string;
  showWordType?: boolean;
  showGrammar?: boolean;
  showExplanations?: boolean;
  showSubjects?: boolean;
  showExamples?: boolean;
};

const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
  vocab,
  columnsCount,
  className = '',
  showGrammar = true,
  showExplanations = true,
  showSubjects = true,
  showExamples = true,
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Vocabulary Details
            </h3>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="rounded bg-slate-200 px-2 py-1 dark:bg-slate-700">
                {vocab.sourceLanguageCode.toUpperCase()}
              </span>
              <span>→</span>
              <span className="rounded bg-slate-200 px-2 py-1 dark:bg-slate-700">
                {vocab.targetLanguageCode.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Text Targets */}
          <div className="space-y-3">
            {vocab.textTargets.map((target: TVocab['textTargets'][number], index: number) => (
              <div
                key={target.textTarget + Math.random()}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                {/* Target Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {target.textTarget}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => handleSpeakTextTarget(target.textTarget)}
                      aria-label="Play pronunciation"
                      title="Play pronunciation"
                    >
                      <Volume2 className="h-4 w-4 text-slate-500" />
                    </Button>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Target
                      {' '}
                      {index + 1}
                    </p>
                  </div>
                  {target.wordType?.name && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {target.wordType.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-3">
                  {showGrammar && target.grammar && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Grammar:</span>
                      <span className="ml-2 text-slate-600 dark:text-slate-400">{target.grammar}</span>
                    </div>
                  )}

                  {showSubjects && target.textTargetSubjects && target.textTargetSubjects.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Subjects:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {target.textTargetSubjects.map(tts => (
                          <span
                            key={tts.id}
                            className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          >
                            {tts.subject.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {showExplanations && (target.explanationSource || target.explanationTarget) && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Explanation:</span>
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-700">
                            <div>
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Source:</span>
                              <p className="text-slate-700 dark:text-slate-300">{target.explanationSource}</p>
                            </div>
                          </div>
                          <div className="rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-700">
                            <div>
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Target:</span>
                              <p className="text-slate-700 dark:text-slate-300">{target.explanationTarget}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {showExamples && target.vocabExamples.filter(example => example.source || example.target).length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Examples:</span>
                      <div className="mt-2 space-y-2">
                        {target.vocabExamples.map((example, index) => (
                          <div className="mt-2 space-y-2" key={example.source + index}>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-700">
                                <div>
                                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Source:</span>
                                  <p className="text-slate-700 dark:text-slate-300">{example.source}</p>
                                </div>
                              </div>

                              <div className="rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-700">
                                <div>
                                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Target:</span>
                                  <p className="text-slate-700 dark:text-slate-300">{example.target}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ExpandedRowContent;
