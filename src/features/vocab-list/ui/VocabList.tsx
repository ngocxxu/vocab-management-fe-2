'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type {
  TCreateVocab,
  TVocab,
  VocabListProps,
} from '@/types/vocab-list';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AltArrowDown,
  AltArrowLeft,
  Eye,
  Pen,
  VolumeLoud,
} from '@solar-icons/react/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useSpeechSynthesis } from 'react-speech-kit';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  createVocab,
  deleteVocabsBulk,
  getVocabsForSelection,
  updateVocab,
} from '@/actions/vocabs';
import { isQuotaError, QUOTA_ERROR_MESSAGE } from '@/utils/quota-error';
import { BulkDeleteDialog, DeleteActionButton, ErrorState } from '@/shared/ui/shared';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Form } from '@/shared/ui/form';
import { DataTable } from '@/shared/ui/table';
import { useApiPagination, useBulkDelete, useDialogState } from '@/hooks';

import { selectVoiceByCode } from '@/utils/textToSpeech';

import AddVocabDialog from './AddVocabDialog';
import ExpandedRowContent from './ExpandedRowContent';
import ImportVocabDialog from './ImportVocabDialog';
import MasteryScoreCell from './MasteryScoreCell';
import VocabListHeader from './VocabListHeader';
import { useWordRelations } from '../hooks/useWordRelations';

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

const VocabList: React.FC<VocabListProps> = ({
  initialVocabsData,
  initialLanguageFolderData,
  initialSubjectsData,
  initialLanguagesData,
  initialWordTypesData,
  currentUser,
  vocabListLoadFailed = false,
}) => {
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const user = currentUser ?? null;
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
  const openAdd = searchParams.get('openAdd') || '';
  const selectedSubjectIds = subjectIdsParam ? subjectIdsParam.split(',') : [];

  const totalItems = initialVocabsData?.totalItems || 0;
  const totalPages = initialVocabsData?.totalPages || 0;
  const currentPage = initialVocabsData?.currentPage || 1;
  const isLoading = false;
  const isError = vocabListLoadFailed;

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

  const dialogState = useDialogState<TVocab>();

  useEffect(() => {
    if (!openAdd) {
      return;
    }
    form.reset({
      textSource: openAdd,
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
    dialogState.setOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('openAdd');
    router.replace(`/vocab-list?${params.toString()}`, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAdd]);

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

  const { relationController, relatedWords, resetRelations } = useWordRelations({
    dialogOpen: dialogState.open,
    editMode: dialogState.editMode,
    editingItem: dialogState.editingItem,
    sourceLanguageCode: form.watch('sourceLanguageCode') || undefined,
    targetLanguageCode: form.watch('targetLanguageCode') || undefined,
    languageFolderId,
    getVocabsForSelection,
  });

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
    resetRelations();
  };

  const addTextTarget = () => {
    const currentTargets = form.getValues('textTargets');
    const newIndex = currentTargets.length;
    form.setValue('textTargets', [...currentTargets, {
      id: generateId(),
      wordTypeId: '',
      textTarget: '',
      grammar: '',
      explanationSource: '',
      explanationTarget: '',
      subjectIds: [],
      vocabExamples: [{ id: generateId(), source: '', target: '' }],
    }], { shouldDirty: true, shouldValidate: true });
    setActiveTab(newIndex.toString());
  };

  const removeTextTarget = (index: number) => {
    const currentTargets = form.getValues('textTargets');
    if (currentTargets.length > 1) {
      form.setValue(
        'textTargets',
        currentTargets.filter((_, i) => i !== index),
        { shouldDirty: true, shouldValidate: true },
      );
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
    resetForm();
    dialogState.handleClose();
  };

  const handleInputChange = (field: string, value: string, targetIndex?: number) => {
    if (targetIndex !== undefined && targetIndex !== null) {
      form.setValue(
        `textTargets.${targetIndex}.${field}` as `textTargets.${number}.textTarget`,
        value,
        { shouldDirty: true, shouldValidate: true },
      );
    } else {
      form.setValue(field as keyof FormData, value, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleExampleChange = (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number = 0) => {
    form.setValue(
      `textTargets.${targetIndex}.vocabExamples.${exampleIndex}.${field}`,
      value,
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const addExample = (targetIndex: number = 0) => {
    const examples = form.getValues(`textTargets.${targetIndex}.vocabExamples`);
    form.setValue(
      `textTargets.${targetIndex}.vocabExamples`,
      [...examples, { id: generateId(), source: '', target: '' }],
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const removeExample = (exampleIndex: number, targetIndex: number = 0) => {
    const examples = form.getValues(`textTargets.${targetIndex}.vocabExamples`);
    form.setValue(
      `textTargets.${targetIndex}.vocabExamples`,
      examples.filter((_, exIndex) => exIndex !== exampleIndex),
      { shouldDirty: true, shouldValidate: true },
    );
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

  const handleLinkedWordClick = useCallback((word: string) => {
    handleSearchChange(word);
  }, [handleSearchChange]);

  const handleAddFreeTextWord = useCallback((word: string) => {
    form.reset({
      textSource: word,
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
    dialogState.setOpen(true);
  }, [form, dialogState, sourceLanguageCode, targetLanguageCode]);

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
        relatedWords,
        textTargets: formData.textTargets.map(({ id, ...target }) => ({
          ...target,
          vocabExamples: target.vocabExamples.map(({ id: _exampleId, ...example }) => example),
        })),
      } as TCreateVocab;

      if (dialogState.editMode && dialogState.editingItem) {
        await updateVocab(dialogState.editingItem.id, apiData);
      } else {
        await createVocab(apiData);
        handlers.setPage(1);
      }

      toast.success(dialogState.editMode ? 'Vocabulary updated successfully' : 'Vocabulary created successfully');

      resetForm();
      dialogState.handleClose();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save vocabulary';
      if (isQuotaError(error)) {
        toast.error(QUOTA_ERROR_MESSAGE, {
          description: errorMessage,
          action: { label: 'Upgrade', onClick: () => {
            window.location.href = '/#pricing';
          } },
        });
      } else {
        toast.error('Error', { description: errorMessage });
      }
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
            <span
              key={`${row.original.textSource}`}
              className="inline-flex max-w-32 min-w-0 shrink-0 items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:max-w-40 md:max-w-48"
              title={row.original.textSource}
            >
              <span className="block min-w-0 truncate">
                {row.original.textSource}
              </span>
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeakTextSource(row.original);
              }}
              aria-label="Play pronunciation"
              title="Play pronunciation"
            >
              <VolumeLoud size={16} weight="BoldDuotone" className="text-muted-foreground" />
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
          <div className="flex min-w-0 gap-1 overflow-hidden">
            {textTargets.map((textTarget, index) => (
              <span
                key={`${textTarget.textTarget}-${index}`}
                className="inline-flex max-w-32 min-w-0 shrink-0 items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:max-w-40 md:max-w-48"
                title={textTarget.textTarget}
              >
                <span className="block min-w-0 truncate">
                  {textTarget.textTarget}
                </span>
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
            className="h-6 w-6 p-0 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(prev => ({
                ...prev,
                [row.original.id]: !prev[row.original.id],
              }));
            }}
          >
            {isExpanded ? <AltArrowDown size={16} weight="BoldDuotone" /> : <AltArrowLeft size={16} weight="BoldDuotone" />}
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
            className="h-8 w-8 rounded-lg hover:bg-accent"
            onClick={() => router.push(`/vocab-list/${_row.original.id}`)}
          >
            <Eye size={16} weight="BoldDuotone" className="text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-accent"
            onClick={() => handleEdit(_row.original)}
          >
            <Pen size={16} weight="BoldDuotone" className="text-muted-foreground" />
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
          userRole={user?.role}
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
          <ErrorState message="Could not load the vocabulary list. Try adjusting filters or refresh the page." />
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
              {...relationController}
              userRole={user?.role}
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

            {!vocabListLoadFailed && (
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
                    onLinkedWordClick={handleLinkedWordClick}
                    onAddFreeTextWord={handleAddFreeTextWord}
                  />
                )}
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
            )}
          </>
        )}
      </div>
    </Form>
  );
};

export default VocabList;
