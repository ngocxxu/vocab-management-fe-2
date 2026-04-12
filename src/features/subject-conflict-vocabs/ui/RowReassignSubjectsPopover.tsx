'use client';

import type { TVocab } from '@/types/vocab-list';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

export type RowReassignSubjectOption = {
  id: string;
  name: string;
};

type RowReassignSubjectsPopoverProps = Readonly<{
  vocab: TVocab;
  options: RowReassignSubjectOption[];
  disabled?: boolean;
  applying?: boolean;
  onApply: (vocab: TVocab, subjectIds: string[]) => Promise<boolean>;
}>;

export function RowReassignSubjectsPopover({
  vocab,
  options,
  disabled,
  applying,
  onApply,
}: RowReassignSubjectsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    setDraftIds([]);
    setSearch('');
  }, []);

  const filtered = useMemo(
    () =>
      options.filter(o =>
        o.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [options, search],
  );

  const setSubjectChecked = useCallback((id: string, checked: boolean) => {
    setDraftIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter(x => x !== id);
    });
  }, []);

  const handleApply = async () => {
    if (draftIds.length === 0) {
      toast.error('Select at least one subject.');
      return;
    }
    const ok = await onApply(vocab, draftIds);
    if (ok) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-[min(100%,260px)] justify-between font-normal"
          disabled={disabled || applying}
          aria-label="Choose subjects to reassign"
        >
          {draftIds.length === 0 ? 'Subjects…' : `${draftIds.length} selected`}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="start"
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
      >
        <div className="border-b px-3 py-2">
          <input
            type="search"
            placeholder="Search subjects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto p-2">
          {filtered.length === 0
            ? (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">No subjects.</p>
              )
            : (
                filtered.map(opt => (
                  <label
                    key={opt.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted/80"
                  >
                    <Checkbox
                      checked={draftIds.includes(opt.id)}
                      onCheckedChange={v => setSubjectChecked(opt.id, v === true)}
                      aria-label={opt.name}
                    />
                    <span className="truncate">{opt.name}</span>
                  </label>
                ))
              )}
        </div>
        <div className="flex justify-end gap-2 border-t p-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleApply()}
            disabled={applying}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
