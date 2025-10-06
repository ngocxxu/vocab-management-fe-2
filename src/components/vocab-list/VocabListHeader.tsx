'use client';

import type { TLanguageFolder } from '@/types/language-folder';
import { Filter, Folder, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { getLanguageName } from '../library/utils';

type VocabListHeaderProps = {
  totalCount: number;
  onAddVocab: () => void;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  languageFolder?: TLanguageFolder;
  isFolderLoading?: boolean;
  // Filter related props
  subjects: Array<{ id: string; name: string }>;
  isSubjectsLoading: boolean;
  selectedSubjectIds: string[];
  onSubjectFilterChange: (subjectIds: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

const VocabListHeader: React.FC<VocabListHeaderProps> = ({
  totalCount,
  onAddVocab,
  sourceLanguageCode,
  targetLanguageCode,
  languageFolder,
  isFolderLoading,
  subjects,
  isSubjectsLoading,
  selectedSubjectIds,
  onSubjectFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vocab List</h1>
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">
            {totalCount}
            {' '}
            Total
          </span>

          <p className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
            {getLanguageName(sourceLanguageCode)}
            {' '}
            →
            {' '}
            {getLanguageName(targetLanguageCode)}
          </p>
        </div>

        {/* Folder Name Display */}
        {isFolderLoading
          ? (
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
            )
          : languageFolder
            ? (
                <div className="flex items-center space-x-2">
                  <div
                    className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: languageFolder.folderColor }}
                  />
                  <div className="flex items-center space-x-2">
                    <Folder className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {languageFolder.name}
                    </span>
                  </div>
                </div>
              )
            : null}

        <p className="text-slate-600 dark:text-slate-400">
          Track your vocabulary learning progress and review history.
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 dark:text-white">Filter Vocabularies</h4>
                <div className="space-y-2">
                  <label
                    htmlFor="subject-filter"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Filter by Subjects
                  </label>
                  {isSubjectsLoading
                    ? (
                        <div className="h-10 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                      )
                    : (
                        <MultiSelect
                          id="subject-filter"
                          options={subjects.map(subject => ({
                            value: subject.id,
                            label: subject.name,
                          }))}
                          defaultValue={selectedSubjectIds}
                          onValueChange={onSubjectFilterChange}
                          placeholder="Choose subjects to filter by..."
                          maxCount={5}
                          className="w-full"
                        />
                      )}
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
          onClick={onAddVocab}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vocab
        </Button>
      </div>
    </div>
  );
};

export default VocabListHeader;
