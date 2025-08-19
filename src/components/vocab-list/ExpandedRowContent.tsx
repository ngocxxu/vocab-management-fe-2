import type { TVocab } from '@/types/vocab-list';
import React from 'react';

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
  showWordType = true,
  showGrammar = true,
  showExplanations = true,
  showSubjects = true,
  showExamples = true,
}) => {
  return (
    <tr className={`bg-slate-50 dark:bg-slate-800 ${className}`}>
      <td colSpan={columnsCount} className="p-4">
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">Text Targets</h4>
            <div className="space-y-2">
              {vocab.textTargets.map((target: TVocab['textTargets'][number]) => (
                <div key={target.textTarget + Math.random()} className="rounded-lg border bg-white p-3 dark:bg-slate-700">
                  <div className="font-medium text-slate-900 dark:text-white">{target.textTarget}</div>

                  {showWordType && target.wordType?.name && (
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-medium">Word type:</span>
                      {' '}
                      {target.wordType.name}
                    </div>
                  )}

                  {showGrammar && target.grammar && (
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-medium">Grammar:</span>
                      {' '}
                      {target.grammar}
                    </div>
                  )}

                  {showExplanations && (
                    <>
                      {target.explanationSource && (
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-medium">Explanation (Source):</span>
                          {' '}
                          {target.explanationSource}
                        </div>
                      )}
                      {target.explanationTarget && (
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-medium">Explanation (Target):</span>
                          {' '}
                          {target.explanationTarget}
                        </div>
                      )}
                    </>
                  )}

                  {showSubjects && target.textTargetSubjects && target.textTargetSubjects.length > 0 && (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-medium">Subjects:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {target.textTargetSubjects.map(tts => (
                          <span
                            key={tts.id}
                            className="inline-flex items-center rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-800 dark:bg-slate-600 dark:text-slate-200"
                          >
                            {tts.subject.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {showExamples && target.vocabExamples && target.vocabExamples.length > 0 && (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-medium">Examples:</span>
                      <div className="mt-1 space-y-1">
                        {target.vocabExamples.map((example, exIndex) => (
                          <div key={exIndex} className="rounded bg-slate-100 p-2 dark:bg-slate-600">
                            <div>
                              <span className="font-medium">Source:</span>
                              {' '}
                              {example.source}
                            </div>
                            <div>
                              <span className="font-medium">Target:</span>
                              {' '}
                              {example.target}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ExpandedRowContent;
