import { Magnifer } from '@solar-icons/react/ssr';
import React from 'react';
import { Input } from '@/components/ui/input';

type LibrarySearchProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
};

const LibrarySearch: React.FC<LibrarySearchProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search languages, folders, or vocabulary...',
}) => {
  return (
    <div className="relative mx-auto w-1/2">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Magnifer size={24} weight="BoldDuotone" className="text-muted-foreground" />
      </div>
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className="h-14 rounded-xl border-2 border-border pl-12 text-lg shadow-xs transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
};

export default LibrarySearch;
