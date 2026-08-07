'use client';

import type { VocabSelectionScopeProps } from '@/types/vocab-trainer';
import { AltArrowDown, DangerTriangle, Global } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { cn } from '@/libs/utils';
import { isAllScope } from '@/utils/trainer-scope';

const VocabSelectionScope: React.FC<VocabSelectionScopeProps> = ({
  sourceLanguageCode,
  targetLanguageCode,
  languages,
  onScopeChange,
  outOfScopeCount,
  onRemoveOutOfScope,
}) => {
  const isAllLanguages = isAllScope(sourceLanguageCode, targetLanguageCode);
  const isScoped = !isAllLanguages;
  const sourceLang = languages.find(l => l.code === sourceLanguageCode);
  const targetLang = languages.find(l => l.code === targetLanguageCode);
  const availableTargetLanguages = languages.filter(l => l.code !== sourceLanguageCode);

  const sourceLabel = sourceLanguageCode === 'ALL' ? 'All' : (sourceLang?.name ?? sourceLanguageCode);
  const targetLabel = targetLanguageCode === 'ALL' ? 'All' : (targetLang?.name ?? targetLanguageCode);

  const triggerLabel = isAllLanguages ? 'All languages' : `${sourceLabel} → ${targetLabel}`;

  const handleSourceChange = (value: string) => {
    // Guards the invariant that source and target can never be the same code.
    // Unreachable today because `availableTargetLanguages` already excludes the
    // current source, but kept in case the target list's filtering ever changes.
    const nextTarget = value === targetLanguageCode ? 'ALL' : targetLanguageCode;
    onScopeChange(value, nextTarget);
  };

  const handleTargetChange = (value: string) => {
    onScopeChange(sourceLanguageCode, value);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Language scope
      </p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-12 w-full justify-between border-2 px-4 text-base font-semibold',
              isScoped ? 'border-primary/40 text-foreground' : 'border-input text-muted-foreground',
            )}
          >
            <span className="flex items-center gap-2">
              <Global size={20} weight="BoldDuotone" className="shrink-0 text-primary" />
              {triggerLabel}
            </span>
            <AltArrowDown size={16} weight="BoldDuotone" className="shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-4" align="start">
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Source language</span>
            <Select value={sourceLanguageCode} onValueChange={handleSourceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Target language</span>
            <Select value={targetLanguageCode} onValueChange={handleTargetChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                {availableTargetLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>

      {outOfScopeCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2">
          <span className="flex items-center gap-2 text-sm text-foreground">
            <DangerTriangle size={16} weight="BoldDuotone" className="shrink-0 text-warning" />
            {outOfScopeCount}
            {' '}
            selected
            {' '}
            {outOfScopeCount === 1 ? 'word is' : 'words are'}
            {' '}
            outside
            {' '}
            {triggerLabel}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={onRemoveOutOfScope}>
            Remove them
          </Button>
        </div>
      )}

      <div className="border-b border-border" />
    </div>
  );
};

export default VocabSelectionScope;
