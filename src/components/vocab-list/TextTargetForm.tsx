'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ExamplesSection from './ExamplesSection';
import SubjectsSection from './SubjectsSection';

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
  onInputChange: (field: string, value: string, targetIndex: number) => void;
  onSubjectChange: (subjectId: string, targetIndex: number) => void;
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
};

const TextTargetForm: React.FC<TextTargetFormProps> = ({
  targetIndex,
  target,
  onInputChange,
  onSubjectChange,
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
              <SelectItem value="1">Greeting</SelectItem>
              <SelectItem value="2">Expression</SelectItem>
              <SelectItem value="3">Farewell</SelectItem>
              <SelectItem value="4">Request</SelectItem>
              <SelectItem value="5">Apology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`grammar-${targetIndex}`}>Grammar</Label>
          <Input
            id={`grammar-${targetIndex}`}
            placeholder="e.g., Interjection, Noun, Verb..."
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
        selectedSubjectIds={target.subjectIds}
        onSubjectChange={onSubjectChange}
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
};

export default TextTargetForm;
