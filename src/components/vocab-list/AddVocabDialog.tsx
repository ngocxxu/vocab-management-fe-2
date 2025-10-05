'use client';

import type { TVocab } from '@/types/vocab-list';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BasicInfoForm from './BasicInfoForm';
import TextTargetTabs from './TextTargetTabs';

type VocabFormData = {
  textSource: string;
  languageFolderId: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textTargets: Array<{
    id: string;
    wordTypeId: string;
    textTarget: string;
    grammar: string;
    explanationSource: string;
    explanationTarget: string;
    subjectIds: string[];
    vocabExamples: Array<{ id: string; source: string; target: string }>;
  }>;
};

type AddVocabDialogProps = {
  formData: VocabFormData;
  activeTab: string;
  onInputChange: (field: string, value: string, targetIndex?: number) => void;
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
  onAddTextTarget: () => void;
  onRemoveTextTarget: (index: number) => void;
  onActiveTabChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void; // Add reset function prop
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode?: boolean;
  editingItem?: TVocab | null;
};

const AddVocabDialog: React.FC<AddVocabDialogProps> = ({
  formData,
  activeTab,
  onInputChange,
  onExampleChange,
  onAddExample,
  onRemoveExample,
  onAddTextTarget,
  onRemoveTextTarget,
  onActiveTabChange,
  onSubmit,
  onReset,
  open,
  setOpen,
  editMode = false,
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
      // Reset form when modal is closed
      onReset();
      // Reset active tab to first tab
      onActiveTabChange('0');
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1000px]">
        <div className="mx-auto w-full">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Vocabulary' : 'Add New Vocabulary'}</DialogTitle>
            <DialogDescription>
              {editMode
                ? `Update the details for your vocabulary item`
                : 'Enter the details for your new vocabulary item'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6 pb-0">
            <BasicInfoForm />

            <TextTargetTabs
              textTargets={formData.textTargets}
              activeTab={activeTab}
              onActiveTabChange={onActiveTabChange}
              onInputChange={onInputChange}
              onExampleChange={onExampleChange}
              onAddExample={onAddExample}
              onRemoveExample={onRemoveExample}
              onAddTextTarget={onAddTextTarget}
              onRemoveTextTarget={onRemoveTextTarget}
            />
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
                      Validating...
                    </>
                  )
                : (
                    'Add Vocabulary'
                  )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVocabDialog;
