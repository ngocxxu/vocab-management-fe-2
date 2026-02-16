'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ResponseAPI, TLanguage, TLanguageFolder } from '@/types';
import type { TSubjectResponse } from '@/types/subject';
import type { TCreateVocab, TVocab } from '@/types/vocab-list';
import type { TWordTypeResponse } from '@/types/word-type';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AltArrowDown,
  AltArrowLeft,
  Pen,
  VolumeLoud,
} from '@solar-icons/react/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSpeechSynthesis } from 'react-speech-kit';
import { toast } from 'sonner';
import { z } from 'zod';
import { createVocab, deleteVocabsBulk, updateVocab } from '@/actions/vocabs';
import { BulkDeleteDialog, DeleteActionButton, ErrorState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { DataTable } from '@/components/ui/table';
import { useApiPagination, useBulkDelete, useDialogState } from '@/hooks';

import { selectVoiceByCode } from '@/utils/textToSpeech';
import { clampMasteryPercent, getMasteryColors, getMasteryDisplay } from '@/utils/vocab-mastery';

import AddVocabDialog from './AddVocabDialog';
import ExpandedRowContent from './ExpandedRowContent';
import ImportVocabDialog from './ImportVocabDialog';
import VocabListHeader from './VocabListHeader';

// Utility function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Define the form schema
const FormSchema = z.object({
  textSource: z.string().min(1, 'Source text is required'),
  sourceLanguageCode: z.string().min(1, 'Source language is required'),
  targetLanguageCode: z.string().min(1, 'Target language is required'),
  textTargets: z.array(z.object({
    id: z.string(),
    wordTypeId: z.string().optional(),
    textTarget: z.string().min(1, 'Target text is required'),
    grammar: z.string(),
    explanationSource: z.string(),
    explanationTarget: z.string(),
    subjectIds: z.array(z.string()).min(1, 'At least one subject must be selected'),
    vocabExamples: z.array(z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
    })),
  })).min(1, 'At least one text target is required'),
});

type FormData = z.infer<typeof FormSchema>;

const CIRCLE_SIZE = 32;
const CIRCLE_R = 14;
const CIRCLE_STROKE = 3;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

function MasteryScoreCell({ score }: Readonly<{ score?: number }>) {
  const percent = clampMasteryPercent(score);
  const { label, kind } = getMasteryDisplay(score);
  const colors = getMasteryColors(kind);
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex shrink-0 items-center justify-center">
        <svg
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_R}
            fill="none"
            strokeWidth={CIRCLE_STROKE}
            className={colors.track}
          />
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_R}
            fill="none"
            strokeWidth={CIRCLE_STROKE}
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={colors.progress}
          />
        </svg>
        <span className="absolute text-center text-[10px] font-medium text-foreground tabular-nums">
          {percent % 1 === 0 ? Math.round(percent) : percent.toFixed(1)}
        </span>
      </div>
      <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${colors.pill}`}>
        {label}
      </span>
    </div>
  );
}

type VocabListProps = {
  initialVocabsData?: ResponseAPI<TVocab[]>;
  initialLanguageFolderData?: TLanguageFolder;
  initialSubjectsData?: TSubjectResponse;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  initialWordTypesData?: TWordTypeResponse;
};

const VocabList: React.FC<VocabListProps> = ({
  initialVocabsData,
  initialLanguageFolderData,
  initialSubjectsData,
  initialLanguagesData,
  initialWordTypesData,
}) => {
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const { speak, cancel, voices } = useSpeechSynthesis();

  const handleSpeakTextSource = useCallback((vocab: TVocab) => {
    cancel();
    speak({
      text: vocab.textSource || '',
      voice: selectVoiceByCode(voices, vocab.sourceLanguageCode || 'en'),
      rate: 0.95,
      pitch: 1,
      volume: 1,
    });
  }, [speak, cancel, voices]);

  const { pagination, handlers } = useApiPagination({
    page: 1,
    pageSize: 10,
    sortBy: 'textSource',
    sortOrder: 'asc',
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const sourceLanguageCode = searchParams.get('sourceLanguageCode') || undefined;
  const targetLanguageCode = searchParams.get('targetLanguageCode') || undefined;
  const languageFolderId = searchParams.get('languageFolderId') || undefined;
  const textSource = searchParams.get('textSource') || '';
  const subjectIdsParam = searchParams.get('subjectIds');
  const selectedSubjectIds = subjectIdsParam ? subjectIdsParam.split(',') : [];

  const totalItems = initialVocabsData?.totalItems || 0;
  const totalPages = initialVocabsData?.totalPages || 0;
  const currentPage = initialVocabsData?.currentPage || 1;
  const isLoading = false;
  const isError = false;

  const languageFolder = initialLanguageFolderData;
  const isFolderLoading = false;

  const subjects = initialSubjectsData?.items || [];
  const isSubjectsLoading = false;

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
    defaultValues: {
      textSource: '',
      sourceLanguageCode: sourceLanguageCode || '',
      targetLanguageCode: targetLanguageCode || '',
      textTargets: [{
        id: generateId(),
        wordTypeId: '',
        textTarget: '',
        grammar: '',
        explanationSource: '',
        explanationTarget: '',
        subjectIds: [],
        vocabExamples: [{ id: generateId(), source: '', target: '' }],
      }],
    },
  });

  const [activeTab, setActiveTab] = useState('0');

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setIsMounted(true);
  }, []);

  const { handleSort, handlePageChange } = handlers;

  const resetForm = () => {
    form.reset({
      textSource: '',
      sourceLanguageCode: sourceLanguageCode || '',
      targetLanguageCode: targetLanguageCode || '',
      textTargets: [{
        id: generateId(),
        wordTypeId: '',
        textTarget: '',
        grammar: '',
        explanationSource: '',
        explanationTarget: '',
        subjectIds: [],
        vocabExamples: [{ id: generateId(), source: '', target: '' }],
      }],
    });
    setActiveTab('0');
  };

  const dialogState = useDialogState<TVocab>({
    onClose: () => {
      resetForm();
    },
  });

  const bulkDelete = useBulkDelete({
    deleteMutation: async (ids: string[]) => {
      await deleteVocabsBulk(ids);
      return { success: true };
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
    },
    itemName: 'vocabulary item',
    itemNamePlural: 'vocabulary items',
  });

  const addTextTarget = () => {
    const newIndex = form.watch('textTargets').length;
    form.setValue('textTargets', [...form.watch('textTargets'), {
      id: generateId(),
      wordTypeId: '',
      textTarget: '',
      grammar: '',
      explanationSource: '',
      explanationTarget: '',
      subjectIds: [], // Ensure this is always initialized as an empty array
      vocabExamples: [{ id: generateId(), source: '', target: '' }],
    }]);
    setActiveTab(newIndex.toString());
  };

  const removeTextTarget = (index: number) => {
    if (form.watch('textTargets').length > 1) {
      form.setValue('textTargets', form.watch('textTargets').filter((_, i) => i !== index));
      // Switch to the previous tab if removing the current one
      if (activeTab === index.toString()) {
        setActiveTab(Math.max(0, index - 1).toString());
      }
    }
  };

  const handleEdit = useCallback(
    (item: TVocab, textTargetIndex?: number) => {
      dialogState.handleEdit(item);

      form.reset({
        textSource: item.textSource,
        sourceLanguageCode: item.sourceLanguageCode,
        targetLanguageCode: item.targetLanguageCode,
        textTargets: item.textTargets.map(textTarget => ({
          id: generateId(),
          wordTypeId: textTarget.wordType?.id || '',
          textTarget: textTarget.textTarget,
          grammar: textTarget.grammar,
          explanationSource: textTarget.explanationSource,
          explanationTarget: textTarget.explanationTarget,
          subjectIds: textTarget.textTargetSubjects?.map(tts => tts.subject.id) || [],
          vocabExamples: (textTarget.vocabExamples || [{ source: '', target: '' }]).map(example => ({
            id: generateId(),
            source: example.source,
            target: example.target,
          })),
        })),
      });
      setActiveTab(textTargetIndex === undefined ? '0' : textTargetIndex.toString());
    },
    [form, dialogState],
  );

  const handleCloseDialog = () => {
    dialogState.handleClose();
  };

  const handleInputChange = (field: string, value: string, targetIndex?: number) => {
    if (targetIndex !== undefined && targetIndex !== null) {
      const currentTargets = form.watch('textTargets');
      const updatedTargets = currentTargets.map((target, index) =>
        index === targetIndex
          ? { ...target, [field]: value }
          : target,
      );
      form.setValue('textTargets', updatedTargets);
    } else {
      form.setValue(field as keyof FormData, value);
    }
  };

  const handleExampleChange = (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number = 0) => {
    const currentTargets = form.watch('textTargets');
    const updatedTargets = currentTargets.map((target, index) =>
      index === targetIndex
        ? {
            ...target,
            vocabExamples: target.vocabExamples.map((example, exIndex) =>
              exIndex === exampleIndex
                ? { ...example, [field]: value }
                : example,
            ),
          }
        : target,
    );
    form.setValue('textTargets', updatedTargets);
  };

  const addExample = (targetIndex: number = 0) => {
    const currentTargets = form.watch('textTargets');
    const updatedTargets = currentTargets.map((target, index) =>
      index === targetIndex
        ? { ...target, vocabExamples: [...target.vocabExamples, { id: generateId(), source: '', target: '' }] }
        : target,
    );
    form.setValue('textTargets', updatedTargets);
  };

  const removeExample = (exampleIndex: number, targetIndex: number = 0) => {
    const currentTargets = form.watch('textTargets');
    const updatedTargets = currentTargets.map((target, index) =>
      index === targetIndex
        ? {
            ...target,
            vocabExamples: target.vocabExamples.filter((_, exIndex) => exIndex !== exampleIndex),
          }
        : target,
    );
    form.setValue('textTargets', updatedTargets);
  };

  const handleImportSuccess = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router, startTransition]);

  const handleSearchChange = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('textSource', query);
    } else {
      params.delete('textSource');
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
    params.delete('textSource');
    params.delete('subjectIds');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleSubmit = async () => {
    try {
      // Validate the form
      const isValid = await form.trigger();

      if (!isValid) {
        // Form validation failed, errors will be displayed automatically
        return;
      }

      // Get the validated form data
      const formData = form.getValues();

      const apiData = {
        ...formData,
        languageFolderId: languageFolderId || '',
        textTargets: formData.textTargets.map(({ id, ...target }) => ({
          ...target,
          vocabExamples: target.vocabExamples.map(({ id: _exampleId, ...example }) => example),
        })),
      } as TCreateVocab;

      if (dialogState.editMode && dialogState.editingItem) {
        await updateVocab(dialogState.editingItem.id, apiData);
        toast.success('Vocabulary updated successfully');
      } else {
        await createVocab(apiData);
        toast.success('Vocabulary created successfully');
      }

      dialogState.setOpen(false);
      resetForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save vocabulary';
      toast.error('Error', {
        description: errorMessage,
      });
      console.error('Failed to save vocabulary:', error);
    }
  };

  const data = useMemo<TVocab[]>(() => initialVocabsData?.items || [], [initialVocabsData]);

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo<ColumnDef<TVocab>[]>(() => [

    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'textSource',
      header: 'Text Source',
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-3">
            <div className="font-semibold text-slate-900 dark:text-white">{row.original.textSource}</div>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeakTextSource(row.original);
              }}
              aria-label="Play pronunciation"
              title="Play pronunciation"
            >
              <VolumeLoud size={16} weight="BoldDuotone" className="text-slate-500" />
            </Button>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
      size: 1000,
    },
    {
      accessorKey: 'textTargets',
      header: 'Text Targets',
      cell: ({ row }) => {
        const textTargets = row.original.textTargets;

        return (
          <div className="flex flex-wrap gap-1">
            {textTargets.map((textTarget, index) => (
              <span
                key={`${textTarget.textTarget}-${index}`}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {textTarget.textTarget}
              </span>
            ))}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
      size: 1000,
    },
    {
      accessorKey: 'masteryScore',
      header: 'Mastery Score',
      cell: ({ row }) => <MasteryScoreCell score={row.original.masteryScore} />,
      enableSorting: true,
      enableHiding: true,
      size: 1000,
    },
    {
      id: 'expand',
      header: () => null,
      cell: ({ row }) => {
        const isExpanded = expanded[row.original.id];
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(prev => ({
                ...prev,
                [row.original.id]: !prev[row.original.id],
              }));
            }}
          >
            {isExpanded
              ? (
                  <AltArrowDown size={16} weight="BoldDuotone" />
                )
              : (
                  <AltArrowLeft size={16} weight="BoldDuotone" />
                )}
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row: _row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => handleEdit(_row.original)}
          >
            <Pen size={16} weight="BoldDuotone" className="text-slate-500" />
          </Button>
          <DeleteActionButton
            itemId={_row.original.id}
            itemName="vocabulary item"
            onDelete={async (id: string) => {
              const { deleteVocab } = await import('@/actions/vocabs');
              await deleteVocab(id);
            }}
            onSuccess={() => {
              startTransition(() => {
                router.refresh();
              });
            }}
            successMessage="Vocabulary deleted successfully!"
            errorMessage="Failed to delete vocabulary. Please try again."
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
  ], [expanded, handleEdit, handleSpeakTextSource, router, startTransition]);

  return (
    <Form {...form}>
      <div className="space-y-6">
        <VocabListHeader
          totalCount={totalItems}
          onAddVocab={() => dialogState.setOpen(true)}
          onImportExcel={() => setImportDialogOpen(true)}
          sourceLanguageCode={sourceLanguageCode || ''}
          targetLanguageCode={targetLanguageCode || ''}
          languageFolder={languageFolder}
          isFolderLoading={isFolderLoading}
          subjects={subjects}
          isSubjectsLoading={isSubjectsLoading}
          selectedSubjectIds={selectedSubjectIds}
          onSubjectFilterChange={handleSubjectFilterChange}
          onClearFilters={clearFilters}
          hasActiveFilters={selectedSubjectIds.length > 0 || !!textSource}
          queryParams={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            sortBy: pagination.sortBy,
            sortOrder: pagination.sortOrder,
            textSource: textSource || undefined,
            sourceLanguageCode,
            targetLanguageCode,
            languageFolderId,
            subjectIds: selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined,
          }}
        />

        {isError && (
          <ErrorState message="Error loading vocabularies. Please try again." />
        )}

        {isMounted && (
          <>
            <AddVocabDialog
              formData={form.watch()}
              activeTab={activeTab}
              onInputChange={handleInputChange}
              onExampleChange={handleExampleChange}
              onAddExample={addExample}
              onRemoveExample={removeExample}
              onAddTextTarget={addTextTarget}
              onRemoveTextTarget={removeTextTarget}
              onActiveTabChange={setActiveTab}
              onSubmit={handleSubmit}
              onReset={resetForm}
              open={dialogState.open}
              setOpen={handleCloseDialog}
              editMode={dialogState.editMode}
              editingItem={dialogState.editingItem}
              initialSubjectsData={initialSubjectsData}
              initialLanguagesData={initialLanguagesData}
              initialWordTypesData={initialWordTypesData}
            />

            <ImportVocabDialog
              open={importDialogOpen}
              onOpenChange={setImportDialogOpen}
              languageFolderId={languageFolderId || ''}
              sourceLanguageCode={sourceLanguageCode || ''}
              targetLanguageCode={targetLanguageCode || ''}
              onImportSuccess={handleImportSuccess}
            />

            <BulkDeleteDialog
              open={bulkDelete.bulkDeleteDialogOpen}
              onOpenChange={bulkDelete.setBulkDeleteDialogOpen}
              itemCount={bulkDelete.selectedIds.length}
              itemName="vocabulary item"
              itemNamePlural="vocabulary items"
              onConfirm={bulkDelete.confirmBulkDelete}
              onCancel={() => bulkDelete.reset()}
            />

            <DataTable
              columns={columns}
              data={data}
              searchPlaceholder="Search vocab..."
              searchValue={textSource}
              onSearchChangeAction={handleSearchChange}
              showSearch={true}
              showPagination={true}
              pageSize={pagination.pageSize}
              isLoading={isLoading}
              skeletonRowCount={pagination.pageSize}
              className=""
              headerClassName=""
              rowClassName=""
              cellClassName=""
              expandedState={expanded}
              onExpandedChange={setExpanded}
              renderExpandedRow={row => (
                <ExpandedRowContent
                  vocab={row.original}
                  columnsCount={columns.length}
                  onCollapse={() => setExpanded(prev => ({ ...prev, [row.original.id]: false }))}
                  onEdit={handleEdit}
                />
              )}
              // Server-side pagination & sorting
              manualPagination={true}
              manualSorting={true}
              manualFiltering={true}
              pageCount={totalPages}
              currentPage={currentPage}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onSortingChange={handleSort}
              onBulkDelete={bulkDelete.handleBulkDelete}
            />
          </>
        )}
      </div>
    </Form>
  );
};

export default VocabList;
