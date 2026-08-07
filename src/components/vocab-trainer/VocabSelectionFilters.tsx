'use client';

import type { QuickFilter, VocabSelectionFiltersProps } from '@/types/vocab-trainer';
import { Folder, Magnifer, Shuffle } from '@solar-icons/react/ssr';
import React from 'react';
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
  onRandomize,
  isRandomizeDisabled,
}) => {
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

          <div className="flex h-9 w-full items-center rounded-md border border-input bg-background shadow-xs sm:w-auto">
            <div className="flex min-w-0 flex-1 items-center justify-center pr-1 pl-2 sm:flex-none">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Count</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                aria-label="Random vocabulary count"
                value={randomCount}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  onRandomCountChange(Number.isFinite(next) ? Math.max(1, next) : 1);
                }}
                className={cn(
                  'h-8 w-10 border-0 bg-none p-0 text-center text-sm font-semibold text-foreground shadow-none outline-none',
                  'focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50',
                )}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={onRandomize}
              disabled={isRandomizeDisabled}
              className={cn(
                'h-8 shrink-0 rounded-md bg-primary/15 text-sm font-medium text-primary hover:text-primary hover:bg-primary/25',
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
