'use client';

import type { TLanguageFolder as LanguageFolderType } from './LanguageFolder';
import type { TCreateLanguageFolder } from '@/types/language-folder';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { languageFolderMutations, useLanguageFolders } from '@/hooks/useLanguageFolders';
import CreateFolderModal from './CreateFolderModal';
import LanguageFolder from './LanguageFolder';
import LibraryEmptyState from './LibraryEmptyState';
import LibraryHeader from './LibraryHeader';
import LibraryLoadingState from './LibraryLoadingState';
import LibrarySearch from './LibrarySearch';

const Library: React.FC = () => {
  const router = useRouter();
  const { languageFolders, isLoading, mutate: refetchFolders } = useLanguageFolders();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleFolderClick = useCallback((folder: LanguageFolderType) => {
    router.push(`/vocab-list?source=${folder.sourceLanguageCode}&target=${folder.targetLanguageCode}&languageFolderId=${folder.id}`);
  }, [router]);

  const handleCreateFolder = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateFolderSubmit = useCallback(async (folderData: TCreateLanguageFolder) => {
    try {
      await languageFolderMutations.create(folderData);
      await refetchFolders();
    } catch (error) {
      console.error('Error creating language folder:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  }, [refetchFolders]);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleFolderUpdated = useCallback(() => {
    // Refresh the folders list when a folder is updated
    refetchFolders();
  }, [refetchFolders]);

  const handleFolderDeleted = useCallback(() => {
    // Refresh the folders list when a folder is deleted
    refetchFolders();
  }, [refetchFolders]);

  const handleFilterChange = useCallback((value: string) => {
    setFilterType(value);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredFolders = useMemo(() => {
    return languageFolders.filter((folder: LanguageFolderType) => {
      const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase())
        || folder.sourceLanguageCode.toLowerCase().includes(searchQuery.toLowerCase())
        || folder.targetLanguageCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all'
        || (filterType === 'active' && true) // All folders are considered active now
        || (filterType === 'empty' && false); // No folders are considered empty

      return matchesSearch && matchesFilter;
    });
  }, [languageFolders, searchQuery, filterType]);

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/30">
      <div className="container mx-auto flex flex-col gap-10 py-8">
        {/* Header Section */}
        <LibraryHeader
          filterType={filterType}
          onFilterChange={handleFilterChange}
          onCreateFolder={handleCreateFolder}
        />

        {/* Search Bar */}
        <LibrarySearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Folders Section */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-4">
            {filteredFolders.map((folder: LanguageFolderType) => (
              <LanguageFolder
                key={folder.id}
                folder={folder}
                onFolderClick={handleFolderClick}
                onFolderUpdated={handleFolderUpdated}
                onFolderDeleted={handleFolderDeleted}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredFolders.length === 0 && !isLoading && (
          <LibraryEmptyState
            searchQuery={searchQuery}
            onCreateFolder={handleCreateFolder}
          />
        )}

        {/* Loading State */}
        {isLoading && <LibraryLoadingState />}

        {/* Create Folder Modal */}
        <CreateFolderModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onCreateFolder={handleCreateFolderSubmit}
        />
      </div>
    </div>
  );
};

export default Library;
