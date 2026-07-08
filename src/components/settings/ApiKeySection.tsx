'use client';

import type { ApiKeySectionProps, TCreateApiKey } from '@/types/api-key';
import { AddCircle } from '@solar-icons/react/ssr';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createApiKey, deleteApiKey } from '@/actions/api-keys';
import { ApiKeyForm } from '@/components/settings/ApiKeyForm';
import { ApiKeyRevealDialog } from '@/components/settings/ApiKeyRevealDialog';
import { ApiKeyTableRow } from '@/components/settings/ApiKeyTableRow';
import { SettingsPageShell } from '@/components/settings/SettingsPageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({ initialApiKeysData }) => {
  const apiKeys = initialApiKeysData?.items || [];
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleCreate = async (data: TCreateApiKey) => {
    try {
      setIsSubmitting(true);
      const result = await createApiKey(data);
      setIsCreateDialogOpen(false);
      setRevealedKey(result.key);
      toast.success('API key created');
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error('Failed to create API key');
      console.error('Create API key error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey(id);
      toast.success('API key deleted');
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error('Failed to delete API key');
      console.error('Delete API key error:', error);
    }
  };

  const headerAction = (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
        </DialogHeader>
        <ApiKeyForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <SettingsPageShell
      title="API Keys"
      description="Personal API keys for automations like the iOS quick-add Shortcut. Each key is scoped to one action and one folder."
      headerAction={headerAction}
    >
      {apiKeys.length === 0
        ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h4 className="mb-2 text-lg font-medium text-foreground">No API keys yet</h4>
                <p className="mb-4 text-muted-foreground">Create one to connect an iOS Shortcut or other automation.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <AddCircle size={16} weight="BoldDuotone" className="mr-2" />
                  Create API Key
                </Button>
              </CardContent>
            </Card>
          )
        : (
            <Card className="overflow-hidden border-0 bg-card/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <CardContent className="p-0">
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">Key</th>
                        <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">Permissions</th>
                        <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">Folder</th>
                        <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">Created</th>
                        <th className="bg-muted/30 px-3 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">Last Used</th>
                        <th className="bg-muted/30 px-3 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:px-6 sm:py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map(apiKey => (
                        <ApiKeyTableRow key={apiKey.id} apiKey={apiKey} onDelete={handleDelete} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

      <ApiKeyRevealDialog apiKey={revealedKey} onClose={() => setRevealedKey(null)} />
    </SettingsPageShell>
  );
};
