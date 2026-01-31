'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TLanguageFolder as LanguageFolderType, TLanguageFolder } from './LanguageFolder';
import type { ResponseAPI, TLanguage } from '@/types';
import type { TCreateLanguageFolder } from '@/types/language-folder';
import { Edit, Folder, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState, useTransition } from 'react';
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
import CreateFolderModal from './CreateFolderModal';
import EditFolderDialog from './EditFolderDialog';
import LibraryEmptyState from './LibraryEmptyState';
import LibraryHeader from './LibraryHeader';
import LibraryLoadingState from './LibraryLoadingState';
import LibrarySearch from './LibrarySearch';

type LibraryProps = {
  initialData?: ResponseAPI<TLanguageFolder[]>;
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
};

const Library: React.FC<LibraryProps> = ({ initialData, initialLanguagesData }) => {
  const { pagination, handlers } = useApiPagination({
    page: initialData?.currentPage || 1,
    pageSize: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const router = useRouter();
  const [, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<LanguageFolderType | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const totalItems = initialData?.totalItems || 0;
  const totalPages = initialData?.totalPages || 0;
  const currentPage = initialData?.currentPage || 1;
  const isLoading = false;

  const handleFolderClick = useCallback((folder: LanguageFolderType) => {
    router.push(`/vocab-list?sourceLanguageCode=${folder.sourceLanguageCode}&targetLanguageCode=${folder.targetLanguageCode}&languageFolderId=${folder.id}`);
  }, [router]);

  const handleCreateFolder = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateFolderSubmit = useCallback(async (folderData: TCreateLanguageFolder) => {
    try {
      await createLanguageFolder(folderData);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error creating language folder:', error);
      throw error; // Re-throw to let the modal handle the error display
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

  const handleEdit = useCallback((folder: LanguageFolderType) => {
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

  // Use handlers from the reusable pagination hook
  const { handleSort, handlePageChange } = handlers;

  // Client-side filtering (server-side pagination doesn't support search yet)
  const data = useMemo<LanguageFolderType[]>(() => {
    const languageFolders = initialData?.items || [];
    return languageFolders.filter((folder: LanguageFolderType) => {
      const matchesSearch = folder.name?.toLowerCase().includes(searchQuery.toLowerCase())
        || folder.sourceLanguageCode?.toLowerCase().includes(searchQuery.toLowerCase())
        || folder.targetLanguageCode?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = true;

      return matchesSearch && matchesFilter;
    });
  }, [initialData, searchQuery]);

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
          <div className="text-sm font-medium text-foreground">
            {row.original.name}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
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
        <div className="text-sm text-muted-foreground">
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
            className="h-8 w-8 rounded-lg hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-4 sm:gap-8 sm:py-6 md:gap-10 md:py-8">
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
          initialLanguagesData={initialLanguagesData}
        />

        {/* Edit Folder Dialog */}
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
