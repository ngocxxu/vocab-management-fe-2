'use client';

import { createLanguageFolder, deleteLanguageFolder } from '@/actions/language-folders';
import type { LibraryProps, TCreateLanguageFolder, TLanguageFolder } from '@/types/language-folder';
import type { TUser } from '@/types/auth';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { verifyUser } from '@/actions';
import { isQuotaError, QUOTA_ERROR_MESSAGE } from '@/utils/quota-error';
import CreateFolderCard from './CreateFolderCard';
import CreateFolderModal from './CreateFolderModal';
import EditFolderDialog from './EditFolderDialog';
import LibraryEmptyState from './LibraryEmptyState';
import LibraryFolderCard from './LibraryFolderCard';
import LibraryHeader from './LibraryHeader';
import LibraryLoadingState from './LibraryLoadingState';
import LibrarySearch from './LibrarySearch';

const Library: React.FC<LibraryProps> = ({ initialData, initialLanguagesData }) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [user, setUser] = useState<TUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<TLanguageFolder | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    verifyUser().then(setUser);
  }, []);

  const isLoading = false;

  const handleFolderClick = useCallback((folder: TLanguageFolder) => {
    router.push(`/vocab-list?sourceLanguageCode=${folder.sourceLanguageCode}&targetLanguageCode=${folder.targetLanguageCode}&languageFolderId=${folder.id}`);
  }, [router]);

  const handleCreateFolder = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateFolderSubmit = useCallback(async (folderData: TCreateLanguageFolder) => {
    try {
      await createLanguageFolder(folderData);
      setIsCreateModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error creating language folder:', error);
      if (isQuotaError(error)) {
        setIsCreateModalOpen(false);
        toast.error(QUOTA_ERROR_MESSAGE, {
          description: error instanceof Error ? error.message : 'Folder limit reached.',
          action: { label: 'Upgrade', onClick: () => {
            window.location.href = '/#pricing';
          } },
        });
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to create language folder');
        throw error;
      }
    }
  }, [router, startTransition]);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleFolderUpdated = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router, startTransition]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((newSortBy: 'updatedAt' | 'name', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const handleEdit = useCallback((folder: TLanguageFolder) => {
    setEditingFolder(folder);
    setShowEditDialog(true);
  }, []);

  const handleDelete = useCallback(async (folderId: string) => {
    try {
      await deleteLanguageFolder(folderId);
      toast.success('Language folder deleted successfully!');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error deleting language folder:', error);
      toast.error('Failed to delete language folder. Please try again.');
    }
  }, [router, startTransition]);

  const data = useMemo<TLanguageFolder[]>(() => {
    const languageFolders = initialData?.items || [];
    const filtered = languageFolders.filter((folder: TLanguageFolder) => {
      const q = searchQuery.toLowerCase();
      return (
        folder.name?.toLowerCase().includes(q)
        || folder.sourceLanguageCode?.toLowerCase().includes(q)
        || folder.targetLanguageCode?.toLowerCase().includes(q)
      );
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'updatedAt') {
        const aVal = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bVal = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const cmp = aName.localeCompare(bName);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [initialData, searchQuery, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-4 sm:gap-8 sm:py-6 md:gap-10 md:py-8">
        <LibraryHeader onCreateFolder={handleCreateFolder} userRole={user?.role} />

        <LibrarySearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        {isLoading && <LibraryLoadingState />}

        {!isLoading && data.length === 0 && (
          <LibraryEmptyState
            searchQuery={searchQuery}
            onCreateFolder={handleCreateFolder}
          />
        )}

        {!isLoading && data.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {data.map(folder => (
              <LibraryFolderCard
                key={folder.id}
                folder={folder}
                onClick={handleFolderClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            <CreateFolderCard onCreateFolder={handleCreateFolder} userRole={user?.role} />
          </div>
        )}

        <CreateFolderModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onCreateFolder={handleCreateFolderSubmit}
          initialLanguagesData={initialLanguagesData}
        />

        {editingFolder && (
          <EditFolderDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            folder={editingFolder}
            onFolderUpdated={handleFolderUpdated}
            initialLanguagesData={initialLanguagesData}
          />
        )}
      </div>
    </div>
  );
};

export default Library;
