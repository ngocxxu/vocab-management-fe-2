'use client';

import type { EditFolderDialogProps, LanguageFolderFormData } from '@/types/language-folder';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateLanguageFolder } from '@/actions/language-folders';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import LanguageFolderForm from './LanguageFolderForm';

const EditFolderDialog = ({ open, onOpenChange, folder, onFolderUpdated, initialLanguagesData }: EditFolderDialogProps) => {
  const t = useTranslations('library');
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleSubmit = async (formData: LanguageFolderFormData) => {
    try {
      setIsUpdating(true);
      await updateLanguageFolder(folder.id, formData);
      toast.success(t('toast.updated'));
      onFolderUpdated?.();
      startTransition(() => {
        router.refresh();
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating language folder:', error);
      toast.error(t('toast.updateFailed'));
      throw error; // Re-throw to let the form handle the error state
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('edit.title')}</DialogTitle>
          <DialogDescription>
            {t('edit.description')}
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
          submitButtonText={t('edit.submit')}
          isSubmitting={isUpdating}
          showAutoGenerate={false}
          initialLanguagesData={initialLanguagesData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditFolderDialog;
