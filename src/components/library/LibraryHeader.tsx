import { Plus } from 'lucide-react';
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type LibraryHeaderProps = {
  filterType: string;
  onFilterChange: (value: string) => void;
  onCreateFolder: () => void;
};

const LibraryHeader: React.FC<LibraryHeaderProps> = memo(({
  filterType,
  onFilterChange,
  onCreateFolder,
}) => {
  return (
    <div className="flex items-center justify-between text-center">
      <div className="flex items-center justify-center space-x-3">
        <div className="text-left">
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-200">
            Language Library
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Organize and explore your vocabulary by language combinations
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          onClick={onCreateFolder}
          className="transform bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Folder
        </Button>

        {/* Simplified Select to debug */}
        <Select value={filterType} onValueChange={onFilterChange}>
          <SelectTrigger className="w-44 border-2 border-slate-200 dark:border-slate-600">
            <SelectValue placeholder="Show All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="empty">Empty</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

LibraryHeader.displayName = 'LibraryHeader';

export default LibraryHeader;
