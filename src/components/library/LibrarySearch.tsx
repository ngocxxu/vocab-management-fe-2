'use client';

import { Filter, List, Magnifer } from '@solar-icons/react/ssr';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { LibrarySearchProps, LibrarySortOption } from '@/types/language-folder';

export type { LibrarySortOption };

const SORT_VALUE_RECENT = 'updatedAt-desc';
const SORT_VALUE_NAME = 'name-asc';

const LibrarySearch: React.FC<LibrarySearchProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  placeholder = 'Search for language folders...',
}) => {
  const sortValue = sortBy === 'updatedAt' && sortOrder === 'desc'
    ? SORT_VALUE_RECENT
    : sortBy === 'name' && sortOrder === 'asc'
      ? SORT_VALUE_NAME
      : SORT_VALUE_RECENT;

  const handleSortValueChange = (value: string) => {
    if (value === SORT_VALUE_RECENT) {
      onSortChange('updatedAt', 'desc');
    } else if (value === SORT_VALUE_NAME) {
      onSortChange('name', 'asc');
    }
  };

  const sortLabel = sortValue === SORT_VALUE_RECENT ? 'Recent' : 'Name A-Z';

  return (
    <div className="flex h-12 w-full flex-row items-center rounded-lg bg-card">
      <div className="relative flex min-w-0 flex-1 items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Magnifer size={20} weight="BoldDuotone" className="text-muted-foreground" />
        </div>
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="h-full border-0 bg-transparent pr-3 pl-11 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
        />
      </div>
      <div className="w-px self-stretch bg-border" />
      <div className="flex shrink-0 items-center gap-1 pr-3 pl-3">
        <Select value={sortValue} onValueChange={handleSortValueChange}>
          <SelectTrigger className="h-12 min-h-0 w-[180px] border-0 bg-transparent shadow-none focus-visible:ring-0 [&_svg]:text-muted-foreground">
            <SelectValue className="text-muted-foreground">
              <span className="flex items-center gap-2">
                <List size={18} weight="BoldDuotone" className="shrink-0 text-muted-foreground" />
                Sort by:
                {' '}
                {sortLabel}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SORT_VALUE_RECENT}>Recent</SelectItem>
            <SelectItem value={SORT_VALUE_NAME}>Name A-Z</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          className="h-12 shrink-0 border-0 bg-transparent px-3 text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground"
        >
          <Filter size={18} weight="BoldDuotone" className="mr-2 shrink-0 text-muted-foreground" />
          Filter
        </Button>
      </div>
    </div>
  );
};

export default LibrarySearch;
