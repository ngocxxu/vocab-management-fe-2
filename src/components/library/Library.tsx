'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TLanguageFolder as LanguageFolderType, TLanguageFolder } from './LanguageFolder';
import type { ResponseAPI } from '@/types';
import type { TCreateLanguageFolder } from '@/types/language-folder';
import { Edit, Folder, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { createLanguageFolder, deleteLanguageFolder } from '@/actions/language-folders';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table';
import { useApiPagination } from '@/hooks';
import { useLanguageFolders } from '@/hooks/useLanguageFolders';
import CreateFolderModal from './CreateFolderModal';
import EditFolderDialog from './EditFolderDialog';
import LibraryEmptyState from './LibraryEmptyState';
import LibraryHeader from './LibraryHeader';
import LibraryLoadingState from './LibraryLoadingState';
import LibrarySearch from './LibrarySearch';

type LibraryProps = {
  initialData?: ResponseAPI<TLanguageFolder[]>;
};

const Library: React.FC<LibraryProps> = ({ initialData }) => {
  const { pagination, handlers } = useApiPagination({
    page: initialData?.currentPage || 1,
    pageSize: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<LanguageFolderType | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Build query parameters for the API call
  const queryParams = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
  };

  const { languageFolders, totalItems, totalPages, currentPage, isLoading, mutate: refetchFolders } = useLanguageFolders(
    queryParams,
    initialData,
  );

  const handleFolderClick = useCallback((folder: LanguageFolderType) => {
    router.push(`/vocab-list?sourceLanguageCode=${folder.sourceLanguageCode}&targetLanguageCode=${folder.targetLanguageCode}&languageFolderId=${folder.id}`);
  }, [router]);

  const handleCreateFolder = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateFolderSubmit = useCallback(async (folderData: TCreateLanguageFolder) => {
    try {
      await createLanguageFolder(folderData);
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

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleEdit = useCallback((folder: LanguageFolderType) => {
    setEditingFolder(folder);
    setShowEditDialog(true);
  }, []);

  const handleDelete = useCallback(async (folderId: string) => {
    try {
      await deleteLanguageFolder(folderId);
      toast.success('Language folder deleted successfully!');
      await refetchFolders();
    } catch (error) {
      console.error('Error deleting language folder:', error);
      toast.error('Failed to delete language folder. Please try again.');
    }
  }, [refetchFolders]);

  // Use handlers from the reusable pagination hook
  const { handleSort, handlePageChange } = handlers;

  // Client-side filtering (server-side pagination doesn't support search yet)
  const filteredFolders = useMemo(() => {
    return languageFolders.filter((folder: LanguageFolderType) => {
      const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase())
        || folder.sourceLanguageCode.toLowerCase().includes(searchQuery.toLowerCase())
        || folder.targetLanguageCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = true;

      return matchesSearch && matchesFilter;
    });
  }, [languageFolders, searchQuery]);

  // Use the filtered folders as data
  const data = useMemo<LanguageFolderType[]>(() => filteredFolders, [filteredFolders]);

  // Define table columns
  const columns = useMemo<ColumnDef<LanguageFolderType>[]>(() => [
    {
      id: 'icon',
      header: '',
      cell: ({ row }) => (
        <div className="flex w-12 items-center justify-center">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm"
            style={{ backgroundColor: row.original.folderColor }}
          >
            <Folder className="h-5 w-5 text-white" />
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
    {
      accessorKey: 'name',
      header: 'Folder Name',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-slate-900 dark:text-white">
            {row.original.name}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {row.original.sourceLanguageCode.toUpperCase()}
            {' → '}
            {row.original.targetLanguageCode.toUpperCase()}
          </div>
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'lastModified',
      header: 'Last Modified',
      cell: () => (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
          >
            <Edit className="h-4 w-4 text-slate-500" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className="h-4 w-4 text-slate-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Language Folder</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;
                  {row.original.name}
                  &quot;? This action cannot be undone. All vocabulary items in this folder will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleDelete(row.original.id)}
                >
                  Delete Folder
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 100,
    },
  ], [handleEdit, handleDelete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/30">
      <div className="container mx-auto flex flex-col gap-10 px-4 py-8">
        {/* Header Section */}
        <LibraryHeader
          onCreateFolder={handleCreateFolder}
        />

        {/* Search Bar */}
        <LibrarySearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Loading State */}
        {isLoading && <LibraryLoadingState />}

        {/* Empty State */}
        {!isLoading && data.length === 0 && (
          <LibraryEmptyState
            searchQuery={searchQuery}
            onCreateFolder={handleCreateFolder}
          />
        )}

        {/* Folders Table */}
        {!isLoading && data.length > 0 && (
          <DataTable
            columns={columns}
            data={data}
            showSearch={false}
            showPagination={true}
            pageSize={pagination.pageSize}
            onRowClick={handleFolderClick}
            // Server-side pagination & sorting
            manualPagination={true}
            manualSorting={true}
            pageCount={totalPages}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onSortingChange={handleSort}
          />
        )}

        {/* Create Folder Modal */}
        <CreateFolderModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onCreateFolder={handleCreateFolderSubmit}
        />

        {/* Edit Folder Dialog */}
        {editingFolder && (
          <EditFolderDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            folder={editingFolder}
            onFolderUpdated={handleFolderUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default Library;
