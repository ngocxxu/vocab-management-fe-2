'use client';

import type { TVocabViewMode } from '@/types/vocab-list';
import { Gallery, ListDown, Widget5 } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

type VocabViewSwitcherProps = {
  value: TVocabViewMode;
  onChange: (value: TVocabViewMode) => void;
};

// labelKey is a translation key under `vocabList.view`.
const VIEW_OPTIONS: Array<{ value: TVocabViewMode; labelKey: string; icon: React.ReactNode }> = [
  { value: 'table', labelKey: 'table', icon: <Widget5 size={16} weight="BoldDuotone" /> },
  { value: 'collapse', labelKey: 'collapse', icon: <ListDown size={16} weight="BoldDuotone" /> },
  { value: 'feed', labelKey: 'feed', icon: <Gallery size={16} weight="BoldDuotone" /> },
];

const VocabViewSwitcher: React.FC<VocabViewSwitcherProps> = ({ value, onChange }) => {
  const t = useTranslations('vocabList.view');

  return (
    <Tabs value={value} onValueChange={v => onChange(v as TVocabViewMode)}>
      <TabsList variant="pill">
        {VIEW_OPTIONS.map(option => (
          <TabsTrigger key={option.value} value={option.value} variant="pill">
            {option.icon}
            {t(option.labelKey)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default VocabViewSwitcher;
