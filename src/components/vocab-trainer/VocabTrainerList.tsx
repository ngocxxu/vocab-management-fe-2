'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { DataTable } from '@/components/ui/table';
import { QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';
import { EQuestionType } from '@/enum/vocab-trainer';
import { useApiPagination, useAuth, useVocabTrainers, vocabTrainerMutations } from '@/hooks';
import AddVocabTrainerDialog from './AddVocabTrainerDialog';
import ExamLauncher from './ExamLauncher';
import VocabTrainerHeader from './VocabTrainerHeader';

// Define the form schema
const FormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  questionType: z.nativeEnum(EQuestionType),
  setCountTime: z.number().min(1, 'Time must be at least 1 second'),
  reminderDisabled: z.boolean(),
  vocabAssignmentIds: z.array(z.string()).min(1, 'At least one vocabulary must be selected'),
});

type FormData = z.infer<typeof FormSchema>;

const VocabTrainerList: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TVocabTrainer | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([]);

  // Use reusable pagination hook
  const { pagination, handlers } = useApiPagination({
    page: 1,
    pageSize: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Get current user
  const { user } = useAuth();

  // Build query parameters for the API call
  const queryParams = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
    name: globalFilter || undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    questionType: selectedQuestionTypes.length > 0 ? selectedQuestionTypes[0] as EQuestionType : undefined,
    userId: user?.id,
  };

  const { vocabTrainers, totalItems, totalPages, currentPage, isLoading, isError, mutate } = useVocabTrainers(queryParams);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      questionType: EQuestionType.MULTIPLE_CHOICE,
      setCountTime: 900,
      reminderDisabled: false,
      vocabAssignmentIds: [],
    },
  });

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setIsMounted(true);
  }, []);

  // Use handlers from the reusable pagination hook
  const { handleSort, handlePageChange } = handlers;

  // Function to reset form to default values
  const resetForm = () => {
    form.reset({
      name: '',
      questionType: EQuestionType.MULTIPLE_CHOICE,
      setCountTime: 900,
      reminderDisabled: false,
      vocabAssignmentIds: [],
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedQuestionTypes([]);
    setGlobalFilter('');
  };

  // Define filter options
  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PASSED', label: 'Passed' },
    { value: 'FAILED', label: 'Failed' },
  ];

  const handleEdit = useCallback((item: TVocabTrainer) => {
    setEditingItem(item);
    setEditMode(true);
    setOpen(true);

    // Populate the form with the item data
    form.reset({
      name: item.name,
      questionType: item.questionType,
      setCountTime: item.setCountTime,
      reminderDisabled: item.reminderDisabled,
      vocabAssignmentIds: item.vocabAssignments?.map(va => va.vocabId) || [],
    });
  }, [form]);

  const handleCloseDialog = () => {
    setOpen(false);
    setEditMode(false);
    setEditingItem(null);
    resetForm();
  };

  const handleSubmit = async () => {
    try {
      // Validate the form
      const isValid = await form.trigger();

      if (!isValid) {
        return;
      }

      // Get the validated form data
      const formData = form.getValues();

      // Prepare API data
      const apiData = {
        name: formData.name,
        status: 'PENDING',
        questionType: formData.questionType,
        reminderTime: 0,
        countTime: 0,
        setCountTime: formData.setCountTime,
        reminderDisabled: formData.reminderDisabled,
        reminderRepeat: 0,
        reminderLastRemind: new Date().toISOString(),
        vocabAssignmentIds: formData.vocabAssignmentIds,
      };

      if (editMode && editingItem) {
        // Update existing trainer
        await vocabTrainerMutations.update(editingItem.id, apiData);
      } else {
        // Create new trainer
        await vocabTrainerMutations.create(apiData);
      }

      // Refresh the data
      await mutate();

      // Close the dialog and show success message
      setOpen(false);

      // Reset the form after successful submission
      resetForm();
    } catch (error) {
      console.error('Failed to save vocab trainer:', error);
    }
  };

  // Use the trainers from SWR hook
  const data = useMemo<TVocabTrainer[]>(() => vocabTrainers, [vocabTrainers]);

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo<ColumnDef<TVocabTrainer>[]>(() => [
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
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-3">
            <div className="font-semibold text-slate-900 dark:text-white">{row.original.name}</div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
      size: 300,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors = {
          PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
          PASSED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
          FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
        };
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-slate-100 text-slate-800'}>
            {status}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
      size: 150,
    },
    {
      accessorKey: 'questionType',
      header: 'Question Type',
      cell: ({ row }) => {
        const type = row.original.questionType;
        return (
          <Badge variant="outline">
            {type.replace(/_/g, ' ')}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
      size: 200,
    },
    {
      accessorKey: 'vocabAssignments',
      header: 'Vocabularies',
      cell: ({ row }) => {
        const count = row.original.vocabAssignments?.length || 0;
        return (
          <span className="text-slate-600 dark:text-slate-400">
            {count}
            {' '}
            vocab
            {count !== 1 ? 's' : ''}
          </span>
        );
      },
      enableSorting: false,
      enableHiding: true,
      size: 150,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row: _row }) => (
        <div className="flex items-center space-x-2">
          <ExamLauncher
            trainerId={_row.original.id}
          />
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
                  This action cannot be undone. This will permanently delete this vocabulary trainer and remove it from your list.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={async () => {
                    try {
                      await vocabTrainerMutations.delete(_row.original.id);
                      await mutate();
                    } catch (error) {
                      console.error('Failed to delete vocab trainer:', error);
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
  ], [handleEdit, mutate]);

  return (
    <Form {...form}>
      <div className="space-y-6">
        <VocabTrainerHeader
          totalCount={totalItems}
          onAddTrainer={() => setOpen(true)}
          statusOptions={statusOptions}
          selectedStatuses={selectedStatuses}
          onStatusFilterChange={setSelectedStatuses}
          questionTypeOptions={QUESTION_TYPE_OPTIONS}
          selectedQuestionTypes={selectedQuestionTypes}
          onQuestionTypeFilterChange={setSelectedQuestionTypes}
          onClearFilters={clearFilters}
          hasActiveFilters={selectedStatuses.length > 0 || selectedQuestionTypes.length > 0 || !!globalFilter}
        />

        {isError && (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-red-600">Error loading vocab trainers. Please try again.</div>
          </div>
        )}

        {isMounted && (
          <>
            <AddVocabTrainerDialog
              formData={form.watch()}
              onSubmit={handleSubmit}
              onReset={resetForm}
              open={open}
              setOpen={handleCloseDialog}
              editMode={editMode}
              editingItem={editingItem}
            />
            <DataTable
              columns={columns}
              data={data}
              searchPlaceholder="Search trainers..."
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
              // Server-side pagination & sorting
              manualPagination={true}
              manualSorting={true}
              pageCount={totalPages}
              currentPage={currentPage}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onSortingChange={handleSort}
            />
          </>
        )}
      </div>
    </Form>
  );
};

export default VocabTrainerList;
