'use client';

import type { VisibilityState } from '@tanstack/react-table';
import { SidebarMinimalistic } from '@solar-icons/react/ssr';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';

type TColumnsDropdownProps = {
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (vis: VisibilityState) => void;
};

const TOGGLEABLE_COLUMNS = [
  { id: 'textTarget', label: 'Text Target' },
  { id: 'wordType', label: 'Type' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'explanationSource', label: 'Explanation (Source)' },
  { id: 'explanationTarget', label: 'Explanation (Target)' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'examples', label: 'Examples' },
] as const;

export function ColumnsDropdown({ columnVisibility, onColumnVisibilityChange }: TColumnsDropdownProps) {
  const isVisible = (id: string) => columnVisibility[id] !== false;

  const toggle = (id: string) => {
    onColumnVisibilityChange({ ...columnVisibility, [id]: !isVisible(id) });
  };

  const selectAll = () => {
    const all: VisibilityState = {};
    for (const col of TOGGLEABLE_COLUMNS) {
      all[col.id] = true;
    }
    onColumnVisibilityChange(all);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 border-border bg-card/80 backdrop-blur-sm">
          <SidebarMinimalistic size={16} weight="BoldDuotone" className="mr-2" />
          <span className="hidden sm:inline">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {TOGGLEABLE_COLUMNS.map(col => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={isVisible(col.id)}
            onCheckedChange={() => toggle(col.id)}
            onSelect={e => e.preventDefault()}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <button
          type="button"
          onClick={selectAll}
          className="w-full px-2 py-1.5 text-left text-sm font-medium text-primary hover:bg-accent"
        >
          Select All
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
