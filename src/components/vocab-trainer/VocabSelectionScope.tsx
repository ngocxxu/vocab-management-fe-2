'use client';

import type { VocabSelectionScopeProps } from '@/types/vocab-trainer';
import { DangerTriangle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { isAllScope } from '@/utils/trainer-scope';

const VocabSelectionScope: React.FC<VocabSelectionScopeProps> = ({
  sourceLanguageCode,
  targetLanguageCode,
  languages,
  onScopeChange,
  outOfScopeCount,
  onRemoveOutOfScope,
}) => {
  const t = useTranslations('trainer.selection');
  const isAllLanguages = isAllScope(sourceLanguageCode, targetLanguageCode);
  const sourceLang = languages.find(l => l.code === sourceLanguageCode);
  const targetLang = languages.find(l => l.code === targetLanguageCode);
  const availableTargetLanguages = languages.filter(l => l.code !== sourceLanguageCode);

  const sourceLabel = sourceLanguageCode === 'ALL' ? t('all') : (sourceLang?.name ?? sourceLanguageCode);
  const targetLabel = targetLanguageCode === 'ALL' ? t('all') : (targetLang?.name ?? targetLanguageCode);

  const triggerLabel = isAllLanguages ? t('allLanguages') : `${sourceLabel} → ${targetLabel}`;

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
        {t('scopeLabel')}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">{t('sourceLanguage')}</span>
          <Select value={sourceLanguageCode} onValueChange={handleSourceChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('all')}</SelectItem>
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">{t('targetLanguage')}</span>
          <Select value={targetLanguageCode} onValueChange={handleTargetChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('all')}</SelectItem>
              {availableTargetLanguages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {outOfScopeCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2">
          <span className="flex items-center gap-2 text-sm text-foreground">
            <DangerTriangle size={16} weight="BoldDuotone" className="shrink-0 text-warning" />
            {t('outOfScope', { count: outOfScopeCount, scope: triggerLabel })}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={onRemoveOutOfScope}>
            {t('removeThem')}
          </Button>
        </div>
      )}

      <div className="border-b border-border" />
    </div>
  );
};

export default VocabSelectionScope;
