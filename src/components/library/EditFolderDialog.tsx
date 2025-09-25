'use client';

import type { TLanguageFolder } from './LanguageFolder';
import { useState } from 'react';
import { toast } from 'sonner';
import { languageFolderMutations } from '@/hooks/useLanguageFolders';
import { useLanguages } from '@/hooks/useLanguages';
import { Button } from '../ui/button';
import { ColorPicker } from '../ui/color-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type EditFolderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: TLanguageFolder;
  onFolderUpdated?: () => void;
};

const EditFolderDialog = ({ open, onOpenChange, folder, onFolderUpdated }: EditFolderDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: folder.name,
    folderColor: folder.folderColor,
    sourceLanguageCode: folder.sourceLanguageCode,
    targetLanguageCode: folder.targetLanguageCode,
  });

  const { languages, isLoading: isLoadingLanguages } = useLanguages();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    if (formData.sourceLanguageCode === formData.targetLanguageCode) {
      toast.error('Source and target languages must be different');
      return;
    }

    try {
      setIsUpdating(true);
      await languageFolderMutations.update(folder.id, formData);
      toast.success('Language folder updated successfully!');
      onFolderUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating language folder:', error);
      toast.error('Failed to update language folder. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, folderColor: color }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Enter folder name"
              disabled={isUpdating}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Folder Color</Label>
            <ColorPicker
              value={formData.folderColor}
              onChange={handleColorChange}
              disabled={isUpdating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceLanguage">Source Language</Label>
              <Select
                value={formData.sourceLanguageCode}
                onValueChange={value => handleInputChange('sourceLanguageCode', value)}
                disabled={isUpdating || isLoadingLanguages}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {languages?.map(language => (
                    <SelectItem key={language.id} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetLanguage">Target Language</Label>
              <Select
                value={formData.targetLanguageCode}
                onValueChange={value => handleInputChange('targetLanguageCode', value)}
                disabled={isUpdating || isLoadingLanguages}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {languages?.map(language => (
                    <SelectItem key={language.id} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFolderDialog;
