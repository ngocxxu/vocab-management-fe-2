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
  editingItem: _editingItem,
  userRole,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVocabById, setSelectedVocabById] = useState<Record<string, TVocab>>({});

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[960px] lg:max-w-[1100px]">
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
              <TrainerBasicInfoForm userRole={userRole} selectedWords={selectedWordBadges} />

            </div>
            <div className="min-w-0">
              {open && (
                <VocabSelectionForm
                  selectedIds={formData.vocabAssignmentIds}
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
              className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
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
    </Dialog>
  );
};

export default AddVocabTrainerDialog;
