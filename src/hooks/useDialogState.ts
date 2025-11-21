import { useCallback, useState } from 'react';

type UseDialogStateOptions<T> = {
  onClose?: () => void;
  onEdit?: (item: T) => void;
};

type UseDialogStateReturn<T> = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode: boolean;
  editingItem: T | null;
  handleEdit: (item: T) => void;
  handleClose: () => void;
  reset: () => void;
};

export const useDialogState = <T>(
  options?: UseDialogStateOptions<T>,
): UseDialogStateReturn<T> => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const handleEdit = useCallback(
    (item: T) => {
      setEditingItem(item);
      setEditMode(true);
      setOpen(true);
      options?.onEdit?.(item);
    },
    [options],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditMode(false);
    setEditingItem(null);
    options?.onClose?.();
  }, [options]);

  const reset = useCallback(() => {
    setEditMode(false);
    setEditingItem(null);
  }, []);

  return {
    open,
    setOpen,
    editMode,
    editingItem,
    handleEdit,
    handleClose,
    reset,
  };
};
