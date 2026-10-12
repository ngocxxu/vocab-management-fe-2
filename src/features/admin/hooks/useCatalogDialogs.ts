'use client';

import { useCallback, useState } from 'react';

/** The add-or-edit form for one catalog row, or none while closed. */
type TCatalogForm<T> = { mode: 'create' } | { mode: 'edit'; item: T };

/** Open and close state for a catalog's add-or-edit form and its delete confirmation. */
export function useCatalogDialogs<T>() {
  const [form, setForm] = useState<TCatalogForm<T> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const openCreate = useCallback(() => setForm({ mode: 'create' }), []);
  const openEdit = useCallback((item: T) => setForm({ mode: 'edit', item }), []);
  const closeForm = useCallback(() => setForm(null), []);
  const openDelete = useCallback((item: T) => setDeleteTarget(item), []);
  const closeDelete = useCallback(() => setDeleteTarget(null), []);

  return { form, deleteTarget, openCreate, openEdit, closeForm, openDelete, closeDelete };
}
