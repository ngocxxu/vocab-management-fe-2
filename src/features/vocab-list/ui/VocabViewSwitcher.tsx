'use client';

import type { TVocabViewMode } from '@/types/vocab-list';
import { Gallery, ListDown, Widget5 } from '@solar-icons/react/ssr';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

type VocabViewSwitcherProps = {
  value: TVocabViewMode;
  onChange: (value: TVocabViewMode) => void;
};

const VIEW_OPTIONS: Array<{ value: TVocabViewMode; label: string; icon: React.ReactNode }> = [
  { value: 'collapse', label: 'Collapse', icon: <ListDown size={16} weight="BoldDuotone" /> },
  { value: 'table', label: 'Table', icon: <Widget5 size={16} weight="BoldDuotone" /> },
  { value: 'feed', label: 'Feed', icon: <Gallery size={16} weight="BoldDuotone" /> },
];

const VocabViewSwitcher: React.FC<VocabViewSwitcherProps> = ({ value, onChange }) => {
  return (
    <Tabs value={value} onValueChange={v => onChange(v as TVocabViewMode)}>
      <TabsList variant="pill">
        {VIEW_OPTIONS.map(option => (
          <TabsTrigger key={option.value} value={option.value} variant="pill">
            {option.icon}
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default VocabViewSwitcher;
