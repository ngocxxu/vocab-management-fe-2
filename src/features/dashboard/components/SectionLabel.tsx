import type { ReactNode } from 'react';

type TSectionLabelProps = {
  children: ReactNode;
};

export function SectionLabel({ children }: TSectionLabelProps) {
  return (
    <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
      {children}
    </p>
  );
}
