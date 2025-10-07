'use client';

import { Plus, X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubjects } from '@/hooks/useSubjects';
import { useWordTypes } from '@/hooks/useWordTypes';
import { cn } from '@/libs/utils';
import TextTargetForm from './TextTargetForm';

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

type TextTargetTabsProps = {
  textTargets: TextTarget[];
  activeTab: string;
  onActiveTabChange: (value: string) => void;
  onInputChange: (field: string, value: string, targetIndex?: number) => void;
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
  onAddTextTarget: () => void;
  onRemoveTextTarget: (index: number) => void;
};

const TextTargetTabs: React.FC<TextTargetTabsProps> = ({
  textTargets,
  activeTab,
  onActiveTabChange,
  onInputChange,
  onExampleChange,
  onAddExample,
  onRemoveExample,
  onAddTextTarget,
  onRemoveTextTarget,
}) => {
  const { wordTypes, isLoading, isError } = useWordTypes();
  const { subjects, isLoading: subjectsLoading, isError: subjectsError } = useSubjects();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Text Targets</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddTextTarget}
          disabled={textTargets.length >= 5}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Target
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {textTargets.map((_target, index) => (
            <TabsTrigger
              key={_target.id}
              value={index.toString()}
              className={cn(
                'relative flex-shrink-0 flex items-center justify-between',
                activeTab === index.toString() ? 'bg-background text-foreground shadow-sm' : '',
              )}
              onClick={() => onActiveTabChange(index.toString())}
            >
              <p className="text-sm">
                Vocab
                {' '}
                {index + 1}
              </p>
              {textTargets.length > 1 && (
                <div
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    onRemoveTextTarget(index);
                  }}
                  className="ml-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm p-0 text-muted-foreground"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveTextTarget(index);
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </div>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {textTargets.map((target, index) => (
          <TabsContent
            key={target.id}
            value={index.toString()}
            className={cn(
              'space-y-4',
              activeTab === index.toString() ? 'block' : 'hidden',
            )}
          >
            <TextTargetForm
              targetIndex={index}
              target={target}
              wordTypes={wordTypes}
              isLoading={isLoading}
              isError={isError}
              subjects={subjects}
              subjectsLoading={subjectsLoading}
              subjectsError={subjectsError}
              onInputChange={onInputChange}
              onExampleChange={onExampleChange}
              onAddExample={onAddExample}
              onRemoveExample={onRemoveExample}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TextTargetTabs;
