'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

type LoadingComponentProps = {
  title: string;
  description?: string;
};

const LoadingComponent: React.FC<LoadingComponentProps> = ({ title, description }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-6 text-center">
        <Loader2 className="mx-auto h-16 w-16 animate-spin text-yellow-600 dark:text-yellow-400" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingComponent;
