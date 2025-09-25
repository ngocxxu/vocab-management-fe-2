import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LibraryLoadingState: React.FC = () => {
  return (
    <div className="space-y-4 py-16 text-center">
      <Skeleton className="mx-auto h-16 w-16 rounded-full" />
      <Skeleton className="mx-auto h-6 w-64" />
    </div>
  );
};

export default LibraryLoadingState;
