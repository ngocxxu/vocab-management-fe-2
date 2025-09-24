'use client';

import type { TLanguageFolder as LanguageFolderType } from './LanguageFolder';
import type { TCreateLanguageFolder } from '@/types/language-folder';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { languageFolderMutations, useLanguageFolders } from '@/hooks/useLanguageFolders';
import { useLanguages } from '@/hooks/useLanguages';
import LanguageFolder from './LanguageFolder';
import LibraryEmptyState from './LibraryEmptyState';
import LibraryHeader from './LibraryHeader';
import LibraryLoadingState from './LibraryLoadingState';
import LibrarySearch from './LibrarySearch';

const Library: React.FC = () => {
  const router = useRouter();
  const { languageFolders, isLoading, mutate: refetchFolders } = useLanguageFolders();
  const { languages } = useLanguages();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Use language folders from API only
  const folders = useMemo(() => {
    if (languageFolders && languageFolders.length > 0) {
      return languageFolders.map((folder: any) => ({
        id: folder.id,
        name: folder.name,
        sourceLanguageCode: folder.sourceLanguageCode,
        targetLanguageCode: folder.targetLanguageCode,
        color: folder.folderColor,
      }));
    }
    return [];
  }, [languageFolders]);

  const handleFolderClick = useCallback((folder: LanguageFolderType) => {
    router.push(`/vocab-list?source=${folder.sourceLanguageCode}&target=${folder.targetLanguageCode}`);
  }, [router]);

  const handleCreateFolder = useCallback(async () => {
    if (!languages || languages.length < 2) {
      toast.error('Please ensure at least 2 languages are available');
      return;
    }

    try {
      // Generate a unique name for the new folder
      const sourceLanguage = languages[0];
      const targetLanguage = languages[1];
      const folderName = `${sourceLanguage.name} → ${targetLanguage.name}`;

      const newFolderData: TCreateLanguageFolder = {
        name: folderName,
        folderColor: 'from-blue-500 to-purple-600', // Default gradient color
        sourceLanguageCode: sourceLanguage.code,
        targetLanguageCode: targetLanguage.code,
      };

      await languageFolderMutations.create(newFolderData);

      // Refresh the folders list
      await refetchFolders();

      toast.success('Language folder created successfully!');
    } catch (error) {
      console.error('Error creating language folder:', error);
      toast.error('Failed to create language folder. Please try again.');
    }
  }, [languages, refetchFolders]);

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
    return folders.filter((folder: LanguageFolderType) => {
      const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase())
        || folder.sourceLanguageCode.toLowerCase().includes(searchQuery.toLowerCase())
        || folder.targetLanguageCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all'
        || (filterType === 'active' && true) // All folders are considered active now
        || (filterType === 'empty' && false); // No folders are considered empty

      return matchesSearch && matchesFilter;
    });
  }, [folders, searchQuery, filterType]);

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
      </div>
    </div>
  );
};

export default Library;
