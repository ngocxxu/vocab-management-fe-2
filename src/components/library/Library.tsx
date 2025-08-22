'use client';

import type { TLanguageFolder as LanguageFolderType } from './LanguageFolder';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { useVocabs } from '@/hooks/useVocabs';
import LanguageFolder from './LanguageFolder';
import LibraryEmptyState from './LibraryEmptyState';
import LibraryHeader from './LibraryHeader';
import LibraryLoadingState from './LibraryLoadingState';
import LibrarySearch from './LibrarySearch';
import { generateFolderColor, generateMockFolders, getLanguageName } from './utils';

const Library: React.FC = () => {
  const router = useRouter();
  const { vocabs, isLoading } = useVocabs();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Memoize the folder generation to prevent infinite re-renders
  const folders = useMemo(() => {
    if (vocabs && vocabs.length > 0) {
      const languageMap = new Map<string, LanguageFolderType>();

      vocabs.forEach((vocab) => {
        const key = `${vocab.sourceLanguageCode}-${vocab.targetLanguageCode}`;
        const existing = languageMap.get(key);

        if (existing) {
          // Folder already exists, no need to track count
        } else {
          languageMap.set(key, {
            id: key,
            name: `${getLanguageName(vocab.sourceLanguageCode)} → ${getLanguageName(vocab.targetLanguageCode)}`,
            sourceLanguageCode: vocab.sourceLanguageCode,
            targetLanguageCode: vocab.targetLanguageCode,
            color: generateFolderColor(key),
          });
        }
      });

      const result = Array.from(languageMap.values());
      return result;
    } else {
      // Use mock data for testing when no vocabularies exist
      const mockFolders = generateMockFolders();
      return mockFolders;
    }
  }, [vocabs]);

  const handleFolderClick = useCallback((folder: LanguageFolderType) => {
    router.push(`/vocab-list?source=${folder.sourceLanguageCode}&target=${folder.targetLanguageCode}`);
  }, [router]);

  const handleCreateFolder = useCallback(() => {
    // TODO: Implement create folder functionality
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setFilterType(value);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => {
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
            {filteredFolders.map(folder => (
              <LanguageFolder
                key={folder.id}
                folder={folder}
                onFolderClick={handleFolderClick}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredFolders.length === 0 && !isLoading && (
          <LibraryEmptyState searchQuery={searchQuery} />
        )}

        {/* Loading State */}
        {isLoading && <LibraryLoadingState />}
      </div>
    </div>
  );
};

export default Library;
