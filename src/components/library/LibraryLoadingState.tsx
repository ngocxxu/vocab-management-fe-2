import React from 'react';

const LibraryLoadingState: React.FC = () => {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      <p className="text-lg text-slate-600 dark:text-slate-400">Loading your language folders...</p>
    </div>
  );
};

export default LibraryLoadingState;
