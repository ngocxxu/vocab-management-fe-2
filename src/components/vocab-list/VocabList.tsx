'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TVocab } from '@/types/vocab-list';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronLeft, Edit, Trash } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { DataTable } from '@/components/ui/table';
import { useVocabs, vocabMutations } from '@/hooks';
import AddVocabDialog from './AddVocabDialog';
import ExpandedRowContent from './ExpandedRowContent';
import VocabListHeader from './VocabListHeader';

// Define the form schema
const FormSchema = z.object({
  textSource: z.string().min(1, 'Source text is required'),
  sourceLanguageCode: z.string().min(1, 'Source language is required'),
  targetLanguageCode: z.string().min(1, 'Target language is required'),
  textTargets: z.array(z.object({
    wordTypeId: z.string().min(1, 'Word type is required'),
    textTarget: z.string().min(1, 'Target text is required'),
    grammar: z.string(),
    explanationSource: z.string(),
    explanationTarget: z.string(),
    subjectIds: z.array(z.string()).min(1, 'At least one subject must be selected'),
    vocabExamples: z.array(z.object({
      source: z.string(),
      target: z.string(),
    })),
  })).min(1, 'At least one text target is required'),
});

type FormData = z.infer<typeof FormSchema>;

const VocabList: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TVocab | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  // Use SWR hook to fetch vocabularies
  const { vocabs, isLoading, isError, mutate } = useVocabs();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange', // Re-validate on change for better UX
    defaultValues: {
      textSource: '',
      sourceLanguageCode: '',
      targetLanguageCode: '',
      textTargets: [{
        wordTypeId: '',
        textTarget: '',
        grammar: '',
        explanationSource: '',
        explanationTarget: '',
        subjectIds: [], // Ensure this is always initialized as an empty array
        vocabExamples: [{ source: '', target: '' }],
      }],
    },
  });

  const [activeTab, setActiveTab] = useState('0');

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to reset form to default values
  const resetForm = () => {
    form.reset();
    setActiveTab('0');
  };

  const addTextTarget = () => {
    const newIndex = form.watch('textTargets').length;
    form.setValue('textTargets', [...form.watch('textTargets'), {
      wordTypeId: '',
      textTarget: '',
      grammar: '',
      explanationSource: '',
      explanationTarget: '',
      subjectIds: [], // Ensure this is always initialized as an empty array
      vocabExamples: [{ source: '', target: '' }],
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

  const handleEdit = (item: TVocab) => {
    setEditingItem(item);
    setEditMode(true);
    setOpen(true);

    // Populate the form with the item data, mapping the structure correctly
    form.reset({
      textSource: item.textSource,
      sourceLanguageCode: item.sourceLanguageCode,
      targetLanguageCode: item.targetLanguageCode,
      textTargets: item.textTargets.map(textTarget => ({
        wordTypeId: textTarget.wordType?.id || '', // Extract ID from wordType object
        textTarget: textTarget.textTarget,
        grammar: textTarget.grammar,
        explanationSource: textTarget.explanationSource,
        explanationTarget: textTarget.explanationTarget,
        subjectIds: textTarget.textTargetSubjects?.map(tts => tts.subject.id) || [], // Extract subject IDs
        vocabExamples: textTarget.vocabExamples || [{ source: '', target: '' }],
      })),
    });
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditMode(false);
    setEditingItem(null);
    resetForm();
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
        ? { ...target, vocabExamples: [...target.vocabExamples, { source: '', target: '' }] }
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

      if (editMode && editingItem) {
        // Update existing vocabulary
        await vocabMutations.update(editingItem.id, formData as any);
      } else {
        // Create new vocabulary
        await vocabMutations.create(formData as any);
      }

      // Refresh the data
      await mutate();

      // If successful, close the dialog and show success message
      setOpen(false);

      // Reset the form after successful submission
      resetForm();
    } catch (error) {
      console.error('Failed to save vocabulary:', error);
      // Handle any other errors here
    }
  };

  // Use the vocabs from SWR hook
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-700">
                <Trash className="h-4 w-4 text-slate-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this vocabulary item and remove it from your list.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={async () => {
                    try {
                      await vocabMutations.delete(_row.original.id);
                      await mutate();
                    } catch (error) {
                      console.error('Failed to delete vocabulary:', error);
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
  ], []);

  return (
    <Form {...form}>
      <div className="space-y-6">
        <VocabListHeader
          totalCount={data.length}
          onAddVocab={() => setOpen(true)}
        />

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg">Loading vocabularies...</div>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-red-600">Error loading vocabularies. Please try again.</div>
          </div>
        )}

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg">Loading vocabularies...</div>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-red-600">Error loading vocabularies. Please try again.</div>
          </div>
        )}

        {/* Empty State */}
        {data !== undefined && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg
                className="h-12 w-12 text-slate-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No vocabularies yet</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Get started by adding your first vocabulary item to build your learning collection.
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="mt-6"
            >
              Add your first vocabulary
            </Button>
          </div>
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
              open={open}
              setOpen={handleCloseDialog}
              editMode={editMode}
              editingItem={editingItem}
            />
            {data.length > 0 && (
              <DataTable
                columns={columns}
                data={data}
                searchPlaceholder="Search vocab..."
                searchValue={globalFilter}
                onSearchChangeAction={setGlobalFilter}
                showSearch={true}
                showPagination={true}
                pageSize={8}
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
              />
            )}
          </>
        )}
      </div>
    </Form>
  );
};

export default VocabList;
