import { Folder, MoreVertical } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

export type TLanguageFolder = {
  id: string;
  name: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  color: string;
};

type LanguageFolderProps = {
  folder: TLanguageFolder;
  onFolderClick: (folder: TLanguageFolder) => void;
};

const LanguageFolder = ({ folder, onFolderClick }: LanguageFolderProps) => {
  return (
    <div
      className="group cursor-pointer border-b border-slate-100 bg-white px-6 py-4 transition-all duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
      onClick={() => onFolderClick(folder)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onFolderClick(folder);
        }
      }}
    >
      <div className="flex items-center space-x-4">
        {/* Icon Column */}
        <div className="flex w-12 items-center justify-center">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${folder.color} shadow-sm`}>
            <Folder className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Name Column */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-900 dark:text-white">
            {folder.name}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {folder.sourceLanguageCode.toUpperCase()}
            {' '}
            →
            {' '}
            {folder.targetLanguageCode.toUpperCase()}
          </div>
        </div>

        {/* Last Modified Column */}
        <div className="w-22 text-sm text-slate-600 dark:text-slate-400">
          {new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>

        {/* Options Column */}
        <div className="flex w-8 items-center justify-center">
          <Button
            onClick={(e) => {
              e.stopPropagation();
            }}
            variant="ghost"
            className="rounded p-1 text-slate-400 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageFolder;
