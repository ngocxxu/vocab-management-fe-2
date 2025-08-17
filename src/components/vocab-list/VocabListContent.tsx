import React from 'react';
import { VocabList } from './index';

const VocabListContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/30">
      <div className="container mx-auto py-8">
        <VocabList />
      </div>
    </div>
  );
};

export default VocabListContent;
