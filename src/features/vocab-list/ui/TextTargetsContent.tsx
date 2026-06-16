'use client';

import type { ResponseAPI } from '@/types';
import type { TTextTarget, TVocab } from '@/types/vocab-list';
import type { TSubjectResponse } from '@/types/subject';
import type { TWordTypeResponse } from '@/types/word-type';
import { AddCircle, Filter } from '@solar-icons/react/ssr';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { getLanguageName } from '@/shared/utils/language';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';
import { Button } from '@/shared/ui/button';
import { MultiSelect } from '@/shared/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import TextTargetDialog from './TextTargetDialog';
import TextTargetsTable from './TextTargetsTable';
import WordRelationsDisplay from './WordRelationsDisplay';

type TextTargetsContentProps = {
  vocab: TVocab;
  initialTextTargetsData?: ResponseAPI<TTextTarget[]> | null;
  initialSubjectsData?: TSubjectResponse | null;
  initialWordTypesData?: TWordTypeResponse | null;
};

function LanguageBadge({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1 text-sm font-medium text-foreground">
        {getLanguageName(code)}
        {' '}
        (
        {code.toUpperCase()}
        )
      </span>
    </div>
  );
}

const TextTargetsContent: React.FC<TextTargetsContentProps> = ({
  vocab,
  initialTextTargetsData,
  initialSubjectsData,
  initialWordTypesData,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TTextTarget | null>(null);
  const [editMode, setEditMode] = useState(false);

  const textTarget = searchParams.get('textTarget') || '';
  const subjectIdsParam = searchParams.get('subjectIds');
  const selectedSubjectIds = subjectIdsParam ? subjectIdsParam.split(',') : [];

  const subjects = initialSubjectsData?.items || [];

  const subjectFilterOptions = useMemo(
    () => subjects.map(s => ({ value: s.id, label: s.name })),
    [subjects],
  );

  const textTargets = initialTextTargetsData?.items ?? vocab.textTargets;
  const totalItems = initialTextTargetsData?.totalItems;
  const totalPages = initialTextTargetsData?.totalPages;
  const currentPage = initialTextTargetsData?.currentPage;

  const hasActiveFilters = selectedSubjectIds.length > 0 || !!textTarget;

  const handleSearchChange = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('textTarget', query);
    } else {
      params.delete('textTarget');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleSubjectFilterChange = useCallback((subjectIds: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (subjectIds.length > 0) {
      params.set('subjectIds', subjectIds.join(','));
    } else {
      params.delete('subjectIds');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('textTarget');
    params.delete('subjectIds');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setEditMode(false);
    setDialogOpen(true);
  };

  const handleEdit = (item: TTextTarget) => {
    setEditingItem(item);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleLinkedWordClick = useCallback((word: string) => {
    router.push(`/vocab-list?textSource=${encodeURIComponent(word)}&sourceLanguageCode=${vocab.sourceLanguageCode}&targetLanguageCode=${vocab.targetLanguageCode}`);
  }, [router]);

  const handleAddFreeTextWord = useCallback((word: string) => {
    router.push(`/vocab-list?openAdd=${encodeURIComponent(word)}&sourceLanguageCode=${vocab.sourceLanguageCode}&targetLanguageCode=${vocab.targetLanguageCode}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/library">Library</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/vocab-list?sourceLanguageCode=${vocab.sourceLanguageCode}&targetLanguageCode=${vocab.targetLanguageCode}`}>Vocab List</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Text Targets</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{vocab.textSource}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Detailed breakdown of semantic mappings and contextual translations.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <LanguageBadge label="Source" code={vocab.sourceLanguageCode} />
              <LanguageBadge label="Target" code={vocab.targetLanguageCode} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 border-border bg-card/80 backdrop-blur-sm">
                  <Filter size={16} weight="BoldDuotone" className="mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                  {hasActiveFilters && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      !
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Filter by Subjects</h4>
                    <MultiSelect
                      id="subject-filter"
                      options={subjectFilterOptions}
                      defaultValue={selectedSubjectIds}
                      onValueChange={handleSubjectFilterChange}
                      placeholder="Choose subjects to filter by..."
                      maxCount={5}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={handleOpenAdd} className="h-10 bg-primary text-primary-foreground shadow-lg hover:opacity-90">
              <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
              <span className="hidden sm:inline">Add Target</span>
            </Button>
          </div>
        </div>

        <TextTargetsTable
          textTargets={textTargets}
          vocabId={vocab.id}
          onEdit={handleEdit}
          totalItems={totalItems}
          totalPages={totalPages}
          currentPage={currentPage}
          searchValue={textTarget}
          onSearchChange={handleSearchChange}
        />

        <TextTargetDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          vocabId={vocab.id}
          textSource={vocab.textSource}
          sourceLanguageCode={vocab.sourceLanguageCode}
          targetLanguageCode={vocab.targetLanguageCode}
          editingItem={editingItem}
          editMode={editMode}
          initialSubjectsData={initialSubjectsData ?? undefined}
          initialWordTypesData={initialWordTypesData ?? undefined}
          onSuccess={handleDialogSuccess}
        />

        {vocab.relatedWords && (
          <div className="mt-6 rounded-lg border border-border bg-card p-4 pt-0 shadow-sm">
            <WordRelationsDisplay
              relatedWords={vocab.relatedWords}
              onLinkedWordClick={handleLinkedWordClick}
              onAddFreeTextWord={handleAddFreeTextWord}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextTargetsContent;
