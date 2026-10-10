'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

type SettingsSectionProps = Readonly<{
  id: string;
  title: string;
  description?: string;
  /** Rendered after the rows, outside the dividers (for example a save bar or a dialog). */
  footer?: React.ReactNode;
  children: React.ReactNode;
}>;

/** A titled group of settings. Rows inside it are separated by dividers. */
export const SettingsSection: React.FC<SettingsSectionProps> = ({ id, title, description, footer, children }) => (
  <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
    <header>
      <h2 id={`${id}-title`} className="text-lg font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </header>
    <div className="divide-y divide-border">{children}</div>
    {footer}
  </section>
);

type SettingsGroupProps = Readonly<{
  title: string;
  /** Says what the group's settings apply to, so the scope is visible next to them. */
  description?: string;
  children: React.ReactNode;
}>;

/** A part of a section whose settings share one scope. Groups inside a section are separated by a divider. */
export const SettingsGroup: React.FC<SettingsGroupProps> = ({ title, description, children }) => (
  <div className="pt-5">
    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    <div className="mt-2 divide-y divide-border">{children}</div>
  </div>
);

type SettingRowProps = Readonly<{
  label: string;
  htmlFor?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}>;

/** One setting: label and hint on the left, the control on the right. Stacks on narrow screens. */
export const SettingRow: React.FC<SettingRowProps> = ({ label, htmlFor, description, children }) => (
  <div className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:items-start sm:gap-8">
    <div>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">{label}</Label>
      {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
    </div>
    <div className="min-w-0">{children}</div>
  </div>
);
