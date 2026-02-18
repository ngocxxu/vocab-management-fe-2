'use client';

import type { ExamplesSectionProps } from '@/types/vocab-list';
import { AddCircle, CloseCircle } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '../ui/textarea';

const ExamplesSection: React.FC<ExamplesSectionProps> = ({
  targetIndex,
  examples,
  onExampleChange,
  onAddExample,
  onRemoveExample,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-2 shrink-0 rounded-full bg-primary" />
          <h4 className="text-sm font-semibold">Usage Examples</h4>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddExample(targetIndex)}
          className="gap-1.5"
        >
          <AddCircle size={14} weight="BoldDuotone" />
          Add Example
        </Button>
      </div>
      <div className="space-y-3">
        {examples.map((example, exampleIndex) => (
          <div key={example.id} className="flex items-center space-x-3 rounded-lg border p-3">
            <div className="grid flex-1 grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`example-source-${targetIndex}-${exampleIndex}`} className="text-xs tracking-wide uppercase">Source</Label>
                <Textarea
                  id={`example-source-${targetIndex}-${exampleIndex}`}
                  placeholder="Source text example..."
                  value={example.source}
                  onChange={e => onExampleChange(exampleIndex, 'source', e.target.value, targetIndex)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`example-target-${targetIndex}-${exampleIndex}`} className="text-xs tracking-wide uppercase">Target</Label>
                <Textarea
                  id={`example-target-${targetIndex}-${exampleIndex}`}
                  placeholder="Target text example..."
                  value={example.target}
                  onChange={e => onExampleChange(exampleIndex, 'target', e.target.value, targetIndex)}
                  className="mt-1"
                />
              </div>
            </div>
            {examples.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemoveExample(exampleIndex, targetIndex)}
                className="shrink-0"
              >
                <CloseCircle size={16} weight="BoldDuotone" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamplesSection;
