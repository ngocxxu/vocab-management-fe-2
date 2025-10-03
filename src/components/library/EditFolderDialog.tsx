'use client';

import type { TLanguageFolder } from './LanguageFolder';
import type { LanguageFolderFormData } from './LanguageFolderForm';
import { useState } from 'react';
import { toast } from 'sonner';
import { languageFolderMutations } from '@/hooks/useLanguageFolders';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import LanguageFolderForm from './LanguageFolderForm';

type EditFolderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: TLanguageFolder;
  onFolderUpdated?: () => void;
};

const EditFolderDialog = ({ open, onOpenChange, folder, onFolderUpdated }: EditFolderDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (formData: LanguageFolderFormData) => {
    try {
      setIsUpdating(true);
      await languageFolderMutations.update(folder.id, formData);
      toast.success('Language folder updated successfully!');
      onFolderUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating language folder:', error);
      toast.error('Failed to update language folder. Please try again.');
      throw error; // Re-throw to let the form handle the error state
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Language Folder</DialogTitle>
          <DialogDescription>
            Update the details of your language folder. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <LanguageFolderForm
          initialData={{
            name: folder.name,
            folderColor: folder.folderColor,
            sourceLanguageCode: folder.sourceLanguageCode,
            targetLanguageCode: folder.targetLanguageCode,
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitButtonText="Update Folder"
          isSubmitting={isUpdating}
          showAutoGenerate={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditFolderDialog;
