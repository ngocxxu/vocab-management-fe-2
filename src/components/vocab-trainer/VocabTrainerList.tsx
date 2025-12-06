'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createVocabTrainer, deleteVocabTrainer, deleteVocabTrainersBulk, updateVocabTrainer } from '@/actions/vocab-trainers';
import { BulkDeleteDialog, DeleteActionButton, ErrorState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { DataTable } from '@/components/ui/table';
import { QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';
import { EQuestionType } from '@/enum/vocab-trainer';
import { useApiPagination, useAuth, useBulkDelete, useDialogState, useVocabTrainers } from '@/hooks';
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
  const [globalFilter, setGlobalFilter] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([]);

  const { pagination, handlers } = useApiPagination({
    page: 1,
    pageSize: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const { user } = useAuth();

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setIsMounted(true);
  }, []);

  const { handleSort, handlePageChange } = handlers;

  const resetForm = () => {
    form.reset({
      name: '',
      questionType: EQuestionType.MULTIPLE_CHOICE,
      setCountTime: 900,
      reminderDisabled: false,
      vocabAssignmentIds: [],
    });
  };

  const dialogState = useDialogState<TVocabTrainer>({
    onClose: () => {
      resetForm();
    },
  });

  const bulkDelete = useBulkDelete({
    deleteMutation: async (ids: string[]) => {
      await deleteVocabTrainersBulk(ids);
      return { success: true };
    },
    onSuccess: async () => {
      await mutate();
    },
    itemName: 'vocabulary trainer',
    itemNamePlural: 'vocabulary trainers',
  });

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

  const handleEdit = useCallback(
    (item: TVocabTrainer) => {
      dialogState.handleEdit(item);

      form.reset({
        name: item.name,
        questionType: item.questionType,
        setCountTime: item.setCountTime,
        reminderDisabled: item.reminderDisabled,
        vocabAssignmentIds: item.vocabAssignments?.map(va => va.vocabId) || [],
      });
    },
    [form, dialogState],
  );

  const handleCloseDialog = () => {
    dialogState.handleClose();
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

      if (dialogState.editMode && dialogState.editingItem) {
        await updateVocabTrainer(dialogState.editingItem.id, apiData);
      } else {
        await createVocabTrainer(apiData);
      }

      await mutate();
      dialogState.setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save vocab trainer:', error);
    }
  };

  // Use the trainers from hook
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
          <DeleteActionButton
            itemId={_row.original.id}
            itemName="vocabulary trainer"
            onDelete={async (id: string) => {
              await deleteVocabTrainer(id);
            }}
            onSuccess={async () => {
              await mutate();
            }}
            successMessage="Vocab trainer deleted successfully!"
            errorMessage="Failed to delete vocab trainer. Please try again."
          />
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
          onAddTrainer={() => dialogState.setOpen(true)}
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
          <ErrorState message="Error loading vocab trainers. Please try again." />
        )}

        {isMounted && (
          <>
            <AddVocabTrainerDialog
              formData={form.watch()}
              onSubmit={handleSubmit}
              onReset={resetForm}
              open={dialogState.open}
              setOpen={handleCloseDialog}
              editMode={dialogState.editMode}
              editingItem={dialogState.editingItem}
            />

            <BulkDeleteDialog
              open={bulkDelete.bulkDeleteDialogOpen}
              onOpenChange={bulkDelete.setBulkDeleteDialogOpen}
              itemCount={bulkDelete.selectedIds.length}
              itemName="vocabulary trainer"
              itemNamePlural="vocabulary trainers"
              onConfirm={bulkDelete.confirmBulkDelete}
              onCancel={() => bulkDelete.reset()}
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
              onBulkDelete={bulkDelete.handleBulkDelete}
            />
          </>
        )}
      </div>
    </Form>
  );
};

export default VocabTrainerList;
