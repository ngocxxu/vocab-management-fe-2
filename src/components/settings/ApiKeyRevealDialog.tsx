'use client';

import { Copy } from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type ApiKeyRevealDialogProps = {
  apiKey: string | null;
  onClose: () => void;
};

export const ApiKeyRevealDialog: React.FC<ApiKeyRevealDialogProps> = ({ apiKey, onClose }) => {
  const t = useTranslations('settings.apiKeys');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!apiKey) {
      return;
    }
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success(t('copiedToast'));
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Dialog
      open={!!apiKey}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('revealTitle')}</DialogTitle>
          <DialogDescription>
            {t('revealDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly value={apiKey ?? ''} className="font-mono text-sm" onFocus={e => e.target.select()} />
          <Button type="button" variant="outline" size="icon" onClick={handleCopy} aria-label={t('copyAria')}>
            <Copy size={16} weight="BoldDuotone" />
          </Button>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleClose}
            disabled={!copied}
          >
            {copied ? t('revealDone') : t('revealCopyFirst')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
