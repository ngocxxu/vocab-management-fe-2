'use client';

import type { TextTargetFormProps, WordTypeItem } from '@/types/vocab-list';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/ui/form';
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
  const t = useTranslations('vocabList.textTargetForm');
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <section>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`textTargets.${targetIndex}.textTarget`}
            render={() => (
              <FormItem>
                <Label htmlFor={`textTarget-${targetIndex}`}>{t('targetText')}</Label>
                <FormControl>
                  <Input
                    id={`textTarget-${targetIndex}`}
                    placeholder={t('targetTextPlaceholder')}
                    value={target.textTarget}
                    onChange={e => onInputChange('textTarget', e.target.value, targetIndex)}
                    className="mt-1 w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor={`wordType-${targetIndex}`}>{t('wordType')}</Label>
              <Select
                value={target.wordTypeId || ''}
                onValueChange={(value: string) => onInputChange('wordTypeId', value === '__none__' ? '' : value, targetIndex)}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder={t('selectWordType')} />
                </SelectTrigger>
                <SelectContent>
                  {isLoading
                    ? (
                        <SelectItem value="loading" disabled>
                          {t('loadingWordTypes')}
                        </SelectItem>
                      )
                    : isError
                      ? (
                          <SelectItem value="error" disabled>
                            {t('errorLoadingWordTypes')}
                          </SelectItem>
                        )
                      : (
                          <>
                            <SelectItem value="__none__">{t('none')}</SelectItem>
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
              <Label htmlFor={`grammar-${targetIndex}`}>{t('grammarNotes')}</Label>
              <Input
                id={`grammar-${targetIndex}`}
                placeholder={t('grammarPlaceholder')}
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
          <h4 className="text-sm font-medium">{t('explanationUsage')}</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor={`explanationSource-${targetIndex}`} className="text-xs tracking-wide uppercase">
              {t('explanationSource')}
            </Label>
            <Textarea
              id={`explanationSource-${targetIndex}`}
              placeholder={t('explanationSourcePlaceholder')}
              value={target.explanationSource}
              onChange={e => onInputChange('explanationSource', e.target.value, targetIndex)}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor={`explanationTarget-${targetIndex}`} className="text-xs tracking-wide uppercase">
              {t('explanationTarget')}
            </Label>
            <Textarea
              id={`explanationTarget-${targetIndex}`}
              placeholder={t('explanationTargetPlaceholder')}
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
