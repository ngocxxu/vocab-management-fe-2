'use client';

import type { ExportCsvButtonProps } from '@/types/vocab-list';
import { Download } from '@solar-icons/react/ssr';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { exportVocabsCsv } from '@/actions/vocabs';
import { Button } from '@/components/ui/button';

const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({ queryParams, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const result = await exportVocabsCsv(queryParams);

      if ('error' in result) {
        throw new Error(result.error);
      }

      const blob = result;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `vocabs-export-${timestamp}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Vocabularies exported successfully');
    } catch (error) {
      console.error('Export CSV error:', error);
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
        : 'Export CSV'}
    </Button>
  );
};

export default ExportCsvButton;
