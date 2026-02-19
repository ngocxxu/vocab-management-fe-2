export function FeatureItemWithIcon({
  Icon,
  children,
  accent,
  muted = false,
}: Readonly<{
  Icon: React.ComponentType<{ size?: number; weight?: 'BoldDuotone'; className?: string }>;
  children: React.ReactNode;
  accent?: boolean;
  muted?: boolean;
}>) {
  const circleClass = muted
    ? 'bg-border text-muted-foreground'
    : accent
      ? 'bg-primary/15 text-primary'
      : 'bg-primary/10 text-primary';
  return (
    <li className="flex items-center gap-3">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${circleClass}`}>
        <Icon size={20} weight="BoldDuotone" />
      </span>
      <span className={`font-sans text-[15px] ${accent ? 'text-foreground' : 'text-muted-foreground'}`}>
        {children}
      </span>
    </li>
  );
}
