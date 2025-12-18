'use client';

import type { LanguageFolderFormData } from './LanguageFolderForm';
import type { ResponseAPI, TLanguage } from '@/types';
import type { TCreateLanguageFolder } from '@/types/language-folder';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LanguageFolderForm from './LanguageFolderForm';

type CreateFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderData: TCreateLanguageFolder) => Promise<void>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
};

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
  initialLanguagesData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (formData: LanguageFolderFormData) => {
    try {
      setIsSubmitting(true);
      await onCreateFolder(formData);
      toast.success('Language folder created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create language folder. Please try again.');
      throw error; // Re-throw to let the form handle the error state
    } finally {
      setIsSubmitting(false);
    }
  }, [onCreateFolder, onClose]);

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
            Create New Language Folder
          </DialogTitle>
        </DialogHeader>

        <LanguageFolderForm
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitButtonText="Create Folder"
          isSubmitting={isSubmitting}
          showAutoGenerate={true}
          initialLanguagesData={initialLanguagesData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
