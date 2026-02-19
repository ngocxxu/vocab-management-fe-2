'use client';

import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type UpsellModalProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  description?: string;
}>;

export function UpsellModal({
  open,
  onOpenChange,
  featureName,
  description,
}: UpsellModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription asChild>
            <p className="mt-2 font-sans text-sm text-muted-foreground">
              {description ?? `${featureName} is available on the Pro plan. Upgrade to unlock it.`}
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3">
          <Button asChild className="w-full rounded-xl bg-primary font-semibold text-primary-foreground">
            <Link href="/#pricing" onClick={() => onOpenChange(false)}>
              Upgrade
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
