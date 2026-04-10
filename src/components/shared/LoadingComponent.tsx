'use client';

import { RefreshCircle } from '@solar-icons/react/ssr';
import React from 'react';

import type { LoadingComponentProps } from '@/types';

const LoadingComponent: React.FC<LoadingComponentProps> = ({ title, description }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-6 text-center">
        <RefreshCircle size={64} weight="BoldDuotone" className="mx-auto animate-spin text-primary" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingComponent;
