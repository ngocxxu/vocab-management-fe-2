'use client';

import { useState } from 'react';
import { ShieldCheck } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function WaitlistModal({
  open,
  onOpenChange,
  onSuccess,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}>) {
  const t = useTranslations('landing.waitlist');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess?.();
    onOpenChange(false);
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold">
            {t('title')}
          </DialogTitle>
          <DialogDescription asChild>
            <p className="mt-2 text-center font-sans text-sm text-muted-foreground">
              {t('body')}
            </p>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Input
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-xl border-border"
            required
          />
          <Button
            type="submit"
            className="w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {t('notify')}
          </Button>
        </form>
        <p className="mt-4 flex items-center justify-center gap-2 font-sans text-xs text-muted-foreground">
          <ShieldCheck size={14} weight="BoldDuotone" className="shrink-0" />
          {t('noSpam')}
        </p>
      </DialogContent>
    </Dialog>
  );
}
