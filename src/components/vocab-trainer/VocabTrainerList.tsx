'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TSrsDefaults } from '@/types/srs-settings';
import type { TTrainerFormData } from '@/libs/validations/vocab-trainer';
import type { TVocabTrainer, VocabTrainerListProps } from '@/types/vocab-trainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { DangerTriangle, Pen } from '@solar-icons/react/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { getProblematicVocabIdsForPractice } from '@/actions/statistics';
import { getSrsSettings } from '@/actions/srs-settings';
import { createVocabTrainer, deleteVocabTrainer, deleteVocabTrainersBulk, updateFsrsSettings, updateVocabTrainer } from '@/actions/vocab-trainers';
import { BulkDeleteDialog, DeleteActionButton, ErrorState } from '@/shared/ui/shared';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Form } from '@/shared/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { DataTable } from '@/shared/ui/table';
import { QUESTION_TYPE_OPTIONS } from '@/constants/vocab-trainer';
import { EFsrsDirection, EQuestionType, ETrainerMode } from '@/enum/vocab-trainer';
import { createTrainerFormSchema, dateInputToEndsAt, endsAtToDateInput, FSRS_MAX_INTERVAL_DAYS } from '@/libs/validations/vocab-trainer';
import { useApiPagination, useBulkDelete, useDialogState } from '@/hooks';
import { getExamCooldownRemainingSeconds } from '@/utils/exam-cooldown';
import AddVocabTrainerDialog from './AddVocabTrainerDialog';
import CloneTrainerDialog from './CloneTrainerDialog';
import ExamLauncher from './ExamLauncher';
import FsrsTrainerActions from './FsrsTrainerActions';
import FsrsTrainerStatus from './FsrsTrainerStatus';
import VocabTrainerHeader from './VocabTrainerHeader';

type FormData = TTrainerFormData;

const SYSTEM_RETENTION = 0.9;
const ALL_DIRECTIONS = [EFsrsDirection.SOURCE_TO_TARGET, EFsrsDirection.TARGET_TO_SOURCE];

// The FSRS fields only matter in FSRS mode; they start from the user's defaults when those are known.
const buildDefaultValues = (srsDefaults?: TSrsDefaults): FormData => ({
  name: '',
  mode: ETrainerMode.CLASSIC,
  questionType: EQuestionType.MULTIPLE_CHOICE,
  setCountTime: 900,
  reminderDisabled: false,
  vocabAssignmentIds: [],
  fsrsDirections: srsDefaults?.directions ?? ALL_DIRECTIONS,
  fsrsDesiredRetention: srsDefaults?.desiredRetention ?? SYSTEM_RETENTION,
  fsrsMaximumInterval: FSRS_MAX_INTERVAL_DAYS,
  fsrsNewPerDay: null,
  fsrsEndsAt: '',
});

const QUESTION_TYPE_BADGE_CLASSES: Record<string, string> = {
  [EQuestionType.FILL_IN_THE_BLANK]: 'bg-accent text-accent-foreground',
  [EQuestionType.MULTIPLE_CHOICE]: 'bg-primary/15 text-primary',
  [EQuestionType.FLIP_CARD]: 'bg-warning/20 text-warning-foreground',
  [EQuestionType.TRANSLATION_AUDIO]: 'bg-success/15 text-success',
  default: 'bg-muted text-muted-foreground',
};

const MAX_PASS_COUNT = 6;

const VocabTrainerList: React.FC<VocabTrainerListProps> = ({ initialData, initialLanguagesData, currentUser, loadError }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [cachedLanguageFolders, setCachedLanguageFolders] = useState<any[]>([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const user = currentUser ?? null;

  const { pagination, handlers } = useApiPagination({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
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
  const isError = Boolean(loadError);

  const checkCooldown = useCallback(() => {
    setCooldownRemaining(getExamCooldownRemainingSeconds());
  }, []);

  const [srsDefaults, setSrsDefaults] = useState<TSrsDefaults | undefined>();
  // The trainer whose ended cycle a new one is being started from.
  const [cloneTarget, setCloneTarget] = useState<TVocabTrainer | null>(null);
  // A deadline that is kept as it is stays valid after it has passed, so an ended trainer can still be renamed.
  const [originalEndsAt, setOriginalEndsAt] = useState('');
  const schemaRef = useRef(createTrainerFormSchema());

  useEffect(() => {
    schemaRef.current = createTrainerFormSchema({ originalEndsAt });
  }, [originalEndsAt]);

  const form = useForm<FormData>({
    resolver: (values, context, options) => zodResolver(schemaRef.current)(values, context, options),
    mode: 'onChange',
    defaultValues: buildDefaultValues(),
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
    setOriginalEndsAt('');
    form.reset(buildDefaultValues(srsDefaults));
  };

  const dialogState = useDialogState<TVocabTrainer>({
    onClose: () => {
      resetForm();
    },
  });
  const setCreateDialogOpen = dialogState.setOpen;

  const problematicPresetConsumedRef = useRef(false);
  const srsDefaultsRequestedRef = useRef(false);

  // The user's defaults are read once, when the create dialog is first opened. Without them the system defaults stay.
  useEffect(() => {
    if (!dialogState.open || dialogState.editMode || srsDefaultsRequestedRef.current) {
      return;
    }
    srsDefaultsRequestedRef.current = true;
    getSrsSettings()
      .then(({ defaults }) => {
        setSrsDefaults(defaults);
        form.setValue('fsrsDirections', defaults.directions);
        form.setValue('fsrsDesiredRetention', defaults.desiredRetention);
      })
      .catch(() => undefined);
  }, [dialogState.open, dialogState.editMode, form]);

  useEffect(() => {
    if (!isMounted || searchParams.get('preset') !== 'problematic' || problematicPresetConsumedRef.current) {
      return;
    }

    problematicPresetConsumedRef.current = true;
    const sourceLanguageCode = searchParams.get('sourceLanguageCode') ?? undefined;
    router.replace('/vocab-trainer');

    let cancelled = false;

    (async () => {
      const result = await getProblematicVocabIdsForPractice(sourceLanguageCode);
      if (cancelled) {
        return;
      }

      if (!Array.isArray(result)) {
        toast.error(result.error);
        return;
      }

      if (result.length === 0) {
        toast.info('No words need practice right now.');
        return;
      }

      const practiceName = sourceLanguageCode
        ? `Problematic ${sourceLanguageCode.toUpperCase()} words practice`
        : 'Problematic words practice';

      form.setValue('vocabAssignmentIds', result, { shouldDirty: true, shouldValidate: true });
      form.setValue('name', practiceName, { shouldDirty: true });
      form.clearErrors('vocabAssignmentIds');
      setCreateDialogOpen(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isMounted, searchParams, form, setCreateDialogOpen, router]);

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

      const endsAt = endsAtToDateInput(item.fsrsEndsAt);
      setOriginalEndsAt(endsAt);
      form.reset({
        name: item.name,
        mode: item.mode ?? ETrainerMode.CLASSIC,
        questionType: item.questionType,
        setCountTime: item.setCountTime,
        reminderDisabled: item.reminderDisabled,
        vocabAssignmentIds: item.vocabAssignments?.map(va => va.vocabId) || [],
        fsrsDirections: item.fsrsDirections?.length ? item.fsrsDirections : ALL_DIRECTIONS,
        fsrsDesiredRetention: item.fsrsDesiredRetention ?? SYSTEM_RETENTION,
        fsrsMaximumInterval: item.fsrsMaximumInterval ?? FSRS_MAX_INTERVAL_DAYS,
        fsrsNewPerDay: item.fsrsNewPerDay ?? null,
        fsrsEndsAt: endsAt,
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

      const isFsrs = formData.mode === ETrainerMode.FSRS;
      const editingItem = dialogState.editMode ? dialogState.editingItem : null;

      if (editingItem) {
        await updateVocabTrainer(editingItem.id, apiData);
        if (isFsrs) {
          // Only what changed is sent: an unchanged deadline that has passed would be refused as "in the past".
          const settings = {
            ...(formData.fsrsDesiredRetention !== editingItem.fsrsDesiredRetention && { desiredRetention: formData.fsrsDesiredRetention }),
            ...(formData.fsrsMaximumInterval !== editingItem.fsrsMaximumInterval && { maximumInterval: formData.fsrsMaximumInterval }),
            ...(formData.fsrsNewPerDay !== editingItem.fsrsNewPerDay && { newPerDay: formData.fsrsNewPerDay }),
            ...(formData.fsrsEndsAt !== originalEndsAt && { endsAt: dateInputToEndsAt(formData.fsrsEndsAt) }),
          };
          if (Object.keys(settings).length > 0) {
            await updateFsrsSettings(editingItem.id, settings);
          }
        }
      } else {
        const created = await createVocabTrainer(isFsrs
          ? {
              ...apiData,
              mode: ETrainerMode.FSRS,
              fsrsDesiredRetention: formData.fsrsDesiredRetention,
              fsrsMaximumInterval: formData.fsrsMaximumInterval,
              fsrsNewPerDay: formData.fsrsNewPerDay,
              fsrsDirections: formData.fsrsDirections,
              fsrsEndsAt: dateInputToEndsAt(formData.fsrsEndsAt),
            }
          : apiData);
        const skipped = created.fsrsSkippedVocabIds?.length ?? 0;
        if (skipped > 0) {
          toast.info(`${skipped} ${skipped === 1 ? 'word has' : 'words have'} no translation yet and got no questions.`);
        }
        handlers.setPage(1);
      }

      dialogState.handleClose();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Failed to save vocab trainer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save the trainer');
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
          <div>
            <div className="font-semibold text-foreground">{row.original.name}</div>
            {row.original.mode === ETrainerMode.FSRS && <FsrsTrainerStatus trainer={row.original} />}
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
        // Pass or fail and the six passes belong to Classic; a spaced repetition trainer never "passes".
        if (row.original.mode === ETrainerMode.FSRS) {
          return <Badge className="bg-primary/15 text-primary">Spaced repetition</Badge>;
        }
        const status = row.original.status;
        const passCount = row.original.reminderRepeat;
        const displayStatus = status === 'PASSED'
          ? `${status} ${Number.isFinite(passCount) ? passCount : 0}/${MAX_PASS_COUNT}`
          : status;
        const statusColors = {
          PENDING: 'bg-warning/20 text-warning-foreground',
          PASSED: 'bg-success/15 text-success',
          FAILED: 'bg-destructive/15 text-destructive',
        };
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-muted text-muted-foreground'}>
            {displayStatus}
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
          {_row.original.mode === ETrainerMode.FSRS
            ? <FsrsTrainerActions trainer={_row.original} onExtend={handleEdit} onStartNewCycle={setCloneTarget} />
            : <ExamLauncher trainerId={_row.original.id} questionType={_row.original.questionType} />}
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
          <ErrorState message={loadError || 'Error loading vocab trainers. Please try again.'} />
        )}

        {isMounted && !isError && (
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
              srsDefaults={srsDefaults}
            />

            <CloneTrainerDialog
              trainer={cloneTarget}
              onClose={() => setCloneTarget(null)}
              onCloned={() => {
                setCloneTarget(null);
                handlers.setPage(1);
                startTransition(() => {
                  router.refresh();
                });
              }}
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
              onPageSizeChange={handlers.handlePageSizeChange}
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
