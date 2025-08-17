'use client';

import { Plus, X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '../ui/textarea';

type VocabExample = {
  source: string;
  target: string;
};

type ExamplesSectionProps = {
  targetIndex: number;
  examples: VocabExample[];
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
};

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
        <h4 className="text-sm font-medium">
          Vocabulary Examples for Vocab
          {' '}
          {targetIndex + 1}
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddExample(targetIndex)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Example
        </Button>
      </div>
      <div className="space-y-3">
        {examples.map((example, exampleIndex) => (
          <div key={`${example.source}-${example.target}-${Math.random()}`} className="flex items-center space-x-3 rounded-lg border p-3">
            <div className="grid flex-1 grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`example-source-${targetIndex}-${exampleIndex}`} className="text-sm">Source</Label>
                <Textarea
                  id={`example-source-${targetIndex}-${exampleIndex}`}
                  placeholder="Source text example..."
                  value={example.source}
                  onChange={e => onExampleChange(exampleIndex, 'source', e.target.value, targetIndex)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`example-target-${targetIndex}-${exampleIndex}`} className="text-sm">Target</Label>
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
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamplesSection;
