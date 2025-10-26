'use client';

import type { VocabQueryParams } from '@/utils/api-config';
import { Download } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';

type ExportExcelButtonProps = {
  queryParams: VocabQueryParams;
  disabled?: boolean;
};

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({ queryParams, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const searchParams = new URLSearchParams();

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(key, item));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/vocabs/export-csv?${searchParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const csvText = await blob.text();

      const workbook = XLSX.read(csvText, { type: 'string', raw: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `vocabs-export-${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);

      toast.success('Vocabularies exported successfully');
    } catch (error) {
      console.error('Export Excel error:', error);
      toast.error('Failed to export vocabularies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isLoading}
      variant="outline"
      className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80"
    >
      <Download className="mr-2 h-4 w-4" />
      {isLoading
        ? 'Exporting...'
        : 'Export Excel'}
    </Button>
  );
};

export default ExportExcelButton;
