'use client';

import type { TextTargetTabsProps } from '@/types/vocab-list';
import { AddCircle, AltArrowRight, CheckCircle, CloseCircle, Target, TrashBin2 } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/libs/utils';
import TextTargetForm from './TextTargetForm';

const TextTargetTabs: React.FC<TextTargetTabsProps> = ({
  variant = 'default',
  textTargets,
  activeTab,
  onActiveTabChange,
  onInputChange,
  onExampleChange,
  onAddExample,
  onRemoveExample,
  onAddTextTarget,
  onRemoveTextTarget,
  textSource = '',
  sourceLanguageCode = '',
  targetLanguageCode = '',
  initialSubjectsData,
  initialLanguagesData: _initialLanguagesData,
  initialWordTypesData,
  userRole,
}) => {
  const wordTypes = initialWordTypesData?.items || [];
  const isLoading = false;
  const isError = false;
  const subjects = initialSubjectsData?.items || [];
  const subjectsLoading = false;
  const subjectsError = false;

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Target size={14} weight="BoldDuotone" />
            Text Targets
          </h3>
          {onAddTextTarget && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={onAddTextTarget}
              disabled={textTargets.length >= 5}
            >
              + Add New
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {textTargets.map((target, index) => {
            const isActive = activeTab === index.toString();
            return (
              <button
                key={target.id}
                type="button"
                className={cn(
                  'group flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary hover:bg-primary/15'
                    : 'border-border bg-background text-foreground hover:bg-muted/50',
                )}
                onClick={() => onActiveTabChange(index.toString())}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-medium',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate">{target.textTarget?.trim() ? target.textTarget : `Vocab ${index + 1}`}</span>
                </span>
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                  <span
                    className={cn(
                      'transition-opacity group-hover:opacity-0',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {isActive
                      ? (
                          <CheckCircle size={16} weight="BoldDuotone" />
                        )
                      : (
                          <AltArrowRight size={16} weight="BoldDuotone" />
                        )}
                  </span>
                  {textTargets.length > 1 && onRemoveTextTarget && (
                    <button
                      type="button"
                      className="absolute inset-0 flex items-center justify-center text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTextTarget(index);
                      }}
                      aria-label="Remove target"
                    >
                      <TrashBin2 size={16} weight="BoldDuotone" />
                    </button>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'content') {
    const index = Math.min(Math.max(0, Number.parseInt(activeTab, 10) || 0), textTargets.length - 1);
    const target = textTargets[index];
    if (!target || !onInputChange || !onExampleChange || !onAddExample || !onRemoveExample) {
      return null;
    }
    return (
      <div className="space-y-4">
        <TextTargetForm
          targetIndex={index}
          target={target}
          wordTypes={wordTypes}
          isLoading={isLoading}
          isError={isError}
          subjects={subjects}
          subjectsLoading={subjectsLoading}
          subjectsError={subjectsError}
          textSource={textSource}
          sourceLanguageCode={sourceLanguageCode}
          targetLanguageCode={targetLanguageCode}
          onInputChange={onInputChange}
          onExampleChange={onExampleChange}
          onAddExample={onAddExample}
          onRemoveExample={onRemoveExample}
          userRole={userRole}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Text Targets</h3>
        {onAddTextTarget && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddTextTarget}
            disabled={textTargets.length >= 5}
          >
            <AddCircle size={16} weight="BoldDuotone" className="mr-1" />
            Add Target
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {textTargets.map((_target, idx) => (
            <TabsTrigger
              key={_target.id}
              value={idx.toString()}
              className={cn(
                'relative flex flex-shrink-0 items-center justify-between',
                activeTab === idx.toString() ? 'bg-background text-foreground shadow-sm' : '',
              )}
              onClick={() => onActiveTabChange(idx.toString())}
            >
              <p className="text-sm">
                Vocab
                {'  '}
                {idx + 1}
              </p>
              {textTargets.length > 1 && onRemoveTextTarget && (
                <div
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    onRemoveTextTarget(idx);
                  }}
                  className="ml-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm p-0 text-muted-foreground"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveTextTarget(idx);
                    }
                  }}
                >
                  <CloseCircle size={12} weight="BoldDuotone" />
                </div>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {textTargets.map((target, idx) => (
          <TabsContent
            key={target.id}
            value={idx.toString()}
            className={cn(
              'space-y-4',
              activeTab === idx.toString() ? 'block' : 'hidden',
            )}
          >
            <TextTargetForm
              targetIndex={idx}
              target={target}
              wordTypes={wordTypes}
              isLoading={isLoading}
              isError={isError}
              subjects={subjects}
              subjectsLoading={subjectsLoading}
              subjectsError={subjectsError}
              textSource={textSource}
              sourceLanguageCode={sourceLanguageCode}
              targetLanguageCode={targetLanguageCode}
              onInputChange={onInputChange!}
              onExampleChange={onExampleChange!}
              onAddExample={onAddExample!}
              onRemoveExample={onRemoveExample!}
              userRole={userRole}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TextTargetTabs;
