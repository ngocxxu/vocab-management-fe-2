'use client';

import { Copy } from '@solar-icons/react/ssr';
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!apiKey) {
      return;
    }
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success('Copied to clipboard');
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
          <DialogTitle>Copy your API key now</DialogTitle>
          <DialogDescription>
            This is the only time the full key is shown. Store it somewhere safe — you won't be able to view it again after closing this dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly value={apiKey ?? ''} className="font-mono text-sm" onFocus={e => e.target.select()} />
          <Button type="button" variant="outline" size="icon" onClick={handleCopy} aria-label="Copy API key">
            <Copy size={16} weight="BoldDuotone" />
          </Button>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleClose}
            disabled={!copied}
          >
            {copied ? 'Done' : 'Copy it first'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
