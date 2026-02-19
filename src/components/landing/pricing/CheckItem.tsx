import { CheckCircle } from '@solar-icons/react/ssr';

export function CheckItem({
  children,
  accent = false,
}: Readonly<{ children: React.ReactNode; accent?: boolean }>) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${accent ? 'bg-primary' : 'bg-border'}`}
      >
        <CheckCircle size={14} weight="BoldDuotone" className={accent ? 'text-primary-foreground' : 'text-muted-foreground'} />
      </span>
      <span className={`font-sans text-[15px] ${accent ? 'text-foreground' : 'text-muted-foreground'}`}>
        {children}
      </span>
    </li>
  );
}
