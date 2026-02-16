'use client';

import type { EQuestionType } from '@/enum/vocab-trainer';
import type { ResponseAPI, TLanguage } from '@/types';
import type { TVocabSelectionFolderArray } from '@/types/vocab-selection';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { RefreshCircle } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TrainerBasicInfoForm from './TrainerBasicInfoForm';
import VocabSelectionForm from './VocabSelectionForm';

type VocabTrainerFormData = {
  name: string;
  questionType: EQuestionType;
  setCountTime: number;
  reminderDisabled: boolean;
  vocabAssignmentIds: string[];
};

type AddVocabTrainerDialogProps = {
  formData: VocabTrainerFormData;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode?: boolean;
  editingItem?: TVocabTrainer | null;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  cachedLanguageFolders?: TVocabSelectionFolderArray;
  onLanguageFoldersLoaded?: (folders: TVocabSelectionFolderArray) => void;
};

const EST_MINUTES_PER_WORD = 0.5;

const AddVocabTrainerDialog: React.FC<AddVocabTrainerDialogProps> = ({
  formData,
  onSubmit,
  onReset,
  open,
  setOpen,
  editMode = false,
  initialLanguagesData,
  cachedLanguageFolders = [],
  onLanguageFoldersLoaded,
  editingItem: _editingItem,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const selectedCount = formData.vocabAssignmentIds.length;
  const estDurationMins = Math.ceil(selectedCount * EST_MINUTES_PER_WORD) || 0;

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
              <TrainerBasicInfoForm />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Summary
                </h4>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Selected Vocab</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedCount}
                      {' '}
                      word
                      {selectedCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Est. Duration</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ~
                      {estDurationMins}
                      {' '}
                      min
                      {estDurationMins === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>
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
