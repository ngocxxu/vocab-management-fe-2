'use client';

import type { TTranslationAudioDialogue } from '@/types/vocab-trainer';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

type DialogueDisplayProps = {
  dialogue: TTranslationAudioDialogue[];
};

const DialogueDisplay: React.FC<DialogueDisplayProps> = ({ dialogue }) => {
  if (!dialogue || dialogue.length === 0) {
    return (
      <Card className="border-2 border-yellow-500/30 bg-white dark:border-yellow-400/30 dark:bg-slate-900">
        <CardContent className="p-8 text-center text-slate-600 dark:text-slate-300">
          No dialogue available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-yellow-500/30 bg-white dark:border-yellow-400/30 dark:bg-slate-900">
      <CardContent className="p-6">
        <div className="space-y-4">
          {dialogue.map((item, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <div
                className={`flex flex-1 flex-col gap-2 ${
                  index % 2 === 0 ? 'items-start' : 'items-end'
                }`}
              >
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {item.speaker}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    index % 2 === 0
                      ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 text-slate-900 dark:from-yellow-400/10 dark:to-yellow-500/10 dark:text-white'
                      : 'bg-gradient-to-br from-blue-400/20 to-blue-500/20 text-slate-900 dark:from-blue-400/10 dark:to-blue-500/10 dark:text-white'
                  }`}
                >
                  <p className="text-base leading-relaxed">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DialogueDisplay;
