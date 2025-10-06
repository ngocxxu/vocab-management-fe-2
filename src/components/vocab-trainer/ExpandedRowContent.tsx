import type { TVocabTrainer } from '@/types/vocab-trainer';
import React from 'react';

type ExpandedRowContentProps = {
  trainer: TVocabTrainer;
  columnsCount: number;
  className?: string;
};

const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
  trainer,
  columnsCount,
  className = '',
}) => {
  return (
    <tr className={`bg-slate-50 dark:bg-slate-800 ${className}`}>
      <td colSpan={columnsCount} className="p-4">
        <div className="space-y-4 pr-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Trainer Details
            </h3>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="rounded bg-slate-200 px-2 py-1 dark:bg-slate-700">
                {trainer.questionType.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Timer Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Set Count Time:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {trainer.setCountTime}
                    {' '}
                    seconds
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Count Time:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {trainer.countTime}
                    {' '}
                    seconds
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Reminder Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Status:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {trainer.reminderDisabled ? 'Disabled' : 'Enabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vocabulary Assignments */}
          {trainer.vocabAssignments && trainer.vocabAssignments.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h4 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                Assigned Vocabularies (
                {trainer.vocabAssignments.length}
                )
              </h4>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {trainer.vocabAssignments.slice(0, 9).map(assignment => (
                  <div
                    key={assignment.id}
                    className="rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-700"
                  >
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {assignment.vocab.textSource}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {assignment.vocab.textTargets.map(tt => tt.textTarget).join(', ')}
                    </div>
                  </div>
                ))}
                {trainer.vocabAssignments.length > 9 && (
                  <div className="flex items-center justify-center rounded border border-slate-200 bg-slate-50 p-2 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
                    +
                    {trainer.vocabAssignments.length - 9}
                    {' '}
                    more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ExpandedRowContent;
