'use client';

import type { TCsvImportResponse } from '@/types/vocab-list';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { vocabApi } from '@/utils/client-api';

const FormSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
});

type FormData = z.infer<typeof FormSchema>;

type ImportVocabDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  languageFolderId: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  onImportSuccess: () => void;
};

const ImportVocabDialog: React.FC<ImportVocabDialogProps> = ({
  open,
  onOpenChange,
  languageFolderId,
  sourceLanguageCode,
  targetLanguageCode,
  onImportSuccess,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<TCsvImportResponse | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const convertExcelToCsv = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName!];
          const csv = XLSX.utils.sheet_to_csv(worksheet!);

          // Create a new File object with CSV content
          const csvFile = new File([csv], file.name.replace(/\.(xlsx|xls)$/i, '.csv'), {
            type: 'text/csv',
          });
          resolve(csvFile);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsUploading(true);
    setImportResult(null);

    try {
      let fileToUpload = data.file;

      // Convert Excel files to CSV
      if (data.file.name.match(/\.(xlsx|xls)$/i)) {
        fileToUpload = await convertExcelToCsv(data.file);
      }

      const result = await vocabApi.importCsv(fileToUpload, {
        languageFolderId,
        sourceLanguageCode,
        targetLanguageCode,
      });

      setImportResult(result);

      if (result.failed === 0) {
        // Complete success
        toast.success(`Import completed successfully! Created: ${result.created}, Updated: ${result.updated}`);
        onImportSuccess();
        onOpenChange(false);
        form.reset();
      } else if (result.created > 0 || result.updated > 0) {
        // Partial success
        toast.warning(`Import completed with errors. Created: ${result.created}, Updated: ${result.updated}, Failed: ${result.failed}`);
        setShowErrorDialog(true);
      } else {
        // Complete failure
        toast.error(`Import failed. ${result.failed} rows failed to import.`);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('Import error:', error);

      // Handle API error response
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        if (apiError.response?.data) {
          // Try to parse error response as import result
          try {
            const errorResult = apiError.response.data;
            if (errorResult.errors && Array.isArray(errorResult.errors)) {
              setImportResult(errorResult);
              toast.error(`Import failed. ${errorResult.failed || 0} rows failed to import.`);
              setShowErrorDialog(true);
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
          }
        }
      }

      toast.error('Failed to import file. Please check the file format and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setImportResult(null);
    setShowErrorDialog(false);
  };

  const handleRetry = () => {
    setShowErrorDialog(false);
    setImportResult(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]" aria-describedby="import-dialog-description">
          <DialogHeader>
            <DialogTitle>Import Vocabulary</DialogTitle>
            <DialogDescription id="import-dialog-description">
              Upload an Excel file (.xls, .xlsx) or CSV file to import vocabulary data.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>File</FormLabel>
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
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading
                    ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      )
                    : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import
                        </>
                      )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Error Details Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Import Results
            </AlertDialogTitle>
            <AlertDialogDescription>
              Detailed results of the import operation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    Created:
                    {importResult.created}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    Updated:
                    {importResult.updated}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">
                    Failed:
                    {importResult.failed}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Total:
                    {importResult.totalProcessed}
                  </span>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Error Details:</h4>
                  <div className="max-h-60 overflow-auto rounded-lg border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-slate-50 dark:bg-slate-800">
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Row</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Error</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.errors.map(error => (
                          <tr key={error.error} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                            <td className="px-4 py-2 font-medium">{error.row}</td>
                            <td className="px-4 py-2 text-red-600">{error.error}</td>
                            <td className="max-w-xs px-4 py-2">
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRetry}>Try Again</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ImportVocabDialog;
