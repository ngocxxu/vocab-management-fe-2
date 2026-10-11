'use client';

import type { AddVocabDialogProps } from '@/types/vocab-list';
import { MagicStick, RefreshCircle } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { PremiumFeatureGate } from '@/components/premium';
import { UserRole } from '@/constants/auth';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useAIGenerate } from '../hooks/useAIGenerate';
import VocabLanguageForm from './VocabLanguageForm';
import TextTargetTabs from './TextTargetTabs';

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
  relationDrafts,
  relationInputValue,
  relationPendingFlags,
  editingRelationId,
  relationAutocompleteItems,
  relationAutocompleteLoading,
  onRelationInputChange,
  onRelationFlagToggle,
  onAddFreeTextRelation,
  onAddLinkedRelation,
  onOpenRelationEditor,
  onUpdateRelationFlags,
  onRemoveRelation,
  hasInvalidRelationDrafts,
  userRole,
}) => {
  const t = useTranslations('vocabList.addDialog');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTargetIndex = Math.min(
    Math.max(0, Number.parseInt(activeTab, 10) || 0),
    formData.textTargets.length - 1,
  );
  const activeTarget = formData.textTargets[activeTargetIndex];
  const { isGenerating, isCooldownActive, cooldownRemaining, handleGenerateAI } = useAIGenerate({
    textSource: formData.textSource,
    sourceLanguageCode: formData.sourceLanguageCode,
    targetLanguageCode: formData.targetLanguageCode,
    targetIndex: activeTargetIndex,
    hasExamples: (activeTarget?.vocabExamples.length ?? 0) > 0,
    onInputChange,
    onExampleChange,
    onAddExample,
  });

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
      onActiveTabChange('0');
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1100px]">
        <div className="mx-auto w-full">
          <DialogHeader>
            <DialogTitle>{editMode ? t('editTitle') : t('addTitle')}</DialogTitle>
            <DialogDescription>
              {editMode ? t('editDescription') : t('addDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 p-6 pb-0 lg:grid-cols-[minmax(0,300px)_1fr]">
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border bg-card">
                <div className="border-b bg-muted px-4 py-3">
                  <h3 className="text-sm font-semibold">{t('basicInfo')}</h3>
                </div>
                <div className="p-4">
                  <VocabLanguageForm
                    initialLanguagesData={initialLanguagesData}
                    relationDrafts={relationDrafts}
                    relationInputValue={relationInputValue}
                    relationPendingFlags={relationPendingFlags}
                    editingRelationId={editingRelationId}
                    relationAutocompleteItems={relationAutocompleteItems}
                    relationAutocompleteLoading={relationAutocompleteLoading}
                    editMode={editMode}
                    onRelationInputChange={onRelationInputChange}
                    onRelationFlagToggle={onRelationFlagToggle}
                    onAddFreeTextRelation={onAddFreeTextRelation}
                    onAddLinkedRelation={onAddLinkedRelation}
                    onOpenRelationEditor={onOpenRelationEditor}
                    onUpdateRelationFlags={onUpdateRelationFlags}
                    onRemoveRelation={onRemoveRelation}
                    hasInvalidRelationDrafts={hasInvalidRelationDrafts}
                  />
                </div>
              </div>
              <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between border-b bg-muted px-4 py-3">
                  <h3 className="text-sm font-semibold">{t('textTargets')}</h3>
                  {onAddTextTarget && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={onAddTextTarget}
                      disabled={formData.textTargets.length >= 5}
                    >
                      {t('addNew')}
                    </Button>
                  )}
                </div>
                <div className="p-4">
                  <TextTargetTabs
                    variant="sidebar"
                    initialWordTypesData={initialWordTypesData}
                    textTargets={formData.textTargets}
                    activeTab={activeTab}
                    onActiveTabChange={onActiveTabChange}
                    onRemoveTextTarget={onRemoveTextTarget}
                    userRole={userRole}
                  />
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="rounded-lg border bg-card">
                <div className="flex items-center justify-between border-b bg-muted px-4 py-3">
                  <h3 className="text-sm font-semibold">{t('meaningContext')}</h3>
                  {userRole === UserRole.GUEST
                    ? (
                        <PremiumFeatureGate
                          userRole={userRole}
                          featureName={t('aiFeatureName')}
                          description={t('aiDescription')}
                          onClick={handleGenerateAI}
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs"
                        >
                          <MagicStick size={12} weight="BoldDuotone" />
                          {t('aiGenerate')}
                        </PremiumFeatureGate>
                      )
                    : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateAI}
                          disabled={isGenerating || isCooldownActive || !formData.textSource || !formData.sourceLanguageCode || !formData.targetLanguageCode}
                          className="h-7 gap-1.5 text-xs"
                        >
                          {isGenerating
                            ? (
                                <>
                                  <RefreshCircle size={12} weight="BoldDuotone" className="animate-spin" />
                                  {t('generating')}
                                </>
                              )
                            : isCooldownActive
                              ? (
                                  <>
                                    <RefreshCircle size={12} weight="BoldDuotone" />
                                    {t('wait', { seconds: cooldownRemaining })}
                                  </>
                                )
                              : (
                                  <>
                                    <MagicStick size={12} weight="BoldDuotone" />
                                    {t('aiGenerate')}
                                  </>
                                )}
                        </Button>
                      )}
                </div>
                <div className="p-4">
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
                    userRole={userRole}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || hasInvalidRelationDrafts}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting
                ? (
                    <>
                      <RefreshCircle size={16} weight="BoldDuotone" className="mr-2 animate-spin" />
                      {editMode ? t('updating') : t('validating')}
                    </>
                  )
                : (editMode ? t('updateVocab') : t('addVocab'))}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVocabDialog;
