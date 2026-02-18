'use client';

import type { ExportExcelButtonProps } from '@/types/vocab-list';
import { Download } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { exportVocabsCsv } from '@/actions/vocabs';
import { Button } from '@/components/ui/button';

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({ queryParams, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const result = await exportVocabsCsv(queryParams);

      if ('error' in result) {
        throw new Error(result.error);
      }

      const blob = result;
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
      <Download size={16} weight="BoldDuotone" className="mr-2" />
      {isLoading
        ? 'Exporting...'
        : 'Export Excel'}
    </Button>
  );
};

export default ExportExcelButton;
