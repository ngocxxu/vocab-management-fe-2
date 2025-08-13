import React from 'react';
import { VocabList } from './index';

export const VocabListContent: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Main Vocab List */}
      <VocabList />
    </div>
  );
};
