import React from 'react';
import { PAGE_CONTAINER_CLASS } from '@/components/shared/page-layout';

type SettingsPageShellProps = {
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
};

export const SettingsPageShell: React.FC<SettingsPageShellProps> = ({
  title,
  description,
  headerAction,
  children,
}) => (
  <div className="min-h-screen bg-background">
    <div className={PAGE_CONTAINER_CLASS}>
      <div className="mb-4 flex items-start justify-between gap-4 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
        {headerAction}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  </div>
);
