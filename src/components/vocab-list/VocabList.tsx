'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TSubjectResponse } from '@/types/subject';
import type { TVocab } from '@/types/vocab-list';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronLeft, Edit, Volume2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSpeechSynthesis } from 'react-speech-kit';
import { z } from 'zod';
import { createVocab, deleteVocabsBulk, updateVocab } from '@/actions/vocabs';
import { BulkDeleteDialog, DeleteActionButton, ErrorState } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { DataTable } from '@/components/ui/table';
import { useApiPagination, useAuth, useBulkDelete, useDialogState, useLanguageFolder, useSubjects, useVocabs } from '@/hooks';
import { selectVoiceByCode } from '@/utils/textToSpeech';
import AddVocabDialog from './AddVocabDialog';
import ExpandedRowContent from './ExpandedRowContent';
import ImportVocabDialog from './ImportVocabDialog';
import VocabListHeader from './VocabListHeader';

// Utility function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

type VocabListProps = {
  initialSubjectsData?: TSubjectResponse;
};

const VocabList: React.FC<VocabListProps> = ({ initialSubjectsData }) => {
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
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

  const sourceLanguageCode = searchParams.get('sourceLanguageCode') || undefined;
  const targetLanguageCode = searchParams.get('targetLanguageCode') || undefined;
  const languageFolderId = searchParams.get('languageFolderId') || undefined;

  const { user } = useAuth();

  const queryParams = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
    textSource: globalFilter || undefined,
    sourceLanguageCode,
    targetLanguageCode,
    languageFolderId,
    subjectIds: selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined,
    userId: user?.id,
  };

  const { vocabs, totalItems, totalPages, currentPage, isLoading, isError, mutate } = useVocabs(queryParams);
  const { languageFolder, isLoading: isFolderLoading } = useLanguageFolder(languageFolderId || null);
  const { subjects, isLoading: isSubjectsLoading } = useSubjects(initialSubjectsData);

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
    onSuccess: () => void mutate(),
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
    (item: TVocab) => {
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
    },
    [form, dialogState],
  );

  const handleCloseDialog = () => {
    dialogState.handleClose();
  };

  const handleInputChange = (field: string, value: string, targetIndex?: number) => {
    if (targetIndex !== undefined) {
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
    mutate(); // Refresh the vocab list
  }, [mutate]);

  const clearFilters = () => {
    setSelectedSubjectIds([]);
    setGlobalFilter('');
  };

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

      // Strip out the client-side IDs before sending to API
      const apiData = {
        ...formData,
        languageFolderId: languageFolderId || '',
        textTargets: formData.textTargets.map(({ id, ...target }) => ({
          ...target,
          vocabExamples: target.vocabExamples.map(({ id: exampleId, ...example }) => example),
        })),
      };

      if (dialogState.editMode && dialogState.editingItem) {
        await updateVocab(dialogState.editingItem.id, apiData as any);
      } else {
        await createVocab(apiData as any);
      }

      await mutate();
      dialogState.setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save vocabulary:', error);
      // Handle any other errors here
    }
  };

  // Use the vocabs from hook
  const data = useMemo<TVocab[]>(() => vocabs, [vocabs]);

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
              <Volume2 className="h-4 w-4 text-slate-500" />
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
            {textTargets.map(textTarget => (
              <span
                key={textTarget.textTarget + Math.random()}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-200"
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
                  <ChevronDown className="h-4 w-4" />
                )
              : (
                  <ChevronLeft className="h-4 w-4" />
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
            <Edit className="h-4 w-4 text-slate-500" />
          </Button>
          <DeleteActionButton
            itemId={_row.original.id}
            itemName="vocabulary item"
            onDelete={async (id: string) => {
              const { deleteVocab } = await import('@/actions/vocabs');
              await deleteVocab(id);
            }}
            onSuccess={() => void mutate()}
            successMessage="Vocabulary deleted successfully!"
            errorMessage="Failed to delete vocabulary. Please try again."
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
  ], [expanded, handleEdit, mutate, handleSpeakTextSource]);

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
          onSubjectFilterChange={setSelectedSubjectIds}
          onClearFilters={clearFilters}
          hasActiveFilters={selectedSubjectIds.length > 0 || !!globalFilter}
          queryParams={queryParams}
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
              searchValue={globalFilter}
              onSearchChangeAction={setGlobalFilter}
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
