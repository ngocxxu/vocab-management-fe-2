'use client';

import type { TextTargetFormProps, WordTypeItem } from '@/types/vocab-list';
import React from 'react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import ExamplesSection from './ExamplesSection';
import SubjectsSection from './SubjectsSection';

const TextTargetForm: React.FC<TextTargetFormProps> = ({
  targetIndex,
  target,
  wordTypes,
  isLoading,
  isError,
  subjects,
  subjectsLoading,
  subjectsError,
  targetLanguageCode,
  onInputChange,
  onExampleChange,
  onAddExample,
  onRemoveExample,
}) => {
  return (
    <div className="space-y-6">
      <section>
        <div className="space-y-4">
          <div>
            <Label htmlFor={`textTarget-${targetIndex}`}>Target Text</Label>
            <Input
              id={`textTarget-${targetIndex}`}
              placeholder="Enter target text..."
              value={target.textTarget}
              onChange={e => onInputChange('textTarget', e.target.value, targetIndex)}
              className="mt-1 w-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor={`wordType-${targetIndex}`}>Word Type</Label>
              <Select
                value={target.wordTypeId || ''}
                onValueChange={(value: string) => onInputChange('wordTypeId', value === '__none__' ? '' : value, targetIndex)}
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
                          <>
                            <SelectItem value="__none__">None</SelectItem>
                            {wordTypes.map((wordType: WordTypeItem) => (
                              <SelectItem key={wordType.id} value={wordType.id}>
                                {wordType.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`grammar-${targetIndex}`}>Grammar Notes</Label>
              <Input
                id={`grammar-${targetIndex}`}
                placeholder="e.g. Used with prepositions"
                value={target.grammar}
                onChange={e => onInputChange('grammar', e.target.value, targetIndex)}
                className="mt-1"
              />
            </div>
          </div>
          <SubjectsSection
            targetId={target.id}
            targetIndex={targetIndex}
            subjectIds={target.subjectIds}
            subjects={subjects}
            subjectsLoading={subjectsLoading}
            subjectsError={subjectsError}
            targetLanguageCode={targetLanguageCode}
            textTarget={target.textTarget}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 border-b pb-2">
          <h4 className="text-sm font-medium">Explanation & Usage</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor={`explanationSource-${targetIndex}`} className="text-xs tracking-wide uppercase">
              Source
            </Label>
            <Textarea
              id={`explanationSource-${targetIndex}`}
              placeholder="Input source explanation..."
              value={target.explanationSource}
              onChange={e => onInputChange('explanationSource', e.target.value, targetIndex)}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor={`explanationTarget-${targetIndex}`} className="text-xs tracking-wide uppercase">
              Target
            </Label>
            <Textarea
              id={`explanationTarget-${targetIndex}`}
              placeholder="Input target explanation..."
              value={target.explanationTarget}
              onChange={e => onInputChange('explanationTarget', e.target.value, targetIndex)}
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
      </section>

      <section>
        <ExamplesSection
          targetIndex={targetIndex}
          examples={target.vocabExamples}
          onExampleChange={onExampleChange}
          onAddExample={onAddExample}
          onRemoveExample={onRemoveExample}
        />
      </section>
    </div>
  );
};

export default TextTargetForm;
