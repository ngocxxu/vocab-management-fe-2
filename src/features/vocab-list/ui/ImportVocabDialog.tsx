'use client';

import type { ImportVocabDialogProps, TCsvImportResponse } from '@/types/vocab-list';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddCircle,
  CheckCircle,
  DangerCircle,
  RefreshCircle,
  Upload,
} from '@solar-icons/react/ssr';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { createSubject } from '@/actions/subjects';
import { importVocabsCsv } from '@/actions/vocabs';
import { isQuotaError } from '@/utils/quota-error';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

const FormSchema = z.object({
  file: z.instanceof(File, { message: 'validation.fileRequired' }),
});

type FormData = z.infer<typeof FormSchema>;

const ImportVocabDialog: React.FC<ImportVocabDialogProps> = ({
  open,
  onOpenChange,
  languageFolderId,
  sourceLanguageCode,
  targetLanguageCode,
  onImportSuccess,
}) => {
  const t = useTranslations('vocabList.importDialog');
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<TCsvImportResponse | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [creatingSubjects, setCreatingSubjects] = useState<Set<string>>(() => new Set());
  const [createdSubjects, setCreatedSubjects] = useState<Set<string>>(() => new Set());
  const router = useRouter();
  const [, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const extractSubjectName = useCallback((error: string): string | null => {
    const match = /Subject '([^']+)' not found/.exec(error);
    if (match) {
      return match[1] || null;
    }
    return null;
  }, []);

  const handleCreateSubject = async (subjectName: string) => {
    if (creatingSubjects.has(subjectName) || createdSubjects.has(subjectName)) {
      return;
    }

    try {
      setCreatingSubjects(prev => new Set(prev).add(subjectName));
      await createSubject({ name: subjectName });
      setCreatedSubjects(prev => new Set(prev).add(subjectName));
      toast.success(t('subjectCreated', { name: subjectName }));
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error(t('subjectCreateFailed', { name: subjectName }));
    } finally {
      setCreatingSubjects((prev) => {
        const next = new Set(prev);
        next.delete(subjectName);
        return next;
      });
    }
  };

  const convertExcelToCsv = useCallback(async (file: File): Promise<File> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName!];
    const csv = XLSX.utils.sheet_to_csv(worksheet!);

    // Create a new File object with CSV content
    const csvFile = new File([csv], file.name.replace(/\.(xlsx|xls)$/i, '.csv'), {
      type: 'text/csv',
    });
    return csvFile;
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsUploading(true);
    setImportResult(null);

    try {
      let fileToUpload = data.file;

      // Convert Excel files to CSV
      if (data.file.name.endsWith('.xlsx') || data.file.name.endsWith('.xls')) {
        fileToUpload = await convertExcelToCsv(data.file);
      }

      const result = await importVocabsCsv(fileToUpload, {
        languageFolderId,
        sourceLanguageCode,
        targetLanguageCode,
      });

      setImportResult(result);

      if (result.failed === 0) {
        // Complete success
        toast.success(t('importSuccess', { created: result.created, updated: result.updated }));
        onImportSuccess();
        startTransition(() => {
          router.refresh();
        });
        onOpenChange(false);
        form.reset();
      } else if (result.created > 0 || result.updated > 0) {
        // Partial success
        toast.warning(t('importPartial', { created: result.created, updated: result.updated, failed: result.failed }));
        setShowErrorDialog(true);
      } else {
        // Complete failure
        toast.error(t('importFailedRows', { failed: result.failed }));
        setShowErrorDialog(true);
      }
    } catch (error: unknown) {
      const withResponse = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: unknown } })
        : null;
      if (withResponse?.response?.data) {
        try {
          const errorResult = withResponse.response.data as TCsvImportResponse;
          if (errorResult.errors && Array.isArray(errorResult.errors)) {
            setImportResult(errorResult);
            toast.error(t('importFailedRows', { failed: errorResult.failed || 0 }));
            setShowErrorDialog(true);
            return;
          }
        } catch {}
      }

      const message = error instanceof Error ? error.message : t('fallbackError');
      if (isQuotaError(error)) {
        toast.error(t('quotaMessage'), {
          description: message,
          action: {
            label: t('upgrade'),
            onClick: () => {
              window.location.href = '/#pricing';
            },
          },
        });
      } else {
        toast.error(t('importFailedTitle'), { description: message });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setImportResult(null);
    setShowErrorDialog(false);
    setCreatingSubjects(new Set());
    setCreatedSubjects(new Set());
  };

  const handleRetry = () => {
    setShowErrorDialog(false);
    setImportResult(null);
    setCreatingSubjects(new Set());
    setCreatedSubjects(new Set());
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]" aria-describedby="import-dialog-description">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription id="import-dialog-description">
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>{t('fileLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="file"
                        accept=".xls,.xlsx,.csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        className="cursor-pointer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading
                    ? (
                        <>
                          <RefreshCircle size={16} weight="BoldDuotone" className="mr-2 animate-spin" />
                          {t('uploading')}
                        </>
                      )
                    : (
                        <>
                          <Upload size={16} weight="BoldDuotone" className="mr-2" />
                          {t('import')}
                        </>
                      )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <DangerCircle size={20} weight="BoldDuotone" className="text-destructive" />
              {t('resultsTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('resultsDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="BoldDuotone" className="text-success" />
                  <span className="text-sm font-medium">
                    {t('createdLabel')}
                    {importResult.created}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="BoldDuotone" className="text-primary" />
                  <span className="text-sm font-medium">
                    {t('updatedLabel')}
                    {importResult.updated}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DangerCircle size={16} weight="BoldDuotone" className="text-destructive" />
                  <span className="text-sm font-medium">
                    {t('failedLabel')}
                    {importResult.failed}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {t('totalLabel')}
                    {importResult.totalProcessed}
                  </span>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">{t('errorDetails')}</h4>
                  <div className="max-h-60 overflow-auto rounded-lg border">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-[8%]" />
                        <col className="w-[32%]" />
                        <col className="w-[42%]" />
                        <col className="w-[18%]" />
                      </colgroup>
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">{t('colRow')}</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">{t('colError')}</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">{t('colData')}</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">{t('colAction')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.errors.map((error, index) => {
                          const subjectName = extractSubjectName(error.error);
                          const isSubjectError = subjectName !== null;
                          const isCreating = subjectName ? creatingSubjects.has(subjectName) : false;
                          const isCreated = subjectName ? createdSubjects.has(subjectName) : false;

                          return (
                            <tr key={`${error.row}-${index}`} className="border-b hover:bg-muted/20">
                              <td className="px-4 py-2 font-medium">{error.row}</td>
                              <td className="px-4 py-2 break-words text-destructive">{error.error}</td>
                              <td className="px-4 py-2 break-words">
                                {Object.entries(error.data).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="font-medium">
                                      {key}
                                      :
                                    </span>
                                    {' '}
                                    {String(value)}
                                  </div>
                                ))}
                              </td>
                              <td className="px-4 py-2">
                                {isSubjectError && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCreateSubject(subjectName)}
                                    disabled={isCreating || isCreated}
                                    className="h-7 text-xs"
                                  >
                                    {isCreating
                                      ? (
                                          <>
                                            <RefreshCircle size={12} weight="BoldDuotone" className="mr-1 animate-spin" />
                                            {t('creating')}
                                          </>
                                        )
                                      : isCreated
                                        ? (
                                            <>
                                              <CheckCircle size={12} weight="BoldDuotone" className="mr-1 text-success" />
                                              {t('createdButton')}
                                            </>
                                          )
                                        : (
                                            <>
                                              <AddCircle size={12} weight="BoldDuotone" className="mr-1" />
                                              {t('createSubject', { name: subjectName })}
                                            </>
                                          )}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRetry}>{t('tryAgain')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>{t('close')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ImportVocabDialog;
