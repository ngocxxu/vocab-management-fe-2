import React from 'react';

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
    <div className="container mx-auto flex flex-col px-4 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
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
