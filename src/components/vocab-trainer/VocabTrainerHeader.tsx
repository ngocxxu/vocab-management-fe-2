'use client';

import type { VocabTrainerHeaderProps } from '@/types/vocab-trainer';
import { AddCircle, Filter } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const VocabTrainerHeader: React.FC<VocabTrainerHeaderProps> = ({
  totalCount,
  onAddTrainer,
  statusOptions,
  selectedStatuses,
  onStatusFilterChange,
  questionTypeOptions,
  selectedQuestionTypes,
  onQuestionTypeFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vocab Trainers</h1>
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">
            {totalCount}
            {' '}
            Total
          </span>
        </div>

        <p className="text-slate-600 dark:text-slate-400">
          Create and manage your vocabulary training sessions to improve your language skills.
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
              <Filter size={16} weight="BoldDuotone" className="mr-2" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 dark:text-white">Filter Trainers</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="status-filter"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Filter by Status
                    </label>
                    <MultiSelect
                      id="status-filter"
                      options={statusOptions}
                      defaultValue={selectedStatuses}
                      onValueChange={onStatusFilterChange}
                      placeholder="Choose statuses to filter by..."
                      maxCount={3}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="question-type-filter"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Filter by Question Type
                    </label>
                    <MultiSelect
                      id="question-type-filter"
                      options={questionTypeOptions}
                      defaultValue={selectedQuestionTypes}
                      onValueChange={onQuestionTypeFilterChange}
                      placeholder="Choose question types to filter by..."
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
                  Clear Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          onClick={onAddTrainer}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
        >
          <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
          Create Trainer
        </Button>
      </div>
    </div>
  );
};

export default VocabTrainerHeader;
