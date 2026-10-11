'use client';

import type { VocabTrainerHeaderProps } from '@/types/vocab-trainer';
import { AddCircle, Filter } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const VocabTrainerHeader: React.FC<VocabTrainerHeaderProps> = ({
  totalCount,
  onAddTrainer,
  isCreateDisabled = false,
  statusOptions,
  selectedStatuses,
  onStatusFilterChange,
  questionTypeOptions,
  selectedQuestionTypes,
  onQuestionTypeFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const t = useTranslations('trainer');

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-sm font-medium text-accent-foreground">
            {totalCount}
            {' '}
            {t('total')}
          </span>
        </div>

        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-card/80 backdrop-blur-sm">
              <Filter size={16} weight="BoldDuotone" className="mr-2" />
              {t('filter')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{t('filterTitle')}</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="status-filter"
                      className="text-sm font-medium text-foreground"
                    >
                      {t('filterStatus')}
                    </label>
                    <MultiSelect
                      id="status-filter"
                      options={statusOptions}
                      defaultValue={selectedStatuses}
                      onValueChange={onStatusFilterChange}
                      placeholder={t('statusPlaceholder')}
                      maxCount={3}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="question-type-filter"
                      className="text-sm font-medium text-foreground"
                    >
                      {t('filterQuestionType')}
                    </label>
                    <MultiSelect
                      id="question-type-filter"
                      options={questionTypeOptions}
                      defaultValue={selectedQuestionTypes}
                      onValueChange={onQuestionTypeFilterChange}
                      placeholder={t('questionTypePlaceholder')}
                      maxCount={3}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  disabled={!hasActiveFilters}
                >
                  {t('clearFilters')}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          onClick={onAddTrainer}
          disabled={isCreateDisabled}
          className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
          {t('create')}
        </Button>
      </div>
    </div>
  );
};

export default VocabTrainerHeader;
