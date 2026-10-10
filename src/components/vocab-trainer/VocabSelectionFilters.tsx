'use client';

import type { QuickFilter, VocabSelectionFiltersProps } from '@/types/vocab-trainer';
import { AddCircle, Folder, Magnifer, MinusCircle, Shuffle } from '@solar-icons/react/ssr';
import React, { useId, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { cn } from '@/libs/utils';

const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: 'all', label: 'All Words' },
  { id: 'recent', label: 'Recently Added' },
  { id: 'difficult', label: 'Difficult' },
  { id: 'unstarted', label: 'Unstarted' },
];

const MIN_RANDOM_COUNT = 1;

function clampCount(value: number, max?: number): number {
  const upper = max ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(Math.trunc(value), MIN_RANDOM_COUNT), upper);
}

const VocabSelectionFilters: React.FC<VocabSelectionFiltersProps> = ({
  globalFilter,
  onGlobalFilterChange,
  languageFolderId,
  onLanguageFolderChange,
  languageFolders,
  quickFilter,
  onQuickFilterChange,
  randomCount,
  onRandomCountChange,
  maxRandomCount,
  onRandomize,
  isRandomizeDisabled,
}) => {
  const countId = useId();
  const hintId = useId();
  // The field holds text while it is being edited, so it can be empty or briefly out of range.
  const [draft, setDraft] = useState(String(randomCount));
  // The parent can change the count on its own (the default follows the words in scope), so the field follows it.
  const [syncedCount, setSyncedCount] = useState(randomCount);
  if (syncedCount !== randomCount) {
    setSyncedCount(randomCount);
    setDraft(String(randomCount));
  }
  const draftValue = draft === '' ? randomCount : Number(draft);
  const isOverMax = maxRandomCount !== undefined && draftValue > maxRandomCount;

  const commitCount = (value: number) => {
    const next = clampCount(value, maxRandomCount);
    setDraft(String(next));
    onRandomCountChange(next);
  };

  const handleBlur = () => {
    // An empty field goes back to the last count that was set, not to 1.
    if (draft === '') {
      setDraft(String(randomCount));
      return;
    }
    commitCount(Number(draft));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Magnifer
            size={18}
            weight="BoldDuotone"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search across all folders..."
            value={globalFilter}
            onChange={e => onGlobalFilterChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={languageFolderId} onValueChange={onLanguageFolderChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Folder size={16} weight="BoldDuotone" className="mr-2 shrink-0" />
            <span className="flex-1 text-left">
              Folder:
              {' '}
              <SelectValue placeholder="All" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            {languageFolders.map(f => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Quick filters
          </p>

          <div className="flex h-9 w-full items-center rounded-md border border-input bg-card shadow-xs sm:w-auto">
            <label htmlFor={countId} className="pr-1 pl-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Count
            </label>
            <button
              type="button"
              aria-label="Decrease count"
              disabled={draftValue <= MIN_RANDOM_COUNT}
              onClick={() => commitCount(draftValue - 1)}
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <MinusCircle size={16} weight="BoldDuotone" />
            </button>
            <input
              id={countId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-describedby={isOverMax ? hintId : undefined}
              aria-invalid={isOverMax || undefined}
              value={draft}
              onChange={e => setDraft(e.target.value.replace(/\D/g, ''))}
              onFocus={e => e.target.select()}
              onBlur={handleBlur}
              className="h-8 w-12 min-w-0 bg-transparent text-center text-sm font-semibold text-foreground tabular-nums outline-none"
            />
            <button
              type="button"
              aria-label="Increase count"
              disabled={maxRandomCount !== undefined && draftValue >= maxRandomCount}
              onClick={() => commitCount(draftValue + 1)}
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <AddCircle size={16} weight="BoldDuotone" />
            </button>

            <Button
              type="button"
              variant="ghost"
              onClick={onRandomize}
              disabled={isRandomizeDisabled}
              className={cn(
                'mr-0.5 h-8 shrink-0 rounded-md bg-primary/15 text-sm font-medium text-primary hover:bg-primary/25 hover:text-primary',
                'disabled:opacity-50 sm:min-w-[132px]',
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-sm bg-background/15">
                <Shuffle size={14} weight="BoldDuotone" />
              </span>
              Randomize
            </Button>
          </div>
        </div>

        {isOverMax && (
          <p id={hintId} className="text-right text-xs text-destructive">
            {`Only ${maxRandomCount} words in this scope. Will use ${maxRandomCount}.`}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onQuickFilterChange(id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                quickFilter === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VocabSelectionFilters;
