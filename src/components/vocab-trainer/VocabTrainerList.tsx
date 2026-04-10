'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TUser } from '@/types/auth';
import type { TVocabTrainer, VocabTrainerListProps } from '@/types/vocab-trainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { DangerTriangle, Pen } from '@solar-icons/react/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { verifyUser } from '@/actions';
import { createVocabTrainer, deleteVocabTrainer, deleteVocabTrainersBulk, updateVocabTrainer } from '@/actions/vocab-trainers';
import { BulkDeleteDialog, DeleteActionButton, ErrorState } from '@/shared/ui/shared';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Form } from '@/shared/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { DataTable } from '@/shared/ui/table';
import { QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';
import { EQuestionType } from '@/enum/vocab-trainer';
import { useApiPagination, useBulkDelete, useDialogState } from '@/hooks';
import { getExamCooldownRemainingSeconds } from '@/utils/exam-cooldown';
import AddVocabTrainerDialog from './AddVocabTrainerDialog';
import ExamLauncher from './ExamLauncher';
import VocabTrainerHeader from './VocabTrainerHeader';

// Define the form schema
const FormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  questionType: z.enum(EQuestionType),
  setCountTime: z.number().min(1, 'Time must be at least 1 second'),
  reminderDisabled: z.boolean(),
  vocabAssignmentIds: z.array(z.string()).min(1, 'At least one vocabulary must be selected'),
});

type FormData = z.infer<typeof FormSchema>;

const QUESTION_TYPE_BADGE_CLASSES: Record<string, string> = {
  [EQuestionType.FILL_IN_THE_BLANK]: 'bg-accent text-accent-foreground',
  [EQuestionType.MULTIPLE_CHOICE]: 'bg-primary/15 text-primary',
  [EQuestionType.FLIP_CARD]: 'bg-warning/20 text-warning-foreground',
  [EQuestionType.TRANSLATION_AUDIO]: 'bg-success/15 text-success',
  default: 'bg-muted text-muted-foreground',
};

const VocabTrainerList: React.FC<VocabTrainerListProps> = ({ initialData, initialLanguagesData }) => {
  const [user, setUser] = useState<TUser | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [cachedLanguageFolders, setCachedLanguageFolders] = useState<any[]>([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    verifyUser().then(setUser);
  }, []);

  const { pagination, handlers } = useApiPagination({
    page: 1,
    pageSize: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const name = searchParams.get('name') || '';
  const statusParam = searchParams.get('status');
  const selectedStatuses = statusParam ? statusParam.split(',') : [];
  const questionTypeParam = searchParams.get('questionType');
  const selectedQuestionTypes = questionTypeParam ? [questionTypeParam] : [];

  const totalItems = initialData?.totalItems || 0;
  const totalPages = initialData?.totalPages || 0;
  const currentPage = initialData?.currentPage || 1;
  const isLoading = false;
  const isError = false;

  const checkCooldown = useCallback(() => {
    setCooldownRemaining(getExamCooldownRemainingSeconds());
  }, []);

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

  useEffect(() => {
    checkCooldown();
    const interval = setInterval(() => {
      checkCooldown();
    }, 1000);
    return () => clearInterval(interval);
  }, [checkCooldown]);

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
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
    },
    itemName: 'vocabulary trainer',
    itemNamePlural: 'vocabulary trainers',
  });

  const handleStatusFilterChange = useCallback((statuses: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (statuses.length > 0) {
      params.set('status', statuses.join(','));
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleQuestionTypeFilterChange = useCallback((questionTypes: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (questionTypes.length > 0) {
      params.set('questionType', questionTypes[0] || '');
    } else {
      params.delete('questionType');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearchChange = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('name', query);
    } else {
      params.delete('name');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('name');
    params.delete('status');
    params.delete('questionType');
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

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

      dialogState.setOpen(false);
      resetForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Failed to save vocab trainer:', error);
    }
  };

  const data = useMemo<TVocabTrainer[]>(() => initialData?.items || [], [initialData]);

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
            <div className="font-semibold text-foreground">{row.original.name}</div>
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
          PENDING: 'bg-warning/20 text-warning-foreground',
          PASSED: 'bg-success/15 text-success',
          FAILED: 'bg-destructive/15 text-destructive',
        };
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-muted text-muted-foreground'}>
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
        const badgeClass = QUESTION_TYPE_BADGE_CLASSES[type] ?? QUESTION_TYPE_BADGE_CLASSES.default;
        return (
          <Badge className={badgeClass}>
            {type.replaceAll('_', ' ')}
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
          <span className="text-muted-foreground">
            {count}
            {' '}
            vocab
            {count === 1 ? '' : 's'}
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
            questionType={_row.original.questionType}
          />
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
            itemName="vocabulary trainer"
            onDelete={async (id: string) => {
              await deleteVocabTrainer(id);
            }}
            onSuccess={() => {
              startTransition(() => {
                router.refresh();
              });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [handleEdit]);

  return (
    <Form {...form}>
      <div className="space-y-6">
        <VocabTrainerHeader
          totalCount={totalItems}
          onAddTrainer={() => dialogState.setOpen(true)}
          statusOptions={statusOptions}
          selectedStatuses={selectedStatuses}
          onStatusFilterChange={handleStatusFilterChange}
          questionTypeOptions={QUESTION_TYPE_OPTIONS}
          selectedQuestionTypes={selectedQuestionTypes}
          onQuestionTypeFilterChange={handleQuestionTypeFilterChange}
          onClearFilters={clearFilters}
          hasActiveFilters={selectedStatuses.length > 0 || selectedQuestionTypes.length > 0 || !!name}
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
              initialLanguagesData={initialLanguagesData}
              cachedLanguageFolders={cachedLanguageFolders}
              onLanguageFoldersLoaded={setCachedLanguageFolders}
              userRole={user?.role}
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
              searchValue={name}
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

            {cooldownRemaining > 0 && (
              <Alert className="border-border bg-warning/15">
                <DangerTriangle className="size-5 text-warning" />
                <AlertTitle>Take a quick 60s break</AlertTitle>
                <AlertDescription>
                  AI is preparing your next exam
                  {' '}
                  (
                  <strong>
                    {cooldownRemaining}
                    s
                  </strong>
                  {' '}
                  left).
                  {' '}
                  Feel free to jump into
                  {' '}
                  <strong>Flip Cards</strong>
                  {' '}
                  right now—they’re always ready for you!
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </Form>
  );
};

export default VocabTrainerList;
