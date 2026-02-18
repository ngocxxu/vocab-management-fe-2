'use client';

import React from 'react';

import type { ErrorStateProps } from '@/types';

const ErrorState: React.FC<ErrorStateProps> = ({ message, className = '' }) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-lg text-destructive">{message}</div>
    </div>
  );
};

export default ErrorState;
