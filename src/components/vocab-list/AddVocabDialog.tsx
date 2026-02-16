'use client';

import type { ResponseAPI, TLanguage } from '@/types';
import type { TSubjectResponse } from '@/types/subject';
import type { TVocab } from '@/types/vocab-list';
import type { TWordTypeResponse } from '@/types/word-type';
import { RefreshCircle } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VocabLanguageForm from './VocabLanguageForm';
import TextTargetTabs from './TextTargetTabs';

type VocabFormData = {
  textSource: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textTargets: Array<{
    id: string;
    wordTypeId?: string;
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
  initialSubjectsData?: TSubjectResponse;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
  initialWordTypesData?: TWordTypeResponse;
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
  editingItem: _editingItem,
  initialSubjectsData,
  initialLanguagesData,
  initialWordTypesData,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1100px]">
        <div className="mx-auto w-full">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Vocabulary' : 'Add New Vocabulary'}</DialogTitle>
            <DialogDescription>
              {editMode
                ? `Update the details for your vocabulary item`
                : 'Enter the details for your new vocabulary item'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-6 p-6 pb-0 lg:grid-cols-[minmax(0,300px)_1fr]">
            <div className="space-y-6">
              <VocabLanguageForm initialLanguagesData={initialLanguagesData} />
              <TextTargetTabs
                variant="sidebar"
                initialWordTypesData={initialWordTypesData}
                textTargets={formData.textTargets}
                activeTab={activeTab}
                onActiveTabChange={onActiveTabChange}
                onAddTextTarget={onAddTextTarget}
                onRemoveTextTarget={onRemoveTextTarget}
              />
            </div>
            <div className="min-w-0">
              <TextTargetTabs
                variant="content"
                initialLanguagesData={initialLanguagesData}
                initialWordTypesData={initialWordTypesData}
                textTargets={formData.textTargets}
                activeTab={activeTab}
                onActiveTabChange={onActiveTabChange}
                onInputChange={onInputChange}
                onExampleChange={onExampleChange}
                onAddExample={onAddExample}
                onRemoveExample={onRemoveExample}
                textSource={formData.textSource}
                sourceLanguageCode={formData.sourceLanguageCode}
                targetLanguageCode={formData.targetLanguageCode}
                initialSubjectsData={initialSubjectsData}
              />
            </div>
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
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting
                ? (
                    <>
                      <RefreshCircle size={16} weight="BoldDuotone" className="mr-2 animate-spin" />
                      {editMode ? 'Updating...' : 'Validating...'}
                    </>
                  )
                : (
                    editMode ? 'Update Vocabulary' : 'Add Vocabulary'
                  )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVocabDialog;
