'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BasicInfoForm from './BasicInfoForm';
import TextTargetTabs from './TextTargetTabs';

type VocabFormData = {
  textSource: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  textTargets: Array<{
    wordTypeId: string;
    textTarget: string;
    grammar: string;
    explanationSource: string;
    explanationTarget: string;
    subjectIds: string[];
    vocabExamples: Array<{ source: string; target: string }>;
  }>;
};

type AddVocabDialogProps = {
  formData: VocabFormData;
  activeTab: string;
  onInputChange: (field: string, value: string, targetIndex?: number) => void;
  onSubjectChange: (subjectId: string, targetIndex: number) => void;
  onExampleChange: (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number) => void;
  onAddExample: (targetIndex: number) => void;
  onRemoveExample: (exampleIndex: number, targetIndex: number) => void;
  onAddTextTarget: () => void;
  onRemoveTextTarget: (index: number) => void;
  onActiveTabChange: (value: string) => void;
  onSubmit: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AddVocabDialog: React.FC<AddVocabDialogProps> = ({
  formData,
  activeTab,
  onInputChange,
  onSubjectChange,
  onExampleChange,
  onAddExample,
  onRemoveExample,
  onAddTextTarget,
  onRemoveTextTarget,
  onActiveTabChange,
  onSubmit,
  open,
  setOpen,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1000px]">
        <div className="mx-auto w-full">
          <DialogHeader>
            <DialogTitle>Add New Vocabulary</DialogTitle>
            <DialogDescription>Enter the details for your new vocabulary item</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6 pb-0">
            <BasicInfoForm
              formData={formData}
              onInputChange={onInputChange}
            />

            <TextTargetTabs
              textTargets={formData.textTargets}
              activeTab={activeTab}
              onActiveTabChange={onActiveTabChange}
              onInputChange={onInputChange}
              onSubjectChange={onSubjectChange}
              onExampleChange={onExampleChange}
              onAddExample={onAddExample}
              onRemoveExample={onRemoveExample}
              onAddTextTarget={onAddTextTarget}
              onRemoveTextTarget={onRemoveTextTarget}
            />
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={onSubmit} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
              Add Vocabulary
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVocabDialog;
