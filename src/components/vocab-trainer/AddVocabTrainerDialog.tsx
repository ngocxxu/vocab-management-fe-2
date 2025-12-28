'use client';

import type { EQuestionType } from '@/enum/vocab-trainer';
import type { ResponseAPI, TLanguage } from '@/types';
import type { TVocabTrainer } from '@/types/vocab-trainer';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BasicInfoForm from './BasicInfoForm';
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
  cachedLanguageFolders?: any[];
  onLanguageFoldersLoaded?: (folders: any[]) => void;
};

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
        <div className="mx-auto w-full">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Vocab Trainer' : 'Create New Vocab Trainer'}</DialogTitle>
            <DialogDescription>
              {editMode
                ? 'Update the details for your vocabulary trainer'
                : 'Set up a new vocabulary training session with your selected words'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6 pb-0">
            <BasicInfoForm />
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
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  )
                : (
                    editMode ? 'Update Trainer' : 'Create Trainer'
                  )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVocabTrainerDialog;
