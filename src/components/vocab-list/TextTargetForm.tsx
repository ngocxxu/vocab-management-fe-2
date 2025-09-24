'use client';

import type { TSubject } from '@/types/subject';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ExamplesSection from './ExamplesSection';
import SubjectsSection from './SubjectsSection';

type WordType = {
  id: string;
  name: string;
  description: string;
};

type TextTarget = {
  wordTypeId: string;
  textTarget: string;
  grammar: string;
  explanationSource: string;
  explanationTarget: string;
  subjectIds: string[];
  vocabExamples: Array<{ source: string; target: string }>;
};

type TextTargetFormProps = {
  targetIndex: number;
  target: TextTarget;
  wordTypes: { items: WordType[] };
  isLoading: boolean;
  isError: boolean;
  subjects: TSubject[];
  subjectsLoading: boolean;
  subjectsError: boolean;
  onInputChange: (field: string, value: string, targetIndex: number) => void;
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
};

const TextTargetForm: React.FC<TextTargetFormProps> = React.memo(({
  targetIndex,
  target,
  wordTypes,
  isLoading,
  isError,
  subjects,
  subjectsLoading,
  subjectsError,
  onInputChange,
  onExampleChange,
  onAddExample,
  onRemoveExample,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor={`wordType-${targetIndex}`}>Word Type</Label>
          <Select
            value={target.wordTypeId}
            onValueChange={(value: string) => onInputChange('wordTypeId', value, targetIndex)}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select word type" />
            </SelectTrigger>
            <SelectContent>
              {isLoading
                ? (
                    <SelectItem value="loading" disabled>
                      Loading word types...
                    </SelectItem>
                  )
                : isError
                  ? (
                      <SelectItem value="error" disabled>
                        Error loading word types
                      </SelectItem>
                    )
                  : (
                      wordTypes.items.map((wordType: WordType) => (
                        <SelectItem key={wordType.id} value={wordType.id}>
                          {wordType.name}
                        </SelectItem>
                      ))
                    )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`grammar-${targetIndex}`}>Grammar</Label>
          <Input
            id={`grammar-${targetIndex}`}
            placeholder="e.g., Grammar..."
            value={target.grammar}
            onChange={e => onInputChange('grammar', e.target.value, targetIndex)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor={`explanationSource-${targetIndex}`}>Explanation (Source Language)</Label>
          <Textarea
            id={`explanationSource-${targetIndex}`}
            placeholder="Explanation in source language..."
            value={target.explanationSource}
            onChange={e => onInputChange('explanationSource', e.target.value, targetIndex)}
            className="mt-1"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor={`explanationTarget-${targetIndex}`}>Explanation (Target Language)</Label>
          <Textarea
            id={`explanationTarget-${targetIndex}`}
            placeholder="Explanation in target language..."
            value={target.explanationTarget}
            onChange={e => onInputChange('explanationTarget', e.target.value, targetIndex)}
            className="mt-1"
            rows={2}
          />
        </div>
      </div>

      <SubjectsSection
        targetIndex={targetIndex}
        subjects={subjects}
        subjectsLoading={subjectsLoading}
        subjectsError={subjectsError}
      />

      <ExamplesSection
        targetIndex={targetIndex}
        examples={target.vocabExamples}
        onExampleChange={onExampleChange}
        onAddExample={onAddExample}
        onRemoveExample={onRemoveExample}
      />
    </div>
  );
});

TextTargetForm.displayName = 'TextTargetForm';

export default TextTargetForm;
