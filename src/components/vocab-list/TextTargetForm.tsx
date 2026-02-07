'use client';

import type { TSubject } from '@/types/subject';
import { MagicStick, RefreshCircle } from '@solar-icons/react/ssr';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { generateTextTargetContent } from '@/actions/vocabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ExamplesSection from './ExamplesSection';
import SubjectsSection from './SubjectsSection';

const COOLDOWN_DURATION_MS = 60000;
const GLOBAL_STORAGE_KEY = 'play_button_last_click_global';

type WordType = {
  id: string;
  name: string;
  description: string;
};

type TextTarget = {
  id: string;
  wordTypeId?: string;
  textTarget: string;
  grammar: string;
  explanationSource: string;
  explanationTarget: string;
  subjectIds: string[];
  vocabExamples: Array<{ id: string; source: string; target: string }>;
};

type TextTargetFormProps = {
  targetIndex: number;
  target: TextTarget;
  wordTypes: WordType[];
  isLoading: boolean;
  isError: boolean;
  subjects: TSubject[];
  subjectsLoading: boolean;
  subjectsError: boolean;
  textSource: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  onInputChange: (field: string, value: string, targetIndex: number) => void;
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
};

const TextTargetForm: React.FC<TextTargetFormProps> = ({
  targetIndex,
  target,
  wordTypes,
  isLoading,
  isError,
  subjects,
  subjectsLoading,
  subjectsError,
  textSource,
  sourceLanguageCode,
  targetLanguageCode,
  onInputChange,
  onExampleChange,
  onAddExample,
  onRemoveExample,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const checkCooldown = useCallback(() => {
    try {
      const lastClickTimeStr = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (!lastClickTimeStr) {
        setIsCooldownActive(false);
        setCooldownRemaining(0);
        return;
      }

      const lastClickTime = Number.parseInt(lastClickTimeStr, 10);
      if (Number.isNaN(lastClickTime)) {
        localStorage.removeItem(GLOBAL_STORAGE_KEY);
        setIsCooldownActive(false);
        setCooldownRemaining(0);
        return;
      }

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;
      const remaining = Math.ceil((COOLDOWN_DURATION_MS - timeSinceLastClick) / 1000);

      if (remaining > 0) {
        setIsCooldownActive(true);
        setCooldownRemaining(remaining);
      } else {
        setIsCooldownActive(false);
        setCooldownRemaining(0);
      }
    } catch (error) {
      console.error('Error checking cooldown:', error);
      setIsCooldownActive(false);
      setCooldownRemaining(0);
    }
  }, []);

  useEffect(() => {
    checkCooldown();

    const interval = setInterval(() => {
      checkCooldown();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkCooldown]);

  const handleGenerateAI = async () => {
    if (!textSource || !sourceLanguageCode || !targetLanguageCode) {
      toast.error('Please fill in source text and language codes first');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateTextTargetContent({
        textSource,
        sourceLanguageCode,
        targetLanguageCode,
      });

      onInputChange('textTarget', result.textTarget, targetIndex);
      onInputChange('wordTypeId', result.wordTypeId, targetIndex);
      onInputChange('explanationSource', result.explanationSource, targetIndex);
      onInputChange('explanationTarget', result.explanationTarget, targetIndex);

      if (result.vocabExamples && result.vocabExamples.length > 0) {
        const firstExample = result.vocabExamples[0];
        if (target.vocabExamples.length > 0) {
          onExampleChange(0, 'source', firstExample?.source || '', targetIndex);
          onExampleChange(0, 'target', firstExample?.target || '', targetIndex);
        } else {
          onAddExample(targetIndex);
          setTimeout(() => {
            onExampleChange(0, 'source', firstExample?.source || '', targetIndex);
            onExampleChange(0, 'target', firstExample?.target || '', targetIndex);
          }, 0);
        }
      }

      toast.success('AI generated content successfully');

      try {
        localStorage.setItem(GLOBAL_STORAGE_KEY, Date.now().toString());
        checkCooldown();
      } catch (error) {
        console.error('Error saving cooldown timestamp:', error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`textTarget-${targetIndex}`}>Target Text</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateAI}
            disabled={isGenerating || isCooldownActive || !textSource || !sourceLanguageCode || !targetLanguageCode}
            className="h-7 gap-1.5 text-xs"
          >
            {isGenerating
              ? (
                  <>
                    <RefreshCircle size={12} weight="BoldDuotone" className="animate-spin" />
                    Generating...
                  </>
                )
              : isCooldownActive
                ? (
                    <>
                      <RefreshCircle size={12} weight="BoldDuotone" />
                      Wait
                      {' '}
                      {cooldownRemaining}
                      s
                    </>
                  )
                : (
                    <>
                      <MagicStick size={12} weight="BoldDuotone" />
                      AI Generate
                    </>
                  )}
          </Button>
        </div>
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
                      wordTypes.map((wordType: WordType) => (
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
};

export default TextTargetForm;
