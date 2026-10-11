'use client';

import { RefreshCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { TVocab } from '@/types/vocab-list';
import { getVocabsByIds } from '@/actions';
import type {
  AddVocabTrainerDialogProps,
} from '@/types/vocab-trainer';
import { ETrainerMode } from '@/enum/vocab-trainer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/ui/alert-dialog';
import { removedVocabIds } from '@/utils/trainer-word-removal';
import ClassicSettingsFields, { ClassicCardSummary } from './ClassicSettingsFields';
import FsrsSettingsFields, { FsrsCardSummary } from './FsrsSettingsFields';
import TrainerBasicInfoForm from './TrainerBasicInfoForm';
import VocabSelectionForm from './VocabSelectionForm';

const EMPTY_CACHED_LANGUAGE_FOLDERS: AddVocabTrainerDialogProps['cachedLanguageFolders'] = [];

const AddVocabTrainerDialog: React.FC<AddVocabTrainerDialogProps> = ({
  formData,
  onSubmit,
  onReset,
  open,
  setOpen,
  editMode = false,
  initialLanguagesData,
  cachedLanguageFolders = EMPTY_CACHED_LANGUAGE_FOLDERS,
  onLanguageFoldersLoaded,
  editingItem,
  userRole,
  srsDefaults,
}) => {
  const t = useTranslations('trainer.dialog');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVocabById, setSelectedVocabById] = useState<Record<string, TVocab>>({});
  const [removalConfirmOpen, setRemovalConfirmOpen] = useState(false);

  // Only an FSRS trainer keeps a schedule per word, so only there does removing a word cost something.
  const removedCount = editMode && editingItem?.mode === ETrainerMode.FSRS
    ? removedVocabIds(editingItem.vocabAssignments.map(assignment => assignment.vocabId), formData.vocabAssignmentIds || []).length
    : 0;

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (removedCount > 0) {
      setRemovalConfirmOpen(true);
      return;
    }
    await submit();
  };

  const handleConfirmRemoval = async () => {
    setRemovalConfirmOpen(false);
    await submit();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onReset();
    }
    setOpen(newOpen);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const selectedIds = formData.vocabAssignmentIds || [];
    const missingIds = selectedIds.filter(id => !selectedVocabById[id]);
    if (missingIds.length === 0) {
      return;
    }

    let cancelled = false;
    (async () => {
      const result = await getVocabsByIds(missingIds);
      if (cancelled || !Array.isArray(result)) {
        return;
      }
      setSelectedVocabById((prev) => {
        const next = { ...prev };
        result.forEach((v) => {
          next[v.id] = v;
        });
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [formData.vocabAssignmentIds, open, selectedVocabById]);

  const selectedWordBadges = useMemo(() => {
    const selectedIds = formData.vocabAssignmentIds || [];
    return selectedIds.map((id) => {
      const vocab = selectedVocabById[id];
      return { id, label: vocab?.textSource };
    });
  }, [formData.vocabAssignmentIds, selectedVocabById]);

  // A word without a translation gets no card; words that are not loaded yet are not counted as missing.
  const wordsWithoutTranslation = useMemo(
    () => (formData.vocabAssignmentIds || [])
      .flatMap((id) => {
        const vocab = selectedVocabById[id];
        return vocab && vocab.textTargets.length === 0 ? [vocab.textSource] : [];
      }),
    [formData.vocabAssignmentIds, selectedVocabById],
  );

  const isFsrs = formData.mode === ETrainerMode.FSRS;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Only the body scrolls. Header and footer are separate rows, so the footer never sits on top of scrolled content. */}
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[700px] lg:max-w-[950px] xl:max-w-[1100px] 2xl:max-w-[1300px]">
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pr-12 pb-4">
          <DialogTitle>{editMode ? t('editTitle') : t('createTitle')}</DialogTitle>
          <DialogDescription>
            {editMode
              ? t('editDescription')
              : t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="space-y-6">
            <TrainerBasicInfoForm userRole={userRole} selectedWords={selectedWordBadges} editMode={editMode} srsDefaults={srsDefaults} />
          </div>
          <div className="min-w-0 space-y-6">
            {open && (
              <VocabSelectionForm
                selectedIds={formData.vocabAssignmentIds}
                selectedVocabById={selectedVocabById}
                initialLanguagesData={initialLanguagesData}
                open={open}
                cachedLanguageFolders={cachedLanguageFolders}
                onLanguageFoldersLoaded={onLanguageFoldersLoaded}
                editMode={editMode}
              />
            )}
            {isFsrs
              ? (
                  <FsrsSettingsFields
                    editMode={editMode}
                    wordCount={selectedWordBadges.length}
                    wordsWithoutTranslation={wordsWithoutTranslation}
                  />
                )
              : <ClassicSettingsFields />}
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-t bg-card px-6 py-4 shadow-[0_-8px_16px_-12px_rgb(0_0_0/0.25)] sm:justify-between">
          <div className="min-w-0 flex-1">
            {isFsrs
              ? <FsrsCardSummary wordCount={selectedWordBadges.length} wordsWithoutTranslation={wordsWithoutTranslation} />
              : <ClassicCardSummary wordCount={selectedWordBadges.length} />}
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (
                    <>
                      <RefreshCircle size={16} weight="BoldDuotone" className="mr-2 animate-spin" />
                      {t('creating')}
                    </>
                  )
                : editMode
                  ? (
                      t('update')
                    )
                  : (
                      t('create')
                    )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <AlertDialog open={removalConfirmOpen} onOpenChange={setRemovalConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('removeTitle', { count: removedCount })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('removeDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmRemoval()}>{t('removeConfirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default AddVocabTrainerDialog;
