import { Search } from 'lucide-react';
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
        <Search className="h-6 w-6 text-slate-400" />
      </div>
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className="h-14 rounded-xl border-2 border-slate-200 pl-12 text-lg shadow-sm transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:focus:ring-blue-800"
      />
    </div>
  );
};

export default LibrarySearch;
