import React from 'react';
import { VocabList } from './index';

export const VocabListLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/30">
      <div className="container mx-auto px-4 py-8">
        <VocabList />
      </div>
    </div>
  );
};
