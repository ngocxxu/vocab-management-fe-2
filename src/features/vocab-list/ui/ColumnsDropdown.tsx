'use client';

import type { VisibilityState } from '@tanstack/react-table';
import { SidebarMinimalistic } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
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

// labelKey is a translation key under `vocabList.columnsMenu`.
const TOGGLEABLE_COLUMNS = [
  { id: 'textTarget', labelKey: 'textTarget' },
  { id: 'wordType', labelKey: 'wordType' },
  { id: 'grammar', labelKey: 'grammar' },
  { id: 'explanationSource', labelKey: 'explanationSource' },
  { id: 'explanationTarget', labelKey: 'explanationTarget' },
  { id: 'subjects', labelKey: 'subjects' },
  { id: 'examples', labelKey: 'examples' },
] as const;

export function ColumnsDropdown({ columnVisibility, onColumnVisibilityChange }: TColumnsDropdownProps) {
  const t = useTranslations('vocabList.columnsMenu');
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
        <Button variant="outline" className="h-10 bg-card/80 backdrop-blur-sm">
          <SidebarMinimalistic size={16} weight="BoldDuotone" className="mr-2" />
          <span className="hidden sm:inline">{t('button')}</span>
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
            {t(col.labelKey)}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <button
          type="button"
          onClick={selectAll}
          className="w-full px-2 py-1.5 text-left text-sm font-medium text-primary hover:bg-accent"
        >
          {t('selectAll')}
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
