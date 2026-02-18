'use client';

import type { DialogueDisplayProps } from '@/types/vocab-trainer';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const DialogueDisplay: React.FC<DialogueDisplayProps> = ({ dialogue }) => {
  if (!dialogue || dialogue.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="p-8 text-center text-muted-foreground">
          No dialogue available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          {dialogue.map((item, index) => (
            <div
              key={`${item.speaker}-${index}`}
              className={`flex gap-4 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div
                className={`flex flex-1 flex-col gap-2 ${index % 2 === 0 ? 'items-start' : 'items-end'}`}
              >
                <div className="text-sm font-semibold text-foreground">
                  {item.speaker}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    index % 2 === 0 ? 'bg-accent text-foreground' : 'bg-primary/10 text-foreground'
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
