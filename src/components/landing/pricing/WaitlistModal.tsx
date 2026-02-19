'use client';

import { useState } from 'react';
import { ShieldCheck } from '@solar-icons/react/ssr';
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
            Be the first to know
          </DialogTitle>
          <DialogDescription asChild>
            <p className="mt-2 text-center font-sans text-sm text-muted-foreground">
              Join our exclusive waitlist for early access to
              <br />
              Member features
            </p>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-xl border-border"
            required
          />
          <Button
            type="submit"
            className="w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Notify Me
          </Button>
        </form>
        <p className="mt-4 flex items-center justify-center gap-2 font-sans text-xs text-muted-foreground">
          <ShieldCheck size={14} weight="BoldDuotone" className="shrink-0" />
          No spam, only precision updates.
        </p>
      </DialogContent>
    </Dialog>
  );
}
