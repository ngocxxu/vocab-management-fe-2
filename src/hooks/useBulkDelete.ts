import type { RowSelectionState } from '@tanstack/react-table';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type BulkDeleteResult = {
  success: boolean;
  error?: string;
};

type UseBulkDeleteOptions = {
  deleteMutation: (ids: string[]) => Promise<BulkDeleteResult>;
  onSuccess?: () => void | Promise<void>;
  itemName: string;
  itemNamePlural?: string;
};

type UseBulkDeleteReturn = {
  bulkDeleteDialogOpen: boolean;
  selectedIds: string[];
  handleBulkDelete: (
    ids: string[],
    emptyRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>,
  ) => void;
  confirmBulkDelete: () => Promise<void>;
  reset: () => void;
  setBulkDeleteDialogOpen: (open: boolean) => void;
};

export const useBulkDelete = (options: UseBulkDeleteOptions): UseBulkDeleteReturn => {
  const { deleteMutation, onSuccess, itemName, itemNamePlural } = options;
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleBulkDelete = useCallback(
    (ids: string[], emptyRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>) => {
      setSelectedIds(ids);
      setBulkDeleteDialogOpen(true);
      emptyRowSelection({});
    },
    [],
  );

  const confirmBulkDelete = useCallback(async () => {
    try {
      await deleteMutation(selectedIds);
      setBulkDeleteDialogOpen(false);
      setSelectedIds([]);
      await onSuccess?.();
      const displayName = selectedIds.length === 1 ? itemName : (itemNamePlural || `${itemName}s`);
      toast.success(`${displayName} deleted successfully!`);
    } catch (error) {
      console.error(`Failed to delete ${itemName}:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to delete ${itemName}. Please try again.`,
      );
    }
  }, [deleteMutation, selectedIds, onSuccess, itemName, itemNamePlural]);

  const reset = useCallback(() => {
    setSelectedIds([]);
    setBulkDeleteDialogOpen(false);
  }, []);

  return {
    bulkDeleteDialogOpen,
    selectedIds,
    handleBulkDelete,
    confirmBulkDelete,
    reset,
    setBulkDeleteDialogOpen,
  };
};
