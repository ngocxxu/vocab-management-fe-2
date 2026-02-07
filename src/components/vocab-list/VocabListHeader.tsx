'use client';

import type { TLanguageFolder } from '@/types/language-folder';
import type { VocabQueryParams } from '@/utils/api-config';
import { AddCircle, Filter, Folder, Upload } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { getLanguageName } from '../library/utils';
import DownloadTemplateButton from './DownloadTemplateButton';
import ExportExcelButton from './ExportExcelButton';

type VocabListHeaderProps = {
  totalCount: number;
  onAddVocab: () => void;
  onImportExcel: () => void;
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
  queryParams: VocabQueryParams;
};

const VocabListHeader: React.FC<VocabListHeaderProps> = ({
  totalCount,
  onAddVocab,
  onImportExcel,
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
  queryParams,
}) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-foreground">Vocab List</h1>
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-sm font-medium text-accent-foreground">
            {totalCount}
            {' '}
            Total
          </span>

          <p className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
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
                    <Folder size={16} weight="BoldDuotone" className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {languageFolder.name}
                    </span>
                  </div>
                </div>
              )
            : null}

        <p className="text-muted-foreground">
          Track your vocabulary learning progress and review history.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 border-border bg-card/80 backdrop-blur-sm">
              <Filter size={16} weight="BoldDuotone" className="mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Filter Vocabularies</h4>
                <div className="space-y-2">
                  <label
                    htmlFor="subject-filter"
                    className="text-sm font-medium text-foreground"
                  >
                    Filter by Subjects
                  </label>
                  {isSubjectsLoading
                    ? (
                        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
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
        <DownloadTemplateButton />
        <ExportExcelButton queryParams={queryParams} />
        <Button
          onClick={onImportExcel}
          variant="outline"
          className="h-10 border-border bg-card/80 backdrop-blur-sm"
        >
          <Upload size={16} weight="BoldDuotone" className="mr-2" />
          <span className="hidden sm:inline">Import Excel</span>
        </Button>
        <Button
          onClick={onAddVocab}
          className="h-10 bg-primary text-primary-foreground shadow-lg hover:opacity-90"
        >
          <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
          <span className="hidden sm:inline">Add Vocab</span>
        </Button>
      </div>
    </div>
  );
};

export default VocabListHeader;
