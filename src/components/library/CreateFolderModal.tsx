'use client';

import type {
  CreateFolderModalProps,
  LanguageFolderFormData,
} from '@/types/language-folder';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import LanguageFolderForm from './LanguageFolderForm';

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
  initialLanguagesData,
}) => {
  const t = useTranslations('library');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (formData: LanguageFolderFormData) => {
    try {
      setIsSubmitting(true);
      await onCreateFolder(formData);
      toast.success(t('toast.created'));
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error(t('toast.createFailed'));
      throw error; // Re-throw to let the form handle the error state
    } finally {
      setIsSubmitting(false);
    }
  }, [onCreateFolder, onClose, t]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t('modal.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <LanguageFolderForm
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitButtonText={t('modal.createSubmit')}
          isSubmitting={isSubmitting}
          showAutoGenerate={true}
          initialLanguagesData={initialLanguagesData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
