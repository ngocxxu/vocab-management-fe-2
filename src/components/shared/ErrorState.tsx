'use client';

import React from 'react';

type ErrorStateProps = {
  message: string;
  className?: string;
};

const ErrorState: React.FC<ErrorStateProps> = ({ message, className = '' }) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-lg text-destructive">{message}</div>
    </div>
  );
};

export default ErrorState;
