'use client';
import { Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';

type LibraryEmptyStateProps = {
  searchQuery: string;
};

const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({ searchQuery }) => {
  const router = useRouter();

  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
        <Folder className="h-12 w-12 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
        {searchQuery ? 'No language folders found' : 'No vocabulary data available'}
      </h3>
      <p className="mx-auto max-w-md leading-relaxed text-slate-600 dark:text-slate-400">
        {searchQuery
          ? 'Try adjusting your search terms or check your spelling'
          : 'The Library will automatically create beautiful folders when you add vocabularies with different language combinations'}
      </p>
      {!searchQuery && (
        <Button
          onClick={() => router.push('/vocab-list')}
          className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          Add Your First Vocabulary
        </Button>
      )}
    </div>
  );
};

export default LibraryEmptyState;
