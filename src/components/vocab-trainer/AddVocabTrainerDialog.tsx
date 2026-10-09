'use client';

import { RefreshCircle } from '@solar-icons/react/ssr';
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
import FsrsSettingsFields from './FsrsSettingsFields';
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px] lg:max-w-[950px] xl:max-w-[1100px] 2xl:max-w-[1300px]">
        <div className="mx-auto w-full">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Vocab Trainer' : 'Create New Vocab Trainer'}</DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Update the details for your vocabulary trainer'
                : 'Configure your session and select words to practice.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-6 p-6 pb-0 lg:grid-cols-[minmax(0,380px)_1fr]">
            <div className="space-y-6">
              <TrainerBasicInfoForm userRole={userRole} selectedWords={selectedWordBadges} editMode={editMode} srsDefaults={srsDefaults} />
              {formData.mode === ETrainerMode.FSRS && (
                <FsrsSettingsFields
                  editMode={editMode}
                  wordCount={selectedWordBadges.length}
                  wordsWithoutTranslation={wordsWithoutTranslation}
                />
              )}
            </div>
            <div className="min-w-0">
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
            </div>
          </div>
          <DialogFooter className="mt-2 flex flex-row justify-end gap-2 border-t pt-4 sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
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
                      Creating...
                    </>
                  )
                : editMode
                  ? (
                      'Update Trainer'
                    )
                  : (
                      'Create Trainer'
                    )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
      <AlertDialog open={removalConfirmOpen} onOpenChange={setRemovalConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {removedCount === 1 ? '1 word' : `${removedCount} words`}
              {' will lose their review schedule'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Removing a word deletes its review schedule in this trainer. Its review history is kept. Adding the word back later starts it as new.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmRemoval()}>Remove and update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default AddVocabTrainerDialog;
